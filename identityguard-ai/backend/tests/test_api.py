import hashlib
import os
import sys
import tempfile
import uuid
from pathlib import Path

import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

DB_FILE = os.path.join(tempfile.gettempdir(), f"identityguard_test_{uuid.uuid4().hex}.db")
UPLOAD_DIR = os.path.join(tempfile.gettempdir(), f"identityguard_uploads_{uuid.uuid4().hex}")

os.environ["DATABASE_URL"] = f"sqlite:///{DB_FILE}"
os.environ["UPLOAD_DIR"] = UPLOAD_DIR
os.environ["ADMIN_EMAIL"] = "admin@identityguard.ai"
os.environ["ADMIN_PASSWORD"] = "Admin12345!"

from app.main import app  # noqa: E402
from app.services.face_engine import FaceEngine  # noqa: E402


def make_image_bytes(color):
    image = np.full((128, 128, 3), color, dtype=np.uint8)
    success, encoded = cv2.imencode(".jpg", image)
    assert success
    return encoded.tobytes()


@pytest.fixture(autouse=True)
def fake_arcface(monkeypatch):
    raw_images = {
        "user_a": make_image_bytes((255, 0, 0)),
        "user_a_variant": make_image_bytes((250, 5, 0)),
        "user_b": make_image_bytes((245, 10, 0)),
        "different": make_image_bytes((0, 255, 0)),
    }
    embeddings = {
        hashlib.sha256(raw_images["user_a"]).hexdigest(): FaceEngine.normalize_embedding(np.array([1.0, 0.0, 0.0], dtype=np.float32)),
        hashlib.sha256(raw_images["user_a_variant"]).hexdigest(): FaceEngine.normalize_embedding(np.array([0.96, 0.04, 0.0], dtype=np.float32)),
        hashlib.sha256(raw_images["user_b"]).hexdigest(): FaceEngine.normalize_embedding(np.array([0.98, 0.02, 0.0], dtype=np.float32)),
        hashlib.sha256(raw_images["different"]).hexdigest(): FaceEngine.normalize_embedding(np.array([0.0, 1.0, 0.0], dtype=np.float32)),
    }

    def _fake_get_embedding(image_path: str, debug: bool = False):
        content = Path(image_path).read_bytes()
        image_hash = hashlib.sha256(content).hexdigest()
        if image_hash not in embeddings:
            raise ValueError("No face detected in the image")
        return embeddings[image_hash]

    monkeypatch.setattr("app.services.face_service.FaceEngine.get_embedding", _fake_get_embedding)
    monkeypatch.setattr(
        "app.services.face_service.LivenessService.analyze",
        lambda image_path: {
            "is_live": True,
            "score": 0.91,
            "reason": "passed",
            "metrics": {},
        },
    )

    return raw_images


def login(client: TestClient, email: str, password: str) -> str:
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    return response.json()["access_token"]


def test_root_and_health():
    with TestClient(app) as client:
        root = client.get("/")
        assert root.status_code == 200
        assert "Welcome" in root.json()["message"]
        assert root.headers["x-request-id"]

        health = client.get("/api/system/health")
        assert health.status_code == 200
        payload = health.json()
        assert payload["success"] is True
        assert payload["data"]["auth_mode"] == "jwt-rbac"
        assert payload["data"]["face_model_name"] == "ArcFace"
        assert payload["data"]["face_detector_backend"] == "retinaface"

        health_v2 = client.get("/api/health")
        assert health_v2.status_code == 200
        assert health_v2.json()["status"] == "ok"
        assert health_v2.json()["database"] == "connected"

        metrics = client.get("/api/metrics")
        assert metrics.status_code == 200
        assert metrics.json()["requests_total"] >= 3
        assert "/api/health" in metrics.json()["paths"]


def test_auth_register_login_and_me():
    with TestClient(app) as client:
        email = f"user_{uuid.uuid4().hex[:8]}@example.com"
        register = client.post(
            "/api/auth/register",
            json={"name": "Test User", "email": email, "password": "Password123!"},
        )
        assert register.status_code == 200
        assert register.json()["success"] is True
        assert register.json()["data"]["role"] == "user"

        token = login(client, email, "Password123!")
        me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me.status_code == 200
        assert me.json()["data"]["email"] == email
        assert me.headers["x-request-id"]


