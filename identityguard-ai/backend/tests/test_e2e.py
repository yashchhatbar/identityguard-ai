import requests
import os
import time

BASE_URL = "http://localhost:8000"
IMAGE_URL = "https://raw.githubusercontent.com/opencv/opencv/master/samples/data/lena.jpg"
IMAGE_PATH = "sample_face.jpg"

print("--- DOWNLOADING SAMPLE FACE ---")
if not os.path.exists(IMAGE_PATH):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    res = requests.get(IMAGE_URL, headers=headers)
    with open(IMAGE_PATH, 'wb') as f:
        f.write(res.content)
    print("Downloaded sample_face.jpg")
else:
    # re-download to ensure it's not a corrupted 403 HTML page
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    res = requests.get(IMAGE_URL, headers=headers)
    with open(IMAGE_PATH, 'wb') as f:
        f.write(res.content)
    print("Downloaded sample_face.jpg properly")

print("\n--- TEST 1: SERVER ROOT ---")
try:
    res = requests.get(f"{BASE_URL}/")
    print(res.status_code, res.json())
    assert res.status_code == 200
except Exception as e:
    print(f"FAILED: {e}")

print("\n--- TEST 2: ADMIN SIGNUP ---")
try:
    admin_data = {
        "username": "admin_test",
        "email": "admin@test.com",
        "password": "securepassword123"
    }
    res = requests.post(f"{BASE_URL}/api/admin/signup", json=admin_data)
    print(res.status_code, res.json())
    # 400 is fine if it already exists
except Exception as e:
    print(f"FAILED: {e}")

print("\n--- TEST 3: ADMIN LOGIN (JWT) ---")
token = None
try:
    login_data = {"username": "admin_test", "password": "securepassword123"}
    res = requests.post(f"{BASE_URL}/api/admin/login", data=login_data)
    print(res.status_code, res.json())
    token = res.json().get("access_token")
    assert token is not None
except Exception as e:
    print(f"FAILED: {e}")

print("\n--- TEST 4: PROTECTED ROUTE (/api/admin/stats) ---")
try:
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(f"{BASE_URL}/api/admin/stats", headers=headers)
    print(res.status_code, res.json())
    assert res.status_code == 200
except Exception as e:
    print(f"FAILED: {e}")

print("\n--- TEST 5: REGISTRATION ALGORITHM ---")
try:
    with open(IMAGE_PATH, "rb") as f:
        files = {"image": ("sample_face.jpg", f, "image/jpeg")}
        data = {"name": "Test User", "email": "obama@example.com"}
        res = requests.post(f"{BASE_URL}/api/register", data=data, files=files)
        print(res.status_code, res.json())
        # Can be 200 (Success) or 400 (Duplicate or Liveness failure)
except Exception as e:
    print(f"FAILED: {e}")

print("\n--- TEST 6: DUPLICATE DETECTION ---")
try:
    with open(IMAGE_PATH, "rb") as f:
        files = {"image": ("sample_face.jpg", f, "image/jpeg")}
        data = {"name": "Test User 2", "email": "obama2@example.com"}
        res = requests.post(f"{BASE_URL}/api/register", data=data, files=files)
        print(res.status_code, res.json())
        assert res.status_code == 400 # Should trigger duplicate rejection
except Exception as e:
    print(f"FAILED: {e}")

print("\n--- TEST 7: VERIFICATION PIPELINE ---")
try:
    with open(IMAGE_PATH, "rb") as f:
        files = {"image": ("sample_face.jpg", f, "image/jpeg")}
        res = requests.post(f"{BASE_URL}/api/verify", files=files)
        print(res.status_code, res.json())
except Exception as e:
    print(f"FAILED: {e}")

print("\n--- TEST 8: CHECK SYSTEM LOGS ---")
try:
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(f"{BASE_URL}/api/admin/logs", headers=headers)
    print(res.status_code)
    for log in res.json().get("data", [])[:5]:
        print(f"  {log['type']} [{log['status']}] - {log['email']}")
except Exception as e:
    print(f"FAILED: {e}")
