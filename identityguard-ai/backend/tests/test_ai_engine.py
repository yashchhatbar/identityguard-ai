import os
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.face_engine import FaceEngine  # noqa: E402


def test_embedding_serialization_round_trip():
    embedding = np.array([0.3, 0.4, 0.5], dtype=np.float32)
    serialized = FaceEngine.serialize_embedding(embedding)
    restored = FaceEngine.deserialize_embedding(serialized)

    assert restored.shape == (3,)
    assert np.isclose(np.linalg.norm(restored), 1.0, atol=1e-5)


def test_cosine_similarity_and_threshold_matching():
    base = FaceEngine.normalize_embedding(np.array([1.0, 0.0, 0.0], dtype=np.float32))
    same = FaceEngine.normalize_embedding(np.array([0.99, 0.01, 0.0], dtype=np.float32))
    different = FaceEngine.normalize_embedding(np.array([0.0, 1.0, 0.0], dtype=np.float32))

    assert FaceEngine.cosine_similarity(base, same) > 0.99
    assert FaceEngine.cosine_similarity(base, different) < 0.01

    matched, user_id, score = FaceEngine.match_against_embeddings(
        base,
        [("u1", same), ("u2", different)],
        threshold=0.72,
    )
    assert matched is True
    assert user_id == "u1"
    assert score > 0.99