def test_auth_validation_errors():
    with TestClient(app) as client:
        invalid = client.post(
            "/api/auth/register",
            json={"name": "a", "email": "bad-email", "password": "weakpass"},
        )
        assert invalid.status_code == 422
        payload = invalid.json()
        assert payload["success"] is False
        assert payload["code"] == "validation_error"
        assert payload["errors"]


def test_face_routes_and_admin_duplicates(fake_arcface):
    with TestClient(app) as client:
        email_a = f"usera_{uuid.uuid4().hex[:8]}@example.com"
        email_b = f"userb_{uuid.uuid4().hex[:8]}@example.com"

        client.post("/api/auth/register", json={"name": "User A", "email": email_a, "password": "Password123!"})
        client.post("/api/auth/register", json={"name": "User B", "email": email_b, "password": "Password123!"})

        token_a = login(client, email_a, "Password123!")
        token_b = login(client, email_b, "Password123!")
        admin_token = login(client, "admin@identityguard.ai", "Admin12345!")

        upload_a = client.post(
            "/api/face/upload",
            headers={"Authorization": f"Bearer {token_a}"},
            files={"image": ("face.jpg", fake_arcface["user_a"], "image/jpeg")},
        )
        assert upload_a.status_code == 200
        assert upload_a.json()["data"]["duplicate_detected"] is False
        assert upload_a.json()["data"]["similarity_score"] == 0.0

        verify = client.post(
            "/api/face/verify",
            headers={"Authorization": f"Bearer {token_a}"},
            files={"image": ("face2.jpg", fake_arcface["user_a_variant"], "image/jpeg")},
        )
        assert verify.status_code == 200
        assert verify.json()["data"]["verified"] is True
        assert verify.json()["data"]["similarity_score"] > 0.9

        upload_b = client.post(
            "/api/face/upload",
            headers={"Authorization": f"Bearer {token_b}"},
            files={"image": ("face3.jpg", fake_arcface["user_b"], "image/jpeg")},
        )
        assert upload_b.status_code == 200
        assert upload_b.json()["data"]["duplicate_detected"] is True
        assert upload_b.json()["data"]["matched_user_id"] is not None
        assert upload_b.json()["data"]["similarity_score"] > 0.95

        no_match = client.post(
            "/api/face/verify",
            headers={"Authorization": f"Bearer {token_b}"},
            files={"image": ("face4.jpg", fake_arcface["different"], "image/jpeg")},
        )
        assert no_match.status_code == 200
        assert no_match.json()["data"]["verified"] is False
        assert no_match.json()["data"]["similarity_score"] < 0.72

        users = client.get("/api/admin/users?page=1&page_size=2&search=User", headers={"Authorization": f"Bearer {admin_token}"})
        assert users.status_code == 200
        assert len(users.json()["data"]) <= 2
        assert users.json()["meta"]["page"] == 1
        assert users.json()["meta"]["total"] >= 2

        duplicates = client.get("/api/admin/duplicates?page=1&page_size=5", headers={"Authorization": f"Bearer {admin_token}"})
        assert duplicates.status_code == 200
        assert len(duplicates.json()["data"]) >= 1
        assert duplicates.json()["meta"]["total"] >= 1


def test_invalid_upload_rejected():
    with TestClient(app) as client:
        email = f"user_{uuid.uuid4().hex[:8]}@example.com"
        client.post("/api/auth/register", json={"name": "Uploader", "email": email, "password": "Password123!"})
        token = login(client, email, "Password123!")

        bad_upload = client.post(
            "/api/face/upload",
            headers={"Authorization": f"Bearer {token}"},
            files={"image": ("bad.txt", b"not-an-image", "image/jpeg")},
        )
        assert bad_upload.status_code == 400
        assert bad_upload.json()["success"] is False


def test_liveness_failure_blocks_verification(monkeypatch, fake_arcface):
    monkeypatch.setattr(
        "app.services.face_service.LivenessService.analyze",
        lambda image_path: {
            "is_live": False,
            "score": 0.12,
            "reason": "spoof_suspected",
            "metrics": {},
        },
    )
    with TestClient(app) as client:
        email = f"user_{uuid.uuid4().hex[:8]}@example.com"
        client.post("/api/auth/register", json={"name": "Live User", "email": email, "password": "Password123!"})
        token = login(client, email, "Password123!")

        blocked = client.post(
            "/api/face/verify",
            headers={"Authorization": f"Bearer {token}"},
            files={"image": ("face.jpg", fake_arcface["user_a"], "image/jpeg")},
        )
        assert blocked.status_code == 400
        assert "Liveness check failed" in blocked.json()["message"]
