import streamlit as st
from deepface import DeepFace
import numpy as np
import pickle
import os

from sklearn.metrics.pairwise import cosine_similarity
from PIL import Image, ImageGrab, ImageOps
import cv2

# --- App Configuration ---
st.set_page_config(
    page_title="IdentityGuard AI",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- Custom CSS & Aesthetics ---
st.markdown("""
<style>
    /* Import Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

    /* Global Styles */
    .stApp {
        background: rgb(15,23,42);
        background: radial-gradient(circle at top left, #1e293b 0%, #0f172a 100%);
        font-family: 'Inter', sans-serif;
        color: #f8fafc;
    }

    /* Titles & Headers */
    h1, h2, h3 {
        color: #fff;
        font-weight: 700;
        letter-spacing: -0.5px;
    }
    
    /* Custom Card Container */
    .css-card {
        background: rgba(30, 41, 59, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(148, 163, 184, 0.1);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    /* Buttons */
    .stButton > button {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        border: none;
        padding: 0.6rem 1.2rem;
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
    }
    .stButton > button:active {
        transform: translateY(0);
    }
    
    /* Input Fields */
    .stTextInput > div > div > input {
        background-color: rgba(15, 23, 42, 0.6);
        color: white;
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 8px;
    }
    .stTextInput > div > div > input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    /* Sidebar */
    [data-testid="stSidebar"] {
        background-color: #0f172a; /* Match the dark theme */
        border-right: 1px solid rgba(148, 163, 184, 0.1);
    }
    [data-testid="stSidebar"] h1, [data-testid="stSidebar"] h2, [data-testid="stSidebar"] h3, [data-testid="stSidebar"] .stMarkdown {
        color: #e2e8f0 !important;
    }
    
    /* Status Badge Helpers */
    .status-badge {
        padding: 8px 16px;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.9rem;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    .status-success {
        background: rgba(34, 197, 94, 0.1);
        color: #4ade80;
        border: 1px solid rgba(34, 197, 94, 0.2);
    }
    .status-error {
        background: rgba(239, 68, 68, 0.1);
        color: #f87171;
        border: 1px solid rgba(239, 68, 68, 0.2);
    }
    .status-warning {
        background: rgba(245, 158, 11, 0.1);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.2);
    }
    
</style>
""", unsafe_allow_html=True)

# --- Session State Init ---
if "clipboard_image" not in st.session_state:
    st.session_state.clipboard_image = None
if "uploader_key" not in st.session_state:
    st.session_state.uploader_key = 0
if "camera_key" not in st.session_state:
    st.session_state.camera_key = 0
if "reset_trigger" not in st.session_state:
    st.session_state.reset_trigger = False

# Reset inputs if triggered
if st.session_state.reset_trigger:
    st.session_state.name_input = ""
    st.session_state.email_input = ""
    st.session_state.reset_trigger = False
# --- Configuration ---
DB_FILE = 'face_db.pkl'
 

# --- Load Models (DeepFace handles lazy loading) ---
# We don't need explicit loading for DeepFace, it does it on first run.
# But we can pre-warm it.
@st.cache_resource
def warm_up_deepface():
    # Run a dummy representation to load weights
    try:
        # Create a dummy image
        dummy_img = np.zeros((200, 200, 3), dtype=np.uint8)
        DeepFace.represent(dummy_img, model_name="ArcFace", detector_backend="mediapipe", enforce_detection=False)
    except:
        pass
    return True

try:
    with st.spinner("Initializing DeepFace (ArcFace + RetinaFace)..."):
        warm_up_deepface()
except Exception as e:
    st.error(f"Error loading models: {e}")
    st.stop()

# --- Database Functions ---
def load_database():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, 'rb') as f:
                data = pickle.load(f)
                # Migration: Ensure all entries have 'count' for averaging
                for entry in data:
                    if 'count' not in entry:
                        entry['count'] = 1
                return data
        except:
            return []
    return []

def save_database(db):
    with open(DB_FILE, 'wb') as f:
        pickle.dump(db, f)


