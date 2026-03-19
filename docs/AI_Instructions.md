# AI Model Instructions

## Model
- ArcFace (replace FaceNet)

## Pipeline
1. Detect face (RetinaFace)
2. Align face
3. Generate embedding
4. Normalize vector
5. Store in DB

## Matching
- Cosine similarity
- Threshold: 0.6–0.8

## Accuracy Improvements
- Multiple images per user
- Face alignment
- Data augmentation

## Future
- Liveness detection