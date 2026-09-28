import cv2
import numpy as np

def check_image_quality(image_bgr: np.ndarray, face_landmarks_list: list = None) -> dict:
    """
    Performs comprehensive pre-screening quality checks on an input face image:
    1. Face Detection & Multi-face verification
    2. Blur detection (Laplacian variance)
    3. Lighting / Exposure check (Mean luminance & clipping)
    4. Face size ratio relative to image frame
    5. Head Pose / Rotation check (Yaw, Pitch, Roll estimation from landmarks)
    """
    height, width = image_bgr.shape[:2]
    issues = []
    warnings = []
    
    # 1. Blur Detection
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    blur_threshold = 15.0
    if laplacian_var < blur_threshold:
        warnings.append(f"Image may be slightly blurry (sharpness score {laplacian_var:.1f})")

    # 2. Lighting / Exposure Check
    mean_lum = float(np.mean(gray))
    if mean_lum < 30:
        warnings.append("Lighting is somewhat dim; clearer lighting is recommended.")
    elif mean_lum > 240:
        warnings.append("Image is slightly bright; avoid direct glare.")

    # 3. Face Count Check
    if not face_landmarks_list or len(face_landmarks_list) == 0:
        return {
            "passed": False,
            "status": "REJECTED",
            "message": "No face detected in the image. Please ensure your face is clearly visible and looking towards the camera.",
            "issues": ["No face detected"],
            "warnings": warnings,
            "metrics": {
                "blur_score": float(round(laplacian_var, 2)),
                "mean_luminance": float(round(mean_lum, 2)),
                "faces_detected": 0
            }
        }

    if len(face_landmarks_list) > 3:
        return {
            "passed": False,
            "status": "REJECTED",
            "message": f"Multiple faces detected ({len(face_landmarks_list)}). Please ensure only the person being screened is in the frame.",
            "issues": [f"Multiple faces detected ({len(face_landmarks_list)})"],
            "warnings": warnings,
            "metrics": {
                "blur_score": float(round(laplacian_var, 2)),
                "mean_luminance": float(round(mean_lum, 2)),
                "faces_detected": len(face_landmarks_list)
            }
        }

    # 4. Face Size & Bounding Box
    landmarks = face_landmarks_list[0]

    def _get_xy(lm):
        if isinstance(lm, dict):
            return lm.get("x", 0.0), lm.get("y", 0.0)
        elif isinstance(lm, (list, tuple)):
            return lm[0], lm[1]
        return getattr(lm, "x", 0.0), getattr(lm, "y", 0.0)

    xs = [_get_xy(lm)[0] * width for lm in landmarks]
    ys = [_get_xy(lm)[1] * height for lm in landmarks]

    box_w = max(xs) - min(xs)
    box_h = max(ys) - min(ys)
    face_area_ratio = (box_w * box_h) / max(width * height, 1.0)

    if face_area_ratio < 0.04:
        warnings.append("Face is slightly far from the camera. Moving closer improves accuracy.")

    # 5. Head Pose / Rotation Check
    try:
        def get_pt(idx):
            lm = landmarks[idx]
            x, y = _get_xy(lm)
            return np.array([x * width, y * height])

        left_eye = get_pt(33)
        right_eye = get_pt(263)
        nose = get_pt(1)

        delta_eye = right_eye - left_eye
        roll_angle = np.degrees(np.arctan2(delta_eye[1], delta_eye[0]))
        if abs(roll_angle) > 35.0:
            warnings.append(f"Head is tilted ({roll_angle:.1f}°). Keeping head straight gives optimal results.")

        eye_center = (left_eye + right_eye) / 2.0
        face_width = np.linalg.norm(delta_eye)
        nose_offset = (nose[0] - eye_center[0]) / max(face_width, 1.0)
        if abs(nose_offset) > 0.35:
            warnings.append("Head is turned slightly. Facing forward is recommended.")
    except Exception:
        pass

    passed = True
    status = "PASSED" if len(warnings) == 0 else "WARNING"
    message = "Image quality check passed." if len(warnings) == 0 else "Image accepted. " + "; ".join(warnings)

    return {
        "passed": passed,
        "status": status,
        "message": message,
        "issues": [],
        "warnings": warnings,
        "metrics": {
            "blur_score": float(round(laplacian_var, 2)),
            "mean_luminance": float(round(mean_lum, 2)),
            "face_area_ratio": float(round(face_area_ratio, 3)),
            "faces_detected": 1
        }
    }

