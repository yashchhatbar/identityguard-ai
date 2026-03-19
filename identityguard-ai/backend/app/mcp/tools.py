import base64
import os
import uuid
import json
from loguru import logger
from sqlalchemy.orm import Session
from datetime import datetime

from .schemas import (
    VerifyIdentityResponse,
    RegisterIdentityResponse,
    DuplicateCheckResponse,
    AdminStatsResponse,
    UserListResponseItem
)
from ..database import db
from ..database.models import User, SystemLog, MCPLog
from ..database.embedding_store import EmbeddingStore
from ..services.face_engine import FaceEngine
from ..services.liveness_detector import LivenessDetector
from ..services.auth_service import AuthService

TEMP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "temp")
os.makedirs(TEMP_DIR, exist_ok=True)

def _log_mcp_event(session: Session, tool_name: str, request_payload: dict, response_payload: dict):
    req_str = json.dumps(request_payload) if request_payload else None
    res_str = json.dumps(response_payload) if response_payload else None
    log = MCPLog(tool_name=tool_name, request_payload=req_str, response_payload=res_str)
    session.add(log)
    try:
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"Failed to save MCP Log: {e}")

def check_duplicate_activity_logic(token: str) -> dict:
    session = next(db.get_db())
    req_payload = {"token_provided": bool(token)}
    try:
        _verify_admin(token, session)
        from datetime import datetime, timedelta
        yesterday = datetime.utcnow() - timedelta(days=1)
        
        duplicates = session.query(SystemLog).filter(
            SystemLog.event_type == 'Duplicate Detection',
            SystemLog.timestamp >= yesterday
        ).all()
        
        res = {
            "total_duplicates_last_24h": len(duplicates),
            "suspicious_emails": [log.description for log in duplicates]
        }
        _log_mcp_event(session, "check_duplicate_activity", req_payload, res)
        return res
    except Exception as e:
        res = {"error": str(e)}
        _log_mcp_event(session, "check_duplicate_activity", req_payload, res)
        return res

def _decode_image_temp(base64_str: str) -> str:
    # Remove prefix if present: "data:image/jpeg;base64,"
    if "," in base64_str:
        base64_str = base64_str.split(",")[1]
    
    img_data = base64.b64decode(base64_str)
    filepath = os.path.join(TEMP_DIR, f"mcp_{uuid.uuid4().hex}.jpg")
    with open(filepath, "wb") as f:
        f.write(img_data)
    return filepath

    return filepath

def _safe_remove(filepath: str):
    if filepath and os.path.exists(filepath):
        try:
            os.remove(filepath)
        except:
            pass

# Advanced Identity Security Tools (Phase 5 & 10)
def check_fraud_alerts_logic(token: str) -> dict:
    session = next(db.get_db())
    req_payload = {"token_provided": bool(token)}
    try:
        _verify_admin(token, session)
        from ..database.models import FraudAlerts
        alerts = session.query(FraudAlerts).filter(FraudAlerts.resolved == False).order_by(FraudAlerts.timestamp.desc()).limit(20).all()
        result = [
            {
                "id": a.id,
                "user_id": str(a.user_id) if a.user_id else "Unregistered",
                "risk_score": a.risk_score,
                "risk_level": a.risk_level,
                "trigger_event": a.trigger_event,
                "timestamp": str(a.timestamp)
            } for a in alerts
        ]
        _log_mcp_event(session, "check_fraud_alerts", req_payload, {"alert_count": len(result)})
        return {"alerts": result}
    except Exception as e:
        res = {"error": str(e)}
        _log_mcp_event(session, "check_fraud_alerts", req_payload, res)
        return res

def investigate_user_logic(token: str, alert_id: int) -> dict:
    session = next(db.get_db())
    req_payload = {"alert_id": alert_id}
    try:
        _verify_admin(token, session)
        from ..ai.fraud_agent import FraudAgent
        report = FraudAgent.investigate_user_alert(alert_id)
        _log_mcp_event(session, "investigate_user", req_payload, report)
        return report
    except Exception as e:
        res = {"error": str(e)}
        _log_mcp_event(session, "investigate_user", req_payload, res)
        return res

