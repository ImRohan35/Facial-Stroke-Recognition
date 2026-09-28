import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
import xgboost as xgb
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
import shap
import datetime

PIPELINE_DIR = os.path.dirname(os.path.abspath(__file__))
SAVED_MODELS_DIR = os.path.join(PIPELINE_DIR, "saved_models")
DATASET_CSV = os.path.join(PIPELINE_DIR, "dataset", "extracted_features.csv")
DATASET_METADATA = os.path.join(PIPELINE_DIR, "dataset", "dataset_metadata.json")
os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

FEATURE_NAMES = [
    "mouth_vertical_asymmetry",
    "mouth_lateral_asymmetry",
    "mouth_corner_asymmetry",
    "eye_opening_difference",
    "eyebrow_elevation_difference",
    "lower_face_asymmetry",
    "mean_landmark_displacement",
    "mouth_symmetry_score",
    "eye_symmetry_score",
    "lower_face_symmetry_score"
]

FEATURE_DISPLAY_NAMES = {
    "mouth_vertical_asymmetry": "Mouth Corner Elevation Difference",
    "mouth_lateral_asymmetry": "Mouth Lateral Deviation",
    "mouth_corner_asymmetry": "Primary Mouth Corner Asymmetry",
    "eye_opening_difference": "Palpebral Fissure / Ptosis Difference",
    "eyebrow_elevation_difference": "Frontalis / Eyebrow Arch Elevation",
    "lower_face_asymmetry": "Lower Face / Mandibular Drift",
    "mean_landmark_displacement": "Global Bilateral Displacement",
    "mouth_symmetry_score": "Mouth Symmetry Score (0-100)",
    "eye_symmetry_score": "Eye Opening Symmetry Score (0-100)",
    "lower_face_symmetry_score": "Lower Face Symmetry Score (0-100)"
}

def load_or_generate_dataset():
    """
    Loads extracted features from the Kaggle dataset
    (abdussalamelhanashy/annotated-facial-images-for-stroke-classification)
    if available. Otherwise falls back to clinical distribution synthesizer.
    """
    if os.path.exists(DATASET_CSV):
        print(f"Loading real Kaggle dataset features from: {DATASET_CSV}")
        df = pd.read_csv(DATASET_CSV)
        # Drop rows with any NaN
        df = df.dropna(subset=FEATURE_NAMES + ["label"])
        X = df[FEATURE_NAMES].values
        y = df["label"].values.astype(int)
        
        meta = {}
        if os.path.exists(DATASET_METADATA):
            with open(DATASET_METADATA, "r") as f:
                meta = json.load(f)

        dataset_info = {
            "source_type": "Kaggle Real Annotated Dataset",
            "dataset_name": "Annotated Facial Images for Stroke Classification",
            "author": "Abdussalam Elhanashy",
            "total_samples": len(df),
            "stroke_samples": int((y == 1).sum()),
            "non_stroke_samples": int((y == 0).sum()),
            "stroke_percentage": round(float((y == 1).mean() * 100), 2),
            "metadata": meta
        }
        print(f"Loaded {len(df)} samples: {dataset_info['stroke_samples']} Stroke ({(y==1).mean()*100:.1f}%), {dataset_info['non_stroke_samples']} NonStroke.")
        return X, y, dataset_info
    else:
        print("Real dataset CSV not found. Generating synthetic calibrated benchmark dataset...")
        from ml_pipeline.train_and_benchmark import generate_clinical_stroke_dataset
        X, y = generate_clinical_stroke_dataset(n_samples=1600, random_state=42)
        dataset_info = {
            "source_type": "Calibrated Clinical Simulation",
            "dataset_name": "Annotated Facial Images Distribution (Calibrated)",
            "total_samples": len(y),
            "stroke_samples": int((y == 1).sum()),
            "non_stroke_samples": int((y == 0).sum()),
            "stroke_percentage": round(float((y == 1).mean() * 100), 2)
        }
        return X, y, dataset_info

