# Face De-duplication Demo Implementation Plan

## Goal
Build a local, offline Streamlit application to demonstrate face de-duplication. The system ensures a person can only register once using their face, even if they provide a different photo. It also filters out non-human faces (statues/icons) and displays the matched image for verification.

## Pipeline
1.  **Image Input**: Capture image via Webcam or Upload File.
2.  **Face Detection**: Use RetinaFace (via DeepFace) to detect faces.
    -   *Constraint*: Validates that a face is present.
3.  **Liveness/Quality Check**:
    -   Heuristic check using Skin Tone analysis (YCbCr) to filter out statues, icons, and black-and-white images.
4.  **Embedding Generation**: Convert the detected face into a high-dimensional feature vector (embedding) using ArcFace (via DeepFace).
5.  **Comparison (De-duplication)**:
    -   Calculate Cosine Similarity between the new face embedding and all registered embeddings.
    -   If Similarity > Threshold (e.g., 0.6), it is a **Duplicate**.
    -   Otherwise, it is a **New User**.
6.  **Storage**: 
    -   Save the new embedding to a local pickle file (`face_db.pkl`).
    -   Save the actual user image to a local directory (`faces/`).
7.  **Visualization**:
    -   If duplicate, show the original registered image alongside the duplicate detection alert.

## Technologies & Libraries
-   **Streamlit**: For the interactive web interface.
-   **DeepFace**: For Face Detection (RetinaFace) and Recognition (ArcFace).
-   **OpenCV (opencv-python)**: For skin-tone pixel analysis.
-   **NumPy**: For vector math (cosine similarity calculation).
-   **Pillow**: Image handling.

## Implementation Steps
1.  Setup Python environment and install dependencies.
2.  Create `app.py` containing the UI and logic.
3.  Run the application using the module approach to ensure correct environment:
    ```bash
    python -m streamlit run app.py
    ```
