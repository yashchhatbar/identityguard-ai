import asyncio
from datetime import datetime
from loguru import logger
from ..database.db import SessionLocal
from ..database.models import SystemLog, FraudAlerts, User
from ..security.fraud_detector import FraudDetector

class FraudMonitorWorker:
    """
    Background worker that continuously sweeps system logs and checks for
    patterns indicating fraud (e.g. rate limits, concurrent liveness failures).
    """

    def __init__(self, interval_seconds: int = 5):
        self.interval_seconds = interval_seconds
        self.running = False
        self.last_checked_id = 0

    async def start(self):
        self.running = True
        logger.info("FraudMonitor Worker started. Sweeping activity every few seconds.")
        while self.running:
            try:
                self._sweep_activity()
            except Exception as e:
                logger.error(f"FraudMonitor worker error: {e}")
            await asyncio.sleep(self.interval_seconds)

    def stop(self):
        self.running = False
        logger.info("FraudMonitor Worker stopped.")

    def _sweep_activity(self):
        session = SessionLocal()
        try:
            # Get latest logs we haven't checked
            unprocessed_logs = session.query(SystemLog).filter(SystemLog.id > self.last_checked_id).order_by(SystemLog.id.asc()).all()
            
            if not unprocessed_logs:
                return

            logger.debug(f"FraudMonitor sweeping {len(unprocessed_logs)} new system events...")

            for log in unprocessed_logs:
                factors = {"duplicate_attempts": 0.0, "failed_liveness": 0.0, "rapid_registration": 0.0, "embedding_anomaly": 0.0}
                
                # Check for high velocity identical fail patterns
                if log.status == "Blocked":
                    if "Duplicate" in log.event_type:
                        factors["duplicate_attempts"] = 1.0
                    if "Liveness" in log.event_type:
                        factors["failed_liveness"] = 1.0

                # Check registration velocity globally (last 60 seconds)
                recent_regs = session.query(SystemLog).filter(
                    SystemLog.event_type == "Registration",
                    SystemLog.timestamp >= log.timestamp - __import__("datetime").timedelta(seconds=60)
                ).count()
                
                if recent_regs > 10:
                    factors["rapid_registration"] = 1.0
                elif recent_regs > 3:
                    factors["rapid_registration"] = 0.5

                score, level, should_alert = FraudDetector.evaluate_activity(factors=factors, context_event=log.event_type)

                if should_alert:
                    # Optional: link to a User if the log description matches an email
                    user = session.query(User).filter(User.email == log.description).first()
                    alert = FraudAlerts(
                        user_id=user.id if user else None,
                        risk_score=score,
                        risk_level=level,
                        trigger_event=log.event_type,
                        timestamp=datetime.utcnow(),
                        resolved=False
                    )
                    session.add(alert)
                    session.commit()
                    logger.warning(f"FRAUD MONITOR ALERT: {level} Risk generated from event {log.id}")

                self.last_checked_id = max(self.last_checked_id, log.id)

        finally:
            session.close()

# Singleton instance for background execution
fraud_monitor_bg = FraudMonitorWorker()
