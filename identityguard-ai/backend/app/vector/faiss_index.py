import os
import faiss
import numpy as np
from loguru import logger

class FaissIndexManager:
    """Manages the FAISS index for high-speed scalable vector similarity searches."""
    
    def __init__(self, dimension: int = 512, index_path: str = None):
        self.dimension = dimension
        self.index_path = index_path or os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
            "data", 
            "faces.index"
        )
        self.index = None
        self.user_ids = []  # Maps FAISS integer ID (index) to actual SQLite User ID
        self.load_index()

    def _create_new_index(self):
        # We use inner product for cosine similarity (assuming normalized vectors)
        self.index = faiss.IndexFlatIP(self.dimension)
        self.user_ids = []
        logger.info("Created new FAISS index (Inner Product).")

    def load_index(self):
        if os.path.exists(self.index_path) and os.path.exists(f"{self.index_path}.ids"):
            try:
                self.index = faiss.read_index(self.index_path)
                with open(f"{self.index_path}.ids", "r") as f:
                    self.user_ids = [int(line.strip()) for line in f.readlines()]
                logger.info(f"Loaded FAISS index with {self.index.ntotal} vectors.")
            except Exception as e:
                logger.error(f"Failed to load FAISS index: {e}")
                self._create_new_index()
        else:
            self._create_new_index()

    def save_index(self):
        if self.index is not None:
            faiss.write_index(self.index, self.index_path)
            with open(f"{self.index_path}.ids", "w") as f:
                for uid in self.user_ids:
                    f.write(f"{uid}\n")
            logger.info(f"Saved FAISS index with {self.index.ntotal} vectors.")

    def add_embedding(self, user_id: int, embedding: np.ndarray):
        """Adds a normalized embedding to the index."""
        if embedding.shape[0] != self.dimension:
            # ArcFace is usually 512. Adjust dimension dynamically if it's the first.
            if self.index.ntotal == 0:
                self.dimension = embedding.shape[0]
                self._create_new_index()
            else:
                raise ValueError(f"Embedding dimension mismatch: {embedding.shape[0]} vs {self.dimension}")

        # Ensure normalized for Inner Product (Cosine)
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
            
        # FAISS expects float32 2D array
        vec = np.array([embedding], dtype=np.float32)
        
        self.index.add(vec)
        self.user_ids.append(user_id)
        self.save_index()
        logger.info(f"Added user_id {user_id} to FAISS index.")

    def search_embedding(self, query_embedding: np.ndarray, top_k: int = 5):
        """Searches for multiple highest similarity vectors."""
        if self.index is None or self.index.ntotal == 0:
            return [], []

        norm = np.linalg.norm(query_embedding)
        if norm > 0:
            query_embedding = query_embedding / norm

        vec = np.array([query_embedding], dtype=np.float32)
        
        k = min(top_k, self.index.ntotal)
        scores, indices = self.index.search(vec, k)
        
        matched_user_ids = []
        similarity_scores = []
        
        for i in range(k):
            idx = indices[0][i]
            if idx != -1 and idx < len(self.user_ids):
                matched_user_ids.append(self.user_ids[idx])
                # Ensure score is standard float
                similarity_scores.append(float(scores[0][i]))
                
        return matched_user_ids, similarity_scores

    def rebuild_index(self, user_ids: list, embeddings: list):
        """Hard refresh of the entire index mapping."""
        if not user_ids or not embeddings:
            self._create_new_index()
            return
            
        self.dimension = embeddings[0].shape[0]
        self._create_new_index()
        
        matrix = np.vstack(embeddings).astype(np.float32)
        # Normalize all
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        matrix = np.divide(matrix, norms, out=np.zeros_like(matrix), where=norms!=0)
        
        self.index.add(matrix)
        self.user_ids = user_ids
        self.save_index()
        logger.info(f"Rebuilt FAISS index from {len(user_ids)} vectors.")

# Global Singleton faiss index manager
faiss_manager = FaissIndexManager()
