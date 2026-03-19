"""
Duplicate Detector Module

This module is responsible for comparing facial embeddings to determine
if two faces represent the same physical person. It ensures the core 
'One Human = One Account' constraint of the IdentityGuard AI system 
by utilizing configured similarity thresholds.
"""

import numpy as np
from ..utils.similarity import SimilarityUtils

class DuplicateDetector:
    def __init__(self, threshold: float = 0.68):
        """
        DuplicateDetector initialized with the strict similarity threshold 
        to ensure 'One Real Human = One Account'.
        """
        self.threshold = threshold

    def is_duplicate(self, new_embedding: np.ndarray, existing_embedding: np.ndarray) -> bool:
        """
        Compares normalized ArcFace embeddings using Cosine Similarity.
        Returns True if the similarity exceeds the strict threshold.
        """
        similarity_score = SimilarityUtils.cosine_similarity(new_embedding, existing_embedding)
        return similarity_score > self.threshold
