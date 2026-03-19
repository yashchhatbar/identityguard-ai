import cv2
import numpy as np

from app.core.logging import compact_log, get_logger

logger = get_logger("identityguard.liveness")


class LivenessService:
    @staticmethod
    def analyze(image_path: str) -> dict:
        image = cv2.imread(image_path)
        if image is None:
            return {
                "is_live": False,
                "score": 0.0,
                "reason": "invalid_image",
                "metrics": {},
            }

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        laplacian = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        std_dev = float(np.std(gray))

        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        saturation = float(np.mean(hsv[:, :, 1]))

        ycrcb = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)
        skin_mask = cv2.inRange(
            ycrcb,
            np.array([0, 133, 77], dtype=np.uint8),
            np.array([255, 173, 127], dtype=np.uint8),
        )
        skin_ratio = float(cv2.countNonZero(skin_mask) / max(skin_mask.size, 1))

        blur_score = min(laplacian / 180.0, 1.0)
        texture_score = min(std_dev / 70.0, 1.0)
        saturation_score = min(saturation / 90.0, 1.0)
        skin_score = min(skin_ratio / 0.35, 1.0)
        weighted_score = (blur_score * 0.35) + (texture_score * 0.25) + (saturation_score * 0.15) + (skin_score * 0.25)

        is_live = weighted_score >= 0.58
        reason = "passed" if is_live else "spoof_suspected"
        logger.info(
            compact_log(
                event="liveness_check",
                score=f"{weighted_score:.4f}",
                is_live=is_live,
                laplacian=f"{laplacian:.2f}",
                skin_ratio=f"{skin_ratio:.3f}",
            )
        )

        return {
            "is_live": is_live,
            "score": round(weighted_score, 4),
            "reason": reason,
            "metrics": {
                "laplacian_variance": round(laplacian, 2),
                "texture_stddev": round(std_dev, 2),
                "mean_saturation": round(saturation, 2),
                "skin_ratio": round(skin_ratio, 4),
            },
        }
