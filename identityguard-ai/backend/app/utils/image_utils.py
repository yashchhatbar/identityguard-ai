import cv2
import base64
import numpy as np
from typing import Tuple

class ImageUtils:
    @staticmethod
    def base64_to_image(base64_string: str) -> np.ndarray:
        """
        Converts a base64 string to an OpenCV image (numpy array).
        """
        try:
            # Handle data URI scheme if present
            if "," in base64_string:
                base64_string = base64_string.split(",")[1]
                
            img_data = base64.b64decode(base64_string)
            nparr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return img
        except Exception as e:
            raise ValueError(f"Failed to decode base64 image: {str(e)}")
            
    @staticmethod
    def detect_and_crop_face(image: np.ndarray) -> Tuple[bool, np.ndarray]:
        """
        Extracts the primary face from an image using OpenCV Haar Cascades
        (Useful for pre-processing before DeepFace if needed).
        """
        # Load the pre-trained Haar cascade for face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        if len(faces) == 0:
            return False, image
            
        # Get the largest face
        largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
        x, y, w, h = largest_face
        
        # Add some padding
        padding = int(w * 0.2)
        y1 = max(0, y - padding)
        y2 = min(image.shape[0], y + h + padding)
        x1 = max(0, x - padding)
        x2 = min(image.shape[1], x + w + padding)
        
        cropped_face = image[y1:y2, x1:x2]
        return True, cropped_face
