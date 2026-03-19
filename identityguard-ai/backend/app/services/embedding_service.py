import numpy as np
from .face_engine import FaceEngine

class EmbeddingService:
    @staticmethod
    def generate_arcface_embedding(image_path: str) -> np.ndarray:
        """
        Service layer specifically requesting an ArcFace embedding vector (512 dimensions)
        utilizing the core FaceEngine wrapper.
        """
        return FaceEngine.get_embedding(image_path)

    @staticmethod
    def cosine_similarity(embedding_a: np.ndarray, embedding_b: np.ndarray) -> float:
        return FaceEngine.cosine_similarity(embedding_a, embedding_b)
