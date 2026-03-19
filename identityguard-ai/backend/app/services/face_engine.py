import json
import logging
import os
import threading
from collections import OrderedDict

import cv2
import numpy as np
from deepface import DeepFace

logger = logging.getLogger(__name__)

# Force CPU (stable)
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"


class FaceEngine:
    model_name = "Facenet"
    detector_backend = "opencv"

    _warmed_up = False
    _warmup_lock = threading.Lock()

    _embedding_cache = OrderedDict()
    _cache_lock = threading.Lock()

    # -------------------------
    # WARMUP
    # -------------------------
    @classmethod
    def warmup(cls):
        if cls._warmed_up:
            return
        with cls._warmup_lock:
            try:
                DeepFace.build_model(cls.model_name)
                cls._warmed_up = True
                logger.info("✅ Model warmed up")
            except Exception as e:
                logger.warning(f"Warmup failed: {e}")

    # -------------------------
    # CACHE
    # -------------------------
    @classmethod
    def get_cached_embedding(cls, key):
        return cls._embedding_cache.get(key)

    @classmethod
    def set_cached_embedding(cls, key, embedding):
        cls._embedding_cache[key] = embedding

    # -------------------------
    # EMBEDDING
    # -------------------------
    @classmethod
    def get_embedding(cls, image_path):
        cls.warmup()

        img = cv2.imread(image_path)

        if img is None:
            raise ValueError("Invalid image")

        # resize for speed
        h, w = img.shape[:2]
        if max(h, w) > 800:
            scale = 800 / max(h, w)
            img = cv2.resize(img, (int(w * scale), int(h * scale)))

        faces = DeepFace.extract_faces(
            img_path=img,
            detector_backend=cls.detector_backend,
            enforce_detection=True,
        )

        if len(faces) == 0:
            raise ValueError("No face detected")

        if len(faces) > 1:
            raise ValueError("Multiple faces detected")

        face = faces[0]["face"]
        face = (face * 255).astype("uint8")

        embedding_obj = DeepFace.represent(
            img_path=face,
            model_name=cls.model_name,
            detector_backend="skip",
            enforce_detection=False,
        )

        embedding = np.array(embedding_obj[0]["embedding"], dtype=np.float32)

        return embedding / np.linalg.norm(embedding)

    # -------------------------
    # SIMILARITY
    # -------------------------
    @staticmethod
    def cosine_similarity(a, b):
        return float(np.dot(a, b))

    # -------------------------
    # MATCHING
    # -------------------------
    @staticmethod
    def match_against_embeddings(probe, candidates, threshold):
        best_score = -1.0
        best_user = None

        for user_id, emb in candidates:
            score = FaceEngine.cosine_similarity(probe, emb)
            if score > best_score:
                best_score = score
                best_user = user_id

        if best_score >= threshold:
            return True, best_user, best_score

        return False, None, best_score

    # -------------------------
    # SERIALIZATION
    # -------------------------
    @staticmethod
    def serialize_embedding(e):
        return json.dumps(e.tolist())

    @staticmethod
    def deserialize_embedding(v):
        return np.array(json.loads(v), dtype=np.float32)