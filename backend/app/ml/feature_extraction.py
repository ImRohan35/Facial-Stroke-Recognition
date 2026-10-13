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
    
    # 2. Anatomical Head Roll & Tilt Angle Estimation
    # Skull base anatomy: the inter-pupillary / inter-ocular line is invariant to facial paresis.
    # When head is bent or tilted, this vector gives the true physical roll angle.
    eye_vector = pts[R_EYE_OUTER, :2] - pts[L_EYE_OUTER, :2]
    eye_roll_angle = np.arctan2(eye_vector[1], eye_vector[0])

    # Mid-sagittal line (Glabella 9 to Menton 152) for secondary reference
    mid_vector = pts[MENTON, :2] - pts[GLABELLA, :2]
    glabella_angle = np.arctan2(mid_vector[1], mid_vector[0]) - (np.pi / 2.0)

    # Use eye-line as dominant orientation anchor (85%) with Glabella alignment to withstand severe head tilt
    effective_tilt_angle = eye_roll_angle if abs(eye_roll_angle) > 0.05 else (0.8 * eye_roll_angle + 0.2 * glabella_angle)

    # Rotation matrix to align face perfectly upright (level eyes horizontally and mid-line vertically)
    cos_a, sin_a = np.cos(-effective_tilt_angle), np.sin(-effective_tilt_angle)
    R = np.array([[cos_a, -sin_a], [sin_a, cos_a]])
    
    # Center origin at midpoint of eyes for roll rotation
    eye_midpoint = (pts[L_EYE_OUTER, :2] + pts[R_EYE_OUTER, :2]) / 2.0
    pts_rot = np.dot(pts[:, :2] - eye_midpoint, R.T) * scale

    # Estimated Yaw (horizontal head turn)
    # Nose tip displacement from vertical midline in rotated coordinates
    yaw_factor = float(pts_rot[NOSE_TIP, 0])
    yaw_correction_left = 1.0 + np.clip(yaw_factor * 0.45, -0.3, 0.3)
    yaw_correction_right = 1.0 - np.clip(yaw_factor * 0.45, -0.3, 0.3)
    
    # 3. Regional Asymmetry Calculations
    
    # A. Mouth / Lip Corner Asymmetry (measured in roll-corrected upright coordinates)
    mouth_l = pts_rot[L_MOUTH_CORNER]
    mouth_r = pts_rot[R_MOUTH_CORNER]
    # In upright frame, any Y difference between mouth corners is true clinical droop
    mouth_vert_asym = abs(mouth_l[1] - mouth_r[1])
    # Compensate lateral coordinate for head yaw turn
    l_lat = abs(mouth_l[0]) * yaw_correction_left
    r_lat = abs(mouth_r[0]) * yaw_correction_right
    mouth_lateral_asym = abs(l_lat - r_lat)
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
    nose_dev = float((abs(pts_rot[NOSE_TIP, 0]) + abs(pts_rot[NOSE_BRIDGE, 0])) / 2.0)
    
    # E. Lower Face / Jawline Asymmetry (Yaw-compensated)
    jaw_pairs = [(234, 454), (93, 323), (132, 361), (58, 288), (172, 397)]
    jaw_deltas = [
        abs(abs(pts_rot[lp, 0]) * yaw_correction_left - abs(pts_rot[rp, 0]) * yaw_correction_right) +
        abs(pts_rot[lp, 1] - pts_rot[rp, 1])
        for lp, rp in jaw_pairs
    ]
    lower_face_asym = float(np.mean(jaw_deltas))
    
    # F. Landmark Displacement Across all Bilateral Pairs
    pair_diffs = []
    for lp, rp in BILATERAL_PAIRS:
        diff_x = abs(abs(pts_rot[lp, 0]) * yaw_correction_left - abs(pts_rot[rp, 0]) * yaw_correction_right)
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

    # Regional Differential Breakdown (चेहरे के कौन से हिस्से सामान्य हैं और कौन से अलग)
    # Mouth analysis
    mouth_diff_pct = round(float(mouth_vert_asym * 120.0), 1)
    mouth_is_diff = bool(mouth_vert_asym >= 0.048 or mouth_symmetry_score < 72.0)
    mouth_droop_side = "Right" if mouth_r[1] > mouth_l[1] else "Left" if mouth_l[1] > mouth_r[1] else "None"
    mouth_detail_en = (
        f"{mouth_droop_side} mouth corner is noticeably drooping by {mouth_diff_pct}% (significant asymmetry)."
        if mouth_is_diff else
        "Both mouth corners are evenly balanced. Normal bilateral commissure elevation."
    )
    mouth_detail_hi = (
        f"मुंह का { 'दायां (Right)' if mouth_droop_side == 'Right' else 'बायां (Left)' } कोना {mouth_diff_pct}% नीचे झुका हुआ है (असामान्य)।"
        if mouth_is_diff else
        "मुंह के दोनों कोने पूरी तरह संतुलित हैं। कोई असामान्य झुकाव नहीं है।"
    )

    # Eye analysis
    eye_diff_pct = round(float(eye_opening_asym * 180.0), 1)
    eye_is_diff = bool(eye_opening_asym >= 0.038 or eye_symmetry_score < 70.0)
    eye_affected_side = "Right" if r_eye_height < l_eye_height else "Left" if l_eye_height < r_eye_height else "None"
    eye_detail_en = (
        f"{eye_affected_side} eye shows narrower aperture / eyelid ptosis ({eye_diff_pct}% difference)."
        if eye_is_diff else
        "Both eyes have equal palpebral aperture width. Normal bilateral opening."
    )
    eye_detail_hi = (
        f"{ 'दाहिनी (Right)' if eye_affected_side == 'Right' else 'बाईं (Left)' } आंख की पलक में {eye_diff_pct}% का अंतर पाया गया।"
        if eye_is_diff else
        "दोनों आंखें सामान्य और समान रूप से खुली हैं।"
    )

    # Eyebrow analysis
    brow_diff_pct = round(float(eyebrow_asym * 160.0), 1)
    brow_is_diff = bool(eyebrow_asym >= 0.040 or eyebrow_symmetry_score < 70.0)
    brow_affected_side = "Right" if r_brow_elev < l_brow_elev else "Left" if l_brow_elev < r_brow_elev else "None"
    brow_detail_en = (
        f"{brow_affected_side} eyebrow shows reduced elevation ({brow_diff_pct}% difference)."
        if brow_is_diff else
        "Bilateral eyebrow arch elevation is symmetric and normal."
    )
    brow_detail_hi = (
        f"{ 'दाहिनी (Right)' if brow_affected_side == 'Right' else 'बाईं (Left)' } भौंह में {brow_diff_pct}% असमानता है।"
        if brow_is_diff else
        "दोनों भौंहें समान ऊंचाई पर संतुलित हैं।"
    )

    # Nose alignment
    nose_diff_pct = round(float(nose_dev * 150.0), 1)
    nose_is_diff = bool(nose_dev >= 0.06 or nose_alignment_score < 70.0)
    nose_detail_en = (
        f"Nasal bridge deviates laterally from vertical midline by {nose_diff_pct}%."
        if nose_is_diff else
        "Nose is straight along the mid-sagittal facial axis."
    )
    nose_detail_hi = (
        f"नाक की स्थिति मध्य रेखा से {nose_diff_pct}% विचलित है।"
        if nose_is_diff else
        "नाक पूरी तरह से चेहरे की मध्य-रेखा पर स्थित है।"
    )

    # Jawline analysis
    jaw_diff_pct = round(float(lower_face_asym * 140.0), 1)
    jaw_is_diff = bool(lower_face_asym >= 0.06 or lower_face_score < 70.0)
    jaw_detail_en = (
        f"Lower jawline shows unilateral muscular contour shift ({jaw_diff_pct}% difference)."
        if jaw_is_diff else
        "Bilateral jawline contour and mandibular tone are balanced."
    )
    jaw_detail_hi = (
        f"निचले जबड़े में {jaw_diff_pct}% की असमानता पाई गई।"
        if jaw_is_diff else
        "जबड़े और निचले चेहरे का संतुलन सामान्य है।"
    )

    regional_breakdown = {
        "mouth": {
            "name": "Mouth & Lips",
            "name_hi": "मुंह और होंठ",
            "is_different": mouth_is_diff,
            "status": "ASYMMETRIC" if mouth_is_diff else "NORMAL",
            "status_label": "Different / Drooping (असामान्य)" if mouth_is_diff else "Normal (सामान्य)",
            "symmetry_score": round(mouth_symmetry_score, 1),
            "affected_side": mouth_droop_side,
            "difference_percent": mouth_diff_pct,
            "detail_en": mouth_detail_en,
            "detail_hi": mouth_detail_hi
        },
        "eyes": {
            "name": "Eyes & Eyelids",
            "name_hi": "आंखें और पलकें",
            "is_different": eye_is_diff,
            "status": "ASYMMETRIC" if eye_is_diff else "NORMAL",
            "status_label": "Different / Ptosis (असामान्य)" if eye_is_diff else "Normal (सामान्य)",
            "symmetry_score": round(eye_symmetry_score, 1),
            "affected_side": eye_affected_side,
            "difference_percent": eye_diff_pct,
            "detail_en": eye_detail_en,
            "detail_hi": eye_detail_hi
        },
        "eyebrows": {
            "name": "Eyebrows & Forehead",
            "name_hi": "भौंहे और माथा",
            "is_different": brow_is_diff,
            "status": "ASYMMETRIC" if brow_is_diff else "NORMAL",
            "status_label": "Different / Uneven (असामान्य)" if brow_is_diff else "Normal (सामान्य)",
            "symmetry_score": round(eyebrow_symmetry_score, 1),
            "affected_side": brow_affected_side,
            "difference_percent": brow_diff_pct,
            "detail_en": brow_detail_en,
            "detail_hi": brow_detail_hi
        },
        "nose": {
            "name": "Nose & Midline",
            "name_hi": "नाक और मध्य-रेखा",
            "is_different": nose_is_diff,
            "status": "DEVIATED" if nose_is_diff else "CENTERED",
            "status_label": "Deviated (विचलित)" if nose_is_diff else "Normal / Centered (सामान्य)",
            "symmetry_score": round(nose_alignment_score, 1),
            "affected_side": "None",
            "difference_percent": nose_diff_pct,
            "detail_en": nose_detail_en,
            "detail_hi": nose_detail_hi
        },
        "jaw": {
            "name": "Jawline & Lower Face",
            "name_hi": "जबड़ा और निचला चेहरा",
            "is_different": jaw_is_diff,
            "status": "ASYMMETRIC" if jaw_is_diff else "NORMAL",
            "status_label": "Different (असामान्य)" if jaw_is_diff else "Normal (सामान्य)",
            "symmetry_score": round(lower_face_score, 1),
            "affected_side": "None",
            "difference_percent": jaw_diff_pct,
            "detail_en": jaw_detail_en,
            "detail_hi": jaw_detail_hi
        }
    }

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
        "head_pose": {
            "roll_degrees": round(float(np.degrees(effective_tilt_angle)), 1),
            "yaw_degrees": round(float(yaw_factor * 45.0), 1)
        },
        "feature_vector": feature_vector,
        "feature_names": feature_names,
        "ui_landmarks": ui_landmarks,
        "regional_breakdown": regional_breakdown
    }
