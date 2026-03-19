import requests
import time
import os
import cv2
import numpy as np
import uuid

BASE_URL = "http://localhost:8000/api"

def create_dummy_image(path):
    # Create a dummy image (e.g. random noise or blank) that will fail face_recognition or at least pass upload mapping
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    cv2.putText(img, 'Simulation Face', (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    cv2.imwrite(path, img)

def simulate_rapid_registration():
    print("--- SIMULATING RAPID REGISTRATION FRAUD ---")
    img_path = "sim_face.jpg"
    create_dummy_image(img_path)
    
    # We fire 5 rapid registrations (Which triggers velocity metrics in the background monitor)
    for i in range(5):
        try:
            with open(img_path, 'rb') as f:
                res = requests.post(f"{BASE_URL}/register/", data={
                    "name": f"synthetic_bot_{i}",
                    "email": f"bot{i}@farm.local"
                }, files={"image": f})
                print(f"[{i}] Status: {res.status_code} - {res.text}")
        except Exception as e:
            print(f"Error {i}: {e}")
            
    print("Waiting 10 seconds for asynchronous FraudMonitor background workers to sweep the SystemLogs...")
    time.sleep(10)
    
    # Check Admin System Security endpoint
    try:
        res = requests.get(f"{BASE_URL}/system/security-status")
        print("\n--- FRAUD MONITOR RESULTS ---")
        print(res.json())
    except Exception as e:
        print("Failed to fetch security status:", e)
        
    if os.path.exists(img_path):
        os.remove(img_path)

if __name__ == "__main__":
    simulate_rapid_registration()
