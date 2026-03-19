from datetime import datetime
from loguru import logger
import json

class FraudDetector:
    """
    Evaluates actions against a weighted risk algorithm to detect identity farms,
    synthetic generation attempts, and rapid registrations.
    """
    
    # Weights mapped to normalized 0-1 outputs
    WEIGHTS = {
        "duplicate_attempts": 0.4,
        "failed_liveness": 0.3,
        "rapid_registration": 0.2,
        "embedding_anomaly": 0.1
    }

    @staticmethod
    def calculate_risk_score(factors: dict) -> float:
        """
        Factors example mapping (all booleans or normalized floats):
        {
            "duplicate_attempts": 1.0, # (If happened)
            "failed_liveness": 1.0, # (If happened)
            "rapid_registration": 0.5, # Rate
            "embedding_anomaly": 1.0 # (If synthetic detected)
        }
        """
        score = 0.0
        for key, weight in FraudDetector.WEIGHTS.items():
            value = float(factors.get(key, 0.0))
            score += (value * weight)
            
        return min(max(score, 0.0), 1.0) # Clamp 0 to 1

    @staticmethod
    def categorize_risk(score: float) -> str:
        if score >= 0.75:
            return "CRITICAL"
        elif score >= 0.5:
            return "HIGH"
        elif score >= 0.25:
            return "MEDIUM"
        return "LOW"
        
    @staticmethod
    def evaluate_activity(user_id=None, factors=dict, context_event="Registration") -> tuple:
        """
        Primary engine endpoint running mathematical logic for FraudAlert boundaries.
        Returns (score, level, should_alert)
        """
        score = FraudDetector.calculate_risk_score(factors)
        level = FraudDetector.categorize_risk(score)
        
        # Determine if an alert record should be created internally (Threshold > 0.2)
        should_alert = score > 0.2
        if should_alert:
            logger.warning(f"FRAUD DETECTED [{level}]: Score {score:.2f} on event '{context_event}'")
            
        return score, level, should_alert