def investigate_embedding_cluster_logic(token: str) -> dict:
    session = next(db.get_db())
    req_payload = {"action": "scan_faiss_clusters"}
    try:
        _verify_admin(token, session)
        from ..security.embedding_cluster_analysis import EmbeddingClusterAnalysis
        from ..vector.faiss_index import faiss_manager
        clusters = EmbeddingClusterAnalysis.identify_clusters(faiss_manager)
        res = {
            "total_farms_detected": len(clusters),
            "clusters": clusters
        }
        _log_mcp_event(session, "investigate_embedding_cluster", req_payload, {"farms_detected": len(clusters)})
        return res
    except Exception as e:
        res = {"error": str(e)}
        _log_mcp_event(session, "investigate_embedding_cluster", req_payload, res)
        return res

def duplicate_activity_report_logic(token: str) -> dict:
    session = next(db.get_db())
    req_payload = {"action": "full_duplicate_report"}
    try:
        _verify_admin(token, session)
        return check_duplicate_activity_logic() # Reuse existing logic
    except Exception as e:
        res = {"error": str(e)}
        _log_mcp_event(session, "duplicate_activity_report", req_payload, res)
        return res

def ai_security_assistant_logic(token: str, query: str) -> dict:
    session = next(db.get_db())
    req_payload = {"query": query}
    try:
        _verify_admin(token, session)
        # Phase 10: In a real system, pass this query to Ollama or a remote LLM
        # For demonstration, we map basic intents to the tools we just built
        query_lower = query.lower()
        if "suspicious" in query_lower or "fraud" in query_lower:
            return check_fraud_alerts_logic(token)
        elif "cluster" in query_lower or "farm" in query_lower:
            return investigate_embedding_cluster_logic(token)
        elif "duplicate" in query_lower:
            return check_duplicate_activity_logic()
        
        res = {"message": "AI Assistant understood the prompt but found no direct mapping. Use explicit investigative tools.", "query": query}
        _log_mcp_event(session, "ai_security_assistant", req_payload, res)
        return res
    except Exception as e:
        res = {"error": str(e)}
        _log_mcp_event(session, "ai_security_assistant", req_payload, res)
        return res

# MCP Tools Implementation
def verify_identity_logic(image_base64: str) -> dict:
    session = next(db.get_db())
    temp_path = ""
    req_payload = {"image_base64_len": len(image_base64)}
    
    try:
        temp_path = _decode_image_temp(image_base64)
        
        is_live = LivenessDetector.analyze_liveness(temp_path)
        if not is_live:
            res = {"verified": False, "message": "Liveness check failed."}
            _log_mcp_event(session, "verify_identity", req_payload, res)
            return res
            
        auth_embedding = FaceEngine.get_embedding(temp_path)
        
        all_users = session.query(User).all()
        if not all_users:
            res = {"verified": False, "message": "No users registered in system."}
            _log_mcp_event(session, "verify_identity", req_payload, res)
            return res
            
        embeddings_dict = {}
        user_map = {}
        for user in all_users:
            try:
                embeddings_dict[user.id] = EmbeddingStore.load_embedding(user.embedding_path)
                user_map[user.id] = user
            except:
                continue
                
        is_match, matched_user_id, highest_sim = FaceEngine.compare_embeddings_batch(auth_embedding, embeddings_dict)
        
        if is_match and matched_user_id in user_map:
            matched_user = user_map[matched_user_id]
            res = {
                "verified": True, 
                "user_id": str(matched_user.id), 
                "similarity_score": round(highest_sim, 4),
                "message": f"Verified successfully as {matched_user.name}"
            }
        else:
            res = {"verified": False, "similarity_score": round(highest_sim, 4), "message": "Face not recognized."}
            
        _log_mcp_event(session, "verify_identity", req_payload, res)
        return res
        
    except Exception as e:
        res = {"verified": False, "message": f"Error: {str(e)}"}
        _log_mcp_event(session, "verify_identity", req_payload, res)
        return res
    finally:
        _safe_remove(temp_path)

