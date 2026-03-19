import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "identityguard_worker",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    broker_connection_retry_on_startup=True
)

@celery_app.task(name="analyze_fraud_activity")
def analyze_fraud_activity(factors: dict, context_event: str):
    """Offloads the mathematical fraud bounds to Redis Celery workers avoiding GIL locks."""
    from app.security.fraud_detector import FraudDetector
    from app.database.db import SessionLocal
    from app.database.models import FraudAlerts
    from datetime import datetime
    import logging

    session = SessionLocal()
    try:
        score, level, should_alert = FraudDetector.evaluate_activity(factors=factors, context_event=context_event)
        
        if should_alert:
            alert = FraudAlerts(
                user_id=None,
                risk_score=score,
                risk_level=level,
                trigger_event=context_event,
                timestamp=datetime.utcnow(),
                resolved=False
            )
            session.add(alert)
            session.commit()
            logging.warning(f"FRAUD DETECTED [{level}]: Score {score:.2f} on event '{context_event}'")
            
        return {"score": score, "level": level, "should_alert": should_alert}
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()

@celery_app.task(name="scan_embedding_clusters")
def scan_embedding_clusters():
    """Heavy FAISS matrix scanning shifted off the main API memory block."""
    from app.security.embedding_cluster_analysis import EmbeddingClusterAnalysis
    from app.vector.faiss_index import faiss_manager
    clusters = EmbeddingClusterAnalysis.identify_clusters(faiss_manager)
    return {"clusters_detected": len(clusters)}

@celery_app.task(name="generate_ai_investigation")
def generate_ai_investigation(alert_id: int):
    """Extensive LLM agentic behaviors resolving JSON schemas offloaded to background nodes."""
    from app.ai.fraud_agent import FraudAgent
    report = FraudAgent.investigate_user_alert(alert_id)
    return report
