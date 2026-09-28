import os
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from typing import Tuple, Dict, Any, List

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "face_landmarker.task")

# Landmark pairs for bilateral symmetry analysis (Left index, Right index)
BILATERAL_PAIRS = [
    # Eyebrows
    (70, 300), (63, 293), (105, 334), (66, 296), (107, 336),
    # Eyes
    (33, 263), (133, 362), (159, 386), (145, 374), (160, 385), (144, 373),
    # Cheeks
    (116, 345), (123, 352), (147, 376), (213, 433),
    # Mouth & Lips
    (61, 291), (78, 308), (81, 311), (178, 402), (87, 317), (14, 14), (13, 13),
    # Jawline
    (234, 454), (93, 323), (132, 361), (58, 288), (172, 397)
]

class FaceMeshExtractor:
    def __init__(self, static_image_mode: bool = True, max_num_faces: int = 2):
        base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
        options = vision.FaceLandmarkerOptions(
            base_options=base_options,
            output_face_blendshapes=False,
            output_facial_transformation_matrixes=False,
            num_faces=max_num_faces,
            min_face_detection_confidence=0.5,
            min_face_presence_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.landmarker = vision.FaceLandmarker.create_from_options(options)

    def extract_landmarks(self, image_bgr: np.ndarray) -> List[List[Dict[str, float]]]:
        """Runs MediaPipe Face Landmarker on BGR image and returns list of landmark coordinates."""
        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)
        results = self.landmarker.detect(mp_image)
        
        if not results.face_landmarks:
            return []
            
        faces = []
        for face_landmarks in results.face_landmarks:
            lms = [{"x": float(lm.x), "y": float(lm.y), "z": float(lm.z)} for lm in face_landmarks]
            faces.append(lms)
        return faces

    def close(self):
        self.landmarker.close()

