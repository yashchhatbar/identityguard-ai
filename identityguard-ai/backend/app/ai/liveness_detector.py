
import numpy as np
import cv2

class LivenessDetector:
    """
    A biological and texture-based liveness detector to distinguish 
    real human faces from statues, masks, and spoofing attacks.
    """
    
    @staticmethod
    def is_likely_human(face_crop, landmarks=None, crop_offset=None):
        """
        High-Recall Liveness Check (Scoring System).
        Prioritizes accepting real humans (even in bad light/angles).
        Only rejects if multiple 'fake' signals accumulate.
        """
        img = np.array(face_crop)
        if img.size == 0: return False, "Empty crop", {}
        
        h, w, _ = img.shape
        if h < 40 or w < 40: return False, f"Face too small ({w}x{h}px).", {}

        # --- PREP ---
        hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
        img_y_cr_cb = cv2.cvtColor(img, cv2.COLOR_RGB2YCrCb)
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        
        h_chan, s_chan, v_chan = cv2.split(hsv)
        
        # --- SCORING SYSTEM ---
        # 0 = Perfect Human
        # > 100 = Likely Fake
        fake_score = 0
        reasons = []
        stats = {}
        
        # 1. SKIN TONE CHECK (YCrCb)
        # Broadened range to support darker skin tones and varying lighting
        min_YCrCb = np.array([0, 125, 60], np.uint8)
        max_YCrCb = np.array([255, 185, 145], np.uint8)
        skin_mask = cv2.inRange(img_y_cr_cb, min_YCrCb, max_YCrCb)
        skin_percent = (np.count_nonzero(skin_mask) / skin_mask.size) * 100
        stats['skin_percent'] = skin_percent
        
        # Reduced penalty to avoid rejecting real faces in bad lighting
        if skin_percent < 20.0:
            fake_score += 40 # Reduced from 60
            reasons.append(f"Low Skin Color ({skin_percent:.1f}%)")
        elif skin_percent < 35.0:
            fake_score += 10 # Minor Penalty
        
        # 2. DOMINANT COLOR / MATERIAL CHECK
        # Check for Gold (Yellow), Blue, Green dominance
        total_pixels = h_chan.size
        # Yellow/Gold is approx Hue 20-40 (OpenCV scale 0-180, so 10-20 approx) -> Gold is often 15-25
        # Blue is 100-130
        
        # Check Gold/Yellow saturation high
        gold_mask = cv2.inRange(hsv, np.array([20, 100, 100]), np.array([35, 255, 255]))
        blue_mask = cv2.inRange(hsv, np.array([90, 50, 50]), np.array([130, 255, 255]))
        
        gold_percent = (np.count_nonzero(gold_mask) / total_pixels) * 100
        blue_percent = (np.count_nonzero(blue_mask) / total_pixels) * 100
        
        if gold_percent > 40.0:
            fake_score += 100 # Immediate Fail likely
            reasons.append("Gold/Yellow Material Detected")
            
        if blue_percent > 40.0:
            fake_score += 100
            reasons.append("Blue Material Detected")

        # 3. TEXTURE CHECK (Laplacian)
        # Statues are smooth. Real faces have noise.
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        stats['texture'] = laplacian_var
        
        # Real cameras can be blurry (score ~20-50).
        # Painted smooth statues often < 10.
        if laplacian_var < 15.0:
            fake_score += 50
            reasons.append(f"Very Smooth Texture ({laplacian_var:.1f})")
        elif laplacian_var < 40.0:
            fake_score += 15 # Minor warning for blur

        # 4. HUE UNIFORMITY (Paint Check)
        # Real skin has *some* variance. Solid paint has near zero.
        # But dark skin in bad light also has low variance.
        # So we only penalize EXTREME uniformity.
        if skin_percent > 10:
            valid_hue = h_chan[skin_mask > 0]
            hue_std = np.std(valid_hue)
            stats['hue_std'] = hue_std
            
            if hue_std < 1.5: # Extremely uniform
                fake_score += 40
                reasons.append("Unnaturally Uniform Color")
        
        # 5. GREYSCALE CHECK (Stone)
        mean_sat = np.mean(s_chan)
        if mean_sat < 9.0:
            fake_score += 30
            reasons.append("Greyscale/Stone Appearance")

        # --- EVALUATION ---
        stats['fake_score'] = fake_score
        
        # Threshold: 100 is a hard fail.
        # We allow up to 99 'points' of suspicion before blocking.
        # This allows a real person to have (Low Skin + Blur) -> 60 + 15 = 75 (PASS)
        # But a Statue (Low Skin + Gold) -> 60 + 100 = 160 (FAIL)
        
        if fake_score >= 90: # Relaxed threshold
            return False, f"Liveness Failed: {', '.join(reasons)}", stats

        return True, "Passed", stats
