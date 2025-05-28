# Mobile Vocabulary API Documentation

## Overview
This document provides comprehensive documentation for the Mobile Vocabulary API endpoints that enable CRUD operations on vocabulary collections with JWT-based authentication.

## Base URL
- **Development:** `http://localhost:3000`
- **Production:** `https://pejuangkorea.vercel.app`

## Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

To obtain a JWT token, use the mobile authentication endpoint:
```javascript
POST /api/mobile/auth/login
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

## Endpoints

### 1. GET /api/mobile/vocabulary
Fetch vocabulary collections with optional filtering.

#### Query Parameters
- `publicOnly` (boolean, optional): Return only public collections
- `mine` (boolean, optional): Return only user's collections

#### Request Example
```javascript
// Get all collections
GET /api/mobile/vocabulary

// Get only public collections
GET /api/mobile/vocabulary?publicOnly=true

// Get only user's collections
GET /api/mobile/vocabulary?mine=true

// Get public collections OR user's collections
GET /api/mobile/vocabulary?publicOnly=true&mine=true
```

#### Response Format
```javascript
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Korean Basic Vocabulary",
      "description": "Essential Korean words for beginners",
      "isPublic": true,
      "itemsCount": 25,
      "createdAt": "2025-05-27T11:30:00.000Z",
      "updatedAt": "2025-05-27T11:30:00.000Z"
    }
  ]
}
```

#### Status Codes
- `200` - Success
- `401` - Authentication required
- `500` - Server error

---

### 2. POST /api/mobile/vocabulary
Create a new vocabulary collection.

#### Request Body
```javascript
{
  "title": "My New Collection",        // Required: string, non-empty
  "description": "Collection desc",    // Optional: string
  "isPublic": false                    // Optional: boolean, default false
}
```

#### Request Example
```javascript
POST /api/mobile/vocabulary
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "title": "Travel Korean",
  "description": "Korean phrases for traveling",
  "isPublic": true
}
```

#### Response Format
```javascript
{
  "success": true,
  "data": {
    "id": 15,
    "message": "Vocabulary collection created successfully"
  }
}
```

#### Status Codes
- `201` - Created successfully
- `400` - Validation error
- `401` - Authentication required
- `500` - Server error

#### Validation Rules
- `title`: Required, non-empty string
- `description`: Optional string
- `isPublic`: Optional boolean

---

### 3. GET /api/mobile/vocabulary/:id
Fetch a specific vocabulary collection with its items.

#### Path Parameters
- `id` (integer): Collection ID

#### Request Example
```javascript
GET /api/mobile/vocabulary/15
Authorization: Bearer <jwt_token>
```

#### Response Format
```javascript
{
  "success": true,
  "data": {
    "id": 15,
    "title": "Travel Korean",
    "description": "Korean phrases for traveling",
    "isPublic": true,
    "createdAt": "2025-05-27T11:30:00.000Z",
    "updatedAt": "2025-05-27T11:30:00.000Z",
    "items": [
      {
        "id": 101,
        "korean": "안녕하세요",
        "indonesian": "Halo",
        "isChecked": false,
        "type": "WORD",
        "createdAt": "2025-05-27T11:30:00.000Z",
        "updatedAt": "2025-05-27T11:30:00.000Z"
      }
    ]
  }
}
```

#### Status Codes
- `200` - Success
- `400` - Invalid collection ID
- `401` - Authentication required
- `403` - Access denied (private collection, not owner)
- `404` - Collection not found
- `500` - Server error

#### Access Rules
- Public collections: Accessible to all authenticated users
- Private collections: Only accessible to the owner

---

### 4. PATCH /api/mobile/vocabulary/:id
Update vocabulary collection metadata.

#### Path Parameters
- `id` (integer): Collection ID

#### Request Body (Partial Updates)
```javascript
{
  "title": "Updated Title",           // Optional: string, non-empty
  "description": "Updated desc",      // Optional: string
  "isPublic": true                    // Optional: boolean
}
```

#### Request Example
```javascript
PATCH /api/mobile/vocabulary/15
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "title": "Advanced Travel Korean",
  "isPublic": false
}
```

#### Response Format
```javascript
{
  "success": true,
  "data": {
    "id": 15,
    "title": "Advanced Travel Korean",
    "description": "Korean phrases for traveling",
    "isPublic": false,
    "updatedAt": "2025-05-27T12:00:00.000Z",
    "message": "Collection updated successfully"
  }
}
```

#### Status Codes
- `200` - Updated successfully
- `400` - Validation error or no updates provided
- `401` - Authentication required
- `403` - Access denied (not owner)
- `404` - Collection not found
- `500` - Server error

#### Validation Rules
- Only collection owner can update
- At least one valid field must be provided
- `title`: Non-empty string if provided
- `description`: String if provided
- `isPublic`: Boolean if provided

---

### 5. DELETE /api/mobile/vocabulary/:id
Delete a vocabulary collection and all its items.

#### Path Parameters
- `id` (integer): Collection ID

#### Request Example
```javascript
DELETE /api/mobile/vocabulary/15
Authorization: Bearer <jwt_token>
```

#### Response Format
```javascript
{
  "success": true,
  "data": {
    "message": "Collection deleted successfully"
  }
}
```

#### Status Codes
- `200` - Deleted successfully
- `400` - Invalid collection ID
- `401` - Authentication required
- `403` - Access denied (not owner)
- `404` - Collection not found
- `500` - Server error

#### Notes
- Only collection owner can delete
- Deletion cascades to all vocabulary items in the collection
- This action is irreversible

---

## Error Handling

### Error Response Format
```javascript
{
  "success": false,
  "error": "Error message description"
}
```

### Common Error Scenarios

#### Authentication Errors (401)
```javascript
{
  "success": false,
  "error": "Authentication required"
}
```

#### Validation Errors (400)
```javascript
{
  "success": false,
  "error": "Title is required and must be a non-empty string"
}
```

#### Authorization Errors (403)
```javascript
{
  "success": false,
  "error": "You can only modify your own collections"
}
```

#### Not Found Errors (404)
```javascript
{
  "success": false,
  "error": "Collection not found"
}
```

#### Server Errors (500)
```javascript
{
  "success": false,
  "error": "Failed to fetch vocabulary collections"
}
```

---

## Usage Examples

### JavaScript/Fetch
```javascript
// Get collections
const response = await fetch('/api/mobile/vocabulary', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();

// Create collection
const newCollection = await fetch('/api/mobile/vocabulary', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'New Collection',
    description: 'Description',
    isPublic: false
  })
});
```

### React Native
```javascript
import { fetchWithAuth } from './lib/auth';

