import requests
import os

MODELS = {
    "face_detection_yunet_2023mar.onnx": "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx",
    "face_recognition_sface_2021dec.onnx": "https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx"
}

def download_models():
    if not os.path.exists("models"):
        os.makedirs("models")
        
    for name, url in MODELS.items():
        path = os.path.join("models", name)
        if not os.path.exists(path):
            print(f"Downloading {name}...")
            r = requests.get(url, allow_redirects=True)
            with open(path, 'wb') as f:
                f.write(r.content)
            print(f"Saved {path}")
        else:
            print(f"{name} exists.")

if __name__ == "__main__":
    download_models()