def register_identity_logic(name: str, email: str, image_base64: str) -> dict:
    session = next(db.get_db())
    temp_path = ""
    req_payload = {"name": name, "email": email, "image_base64_len": len(image_base64)}
    
    try:
        existing = session.query(User).filter(User.email == email).first()
        if existing:
            res = {"success": False, "message": "Email already registered"}
            _log_mcp_event(session, "register_identity", req_payload, res)
            return res
            
        temp_path = _decode_image_temp(image_base64)
        
        is_live = LivenessDetector.analyze_liveness(temp_path)
        if not is_live:
            res = {"success": False, "message": "Liveness check failed."}
            _log_mcp_event(session, "register_identity", req_payload, res)
            return res
            
        new_embedding = FaceEngine.get_embedding(temp_path)
        
        all_users = session.query(User).all()
        if all_users:
            embeddings_dict = {}
            for user in all_users:
                try:
                    embeddings_dict[user.id] = EmbeddingStore.load_embedding(user.embedding_path)
                except:
                    continue
                    
            is_dupe, matched_id, highest_sim = FaceEngine.compare_embeddings_batch(new_embedding, embeddings_dict)
            if is_dupe:
                res = {"success": False, "message": f"Duplicate identity detected (similarity: {highest_sim:.4f})"}
                _log_mcp_event(session, "register_identity", req_payload, res)
                return res
                
        embedding_path = EmbeddingStore.save_embedding(new_embedding)
        new_user = User(name=name, email=email, embedding_path=embedding_path)
        session.add(new_user)
        session.commit()
        
        # Sync memory index for FAISS vector search
        from ..vector.faiss_index import faiss_manager
        faiss_manager.add_embedding(new_user.id, new_embedding)
        
        log = SystemLog(event_type="Registration", status="Success", description=f"MCP: {email}")
        session.add(log)
        session.commit()
        
        res = {"success": True, "message": f"User {name} registered successfully."}
        _log_mcp_event(session, "register_identity", req_payload, res)
        return res
        
    except Exception as e:
        res = {"success": False, "message": f"Error: {str(e)}"}
        _log_mcp_event(session, "register_identity", req_payload, res)
        return res
    finally:
        _safe_remove(temp_path)

def duplicate_check_logic(image_base64: str) -> dict:
    session = next(db.get_db())
    temp_path = ""
    req_payload = {"image_base64_len": len(image_base64)}
    
    try:
        temp_path = _decode_image_temp(image_base64)
        new_embedding = FaceEngine.get_embedding(temp_path)
        
        all_users = session.query(User).all()
        if not all_users:
            res = {"duplicate_detected": False, "message": "No users in system."}
            _log_mcp_event(session, "duplicate_check", req_payload, res)
            return res
            
        embeddings_dict = {}
        for user in all_users:
            try:
                embeddings_dict[user.id] = EmbeddingStore.load_embedding(user.embedding_path)
            except:
                continue
                
        is_dupe, matched_id, highest_sim = FaceEngine.compare_embeddings_batch(new_embedding, embeddings_dict)
        
        res = {
            "duplicate_detected": is_dupe,
            "similarity_score": round(highest_sim, 4),
            "message": "Duplicate found" if is_dupe else "No duplicate found"
        }
        _log_mcp_event(session, "duplicate_check", req_payload, res)
        return res
        
    except Exception as e:
        res = {"duplicate_detected": False, "message": f"Error: {str(e)}"}
        _log_mcp_event(session, "duplicate_check", req_payload, res)
        return res
    finally:
        _safe_remove(temp_path)

