import cv2
import numpy as np
import base64
from typing import List, Dict, Any, Optional

def annotate_face_landmarks(image_bgr: np.ndarray, landmarks: List[Dict[str, float]], features: Optional[Dict[str, Any]] = None) -> np.ndarray:
    """
    Renders clean, clinical landmark overlay on the face:
    - Mid-sagittal symmetry axis (cyan line through forehead, nose tip, chin)
    - Key facial landmark points (eyes, eyebrows, mouth)
    - Oral commissure alignment vector (magenta line connecting mouth corners)
    - Palpebral fissure alignment (between outer eye corners)
    """
    annotated = image_bgr.copy()
    h, w = annotated.shape[:2]

    def pt(idx):
        lm = landmarks[idx]
        return int(lm["x"] * w), int(lm["y"] * h)

    # 1. Mid-sagittal reference axis
    try:
        forehead = pt(9)
        chin = pt(152)
        cv2.line(annotated, forehead, chin, (255, 230, 0), 2, cv2.LINE_AA)
    except Exception:
        pass

    # 2. Eye alignment axis
    try:
        l_eye = pt(33)
        r_eye = pt(263)
        cv2.line(annotated, l_eye, r_eye, (0, 200, 255), 1, cv2.LINE_AA)
        cv2.circle(annotated, l_eye, 4, (0, 200, 255), -1, cv2.LINE_AA)
        cv2.circle(annotated, r_eye, 4, (0, 200, 255), -1, cv2.LINE_AA)
    except Exception:
        pass

    # 3. Mouth commissure alignment axis
    try:
        l_mouth = pt(61)
        r_mouth = pt(291)
        cv2.line(annotated, l_mouth, r_mouth, (255, 0, 180), 2, cv2.LINE_AA)
        cv2.circle(annotated, l_mouth, 5, (255, 0, 180), -1, cv2.LINE_AA)
        cv2.circle(annotated, r_mouth, 5, (255, 0, 180), -1, cv2.LINE_AA)
    except Exception:
        pass

    # 4. Eyebrows
    try:
        cv2.circle(annotated, pt(105), 4, (0, 255, 120), -1, cv2.LINE_AA)
        cv2.circle(annotated, pt(334), 4, (0, 255, 120), -1, cv2.LINE_AA)
    except Exception:
        pass

    # 5. Selected mesh contour dots (subtle dots for depth)
    sample_indices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
    for idx in sample_indices:
        if idx < len(landmarks):
            p = pt(idx)
            cv2.circle(annotated, p, 2, (180, 180, 180), -1, cv2.LINE_AA)

    return annotated

def image_to_base64(image_bgr: np.ndarray) -> str:
    success, buffer = cv2.imencode('.jpg', image_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 88])
    if not success:
        return ""
    return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"
