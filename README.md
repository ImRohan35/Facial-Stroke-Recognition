# StrokeCare AI — Explainable AI-Based Stroke Screening, Risk Assessment, Monitoring and Recovery Platform

> **Clinical Disclaimer:** StrokeCare AI is an AI-assisted screening, risk-factor assessment, awareness, and recovery-support platform. It is **NOT** a medical diagnostic device and does not replace evaluation by a qualified medical professional, neurologist, or emergency services. If sudden stroke warning signs occur, call **911 / 112** immediately.

---

## 🌟 Platform Capabilities

1. **AI Facial Screening**:
   - Multi-mode input: Image Upload, Live Camera with oval face guide, and 5-second Guided Video recording.
   - Pre-screening quality guard: detects blur, poor lighting, multi-face presence, and head pose tilt.
   - 468-point 3D MediaPipe Face Landmarker with inter-ocular distance (IOD) scale normalization and mid-sagittal alignment.
   - Detection of oral commissure elevation, palpebral fissure height balance, and frontalis muscle asymmetry.
2. **Explainable AI (XAI)**:
   - Powered by SHAP (SHapley Additive exPlanations) to rank anatomical feature contributions.
   - Visual landmark mesh and asymmetry line overlays directly rendered on the face.
3. **Cardiovascular Risk Factor Profiler**:
   - Evidence-based lifestyle and clinical assessment (AHA/ASA guidelines).
   - Flags attention-needed indicators without unsupported predictive percentages.
4. **Personal Baseline & Longitudinal Tracking**:
   - Save your healthy facial symmetry profile as a baseline reference.
   - Differentiates natural physiological asymmetry from sudden changes.
5. **Post-Stroke Recovery Support**:
   - Log daily facial rehabilitation exercises, speech practice minutes, and therapist goals.
6. **B.E. F.A.S.T. Emergency Protocol & Timeline**:
   - Instant emergency action buttons (911 / 112) with symptom onset time recorder.
7. **Doctor-Patient Collaboration Portal**:
   - Consented patient review roster with clinical measurements and telemetry.
   - Exportable, medical-grade PDF clinical reports (ReportLab).
8. **Educational AI Health Assistant**:
   - Guardrailed medical education Q&A with automatic emergency escalation.

---

## 🏗️ System Architecture & Tech Stack

- **Frontend**: React 19, Tailwind CSS, Lucide Icons, Recharts, Axios.
- **Backend API**: Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2, JWT Security (bcrypt).
- **Computer Vision & ML Core**: MediaPipe 1.0 (Tasks FaceLandmarker), OpenCV, Scikit-learn, XGBoost, SHAP.
- **Reporting**: ReportLab PDF generator.
- **Database**: SQLite (default local zero-config) / PostgreSQL production compatible.

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.12+ (or 3.10-3.12)
- Node.js v18+ & npm

### 2. Run Unified Full Website Server (Frontend UI + Backend API on Port 8000)
The platform is configured to serve the complete production web application, static assets, and API from a single server:
```bash
# Navigate to workspace root and run backend server
cd "c:/Users/Dell/Downloads/stroke major project"
.\venv\Scripts\python backend/run.py
```
- **Full Web Application:** `http://localhost:8000/`
- **Interactive API Documentation (Swagger UI):** `http://localhost:8000/docs`
- **System Health Check:** `http://localhost:8000/api/health`

### 3. Alternative: Run Vite Development Server (Port 3000 with HMR)
If actively developing frontend React components with instant hot module reloading:
```bash
cd frontend
npm run dev -- --port 3000
```
- Open `http://localhost:3000` in your web browser (auto-proxies API calls to port 8000).


---

## 👥 Demo Personas (Pre-seeded Accounts)

You can instantly switch personas using the **Demo Persona** dropdown in the top navbar:

| Persona | Email | Password | Role | Features Available |
|---|---|---|---|---|
| **Patient** | `patient@strokecare.ai` | `patient123` | `PATIENT` | Guided Face Test, Risk Profiler, Recovery Hub, Personal Baseline, PDF Reports |
| **Doctor** | `doctor@strokecare.ai` | `doctor123` | `DOCTOR` | Authorized Patient Roster, Clinical Telemetry, Symptom Timelines, Report Review |
| **Admin** | `admin@strokecare.ai` | `admin123` | `ADMIN` | System Analytics, Multi-Model Benchmark Comparison (LogReg, SVM, RF, XGBoost) |

---

## 🔬 Machine Learning Benchmark & Dataset

### 📂 Real Clinical Dataset Provenance
This platform is integrated with and trained on the Kaggle dataset:
**[Annotated Facial Images for Stroke Classification](https://www.kaggle.com/datasets/abdussalamelhanashy/annotated-facial-images-for-stroke-classification)** by *Abdussalam Elhanashy* (CC BY-SA 4.0).
- **Total Source Images:** 3,749 facial images (2,500 Non-Stroke controls + 1,249 Stroke images)
- **MediaPipe 468-point 3D Landmark Yield:** 3,715 successfully extracted (99.09% yield)
- **Class Cohorts:** 1,244 Acute Stroke patterns (33.5%) vs. 2,471 Non-Stroke controls (66.5%)
- **Feature Extraction:** 10 invariant geometric symmetry metrics computed after Inter-Ocular Distance (IOD) scale normalization and mid-sagittal anatomical alignment (Glabella-Menton axis).

### 🛠️ Feature Extraction & Model Training Commands
1. **Extract MediaPipe Features from Dataset Images:**
```bash
.\venv\Scripts\python backend/ml_pipeline/extract_dataset_features.py
```
Outputs: `backend/ml_pipeline/dataset/extracted_features.csv` and `dataset_metadata.json`

2. **Train and Benchmark All 4 Models with 5-Fold Stratified Cross-Validation:**
```bash
.\venv\Scripts\python backend/ml_pipeline/train_and_benchmark.py
```

### 📊 Benchmark Results on Real Kaggle Dataset

| Model | Recall / Sensitivity | Specificity | ROC-AUC | F1-Score | Test Accuracy | 5-Fold CV Accuracy |
|---|---|---|---|---|---|---|
| **XGBoost (Active Production)** | **88.4%** | **87.9%** | **0.9531** | **83.2%** | **88.0%** | **88.5% ± 0.9%** |
| **Random Forest** | 91.6% | 86.6% | 0.9431 | 84.0% | 88.3% | 87.1% ± 0.9% |
| **SVM (RBF Kernel)** | 81.9% | 84.8% | 0.8978 | 77.3% | 83.9% | 83.3% ± 0.8% |
| **Logistic Regression** | 79.9% | 63.0% | 0.7859 | 63.1% | 68.6% | 69.4% ± 1.3% |

Outputs and serialized models are stored in:
`backend/ml_pipeline/saved_models/` (`xgboost_model.joblib`, `shap_explainer.joblib`, `scaler.joblib`, `model_benchmarks.json`)

