import numpy as np

class SimilarityUtils:
    @staticmethod
    def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
        """
        Computes the cosine similarity between two 1D NumPy arrays.
        """
        if vec1.shape != vec2.shape:
             raise ValueError("Vectors must have the same dimensions for comparison.")
             
        dot_product = np.dot(vec1, vec2)
        norm_v1 = np.linalg.norm(vec1)
        norm_v2 = np.linalg.norm(vec2)
        
        if norm_v1 == 0 or norm_v2 == 0:
            return 0.0
            
        return float(dot_product / (norm_v1 * norm_v2))
        
    @staticmethod
    def euclidean_distance(vec1: np.ndarray, vec2: np.ndarray) -> float:
        """
        Computes Euclidean distance between two vectors.
        """
        return float(np.linalg.norm(vec1 - vec2))