def assess_face_quality(img_np):
    """
    Check if image is too blurry or too dark/bright.
    Returns: (bool, hint_string, score_dict)
    """
    # 1. Blur Check (Laplacian Variance)
    gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    # 2. Brightness Check
    mean_brightness = np.mean(gray)
    
    scores = {
        "blur_score": laplacian_var,
        "brightness": mean_brightness
    }
    
    warnings = []
    is_good = True
    
    # Thresholds
    BLUR_THRESHOLD = 50.0 # Below this is blurry
    DARK_THRESHOLD = 40.0 # Below this is too dark
    BRIGHT_THRESHOLD = 220.0 # Above this is washed out
    
    if laplacian_var < BLUR_THRESHOLD:
        is_good = False
        warnings.append(f"Image is too blurry (Score: {int(laplacian_var)})")
        
    if mean_brightness < DARK_THRESHOLD:
        is_good = False
        warnings.append("Image is too dark")
    elif mean_brightness > BRIGHT_THRESHOLD:
        is_good = False
        warnings.append("Image is too bright")
        
    return is_good, ", ".join(warnings), scores

# --- Core Logic ---
from liveness_detector import LivenessDetector
import time

def get_embedding(image_pil):
    t_start = time.time()
    timing_logs = []
    
    try:
        # Optimization 2: Resize huge images
        if max(image_pil.size) > 800:
             image_pil.thumbnail((800, 800), Image.Resampling.LANCZOS)
             timing_logs.append("Resized image to max 800px")
        
        t_resize = time.time()
        
        # Convert PIL to Numpy (RGB)
        img_np = np.array(image_pil)
        
        # --- QUALITY CHECK ---
        is_good_quality, quality_msg, q_stats = assess_face_quality(img_np)
        if not is_good_quality:
            # We don't fail hard, but we warn the user strongly
            # For registration, we might fail hard later.
            timing_logs.append(f"Quality Warning: {quality_msg}")
        
        # 1. DETECT FACES via MTCNN
        try:
            img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
            
            # Use MTCNN for better accuracy
            faces = DeepFace.extract_faces(
                img_path=img_bgr, 
                detector_backend="mtcnn", 
                align=True,
                enforce_detection=True
            )
        except ValueError:
            return None, "No face detected (MTCNN)", {}
        
        t_detect = time.time()
        timing_logs.append(f"Face Detection (MTCNN): {t_detect - t_resize:.4f}s")

        if len(faces) == 0:
            return None, "No face detected", {}
            
        top_face = faces[0]
        face_img = top_face['face'] # Normalized
        
        # Convert face_img back to 0-255 uint8
        if face_img.max() <= 1.0:
            face_img_uint8 = (face_img * 255).astype(np.uint8)
        else:
            face_img_uint8 = face_img.astype(np.uint8)
        
        # CLAHE
        if face_img_uint8.ndim == 3:
             lab = cv2.cvtColor(face_img_uint8, cv2.COLOR_RGB2LAB)
             l, a, b = cv2.split(lab)
             clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
             cl = clahe.apply(l)
             limg = cv2.merge((cl,a,b))
             face_img_uint8 = cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)
        
        # --- Liveness Check ---
        is_real, reason, stats = LivenessDetector.is_likely_human(face_img_uint8, landmarks=None, crop_offset=None)
        
        t_live = time.time()
        timing_logs.append(f"Liveness Check: {t_live - t_detect:.4f}s")
        
        if not is_real:
            return None, f"Liveness Check Failed: {reason} (Time: {t_detect - t_start:.2f}s)", q_stats

        # --- Embedding (ArcFace) ---
        embedding_objs = DeepFace.represent(
            img_path=face_img_uint8,
            model_name="ArcFace",
            detector_backend="skip",
            enforce_detection=False,
            align=False
        )
        
        t_embed = time.time()
        timing_logs.append(f"Embedding (ArcFace): {t_embed - t_live:.4f}s")
        timing_logs.append(f"Total Time: {t_embed - t_start:.4f}s")
        
        if not embedding_objs:
             return None, "Embedding generation failed", q_stats
             
        embedding = embedding_objs[0]['embedding']
        
        # Normalize embedding just in case
        embedding = np.array(embedding)
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
            
        return embedding, "\n".join(timing_logs), q_stats

    except Exception as e:
        return None, f"Error: {str(e)}", {}

# --- Main App ---
db = load_database()
FACES_DIR = 'faces'
os.makedirs(FACES_DIR, exist_ok=True)

