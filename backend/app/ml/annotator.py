import cv2
import numpy as np
import base64
from typing import List, Dict, Any, Optional

def annotate_face_landmarks(image_bgr: np.ndarray, landmarks: List[Dict[str, float]], features: Optional[Dict[str, Any]] = None) -> np.ndarray:
    """
    Renders high-definition clinical landmark overlay with distinct anatomical colors:
    - Lips & Oral Commissures: Crimson / Coral Red (BGR: 68, 68, 239)
    - Eyes & Palpebral Apertures: Electric Cyan (BGR: 212, 182, 6)
    - Eyebrows & Frontalis: Vivid Purple / Violet (BGR: 247, 85, 168)
    - Nose & Nasal Bridge: Emerald Green (BGR: 129, 185, 16)
    - Jawline & Mandible Contour: Golden Amber (BGR: 11, 158, 245)
    - Mid-Sagittal Symmetry Axis: Neon Lime Green (BGR: 50, 220, 50)
    - Oral Commissure Vector: Hot Pink / Magenta (BGR: 180, 50, 245)
    """
    annotated = image_bgr.copy()
    h, w = annotated.shape[:2]

    def pt(idx):
        if idx >= len(landmarks):
            return None
        lm = landmarks[idx]
        return int(lm["x"] * w), int(lm["y"] * h)

    # Anatomical index groupings
    mouth_indices = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78, 13]
    eye_indices = [33, 160, 158, 133, 153, 144, 263, 387, 385, 362, 380, 373]
    brow_indices = [70, 63, 105, 66, 107, 300, 293, 334, 296, 336]
    nose_indices = [9, 168, 1, 2, 164, 0, 197, 195, 5, 4]
    jaw_indices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]

    # Color definitions in BGR
    COLOR_MOUTH = (68, 68, 239)       # Red / Coral
    COLOR_EYES = (212, 182, 6)        # Electric Cyan
    COLOR_BROWS = (247, 85, 168)      # Vivid Purple
    COLOR_NOSE = (129, 185, 16)       # Emerald Green
    COLOR_JAW = (11, 158, 245)        # Golden Amber
    COLOR_MIDLINE = (50, 230, 50)     # Neon Lime Green
    COLOR_COMMISSURE = (180, 50, 245) # Hot Pink / Magenta

    # 1. Jawline & Contour dots (Golden Amber)
    for idx in jaw_indices:
        p = pt(idx)
        if p:
            cv2.circle(annotated, p, 2, COLOR_JAW, -1, cv2.LINE_AA)

    # 2. Nose dots (Emerald Green)
    for idx in nose_indices:
        p = pt(idx)
        if p:
            cv2.circle(annotated, p, 3, COLOR_NOSE, -1, cv2.LINE_AA)

    # 3. Eyebrow dots and connector arches (Vivid Purple)
    l_brow_pts = [pt(i) for i in [70, 63, 105, 66, 107] if pt(i)]
    r_brow_pts = [pt(i) for i in [300, 293, 334, 296, 336] if pt(i)]
    for i in range(len(l_brow_pts) - 1):
        cv2.line(annotated, l_brow_pts[i], l_brow_pts[i+1], COLOR_BROWS, 1, cv2.LINE_AA)
    for i in range(len(r_brow_pts) - 1):
        cv2.line(annotated, r_brow_pts[i], r_brow_pts[i+1], COLOR_BROWS, 1, cv2.LINE_AA)
    for idx in brow_indices:
        p = pt(idx)
        if p:
            cv2.circle(annotated, p, 3, COLOR_BROWS, -1, cv2.LINE_AA)

    # 4. Eye dots and eyelid contours (Electric Cyan)
    l_eye_loop = [pt(i) for i in [33, 160, 158, 133, 153, 144] if pt(i)]
    r_eye_loop = [pt(i) for i in [263, 387, 385, 362, 380, 373] if pt(i)]
    if len(l_eye_loop) > 2:
        cv2.polylines(annotated, [np.array(l_eye_loop)], True, COLOR_EYES, 1, cv2.LINE_AA)
    if len(r_eye_loop) > 2:
        cv2.polylines(annotated, [np.array(r_eye_loop)], True, COLOR_EYES, 1, cv2.LINE_AA)
    for idx in eye_indices:
        p = pt(idx)
        if p:
            cv2.circle(annotated, p, 3, COLOR_EYES, -1, cv2.LINE_AA)

    # 5. Mouth & Lip dots and contours (Crimson / Coral Red)
    for idx in mouth_indices:
        p = pt(idx)
        if p:
            cv2.circle(annotated, p, 3, COLOR_MOUTH, -1, cv2.LINE_AA)

    # 6. Mid-Sagittal Symmetry Axis (Neon Lime Green dashed/solid line)
    p_glabella = pt(9) or pt(168)
    p_menton = pt(152)
    if p_glabella and p_menton:
        cv2.line(annotated, p_glabella, p_menton, COLOR_MIDLINE, 2, cv2.LINE_AA)
        cv2.circle(annotated, p_glabella, 4, COLOR_MIDLINE, -1, cv2.LINE_AA)
        cv2.circle(annotated, p_menton, 4, COLOR_MIDLINE, -1, cv2.LINE_AA)

    # 7. Oral Commissure Alignment Vector (Hot Pink connecting mouth corners)
    l_mouth = pt(61)
    r_mouth = pt(291)
    if l_mouth and r_mouth:
        cv2.line(annotated, l_mouth, r_mouth, COLOR_COMMISSURE, 2, cv2.LINE_AA)
        cv2.circle(annotated, l_mouth, 5, COLOR_COMMISSURE, -1, cv2.LINE_AA)
        cv2.circle(annotated, r_mouth, 5, COLOR_COMMISSURE, -1, cv2.LINE_AA)

    return annotated

def image_to_base64(image_bgr: np.ndarray) -> str:
    success, buffer = cv2.imencode('.jpg', image_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 88])
    if not success:
        return ""
    return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"
