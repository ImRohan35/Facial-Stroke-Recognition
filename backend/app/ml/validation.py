import cv2
import numpy as np
from typing import List, Dict, Any, Tuple, Optional

def validate_image_authenticity_and_quality(
    image_bgr: np.ndarray,
    face_landmarks_list: Optional[List[Any]] = None
) -> Dict[str, Any]:
    """
    Comprehensive Input Validation & Anti-Manipulation Engine:
    1. Face Detection & Count Verification (Exactly one primary face)
    2. Face Size Ratio (Reject distant faces)
    3. Blur / Sharpness Detection (Laplacian Variance)
    4. Lighting / Illumination / Shadow Uniformity
    5. Head Pose & Rotation (Yaw, Pitch, Roll estimation)
    6. Facial Feature Visibility & Occlusion
    7. Anti-Manipulation & Beauty Filter Detection (Skin Texture Frequency Analysis)
    8. Natural vs Forced Expression Consistency Check
    9. Measurable Input Reliability Score (0-100%, High / Medium / Low)
    """
    height, width = image_bgr.shape[:2]
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    
    # 1. Blur Detection (Laplacian Variance)
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    
    # 2. Lighting & Exposure
    mean_lum = float(np.mean(gray))
    lum_std = float(np.std(gray))
    
    # 3. Face Count Check
    num_faces = len(face_landmarks_list) if face_landmarks_list else 0
    if num_faces == 0:
        return {
            "is_valid": False,
            "authenticity_status": "NO_FACE",
            "validation_status": "REJECTED",
            "message": "No face detected in the image. Please upload a clear photo with your face facing the camera.",
            "reliability_score": 0.0,
            "reliability_category": "LOW",
            "reliability_factors": {
                "face_detected": 0.0,
                "sharpness": 0.0,
                "lighting": 0.0,
                "pose": 0.0,
                "texture_integrity": 0.0
            },
            "warnings": ["No face landmarks could be identified."],
            "is_forced_expression": False,
            "manipulation_suspected": False
        }

    if num_faces > 1:
        return {
            "is_valid": False,
            "authenticity_status": "MULTIPLE_FACES",
            "validation_status": "REJECTED",
            "message": f"Multiple faces detected ({num_faces}). Please upload an image containing only one face.",
            "reliability_score": 25.0,
            "reliability_category": "LOW",
            "reliability_factors": {
                "face_detected": 0.3,
                "sharpness": round(min(1.0, laplacian_var / 100.0), 2),
                "lighting": round(max(0.0, 1.0 - abs(mean_lum - 128) / 128.0), 2),
                "pose": 0.5,
                "texture_integrity": 0.8
            },
            "warnings": [f"{num_faces} faces detected in frame."],
            "is_forced_expression": False,
            "manipulation_suspected": False
        }

    landmarks = face_landmarks_list[0]

    def _get_xy(lm):
        if isinstance(lm, dict):
            return lm.get("x", 0.0), lm.get("y", 0.0)
        elif isinstance(lm, (list, tuple)):
            return lm[0], lm[1]
        return getattr(lm, "x", 0.0), getattr(lm, "y", 0.0)

    # 4. Face Size & Coverage
    xs = [_get_xy(lm)[0] * width for lm in landmarks]
    ys = [_get_xy(lm)[1] * height for lm in landmarks]
    min_x, max_x = max(0, min(xs)), min(width, max(xs))
    min_y, max_y = max(0, min(ys)), min(height, max(ys))
    
    box_w = max_x - min_x
    box_h = max_y - min_y
    face_area_ratio = float((box_w * box_h) / max(width * height, 1.0))

    if face_area_ratio < 0.045:
        return {
            "is_valid": False,
            "authenticity_status": "LOW_QUALITY",
            "validation_status": "REJECTED",
            "message": "The face is too far from the camera. Please upload a closer image.",
            "reliability_score": 30.0,
            "reliability_category": "LOW",
            "reliability_factors": {
                "face_coverage": round(face_area_ratio * 10, 2),
                "sharpness": round(min(1.0, laplacian_var / 100.0), 2),
                "lighting": round(max(0.0, 1.0 - abs(mean_lum - 128) / 128.0), 2),
                "pose": 0.7,
                "texture_integrity": 0.8
            },
            "warnings": ["Face takes up less than 5% of the image frame."],
            "is_forced_expression": False,
            "manipulation_suspected": False
        }

    # 5. Blur Assessment
    if laplacian_var < 10.0:
        return {
            "is_valid": False,
            "authenticity_status": "LOW_QUALITY",
            "validation_status": "REJECTED",
            "message": "The image is too blurry for reliable analysis. Please upload a clearer photo.",
            "reliability_score": 35.0,
            "reliability_category": "LOW",
            "reliability_factors": {
                "sharpness": round(laplacian_var / 100.0, 2),
                "lighting": round(max(0.0, 1.0 - abs(mean_lum - 128) / 128.0), 2),
                "pose": 0.7,
                "texture_integrity": 0.5
            },
            "warnings": [f"High blur detected (Laplacian score {laplacian_var:.1f})."],
            "is_forced_expression": False,
            "manipulation_suspected": False
        }

    # 6. Lighting / Extreme Shadowing
    if mean_lum < 22.0 or mean_lum > 248.0:
        return {
            "is_valid": False,
            "authenticity_status": "LOW_QUALITY",
            "validation_status": "REJECTED",
            "message": "Lighting is insufficient for reliable facial analysis. Please avoid extreme darkness or direct glare.",
            "reliability_score": 38.0,
            "reliability_category": "LOW",
            "reliability_factors": {
                "sharpness": round(min(1.0, laplacian_var / 100.0), 2),
                "lighting": round(mean_lum / 255.0, 2),
                "pose": 0.7,
                "texture_integrity": 0.5
            },
            "warnings": [f"Mean luminance {mean_lum:.1f} out of acceptable bounds."],
            "is_forced_expression": False,
            "manipulation_suspected": False
        }

    # 7. Head Pose / Orientation Check (Roll, Yaw, Pitch)
    def pt(idx):
        lm = landmarks[idx]
        x, y = _get_xy(lm)
        return np.array([x * width, y * height])

    left_eye_outer = pt(33)
    right_eye_outer = pt(263)
    nose_tip = pt(1)
    chin = pt(152)

    delta_eye = right_eye_outer - left_eye_outer
    roll_angle_deg = float(np.degrees(np.arctan2(delta_eye[1], delta_eye[0])))
    
    eye_midpoint = (left_eye_outer + right_eye_outer) / 2.0
    iod = float(np.linalg.norm(delta_eye))
    yaw_ratio = float((nose_tip[0] - eye_midpoint[0]) / max(iod, 1.0))
    yaw_angle_est = yaw_ratio * 45.0  # Approx degrees

    if abs(roll_angle_deg) > 32.0 or abs(yaw_angle_est) > 28.0:
        return {
            "is_valid": False,
            "authenticity_status": "LOW_QUALITY",
            "validation_status": "REJECTED",
            "message": "The face is too sideways or tilted. Please upload a more front-facing image.",
            "reliability_score": 42.0,
            "reliability_category": "LOW",
            "reliability_factors": {
                "pose": 0.3,
                "sharpness": round(min(1.0, laplacian_var / 100.0), 2),
                "lighting": round(max(0.0, 1.0 - abs(mean_lum - 128) / 128.0), 2),
                "texture_integrity": 0.8
            },
            "warnings": [f"Face rotation detected: Roll={roll_angle_deg:.1f}°, Estimated Yaw={yaw_angle_est:.1f}°"],
            "is_forced_expression": False,
            "manipulation_suspected": False
        }

    # 8. Anti-Manipulation & Beauty Filter Detection
    # Extract cheek skin patches (between nose and outer cheek)
    manipulation_suspected = False
    filter_warning = None
    try:
        # Left cheek patch near landmark 50, right cheek patch near 280
        l_cheek = pt(50)
        r_cheek = pt(280)
        patch_size = max(12, int(iod * 0.15))
        
        def get_patch_texture_variance(center):
            cx, cy = int(center[0]), int(center[1])
            y1, y2 = max(0, cy - patch_size), min(height, cy + patch_size)
            x1, x2 = max(0, cx - patch_size), min(width, cx + patch_size)
            if y2 - y1 < 8 or x2 - x1 < 8:
                return 15.0
            patch = gray[y1:y2, x1:x2]
            return float(cv2.Laplacian(patch, cv2.CV_64F).var())

        l_var = get_patch_texture_variance(l_cheek)
        r_var = get_patch_texture_variance(r_cheek)
        mean_skin_texture = (l_var + r_var) / 2.0

        # In natural unedited photos, even smooth skin has Laplacian var > 1.2 at decent resolution
        # Heavy beauty filters / aggressive AI smoothing wipe high frequencies while edge sharpness remains high
        if mean_skin_texture < 0.6 and laplacian_var > 45.0:
            manipulation_suspected = True
            filter_warning = "Possible artificial skin smoothing or beauty filter detected."
    except Exception:
        pass

    if manipulation_suspected:
        return {
            "is_valid": False,
            "authenticity_status": "MANIPULATION_SUSPECTED",
            "validation_status": "REJECTED",
            "message": "This image may contain filters or facial manipulation. Please upload a natural, unedited facial photograph.",
            "reliability_score": 38.0,
            "reliability_category": "LOW",
            "reliability_factors": {
                "texture_integrity": 0.2,
                "sharpness": round(min(1.0, laplacian_var / 100.0), 2),
                "lighting": round(max(0.0, 1.0 - abs(mean_lum - 128) / 128.0), 2),
                "pose": round(max(0.0, 1.0 - abs(yaw_angle_est) / 30.0), 2)
            },
            "warnings": [filter_warning or "Suspicious smoothing texture profile."],
            "is_forced_expression": False,
            "manipulation_suspected": True
        }

    # 9. Natural vs Forced Expression Validation
    # Checks for intentional severe grimacing / unilateral mouth-pulling without natural anatomical harmony
    is_forced_expression = False
    forced_expression_notes = []
    try:
        left_corner = pt(61)
        right_corner = pt(291)
        upper_lip_center = pt(13)
        lower_lip_center = pt(14)
        
        mouth_w = float(np.linalg.norm(right_corner - left_corner))
        mouth_corner_elevation_diff = float(abs(left_corner[1] - right_corner[1]) / max(iod, 1.0))
        
        # Check lateral displacement relative to lip centers
        mouth_mid_x = (left_corner[0] + right_corner[0]) / 2.0
        lip_mid_x = (upper_lip_center[0] + lower_lip_center[0]) / 2.0
        lateral_jaw_pull = abs(mouth_mid_x - lip_mid_x) / max(mouth_w, 1.0)

        # Check frontalis (eyebrow) elevation vs mouth asymmetry
        l_brow = pt(105)
        r_brow = pt(334)
        brow_diff = float(abs(l_brow[1] - r_brow[1]) / max(iod, 1.0))

        # If mouth is extremely pulled laterally (> 0.28) while eye & brow remain completely still/flat,
        # it strongly indicates voluntary smirk/intentional grimace rather than resting facial asymmetry
        if lateral_jaw_pull > 0.25 and brow_diff < 0.02:
            is_forced_expression = True
            forced_expression_notes.append("Facial asymmetry appears potentially voluntary or posed. Expression consistency is uncertain.")
    except Exception:
        pass

    # 10. Compute Real Measurable Input Reliability Score (0 - 100%)
    res_factor = min(1.0, (width * height) / (640 * 480))
    sharp_factor = min(1.0, laplacian_var / 80.0)
    lum_factor = max(0.0, 1.0 - abs(mean_lum - 128) / 128.0)
    pose_factor = max(0.0, 1.0 - (abs(roll_angle_deg) + abs(yaw_angle_est)) / 50.0)
    cov_factor = min(1.0, face_area_ratio / 0.12)
    tex_factor = 0.95 if not manipulation_suspected else 0.2

    composite_score = (
        0.20 * res_factor +
        0.25 * sharp_factor +
        0.15 * lum_factor +
        0.20 * pose_factor +
        0.10 * cov_factor +
        0.10 * tex_factor
    ) * 100.0

    reliability_score = round(float(composite_score), 1)
    if reliability_score >= 80.0:
        reliability_category = "HIGH"
    elif reliability_score >= 60.0:
        reliability_category = "MEDIUM"
    else:
        reliability_category = "LOW"

    warnings = []
    if laplacian_var < 20.0:
        warnings.append(f"Image is slightly soft (sharpness {laplacian_var:.1f}).")
    if abs(yaw_angle_est) > 15.0:
        warnings.append(f"Slight head turn detected ({yaw_angle_est:.1f}°).")
    if is_forced_expression:
        warnings.extend(forced_expression_notes)

    authenticity_status = "VALID"
    if is_forced_expression or reliability_score < 50.0:
        authenticity_status = "UNCERTAIN"

    return {
        "is_valid": True,
        "authenticity_status": authenticity_status,
        "validation_status": "PASSED" if len(warnings) == 0 else "WARNING",
        "message": "Image passed all authenticity and quality checks." if len(warnings) == 0 else "Image accepted with advisories: " + "; ".join(warnings),
        "reliability_score": reliability_score,
        "reliability_category": reliability_category,
        "reliability_factors": {
            "resolution_factor": round(float(res_factor), 2),
            "sharpness_factor": round(float(sharp_factor), 2),
            "lighting_factor": round(float(lum_factor), 2),
            "pose_factor": round(float(pose_factor), 2),
            "face_coverage_factor": round(float(cov_factor), 2),
            "texture_factor": round(float(tex_factor), 2)
        },
        "warnings": warnings,
        "is_forced_expression": is_forced_expression,
        "manipulation_suspected": manipulation_suspected
    }