# sidebar
with st.sidebar:
    st.markdown("### ⚙️ System Status")
    st.metric("Registered User Profiles", len(db))
    
    st.markdown("---")
    st.markdown("### 🔧 Controls")
    
    # ArcFace Cosine Distance Threshold
    # Recommended for ArcFace: 0.68 (DeepFace default), but 0.50 is safer for high matching.
    # Lower = Stricter.
    MATCH_THRESHOLD = st.slider("Match Distance Threshold", 0.30, 0.80, 0.60, 0.05, help="Lower value = Stricter matching (Requires exact face). Higher = Looser.")
    
    if st.button("Reset Database", type="secondary"):
        if os.path.exists(DB_FILE):
             os.remove(DB_FILE)
        for f in os.listdir(FACES_DIR):
             os.remove(os.path.join(FACES_DIR, f))
        st.rerun()
    
    st.markdown("---")
    st.caption("Powered by DeepFace (ArcFace) & MediaPipe") # Credits Updated

# Main Content
st.markdown("<div style='text-align: center; padding-bottom: 2rem;'>", unsafe_allow_html=True)
st.title("🛡️ IdentityGuard")
st.markdown("<p style='font-size: 1.2rem; color: #94a3b8;'>Advanced Face De-duplication & Anti-Spoofing System</p>", unsafe_allow_html=True)
st.markdown("</div>", unsafe_allow_html=True)

# Layout Containers
col_left, col_right = st.columns([1, 1.2], gap="large")

with col_left:
    st.markdown("### 📝 User Details")
    with st.container(border=True):
        name_input = st.text_input("Full Name", placeholder="Enter full name", key="name_input")
        email_input = st.text_input("Email Address", placeholder="Enter email address", key="email_input")

    st.markdown("### 📸 Capture Face")
    
    # Modern Tab Interface for Input
    tab_upload, tab_cam, tab_paste = st.tabs(["📂 Upload", "📷 Webcam", "📋 Paste"])
    
    img_file = None
    input_type = None

    with tab_upload:
        img_file = st.file_uploader("Upload Image", type=['jpg', 'png', 'jpeg'], key=f"uploader_{st.session_state.uploader_key}")
        if img_file: input_type = "upload"

    with tab_cam:
        cam_file = st.camera_input("Take Photo", key=f"camera_{st.session_state.camera_key}")
        if cam_file: 
            img_file = cam_file
            input_type = "camera"

    with tab_paste:
        st.caption("Copy an image to your clipboard and click the button below.")
        if st.button("Paste from Clipboard", use_container_width=True, type="primary"):
            try:
                clipboard_content = ImageGrab.grabclipboard()
                if isinstance(clipboard_content, Image.Image):
                    st.session_state.clipboard_image = clipboard_content.convert("RGB")
                    input_type = "clipboard"
                elif isinstance(clipboard_content, list) and clipboard_content:
                    st.session_state.clipboard_image = Image.open(clipboard_content[0]).convert("RGB")
                    input_type = "clipboard"
                else:
                    st.warning("Clipboard is empty or contains non-image data.")
            except Exception as e:
                st.error(f"Clipboard Error: {e}")
        
        if st.session_state.clipboard_image:
            st.image(st.session_state.clipboard_image, caption="Clipboard Image", width=200)

    # Determine Final Image
    final_image = None
    if input_type == "upload" and img_file:
        final_image = Image.open(img_file).convert('RGB')
    elif input_type == "camera" and img_file:
        final_image = Image.open(img_file).convert('RGB')
    elif st.session_state.clipboard_image:
        final_image = st.session_state.clipboard_image

