import os
import glob
import time
import json
import cv2
import numpy as np
import pandas as pd
from tqdm import tqdm
import sys

# Add backend directory to path
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BACKEND_DIR)

from app.ml.feature_extraction import FaceMeshExtractor, extract_distance_invariant_features

DATASET_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dataset")
STROKE_DIR = os.path.join(DATASET_DIR, "Stroke")
NON_STROKE_DIR = os.path.join(DATASET_DIR, "NonStroke")
OUTPUT_CSV = os.path.join(DATASET_DIR, "extracted_features.csv")
OUTPUT_METADATA = os.path.join(DATASET_DIR, "dataset_metadata.json")

def process_dataset(max_per_class: int = None, batch_save_interval: int = 100):
    print("=" * 70)
    print("Extracting MediaPipe 3D Landmark Features from Kaggle Stroke Dataset")
    print("Dataset: Annotated Facial Images for Stroke Classification (Abdussalam Elhanashy)")
    print("=" * 70)

    stroke_files = sorted(glob.glob(os.path.join(STROKE_DIR, "*.jpg")))
    non_stroke_files = sorted(glob.glob(os.path.join(NON_STROKE_DIR, "*.jpg")))

    if max_per_class is not None:
        stroke_files = stroke_files[:max_per_class]
        non_stroke_files = non_stroke_files[:max_per_class]

    print(f"Discovered {len(stroke_files)} Stroke images and {len(non_stroke_files)} NonStroke images.")
    
    extractor = FaceMeshExtractor(static_image_mode=True, max_num_faces=1)

    items = []
    for f in stroke_files:
        items.append((f, 1, "Stroke"))
    for f in non_stroke_files:
        items.append((f, 0, "NonStroke"))

    records = []
    skipped_no_face = 0
    t0 = time.time()

    print(f"Beginning feature extraction for {len(items)} total candidate images...")

    for idx, (img_path, label, label_name) in enumerate(items):
        img_bgr = cv2.imread(img_path)
        if img_bgr is None:
            skipped_no_face += 1
            continue

        try:
            faces = extractor.extract_landmarks(img_bgr)
            if not faces or len(faces) == 0:
                skipped_no_face += 1
                continue

            feats = extract_distance_invariant_features(faces[0])
            fv = feats["feature_vector"]
            fn = feats["feature_names"]

            row = {
                "image_filename": os.path.basename(img_path),
                "image_path": img_path,
                "label": label,
                "label_name": label_name,
                "facial_symmetry_score": feats["facial_symmetry_score"],
                "mouth_corner_symmetry": feats["mouth_corner_symmetry"],
                "eye_opening_symmetry": feats["eye_opening_symmetry"],
                "eyebrow_height_symmetry": feats["eyebrow_height_symmetry"],
                "lower_face_asymmetry_metric": feats["lower_face_asymmetry"],
                "mean_landmark_displacement_metric": feats["landmark_displacement_mean"],
            }
            # Add all 10 invariant features
            for i, name in enumerate(fn):
                row[name] = fv[i]

            records.append(row)
        except Exception as e:
            skipped_no_face += 1

        if (idx + 1) % 250 == 0 or (idx + 1) == len(items):
            elapsed = time.time() - t0
            print(f"  Processed {idx + 1}/{len(items)} images ({len(records)} valid faces detected, {skipped_no_face} skipped, {elapsed:.1f}s elapsed)")

    extractor.close()

    df = pd.DataFrame(records)
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"\nFeature extraction complete! Saved {len(df)} samples to: {OUTPUT_CSV}")

    # Calculate dataset statistics
    stroke_df = df[df["label"] == 1]
    control_df = df[df["label"] == 0]

    metadata = {
        "dataset_name": "Annotated Facial Images for Stroke Classification",
        "dataset_source": "Kaggle (abdussalamelhanashy/annotated-facial-images-for-stroke-classification)",
        "total_source_images": len(items),
        "total_valid_landmarked_images": len(df),
        "skipped_images_no_landmark": skipped_no_face,
        "landmark_detection_rate": round(len(df) / max(1, len(items)) * 100, 2),
        "class_breakdown": {
            "stroke_count": int(len(stroke_df)),
            "non_stroke_count": int(len(control_df))
        },
        "clinical_averages": {
            "stroke": {
                "mean_facial_symmetry_score": round(float(stroke_df["facial_symmetry_score"].mean()), 2),
                "mean_mouth_symmetry_score": round(float(stroke_df["mouth_corner_symmetry"].mean()), 2),
                "mean_mouth_corner_asymmetry": round(float(stroke_df["mouth_corner_asymmetry"].mean()), 4),
                "mean_lower_face_asymmetry": round(float(stroke_df["lower_face_asymmetry"].mean()), 4)
            },
            "non_stroke": {
                "mean_facial_symmetry_score": round(float(control_df["facial_symmetry_score"].mean()), 2),
                "mean_mouth_symmetry_score": round(float(control_df["mouth_corner_symmetry"].mean()), 2),
                "mean_mouth_corner_asymmetry": round(float(control_df["mouth_corner_asymmetry"].mean()), 4),
                "mean_lower_face_asymmetry": round(float(control_df["lower_face_asymmetry"].mean()), 4)
            }
        },
        "extracted_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    with open(OUTPUT_METADATA, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Dataset metadata and statistics saved to: {OUTPUT_METADATA}")
    print("\nClinical Symmetry Comparison:")
    print(f"  Stroke Mean Facial Symmetry Score:     {metadata['clinical_averages']['stroke']['mean_facial_symmetry_score']:.2f}")
    print(f"  NonStroke Mean Facial Symmetry Score:  {metadata['clinical_averages']['non_stroke']['mean_facial_symmetry_score']:.2f}")
    print(f"  Stroke Mean Mouth Corner Asymmetry:    {metadata['clinical_averages']['stroke']['mean_mouth_corner_asymmetry']:.4f}")
    print(f"  NonStroke Mean Mouth Corner Asymmetry: {metadata['clinical_averages']['non_stroke']['mean_mouth_corner_asymmetry']:.4f}")

    return df, metadata

if __name__ == "__main__":
    process_dataset()
