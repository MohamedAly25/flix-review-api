# 📚 FlixReview API Documentation

Complete API reference for FlixReview Movie Review Platform.

**Base URL**: `http://127.0.0.1:8000/api/`  
**Version**: 1.0  
**Last Updated**: October 14, 2025

---

## Table of Contents

1. [Authentication](#authentication)
2. [Movies](#movies)
3. [Genres](#genres)
4. [Reviews](#reviews)
5. [Recommendations](#recommendations)
6. [TMDB Integration](#tmdb-integration)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## Authentication

### Register User
```http
POST /api/auth/register/
```

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password2": "SecurePass123!"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### Login
```http
POST /api/auth/login/
```

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### Refresh Token
```http
POST /api/auth/token/refresh/
```

**Request Body**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response** (200 OK):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Logout
```http
POST /api/auth/logout/
```

**Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response** (205 Reset Content)

---

## Movies

### List Movies
```http
GET /api/movies/
```

**Query Parameters**:
- `search` - Search in title/description
- `genre` - Filter by genre slug
- `ordering` - Sort by field (title, release_date, avg_rating)
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 10, max: 100)

**Example**:
```http
GET /api/movies/?search=inception&ordering=-avg_rating&page=1
```

**Response** (200 OK):
```json
{
  "count": 50,
  "next": "http://127.0.0.1:8000/api/movies/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Inception",
      "genre": "Sci-Fi, Action, Thriller",
      "description": "A thief who steals corporate secrets...",
      "release_date": "2010-07-16",
      "avg_rating": 4.50,
      "total_reviews": 125,
      "poster_url": "https://image.tmdb.org/t/p/w500/...",
      "backdrop_url": "https://image.tmdb.org/t/p/original/...",
      "tmdb_id": 27205,
      "imdb_id": "tt1375666",
      "runtime": 148,
      "budget": 160000000,
      "revenue": 829895144,
      "genres": [
        {"id": 1, "name": "Action", "slug": "action"},
        {"id": 4, "name": "Sci-Fi", "slug": "scifi"}
      ]
    }
  ]
}
```

### Get Movie Details
```http
GET /api/movies/{id}/
```

**Response** (200 OK):
```json
{
  "id": 1,
  "title": "Inception",
  "genre": "Sci-Fi, Action, Thriller",
  "description": "A thief who steals corporate secrets...",
  "release_date": "2010-07-16",
  "avg_rating": 4.50,
  "total_reviews": 125,
  "poster_url": "https://image.tmdb.org/t/p/w500/...",
  "backdrop_url": "https://image.tmdb.org/t/p/original/...",
  "tmdb_id": 27205,
  "imdb_id": "tt1375666",
  "runtime": 148,
  "budget": 160000000,
  "revenue": 829895144,
  "genres": [...]
}
```

### Create Movie (Admin Only)
```http
POST /api/movies/
```

**Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "title": "The Matrix",
  "genre": "Sci-Fi, Action",
  "description": "A computer hacker learns...",
  "release_date": "1999-03-31",
  "poster_url": "https://image.tmdb.org/t/p/w500/..."
}
```

**Response** (201 Created)

---

## Genres

### List Genres
```http
GET /api/genres/
```

**Response** (200 OK):
```json
{
  "count": 7,
  "results": [
    {
      "id": 1,
      "name": "Action",
      "slug": "action",
      "description": "Fast-paced movies with lots of excitement",
      "movie_count": 15,
      "created_at": "2025-10-14T19:00:00Z"
    }
  ]
}
```

### Get Genre Details
```http
GET /api/genres/{slug}/
```

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Action",
  "slug": "action",
  "description": "Fast-paced movies with lots of excitement",
  "movie_count": 15,
  "created_at": "2025-10-14T19:00:00Z"
}
```

---

## Reviews

### List Reviews (All)
```http
GET /api/reviews/
```

**Query Parameters**:
- `movie` - Filter by movie ID
- `user` - Filter by user ID
- `rating` - Filter by exact rating
- `ordering` - Sort (-created_at, rating)

**Response** (200 OK):
```json
{
  "count": 250,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "username": "johndoe"
      },
      "movie": {
        "id": 1,
        "title": "Inception"
      },
      "content": "Mind-blowing! One of the best movies...",
      "rating": 5,
      "created_at": "2025-10-14T10:30:00Z",
      "updated_at": "2025-10-14T10:30:00Z",
      "is_edited": false
    }
  ]
}
```

### Get Reviews for Movie
```http
GET /api/movies/{movie_id}/reviews/
```

### Create Review
```http
POST /api/reviews/
```

**Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "movie": 1,
  "content": "Amazing movie! Highly recommended.",
  "rating": 5
}
```

**Response** (201 Created)

### Update Review
```http
PUT /api/reviews/{id}/
PATCH /api/reviews/{id}/
```

**Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "content": "Updated review content",
  "rating": 4
}
```

**Response** (200 OK)

### Delete Review
```http
DELETE /api/reviews/{id}/
```

**Headers**: `Authorization: Bearer <access_token>`

**Response** (204 No Content)

---

## Recommendations

### Content-Based Recommendations
```http
GET /api/recommendations/content-based/
```

**Headers**: `Authorization: Bearer <access_token>`

**Query Parameters**:
- `limit` - Number of recommendations (default: 5, max: 20)

**Response** (200 OK):
```json
{
  "recommendations": [
    {
      "movie": {
        "id": 2,
        "title": "The Matrix",
        "genre": "Sci-Fi, Action"
      },
      "score": 0.95,
      "reason": "Similar to your highly-rated movies"
    }
  ]
}
```

### Collaborative Filtering
```http
GET /api/recommendations/collaborative/
```

**Headers**: `Authorization: Bearer <access_token>`

**Response** (200 OK):
```json
{
  "recommendations": [
    {
      "movie": {...},
      "predicted_rating": 4.8,
      "reason": "Users like you also enjoyed this"
    }
  ]
}
```

### Similar Movies
```http
GET /api/recommendations/similar/{movie_id}/
```

**Query Parameters**:
- `limit` - Number of similar movies (default: 5)

**Response** (200 OK):
```json
{
  "movie": {
    "id": 1,
    "title": "Inception"
  },
  "similar_movies": [
    {
      "movie": {...},
      "similarity_score": 0.87
    }
  ]
}
```

### User Taste Profile
```http
GET /api/recommendations/taste-profile/
```

**Headers**: `Authorization: Bearer <access_token>`

**Response** (200 OK):
```json
{
  "favorite_genres": ["Sci-Fi", "Thriller"],
  "avg_rating": 4.2,
  "total_reviews": 15,
  "preferences": {
    "Sci-Fi": 0.85,
    "Action": 0.70,
    "Drama": 0.60
  }
}
```

---

## TMDB Integration

### Import Movie from TMDB
```http
POST /api/tmdb/import/
```

**Headers**: `Authorization: Bearer <access_token>` (Admin only)

**Request Body**:
```json
{
  "tmdb_id": 550
}
```

**Response** (201 Created):
```json
{
  "message": "Movie 'Fight Club' imported successfully",
  "movie": {
    "id": 10,
    "title": "Fight Club",
    "tmdb_id": 550
  }
}
```

### Search TMDB
```http
GET /api/tmdb/search/?query=matrix
```

**Headers**: `Authorization: Bearer <access_token>` (Admin only)

**Response** (200 OK):
```json
{
  "results": [
    {
      "tmdb_id": 603,
      "title": "The Matrix",
      "release_date": "1999-03-30",
      "overview": "...",
      "poster_path": "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"
    }
  ]
}
```

### Sync Movie Data
```http
POST /api/tmdb/sync/{movie_id}/
```

**Headers**: `Authorization: Bearer <access_token>` (Admin only)

**Response** (200 OK):
```json
{
  "message": "Movie synced successfully",
  "updated_fields": ["runtime", "budget", "revenue"]
}
```

---

## Error Handling

### Error Response Format
```json
{
  "error": "Error message",
  "detail": "Detailed explanation",
  "status_code": 400
}
```

### Common Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request successful, no content to return |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Example Errors

**Validation Error** (400):
```json
{
  "rating": ["Ensure this value is less than or equal to 5."],
  "content": ["This field is required."]
}
```

**Authentication Error** (401):
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Permission Error** (403):
```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

## Rate Limiting

### Limits

| Endpoint | Limit |
|----------|-------|
| Authentication | 5 requests/minute |
| General API | 100 requests/minute |
| TMDB Import | 10 requests/minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1697312400
```

### Rate Limit Exceeded Response

```http
HTTP/1.1 429 Too Many Requests
```

```json
{
  "detail": "Request was throttled. Expected available in 60 seconds."
}
```

---

## Interactive Documentation

### Swagger UI
http://127.0.0.1:8000/api/docs/

- Interactive API explorer
- Try endpoints directly
- View request/response schemas

### ReDoc
http://127.0.0.1:8000/api/redoc/

- Clean, readable documentation
- Search functionality
- Code samples

### OpenAPI Schema
http://127.0.0.1:8000/api/schema/

- Download OpenAPI 3.0 schema
- Import into Postman/Insomnia
- Generate client SDKs

---

## Examples

### Complete Workflow Example

**1. Register & Login**:
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"Pass123!","password2":"Pass123!"}'
```

**2. Get Movies**:
```bash
curl http://127.0.0.1:8000/api/movies/
```

**3. Create Review**:
```bash
curl -X POST http://127.0.0.1:8000/api/reviews/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"movie":1,"content":"Great movie!","rating":5}'
```

**4. Get Recommendations**:
```bash
curl http://127.0.0.1:8000/api/recommendations/content-based/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## SDKs & Tools

### Python
```python
import requests

# Login
response = requests.post('http://127.0.0.1:8000/api/auth/login/', json={
    'email': 'john@example.com',
    'password': 'Pass123!'
})
token = response.json()['access']

# Get movies
headers = {'Authorization': f'Bearer {token}'}
movies = requests.get('http://127.0.0.1:8000/api/movies/', headers=headers)
print(movies.json())
```

### JavaScript
```javascript
// Login
const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'john@example.com', password: 'Pass123!'})
});
const {access} = await response.json();

// Get movies
const movies = await fetch('http://127.0.0.1:8000/api/movies/', {
  headers: {'Authorization': `Bearer ${access}`}
});
console.log(await movies.json());
```

---

## Support

For more details:
- **Setup Guide**: [SETUP.md](SETUP.md)
- **Development Guide**: [DEVELOPMENT.md](DEVELOPMENT.md)
- **Testing Guide**: [TESTING.md](TESTING.md)

**API Documentation**: http://127.0.0.1:8000/api/docs/
