# Database Schema

## Users
- id (UUID)
- name
- email
- password_hash
- role (user/admin)
- created_at

## FaceEmbeddings
- id
- user_id
- embedding (vector)
- image_url
- created_at

## DuplicateLogs
- id
- user_id
- matched_user_id
- similarity_score
- status
- created_at