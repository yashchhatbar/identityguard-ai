# API Design

## Auth
POST /api/auth/register  
POST /api/auth/login  

## Face
POST /api/face/upload  
POST /api/face/verify  

## Admin
GET /api/admin/users  
GET /api/admin/duplicates  
DELETE /api/admin/user/{id}  

## Response Format
{
  "success": true,
  "data": {},
  "message": ""
}