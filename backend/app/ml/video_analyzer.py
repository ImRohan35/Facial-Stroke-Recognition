import cv2
import numpy as np
from typing import List, Dict, Any
from app.ml.feature_extraction import FaceMeshExtractor, extract_distance_invariant_features

def analyze_video_frames(video_path: str, max_frames: int = 60) -> Dict[str, Any]:
    """
    Performs Facial Landmark Sequence Analysis across video frames:
    - Extracts MediaPipe landmarks for each frame (Frame 1..N)
    - Computes temporal dynamics:
      * Movement range (amplitude)
      * Left/right movement difference
      * Mouth movement symmetry
      * Eyebrow movement & velocity
      * Eye movement & blink symmetry
      * Facial landmark velocity & acceleration
      * Landmark displacement over time
      * Temporal asymmetry index
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {
            "success": False,
            "error": "Could not open video file."
        }

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    duration_sec = round(total_frames / fps, 2) if total_frames > 0 else 0.0
    
    # Sample uniformly across the video
    step = max(1, total_frames // max_frames) if total_frames > 0 else 1
    
    mesh_extractor = FaceMeshExtractor(static_image_mode=False, max_num_faces=1)
    
    sequence_frames = []
    frame_idx = 0
    sampled_count = 0
    
    # Coordinate sequences for velocity & displacement
    l_mouth_y = []
    r_mouth_y = []
    l_brow_y = []
    r_brow_y = []
    l_eye_open = []
    r_eye_open = []
    timestamps = []
    all_frame_features = []

    while cap.isOpened() and sampled_count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_idx % step == 0:
            timestamp_sec = round(frame_idx / fps, 3)
            faces = mesh_extractor.extract_landmarks(frame)
            
            if faces:
                lms = faces[0]
                features = extract_distance_invariant_features(lms)
                all_frame_features.append(features)
                
                # Critical facial tracking points (normalized)
                l_m_y = float(lms[61]["y"])
                r_m_y = float(lms[291]["y"])
                l_b_y = float(lms[105]["y"])
                r_b_y = float(lms[334]["y"])
                
                # Palpebral fissure heights
                l_e_h = abs(float(lms[159]["y"]) - float(lms[145]["y"]))
                r_e_h = abs(float(lms[386]["y"]) - float(lms[374]["y"]))
                
                l_mouth_y.append(l_m_y)
                r_mouth_y.append(r_m_y)
                l_brow_y.append(l_b_y)
                r_brow_y.append(r_b_y)
                l_eye_open.append(l_e_h)
                r_eye_open.append(r_e_h)
                timestamps.append(timestamp_sec)
                
                sequence_frames.append({
                    "frame_index": frame_idx,
                    "timestamp": timestamp_sec,
                    "facial_symmetry": features["facial_symmetry"],
                    "mouth_symmetry": features["mouth_symmetry"],
                    "eye_symmetry": features["eye_symmetry"],
                    "eyebrow_symmetry": features["eyebrow_symmetry"],
                    "nose_alignment": features["nose_alignment"],
                    "l_mouth_corner_y": round(l_m_y, 4),
                    "r_mouth_corner_y": round(r_m_y, 4),
                    "l_brow_peak_y": round(l_b_y, 4),
                    "r_brow_peak_y": round(r_b_y, 4),
                    "lower_face_asymmetry": features["lower_face_asymmetry"]
                })
            sampled_count += 1
            
        frame_idx += 1

    cap.release()
    mesh_extractor.close()

    if not sequence_frames:
        return {
            "success": False,
            "error": "No face landmarks could be tracked across the video frames. Ensure face is visible."
        }

    # Temporal feature extraction
    n_tracked = len(sequence_frames)
    dt = np.diff(timestamps) if len(timestamps) > 1 else np.array([1.0 / fps])
    dt = np.where(dt <= 0, 1e-3, dt)

    # 1. Movement Range (Amplitudes)
    l_mouth_range = float(np.ptp(l_mouth_y)) if l_mouth_y else 0.0
    r_mouth_range = float(np.ptp(r_mouth_y)) if r_mouth_y else 0.0
    mouth_movement_diff = float(abs(l_mouth_range - r_mouth_range))
    mouth_movement_symmetry = max(0.0, min(100.0, 100.0 - (mouth_movement_diff * 400.0)))

    l_brow_range = float(np.ptp(l_brow_y)) if l_brow_y else 0.0
    r_brow_range = float(np.ptp(r_brow_y)) if r_brow_y else 0.0
    brow_movement_diff = float(abs(l_brow_range - r_brow_range))
    eyebrow_movement_symmetry = max(0.0, min(100.0, 100.0 - (brow_movement_diff * 500.0)))

    l_eye_range = float(np.ptp(l_eye_open)) if l_eye_open else 0.0
    r_eye_range = float(np.ptp(r_eye_open)) if r_eye_open else 0.0
    eye_movement_diff = float(abs(l_eye_range - r_eye_range))
    eye_movement_symmetry = max(0.0, min(100.0, 100.0 - (eye_movement_diff * 600.0)))

    # 2. Landmark Velocities
    l_mouth_vel = np.abs(np.diff(l_mouth_y) / dt) if len(l_mouth_y) > 1 else np.array([0.0])
    r_mouth_vel = np.abs(np.diff(r_mouth_y) / dt) if len(r_mouth_y) > 1 else np.array([0.0])
    mean_l_velocity = float(np.mean(l_mouth_vel))
    mean_r_velocity = float(np.mean(r_mouth_vel))
    velocity_asymmetry = float(abs(mean_l_velocity - mean_r_velocity))

    # 3. Overall Temporal Asymmetry Index
    temporal_asymmetry_index = round(float(
        mouth_movement_diff * 35.0 +
        brow_movement_diff * 25.0 +
        eye_movement_diff * 20.0 +
        velocity_asymmetry * 20.0
    ), 2)

    # 4. Summary Averages Across Sequence
    avg_facial_symmetry = round(float(np.mean([f["facial_symmetry"] for f in sequence_frames])), 1)
    avg_mouth_symmetry = round(float(np.mean([f["mouth_symmetry"] for f in sequence_frames])), 1)
    avg_eye_symmetry = round(float(np.mean([f["eye_symmetry"] for f in sequence_frames])), 1)
    avg_eyebrow_symmetry = round(float(np.mean([f["eyebrow_symmetry"] for f in sequence_frames])), 1)
    avg_nose_alignment = round(float(np.mean([f["nose_alignment"] for f in sequence_frames])), 1)

    # Pick representative frame features (maximum asymmetry expression frame)
    asymmetry_scores = [100.0 - f["facial_symmetry"] for f in sequence_frames]
    peak_idx = int(np.argmax(asymmetry_scores))
    representative_features = all_frame_features[peak_idx]

    return {
        "success": True,
        "total_frames_analyzed": n_tracked,
        "video_duration_seconds": duration_sec,
        "frame_sequence": sequence_frames,
        "temporal_features": {
            "movement_range_left_mouth": round(l_mouth_range, 4),
            "movement_range_right_mouth": round(r_mouth_range, 4),
            "left_right_movement_difference": round(mouth_movement_diff, 4),
            "mouth_movement_symmetry": round(mouth_movement_symmetry, 1),
            "eyebrow_movement_symmetry": round(eyebrow_movement_symmetry, 1),
            "eye_movement_symmetry": round(eye_movement_symmetry, 1),
            "mean_left_landmark_velocity": round(mean_l_velocity, 4),
            "mean_right_landmark_velocity": round(mean_r_velocity, 4),
            "velocity_asymmetry": round(velocity_asymmetry, 4),
            "temporal_asymmetry_index": temporal_asymmetry_index
        },
        "sequence_averages": {
            "facial_symmetry": avg_facial_symmetry,
            "mouth_symmetry": avg_mouth_symmetry,
            "eye_symmetry": avg_eye_symmetry,
            "eyebrow_symmetry": avg_eyebrow_symmetry,
            "nose_alignment": avg_nose_alignment
        },
        "representative_features": representative_features,
        "peak_asymmetry_frame": sequence_frames[peak_idx]
    }