def search_embeddings_logic(image_base64: str) -> dict:
    session = next(db.get_db())
    temp_path = ""
    req_payload = {"image_base64_len": len(image_base64)}
    
    try:
        temp_path = _decode_image_temp(image_base64)
        new_embedding = FaceEngine.get_embedding(temp_path)
        
        all_users = session.query(User).all()
        if not all_users:
            res = {"top_matches": [], "similarity_scores": []}
            _log_mcp_event(session, "search_embeddings", req_payload, res)
            return res
            
        embeddings_dict = {}
        for user in all_users:
            try:
                embeddings_dict[user.id] = EmbeddingStore.load_embedding(user.embedding_path)
            except:
                continue
                
        # Calculate raw dot products against all
        import numpy as np
        if not embeddings_dict:
            res = {"top_matches": [], "similarity_scores": []}
            return res
            
        user_ids = list(embeddings_dict.keys())
        all_embeds = [embeddings_dict[uid] for uid in user_ids]
        db_matrix = np.vstack(all_embeds)
        
        target_norm = new_embedding / np.linalg.norm(new_embedding)
        db_norm = db_matrix / np.linalg.norm(db_matrix, axis=1, keepdims=True)
        similarities = np.dot(db_norm, target_norm.T).flatten()
        
        # Sort indices
        sorted_indices = np.argsort(similarities)[::-1]
        
        top_matches = []
        similarity_scores = []
        
        for idx in sorted_indices[:5]: # Top 5
            top_matches.append(str(user_ids[idx]))
            similarity_scores.append(round(float(similarities[idx]), 4))
            
        res = {
            "top_matches": top_matches,
            "similarity_scores": similarity_scores
        }
        _log_mcp_event(session, "search_embeddings", req_payload, res)
        return res
        
    except Exception as e:
        res = {"top_matches": [], "similarity_scores": [], "error": str(e)}
        _log_mcp_event(session, "search_embeddings", req_payload, res)
        return res
    finally:
        _safe_remove(temp_path)

def _verify_admin(token: str, session: Session):
    import jwt
    from ..services.auth_service import SECRET_KEY, ALGORITHM
    from ..database.models import Admin
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise Exception("Invalid Token Payload.")
    except Exception as e:
        raise Exception(f"JWT Verification Failed: {str(e)}")
        
    admin = session.query(Admin).filter(Admin.username == username).first()
    if not admin:
        raise Exception("Associated Admin User not found.")
    return admin

def get_admin_stats_logic(token: str) -> dict:
    session = next(db.get_db())
    req_payload = {"token_provided": bool(token)}
    try:
        _verify_admin(token, session)
        
        total_users = session.query(User).count()
        total_embeddings = total_users
        duplicate_attempts = session.query(SystemLog).filter(
            SystemLog.event_type == 'Duplicate Detection',
            SystemLog.status == 'Blocked'
        ).count()
        
        res = {
            "total_users": total_users,
            "total_embeddings": total_embeddings,
            "duplicate_attempts": duplicate_attempts,
            "system_health": "Optimal🟢",
            "uptime_hours": 24
        }
        _log_mcp_event(session, "get_admin_stats", req_payload, res)
        return res
    except Exception as e:
        res = {"error": str(e)}
        _log_mcp_event(session, "get_admin_stats", req_payload, res)
        return res

def list_users_logic(token: str) -> dict:
    session = next(db.get_db())
    req_payload = {"token_provided": bool(token)}
    try:
        _verify_admin(token, session)
        
        users = session.query(User).all()
        user_list = []
        for u in users:
            user_list.append({
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "created_at": str(u.created_at)
            })
            
        res = {"users": user_list}
        _log_mcp_event(session, "list_users", req_payload, {"user_count": len(user_list)})
        return res
    except Exception as e:
        res = {"error": str(e)}
        _log_mcp_event(session, "list_users", req_payload, res)
        return res
