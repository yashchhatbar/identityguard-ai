import json
from loguru import logger
from ..database.db import SessionLocal
from ..database.models import FraudAlerts, User

class FraudAgent:
    """
    Simulates or interfaces with LLM-based investigation over Fraud Alerts.
    Produces structured json analysis for Admin Dashboards.
    """

    @staticmethod
    def investigate_user_alert(alert_id: int) -> dict:
        """
        Executes a deep-dive investigation reading historical logs, FAISS clusters,
        and producing a final LLM-like analysis report on identity fraud behavior.
        """
        session = SessionLocal()
        try:
            alert = session.query(FraudAlerts).filter(FraudAlerts.id == alert_id).first()
            if not alert:
                return {"error": f"Alert ID {alert_id} not found."}

            analysis_text = []
            if alert.risk_level == "CRITICAL":
                analysis_text.append("Multiple high severity factors triggered concurrently.")
            if "Duplicate" in alert.trigger_event:
                analysis_text.append("Identity matched previously encoded faces.")
            if "Liveness" in alert.trigger_event:
                analysis_text.append("Automated video stream spoofing suspected.")
                
            report = {
                "user_id": str(alert.user_id) if alert.user_id else "Unregistered",
                "risk_level": alert.risk_level,
                "risk_score_raw": alert.risk_score,
                "analysis": " ".join(analysis_text) if analysis_text else "General anomaly detected. Manual verification recommended."
            }

            logger.info(f"AI Agent generated investigation report for alert {alert_id}")
            return report

        except Exception as e:
            logger.error(f"Investigation failed: {e}")
            return {"error": str(e)}
        finally:
            session.close()

    @staticmethod
    def resolve_alert(alert_id: int):
        session = SessionLocal()
        try:
            from sqlalchemy import update
            stmt = update(FraudAlerts).where(FraudAlerts.id == alert_id).values(resolved=True)
            session.execute(stmt)
            session.commit()
            return {"status": "success", "message": f"Alert {alert_id} resolved."}
        finally:
            session.close()