def extract_distance_invariant_features(landmarks: List[Dict[str, float]]) -> Dict[str, Any]:
    """
    Computes invariant geometric symmetry and asymmetry features from 468 MediaPipe landmarks.
    Normalizes coordinates by Inter-Ocular Distance (IOD) and aligns to mid-sagittal axis.
    """
    L_EYE_OUTER = 33
    R_EYE_OUTER = 263
    L_EYE_INNER = 133
    R_EYE_INNER = 362
    L_EYE_TOP = 159
    L_EYE_BOTTOM = 145
    R_EYE_TOP = 386
    R_EYE_BOTTOM = 374
    
    L_BROW_PEAK = 105
    R_BROW_PEAK = 334
    
    L_MOUTH_CORNER = 61
    R_MOUTH_CORNER = 291
    UPPER_LIP = 13
    LOWER_LIP = 14
    
    NOSE_TIP = 1
    NOSE_BRIDGE = 168
    GLABELLA = 9
    MENTON = 152

    pts = np.array([[lm["x"], lm["y"], lm["z"]] for lm in landmarks])
    
    # 1. Inter-Ocular Distance (IOD) scale factor
    iod = np.linalg.norm(pts[L_EYE_OUTER, :2] - pts[R_EYE_OUTER, :2])
    scale = 1.0 / max(iod, 1e-6)
    
    # 2. Mid-Sagittal Reference Axis (from Glabella 9 to Menton 152)
    mid_vector = pts[MENTON, :2] - pts[GLABELLA, :2]
    mid_angle = np.arctan2(mid_vector[1], mid_vector[0]) - (np.pi / 2.0)
    
    # Rotation matrix to align mid-sagittal line vertically
    cos_a, sin_a = np.cos(-mid_angle), np.sin(-mid_angle)
    R = np.array([[cos_a, -sin_a], [sin_a, cos_a]])
    
    # Center origin at midpoint of Glabella and Menton
    mid_origin = (pts[GLABELLA, :2] + pts[MENTON, :2]) / 2.0
    pts_rot = np.dot(pts[:, :2] - mid_origin, R.T) * scale
    
    # 3. Regional Asymmetry Calculations
    
    # A. Mouth / Lip Corner Asymmetry
    mouth_l = pts_rot[L_MOUTH_CORNER]
    mouth_r = pts_rot[R_MOUTH_CORNER]
    mouth_vert_asym = abs(mouth_l[1] - mouth_r[1])
    mouth_lateral_asym = abs(abs(mouth_l[0]) - abs(mouth_r[0]))
    mouth_asym_metric = float(mouth_vert_asym * 1.5 + mouth_lateral_asym * 0.5)
    
    # B. Eye Opening Asymmetry
    l_eye_height = np.linalg.norm(pts[L_EYE_TOP, :2] - pts[L_EYE_BOTTOM, :2]) * scale
    r_eye_height = np.linalg.norm(pts[R_EYE_TOP, :2] - pts[R_EYE_BOTTOM, :2]) * scale
    eye_opening_asym = float(abs(l_eye_height - r_eye_height))
    
    # C. Eyebrow Elevation Asymmetry
    l_brow_elev = pts_rot[L_BROW_PEAK, 1] - pts_rot[L_EYE_TOP, 1]
    r_brow_elev = pts_rot[R_BROW_PEAK, 1] - pts_rot[R_EYE_TOP, 1]
    eyebrow_asym = float(abs(l_brow_elev - r_brow_elev))
    
    # D. Nose Alignment Deviation
    # Lateral displacement of nose tip (1) and bridge (168) from mid-sagittal x=0
    nose_dev = float((abs(pts_rot[NOSE_TIP, 0]) + abs(pts_rot[NOSE_BRIDGE, 0])) / 2.0)
    
    # E. Lower Face / Jawline Asymmetry
    jaw_pairs = [(234, 454), (93, 323), (132, 361), (58, 288), (172, 397)]
    jaw_deltas = [abs(abs(pts_rot[lp, 0]) - abs(pts_rot[rp, 0])) + abs(pts_rot[lp, 1] - pts_rot[rp, 1]) for lp, rp in jaw_pairs]
    lower_face_asym = float(np.mean(jaw_deltas))
    
    # F. Landmark Displacement Across all Bilateral Pairs
    pair_diffs = []
    for lp, rp in BILATERAL_PAIRS:
        diff_x = abs(abs(pts_rot[lp, 0]) - abs(pts_rot[rp, 0]))
        diff_y = abs(pts_rot[lp, 1] - pts_rot[rp, 1])
        pair_diffs.append(np.sqrt(diff_x**2 + diff_y**2))
    landmark_displacement_mean = float(np.mean(pair_diffs))
    
    # 4. Clinical Symmetry Scores (0 - 100 Index, 100 = symmetric)
    mouth_symmetry_score = max(0.0, min(100.0, 100.0 - (mouth_asym_metric * 190.0)))
    eye_symmetry_score = max(0.0, min(100.0, 100.0 - (eye_opening_asym * 280.0)))
    eyebrow_symmetry_score = max(0.0, min(100.0, 100.0 - (eyebrow_asym * 240.0)))
    nose_alignment_score = max(0.0, min(100.0, 100.0 - (nose_dev * 260.0)))
    lower_face_score = max(0.0, min(100.0, 100.0 - (lower_face_asym * 200.0)))
    
    facial_symmetry_score = float(
        mouth_symmetry_score * 0.35 +
        eye_symmetry_score * 0.20 +
        eyebrow_symmetry_score * 0.15 +
        nose_alignment_score * 0.10 +
        lower_face_score * 0.20
    )
    
    # 10-dimensional ML feature vector compatible with trained models
    feature_vector = [
        round(mouth_vert_asym, 5),
        round(mouth_lateral_asym, 5),
        round(mouth_asym_metric, 5),
        round(eye_opening_asym, 5),
        round(eyebrow_asym, 5),
        round(lower_face_asym, 5),
        round(landmark_displacement_mean, 5),
        round(mouth_symmetry_score, 2),
        round(eye_symmetry_score, 2),
        round(lower_face_score, 2)
    ]
    
    feature_names = [
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
    
    key_indices = [
        # Jawline & Contour
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152,
        148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
        # Lips & Mouth
        61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78,
        # Eyes
        33, 160, 158, 133, 153, 144, 263, 387, 385, 362, 380, 373,
        # Eyebrows
        70, 63, 105, 66, 107, 300, 293, 334, 296, 336,
        # Nose & Midline
        9, 168, 1, 2, 164, 0, 11, 12, 13, 14, 15, 16, 17, 18, 200, 199, 175, 152
    ]
    
    ui_landmarks = [
        {"idx": idx, "x": round(float(landmarks[idx]["x"]), 4), "y": round(float(landmarks[idx]["y"]), 4)}
        for idx in key_indices if idx < len(landmarks)
    ]

    return {
        # Section 31 required structure keys:
        "facial_symmetry": round(facial_symmetry_score, 1),
        "eye_symmetry": round(eye_symmetry_score, 1),
        "eyebrow_symmetry": round(eyebrow_symmetry_score, 1),
        "mouth_symmetry": round(mouth_symmetry_score, 1),
        "nose_alignment": round(nose_alignment_score, 1),
        "jaw_symmetry": round(lower_face_score, 1),
        
        # Supporting measurements:
        "facial_symmetry_score": round(facial_symmetry_score, 1),
        "eye_opening_symmetry": round(eye_symmetry_score, 1),
        "eyebrow_height_symmetry": round(eyebrow_symmetry_score, 1),
        "mouth_corner_symmetry": round(mouth_symmetry_score, 1),
        "lower_face_asymmetry": round(lower_face_asym, 3),
        "landmark_displacement_mean": round(landmark_displacement_mean, 3),
        "nose_deviation": round(nose_dev, 4),
        "feature_vector": feature_vector,
        "feature_names": feature_names,
        "ui_landmarks": ui_landmarks
    }
