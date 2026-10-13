import os
import sys
import unittest
import numpy as np
import cv2

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.ml.models import model_service
from app.ml.validation import validate_image_authenticity_and_quality
from app.ml.universal_loader import extract_face_image_from_bytes
from app.ml.feature_extraction import extract_distance_invariant_features

class StrokeCareSystemTests(unittest.TestCase):

    def test_01_symmetric_normal_face_prediction(self):
        """Tests that a clinically symmetric healthy face is classified as non-stroke."""
        # Feature vector for healthy face: 93.5% facial symmetry, 79.2% mouth symmetry
        normal_features = [0.05004, 0.06847, 0.1093, 0.00848, 0.0054, 0.02959, 0.03265, 79.23, 97.63, 94.08]
        res = model_service.predict_and_explain(normal_features)
        
        self.assertEqual(res["prediction"], "non_stroke_associated")
        self.assertIn("Non-stroke", res["prediction_display"])
        self.assertGreaterEqual(res["model_confidence"], 0.80)
        print("PASS: test_01_symmetric_normal_face_prediction ->", res["prediction"])

    def test_02_clinical_stroke_face_prediction(self):
        """Tests that a clinical stroke case with true unilateral droop is flagged as stroke_associated."""
        # Feature vector for stroke case: severe oral commissure droop, mouth_symmetry 61.2%
        stroke_features = [0.082, 0.075, 0.145, 0.024, 0.018, 0.075, 0.082, 61.2, 86.4, 63.8]
        res = model_service.predict_and_explain(stroke_features)
        
        self.assertEqual(res["prediction"], "stroke_associated")
        self.assertIn("Stroke-associated", res["prediction_display"])
        self.assertGreaterEqual(res["model_confidence"], 0.80)
        print("PASS: test_02_clinical_stroke_face_prediction ->", res["prediction"])

    def test_03_quality_validation_no_face(self):
        """Tests that a blank or non-face image is rejected with clear error message."""
        blank_img = np.zeros((300, 300, 3), dtype=np.uint8)
        val = validate_image_authenticity_and_quality(blank_img, face_landmarks_list=[])
        
        self.assertFalse(val["is_valid"])
        self.assertEqual(val["authenticity_status"], "NO_FACE")
        self.assertEqual(val["validation_status"], "REJECTED")
        print("PASS: test_03_quality_validation_no_face -> Rejected correctly")

    def test_04_universal_loader_image(self):
        """Tests universal loader with synthetic JPEG buffer."""
        test_img = np.full((200, 200, 3), 180, dtype=np.uint8)
        _, buf = cv2.imencode(".jpg", test_img)
        decoded, desc = extract_face_image_from_bytes(buf.tobytes(), "test.jpg")
        
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded.shape[:2], (200, 200))
        self.assertIn("Image", desc)
        print("PASS: test_04_universal_loader_image ->", desc)

    def test_05_universal_loader_rejects_empty(self):
        """Tests that universal loader rejects empty files."""
        with self.assertRaises(ValueError):
            extract_face_image_from_bytes(b"", "empty.jpg")
        print("PASS: test_05_universal_loader_rejects_empty")

    def test_06_feature_extraction_invariant_keys(self):
        """Tests that geometric symmetry extraction returns all 10 invariant features."""
        # Create minimal 468 landmarks
        dummy_lms = [{"x": float(i % 10) / 10.0, "y": float(i // 10) / 50.0, "z": 0.0} for i in range(468)]
        # Place eyes symmetrically
        dummy_lms[33] = {"x": 0.35, "y": 0.35, "z": 0.0}
        dummy_lms[263] = {"x": 0.65, "y": 0.35, "z": 0.0}
        dummy_lms[1] = {"x": 0.50, "y": 0.45, "z": 0.0}
        dummy_lms[152] = {"x": 0.50, "y": 0.85, "z": 0.0}
        dummy_lms[61] = {"x": 0.40, "y": 0.65, "z": 0.0}
        dummy_lms[291] = {"x": 0.60, "y": 0.65, "z": 0.0}

        features = extract_distance_invariant_features(dummy_lms)
        self.assertIn("facial_symmetry", features)
        self.assertIn("mouth_symmetry", features)
        self.assertIn("feature_vector", features)
        self.assertEqual(len(features["feature_vector"]), 10)
        print("PASS: test_06_feature_extraction_invariant_keys -> 10 features extracted")

if __name__ == "__main__":
    unittest.main()
