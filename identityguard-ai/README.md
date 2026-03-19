# IdentityGuard AI

IdentityGuard AI is a production-oriented face de-duplication and authentication system built as a FastAPI + React SaaS application. It uses ArcFace embeddings, RetinaFace detection, cosine similarity matching, JWT authentication, and a role-protected admin workspace.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion
- Backend: FastAPI, SQLAlchemy, bcrypt, JWT
- AI: DeepFace ArcFace, RetinaFace, OpenCV, NumPy
- Deployment: Vercel for the frontend, Render for the backend

## Application Areas

- User authentication and registration
- Face upload and duplicate screening
- Face verification
- Admin users, duplicates, and analytics views

## Local Development

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend expects `VITE_API_BASE_URL` to point at the FastAPI `/api` base URL.

## Deployment

### Vercel

- Frontend project root: `identityguard-ai/frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL`
- SPA rewrites are configured in `frontend/vercel.json`

### Render

- Backend service root: `identityguard-ai/backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Baseline service definition lives in `render.yaml`
- Set production secrets from `backend/.env.example`

## Validation

### Backend

```bash
cd backend
pytest tests/test_api.py tests/test_ai_engine.py
```

### Frontend

```bash
cd frontend
npm run build
```
