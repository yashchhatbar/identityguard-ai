# System Architecture

Frontend (Vercel)
    ↓
Backend API (Render)
    ↓
AI Layer (ArcFace)
    ↓
Database (PostgreSQL)

## Flow
1. Upload image
2. Detect face (RetinaFace)
3. Generate embedding (ArcFace)
4. Compare embeddings
5. Return result