import os
import numpy as np
import uuid

# Base directory for saving embeddings
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "embeddings")
os.makedirs(DATA_DIR, exist_ok=True)

class EmbeddingStore:
    @staticmethod
    def save_embedding(embedding: np.ndarray) -> str:
        """
        Saves a numpy array to disk and returns the relative path.
        """
        file_name = f"{uuid.uuid4().hex}.npy"
        file_path = os.path.join(DATA_DIR, file_name)
        np.save(file_path, embedding)
        return file_path
    
    @staticmethod
    def load_embedding(file_path: str) -> np.ndarray:
        """
        Loads a numpy array from disk given its file path.
        """
        return np.load(file_path)

    @staticmethod
    def delete_embedding(file_path: str) -> bool:
        """
        Deletes the embedding file.
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
            return True
        except OSError:
            return False
