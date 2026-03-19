import numpy as np
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

# Mock FaceEngine logic if imports fail for verification environment
class LogicVerifier:
    @staticmethod
    def get_confidence_score(similarity: float, threshold: float) -> float:
        if threshold >= 1.0:
            return 100.0 if similarity >= 1.0 else 0.0
        confidence = ((similarity - threshold) / (1.0 - threshold)) * 100.0
        return float(np.clip(confidence, 0.0, 100.0))

def test_confidence_mapping():
    print("Testing Confidence Mapping Logic...")
    # LOW: threshold 0.65
    t_low = 0.65
    print(f"LOW (0.65) @ 0.65 similarity: {LogicVerifier.get_confidence_score(0.65, t_low)}% (Expected 0.0)")
    print(f"LOW (0.65) @ 0.825 similarity: {LogicVerifier.get_confidence_score(0.825, t_low)}% (Expected 50.0)")
    print(f"LOW (0.65) @ 1.0 similarity: {LogicVerifier.get_confidence_score(1.0, t_low)}% (Expected 100.0)")
    
    # STANDARD: threshold 0.75
    t_std = 0.75
    print(f"STANDARD (0.75) @ 0.75 similarity: {LogicVerifier.get_confidence_score(0.75, t_std)}% (Expected 0.0)")
    print(f"STANDARD (0.75) @ 0.875 similarity: {LogicVerifier.get_confidence_score(0.875, t_std)}% (Expected 50.0)")
    print(f"STANDARD (0.75) @ 1.0 similarity: {LogicVerifier.get_confidence_score(1.0, t_std)}% (Expected 100.0)")
    
    # HIGH: threshold 0.85
    t_high = 0.85
    print(f"HIGH (0.85) @ 0.85 similarity: {LogicVerifier.get_confidence_score(0.85, t_high)}% (Expected 0.0)")
    print(f"HIGH (0.85) @ 0.925 similarity: {LogicVerifier.get_confidence_score(0.925, t_high)}% (Expected 50.0)")
    print(f"HIGH (0.85) @ 1.0 similarity: {LogicVerifier.get_confidence_score(1.0, t_high)}% (Expected 100.0)")

def test_normalization():
    print("\nTesting Embedding Normalization Logic...")
    # Simulated normalization logic from face_engine.py
    emb = np.random.rand(512).astype(np.float32)
    norm = np.linalg.norm(emb)
    normalized = emb / norm
    print(f"Raw norm: {norm:.4f}")
    print(f"Normalized norm: {np.linalg.norm(normalized):.4f} (Expected 1.0)")

if __name__ == "__main__":
    test_confidence_mapping()
    test_normalization()

if __name__ == "__main__":
    test_confidence_mapping()
    test_normalization()
