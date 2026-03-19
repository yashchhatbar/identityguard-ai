import numpy as np

class SyntheticFaceDetector:
    """
    Analyzes visual attributes or DeepFace embeddings for anomalies
    typical of GANs or diffusion architectures.
    """
    
    @staticmethod
    def detect_synthetic_artifacts(embedding: np.ndarray) -> float:
        """
        Returns a probability (0-1) that the face is fully synthetic.
        Currently uses heuristic dispersion metrics across the embedding vector.
        Highly unusual sparsity or lack of natural variance could indicate models.
        """
        if embedding is None or len(embedding) == 0:
            return 0.0
            
        # Example Heuristic: Absolute mean density variation
        avg = np.mean(np.abs(embedding))
        std = np.std(embedding)
        
        # Known generic distributions scale between 0.02 and 0.08 naturally
        # A perfectly distributed or flat line indicates generated noise artifacts
        if std < 0.01:
            return 0.9 # High probability synthetic (no texture variation)
        if avg < 0.005: 
            return 0.8
            
        return 0.0 # Clean natural feature set