with col_right:
    st.markdown("### 🔍 Analysis Results")
    
    container = st.container(border=True)
    
    if final_image:
        # Show Image and Process
        with container:
            col_img, col_info = st.columns([1, 2])
            with col_img:
                st.image(final_image, use_column_width=True, caption="Analyzed Image")
            
            with col_info:
                with st.spinner("Running Biometric Analysis..."):
                    embedding, msg, q_stats = get_embedding(final_image)

            st.markdown("---")
            
            # Show Quality Stats in UI
            if q_stats:
                with st.expander("📸 Image Quality Stats", expanded=False):
                    q_col1, q_col2 = st.columns(2)
                    q_col1.metric("Blur Score", f"{int(q_stats.get('blur_score', 0))}", help="Higher is sharper. <50 is blurry.")
                    q_col2.metric("Brightness", f"{int(q_stats.get('brightness', 0))}", help="Should be between 40-220.")
            
            if embedding is None:
                st.markdown(f'''
                <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 2rem;">❌</div>
                    <div>
                        <h4 style="margin: 0; color: #fca5a5;">Verification Failed</h4>
                        <p style="margin: 4px 0 0 0; color: #fca5a5; font-size: 0.95rem;">{msg}</p>
                    </div>
                </div>
                ''', unsafe_allow_html=True)
            else:
                # Logic: Check Duplicates (Multi-Template Gallery Match)
                min_dist = 100
                duplicate_user = None
                nearest_user = None
                
                if len(db) > 0:
                    # Flatten embeddings to enable vector search
                    # Map each embedding index back to the user object
                    all_embeddings = []
                    embedding_owner_map = []
                    
                    for user in db:
                        # Migration support: Handle old 'embedding' format
                        if 'embeddings' not in user:
                            if 'embedding' in user:
                                user['embeddings'] = [user['embedding']]
                                del user['embedding'] # Cleanup old key
                            else:
                                continue # Should not happen

                        for emb in user['embeddings']:
                            all_embeddings.append(emb)
                            embedding_owner_map.append(user)
                            
                    if all_embeddings:
                        db_embeddings = np.array(all_embeddings)
                        current_emb = embedding.reshape(1, -1)
                        
                        from sklearn.metrics.pairwise import cosine_distances
                        dists = cosine_distances(current_emb, db_embeddings)[0]
                        
                        # Find the single best match across all templates
                        min_dist_idx = np.argmin(dists)
                        min_dist = dists[min_dist_idx]
                        
                        nearest_user = embedding_owner_map[min_dist_idx] # User owner of that specific embedding
                        
                        if min_dist < MATCH_THRESHOLD:
                            duplicate_user = nearest_user

                # Display Results
                if duplicate_user:
                    # Recalibrated Sigmoid Confidence
                    # We want 0.50 distance to be ~95% confidence
                    # We want 0.60 distance to be ~85% confidence
                    # Centered at 0.8
                    import math
                    try:
                         # Gentler slope (8) and higher offset (0.8) for optimistic scoring on valid matches
                        confidence = (1 / (1 + math.exp(8 * (min_dist - 0.80)))) * 100
                    except OverflowError:
                        confidence = 0.0 if min_dist > 0.80 else 100.0
                    
                    match_strength_color = "#f97316" # Orange
                    match_strength_msg = "Match"
                    
                    if confidence > 95:
                        match_strength_msg = "Verified Identity (High Confidence)"
                        match_strength_color = "#16a34a" # Green
                    elif confidence > 85:
                        match_strength_msg = "Strong Match"
                        match_strength_color = "#22c55e" # Light Green
                    
                    # AUTO-LEARNING: If match is extremely good (< 0.40), add this new look to DB automatically
                    # This improves future recognition for this user without manual merging.
                    if min_dist < 0.40:
                         if 'embeddings' not in duplicate_user:
                             duplicate_user['embeddings'] = [duplicate_user['embedding']] if 'embedding' in duplicate_user else []
                         
                         # Limit max templates to 10 to keep DB fast
                         if len(duplicate_user['embeddings']) < 10:
                             duplicate_user['embeddings'].append(embedding)
                             duplicate_user['count'] = len(duplicate_user['embeddings'])
                             save_database(db)
                             # Toast, don't rerun/interrupt flow
                             st.toast(f"🧠 IdentityGuard learned this new look for {duplicate_user['name']}!")

                    st.markdown(f'''
                    <div style="background: rgba(220, 38, 38, 0.2); border: 1px solid rgba(220, 38, 38, 0.4); border-radius: 12px; padding: 20px; text-align: center;">
                        <h3 style="color: #fca5a5; margin-bottom: 10px;">🚨 Duplicate Identity</h3>
                        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-top: 10px;">
                            <p style="color: white; font-size: 1.1rem; font-weight: bold; margin: 0;">{duplicate_user['name']}</p>
                            <p style="color: #cbd5e1; margin: 5px 0;">{duplicate_user.get('email', 'No Email')}</p>
                            <div style="margin-top: 10px; font-size: 0.85rem; color: #cbd5e1;">
                                <span style="background: {match_strength_color}; padding: 2px 6px; border-radius: 4px; color: white; font-weight: bold;">{match_strength_msg}</span>
                                <span style="display: block; margin-top: 4px; font-size: 1.2rem; font-weight: 800; color: {match_strength_color};">{confidence:.2f}% Verified</span>
                                <span style="font-size: 0.8rem; opacity: 0.7;">(Distance: {min_dist:.4f})</span>
                            </div>
                        </div>
                    </div>
                    ''', unsafe_allow_html=True)
                
                # POTENTIAL MATCH STATE (The "Gray Area")
                # Tightened to only strictly borderline cases (Threshold to Threshold + 0.03)
                # This eliminates ambiguity for scores like 0.64+ which are likely different people.
                elif nearest_user and min_dist < (MATCH_THRESHOLD + 0.03):
                     st.markdown(f'''
                    <div style="background: rgba(234, 179, 8, 0.15); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 12px; padding: 20px; text-align: center;">
                        <h3 style="color: #fde047; margin-bottom: 5px;">⚠️ Potential Match Suggested</h3>
                        <p style="color: #fef08a; margin-top: 5px;">Similarity ({min_dist:.4f}) is extremely close to threshold. Is this <b>{nearest_user['name']}</b>?</p>
                        <div style="margin-top: 10px; font-size: 0.85rem; color: #fde047; background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 4px; display: inline-block;">
                                Distance: {min_dist:.4f} (Threshold: {MATCH_THRESHOLD})
                        </div>
                    </div>
                    ''', unsafe_allow_html=True)
                     
                     st.caption("Existing Profile:")
                     if 'image_path' in nearest_user and os.path.exists(nearest_user['image_path']):
                        st.image(nearest_user['image_path'], width=100)
                     
                     st.markdown("#### Is this the same person?")
                     col_yes, col_no = st.columns(2)
                     
                     with col_yes:
                         if st.button(f"Yes, Merge with {nearest_user['name']}", type="primary", use_container_width=True):
                             # MERGE LOGIC: Append new template to list (Multi-Template)
                             # This improves accuracy by storing multiple "looks" of the user.
                             if 'embeddings' not in nearest_user:
                                 nearest_user['embeddings'] = [nearest_user['embedding']]
                             
                             nearest_user['embeddings'].append(embedding)
                             # Update count just for stats
                             nearest_user['count'] = len(nearest_user['embeddings'])
                             
                             save_database(db)
                             st.success(f"Profile updated! Added new face template to {nearest_user['name']}.")
                             
                             # Reset inputs
                             st.session_state.clipboard_image = None
                             st.session_state.reset_trigger = True
                             st.session_state.uploader_key += 1
                             st.session_state.camera_key += 1
                             st.rerun()

                     with col_no:
                         st.info("If 'No', create a new profile below.")

                # NEW USER STATE
                if not duplicate_user:
                    st.markdown("###")
                    st.markdown(f'''
                    <div style="background: rgba(22, 163, 74, 0.15); border: 1px solid rgba(22, 163, 74, 0.3); border-radius: 12px; padding: 20px; text-align: center;">
                        <h3 style="color: #86efac; margin-bottom: 5px;">✅ Identity Available</h3>
                        <p style="color: #bbf7d0; margin-top: 5px;">This face is unique and verified real.</p>
                    </div>
                    ''', unsafe_allow_html=True)
                    
                    with st.expander("⏱️ Performance Stats"):
                         st.code(msg)
                    
                    st.markdown("###") # Spacer
                    
                    # Register Button
                    if st.button("Create New Profile", type="primary", use_container_width=True):
                        # Strict Quality Check for Registration
                        is_good, q_msg, _ = assess_face_quality(np.array(final_image))
                        
                        if len(name_input) < 3:
                            st.toast("⚠️ Name requires 3+ characters.")
                        elif "@" not in email_input:
                            st.toast("⚠️ Invalid Email format.")
                        elif not is_good:
                            st.error(f"Cannot register: {q_msg}. Please provide a better quality image for the master profile.")
                        else:
                            img_path = os.path.join(FACES_DIR, f"{name_input}_{len(db)}.jpg")
                            final_image.save(img_path)
                            
                            db.append({
                                'name': name_input,
                                'email': email_input,
                                'embeddings': [embedding], # Initialize List
                                'image_path': img_path,
                                'count': 1
                            })
                            save_database(db)
                            st.session_state.clipboard_image = None
                            
                            # Trigger Reset
                            st.session_state.reset_trigger = True
                            st.session_state.uploader_key += 1
                            st.session_state.camera_key += 1
                            
                            st.balloons()
                            st.success("User registered successfully.\nThe form has been reset. Please proceed to register or log in as a new user.")
                            st.rerun()

    else:
        # Empty State
        with container:
            st.markdown("""
            <div style="height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #64748b; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">&#128100;</div>
                <p>Select an input method to begin verification.</p>
            </div>
            """, unsafe_allow_html=True)
        