// Get collections with authentication
const collections = await fetchWithAuth('/api/mobile/vocabulary');

// Create collection
const newCollection = await fetchWithAuth('/api/mobile/vocabulary', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Travel Phrases',
    isPublic: true
  })
});
```

### cURL
```bash
# Get collections
curl -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/mobile/vocabulary

# Create collection
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"New Collection","isPublic":true}' \
     http://localhost:3000/api/mobile/vocabulary
```

---

## Database Schema

### VocabularyCollection
```sql
model VocabularyCollection {
  id          Int              @id @default(autoincrement())
  title       String
  description String?
  icon        String?          @default("FaBook")
  isPublic    Boolean          @default(false)
  userId      String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  user        User?            @relation(fields: [userId], references: [id])
  items       VocabularyItem[]
}
```

### VocabularyItem
```sql
model VocabularyItem {
  id           Int                  @id @default(autoincrement())
  korean       String
  indonesian   String
  isChecked    Boolean              @default(false)
  type         VocabularyType       @default(WORD)
  collectionId Int
  createdAt    DateTime             @default(now())
  updatedAt    DateTime             @updatedAt
  collection   VocabularyCollection @relation(fields: [collectionId], references: [id])
}
```

---

## Testing

### Running API Tests
```bash
# Navigate to web directory
cd web

# Run the test script
node tests/api-vocabulary-test.js
```

### Test Coverage
The test suite covers:
- ✅ Authentication flow
- ✅ GET collections (with query parameters)
- ✅ POST collection creation
- ✅ GET specific collection
- ✅ PATCH collection updates
- ✅ DELETE collection
- ✅ Error scenarios (401, 400, 404)
- ✅ Input validation
- ✅ Authorization checks

---

## Security Features

### JWT Token Validation
- Server-side signature verification
- Token expiration checking
- User validation from token payload

### Access Control
- Private collections: Only accessible to owners
- Public collections: Readable by all authenticated users
- Write operations: Restricted to collection owners

### Input Validation
- Request body validation
- SQL injection prevention via Prisma ORM
- XSS protection through proper data handling

### Error Handling
- Detailed logging for debugging
- Safe error messages to clients
- Proper HTTP status codes

---

## Rate Limiting & Performance

### Recommendations
- Implement rate limiting for production use
- Add caching for frequently accessed public collections
- Consider pagination for large datasets
- Monitor API response times

### Database Optimization
- Indexed queries via Prisma
- Efficient relationship loading
- Cascade deletion for data consistency

---

**API Version:** 1.0  
**Last Updated:** May 27, 2025  
**Status:** Production Ready
