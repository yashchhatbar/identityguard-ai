import sys
import os
import numpy as np
import cv2
from loguru import logger

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.services.face_engine import FaceEngine

def verify_pipeline(image_path):
    print(f"\n--- Verifying Pipeline for: {image_path} ---")
    if not os.path.exists(image_path):
        print(f"Error: Image {image_path} not found.")
        return None
    
    try:
        # Extract embedding with debug mode enabled
        embedding = FaceEngine.get_embedding(image_path, debug=True)
        
        print(f"Successfully extracted embedding.")
        print(f"Embedding shape: {embedding.shape}")
        print(f"Embedding norm: {np.linalg.norm(embedding):.4f}")
        
        return embedding
    except Exception as e:
        print(f"Pipeline failed: {e}")
        return None

def test_similarity(emb1, emb2, label="Same Person"):
    similarity = np.dot(emb1, emb2)
    threshold = 0.75
    confidence = FaceEngine.get_confidence_score(similarity, threshold)
    print(f"\nComparing: {label}")
    print(f"Similarity: {similarity:.4f}")
    print(f"Confidence (STANDARD 0.75): {confidence:.2f}%")
    return similarity

if __name__ == "__main__":
    # Use the sample face provided in the backend directory
    sample_img = os.path.join(os.path.dirname(__file__), "..", "sample_face.jpg")
    
    emb1 = verify_pipeline(sample_img)
    
    if emb1 is not None:
        # Test same image similarity
        test_similarity(emb1, emb1, label="Same Image")
        
        # In a real test we would have another image of the same person
        # and an image of a different person.
        # Since I only have one sample, I'll simulate a slight variation for logic check.
        noise = np.random.normal(0, 0.01, emb1.shape).astype(np.float32)
        emb2 = emb1 + noise
        emb2 = emb2 / np.linalg.norm(emb2)
        test_similarity(emb1, emb2, label="Simulated Same Person (with noise)")
        
        diff_person = np.random.rand(512).astype(np.float32)
        diff_person = diff_person / np.linalg.norm(diff_person)
        test_similarity(emb1, diff_person, label="Simulated Different Person (Random)")