def train_and_compare_models():
    print("=" * 70)
    print("StrokeCare AI — Model Training, Cross-Validation & Benchmark")
    print("=" * 70)

    X, y, dataset_info = load_or_generate_dataset()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Class balance weighting for XGBoost
    n_neg = int((y_train == 0).sum())
    n_pos = int((y_train == 1).sum())
    scale_pos = round(float(n_neg / max(1, n_pos)), 2)

    # Candidate Models
    models = {
        "LogisticRegression": LogisticRegression(
            C=1.0, max_iter=1000, class_weight="balanced", random_state=42
        ),
        "SVM": SVC(
            C=2.0, kernel="rbf", probability=True, class_weight="balanced", random_state=42
        ),
        "RandomForest": RandomForestClassifier(
            n_estimators=150, max_depth=8, min_samples_split=4, class_weight="balanced", random_state=42
        ),
        "XGBoost": xgb.XGBClassifier(
            n_estimators=160, max_depth=5, learning_rate=0.06, subsample=0.85,
            scale_pos_weight=scale_pos, eval_metric="logloss", random_state=42
        )
    }

    results = {}
    best_model_name = "XGBoost"
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    print("\n--- Training and Evaluating Models ---")
    for name, model in models.items():
        print(f"\n[Evaluating {name}]")
        use_scaled = name in ["LogisticRegression", "SVM"]
        X_tr = X_train_scaled if use_scaled else X_train
        X_te = X_test_scaled if use_scaled else X_test
        X_all = scaler.transform(X) if use_scaled else X

        # 5-Fold Stratified Cross-Validation
        cv_scores = cross_validate(
            model, X_all, y, cv=cv,
            scoring=["accuracy", "recall", "roc_auc", "f1"],
            n_jobs=-1
        )

        # Train on train set, test on hold-out test set
        model.fit(X_tr, y_train)
        y_pred = model.predict(X_te)
        y_proba = model.predict_proba(X_te)[:, 1]

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        roc = roc_auc_score(y_test, y_proba)
        tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
        spec = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0

        metrics = {
            "model_name": name,
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall_sensitivity": round(float(rec), 4),
            "specificity": round(float(spec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(roc), 4),
            "confusion_matrix": {
                "true_negative": int(tn),
                "false_positive": int(fp),
                "false_negative": int(fn),
                "true_positive": int(tp)
            },
            "cross_validation_5fold": {
                "mean_accuracy": round(float(np.mean(cv_scores["test_accuracy"])), 4),
                "std_accuracy": round(float(np.std(cv_scores["test_accuracy"])), 4),
                "mean_sensitivity": round(float(np.mean(cv_scores["test_recall"])), 4),
                "std_sensitivity": round(float(np.std(cv_scores["test_recall"])), 4),
                "mean_roc_auc": round(float(np.mean(cv_scores["test_roc_auc"])), 4),
                "std_roc_auc": round(float(np.std(cv_scores["test_roc_auc"])), 4),
                "mean_f1": round(float(np.mean(cv_scores["test_f1"])), 4)
            }
        }
        results[name] = metrics
        print(f"  Hold-out Test -> Acc: {acc:.4f} | Recall/Sensitivity: {rec:.4f} | Specificity: {spec:.4f} | ROC-AUC: {roc:.4f}")
        print(f"  5-Fold CV     -> Mean Acc: {metrics['cross_validation_5fold']['mean_accuracy']:.4f} | Mean Sensitivity: {metrics['cross_validation_5fold']['mean_sensitivity']:.4f} | Mean ROC-AUC: {metrics['cross_validation_5fold']['mean_roc_auc']:.4f}")

        # Save model artifact
        save_path = os.path.join(SAVED_MODELS_DIR, f"{name.lower()}_model.joblib")
        joblib.dump(model, save_path)

    # Save scaler
    joblib.dump(scaler, os.path.join(SAVED_MODELS_DIR, "scaler.joblib"))

    # Train and serialize SHAP explainer on XGBoost
    print("\nFitting SHAP TreeExplainer on XGBoost...")
    xgb_model = models["XGBoost"]
    explainer = shap.TreeExplainer(xgb_model)
    joblib.dump(explainer, os.path.join(SAVED_MODELS_DIR, "shap_explainer.joblib"))

    # Compute global feature importance rankings using SHAP
    shap_vals = explainer.shap_values(X_test)
    mean_abs_shap = np.abs(shap_vals).mean(axis=0)
    feature_ranking = []
    for idx, f_name in enumerate(FEATURE_NAMES):
        feature_ranking.append({
            "feature_key": f_name,
            "display_name": FEATURE_DISPLAY_NAMES.get(f_name, f_name),
            "mean_abs_shap": round(float(mean_abs_shap[idx]), 4)
        })
    feature_ranking.sort(key=lambda x: x["mean_abs_shap"], reverse=True)

    benchmark_payload = {
        "dataset_info": dataset_info,
        "models": results,
        "recommended_production_model": best_model_name,
        "primary_metric": "Recall / Sensitivity (Minimizing False Negatives in Stroke Screening)",
        "features": FEATURE_NAMES,
        "feature_display_names": FEATURE_DISPLAY_NAMES,
        "shap_global_feature_importance": feature_ranking,
        "trained_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    with open(os.path.join(SAVED_MODELS_DIR, "model_benchmarks.json"), "w") as f:
        json.dump(benchmark_payload, f, indent=2)

    print("\n" + "=" * 70)
    print("Model Training & Benchmarking Complete!")
    print(f"Artifacts successfully saved to: {SAVED_MODELS_DIR}")
    print(f"Recommended Production Model: {best_model_name}")
    print(f"  Accuracy:    {results[best_model_name]['accuracy']}")
    print(f"  Sensitivity: {results[best_model_name]['recall_sensitivity']}")
    print(f"  Specificity: {results[best_model_name]['specificity']}")
    print(f"  ROC-AUC:     {results[best_model_name]['roc_auc']}")
    print("=" * 70)

    return benchmark_payload

if __name__ == "__main__":
    train_and_compare_models()
