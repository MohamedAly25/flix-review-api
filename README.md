# Movie Review API (Phases 1–3)

Backend API built with Django + DRF to manage movies and reviews with JWT authentication.

## Features

- Custom user model with email login, JWT auth, and instant token issuance on signup.
- Unified API responses (success/error envelopes) with timestamp metadata and centralized exception handling.
- Global pagination with page-size overrides and consistent payloads.
- Movie catalogue with advanced filters (genre, min/max rating, release year ranges) and on-demand review statistics.
- Review CRUD with ownership permissions, rating range filters, search endpoint, and movie-title specific listings.
- OpenAPI schema + Swagger UI via drf-spectacular for interactive documentation.

## Setup

1. Create a virtual environment and install dependencies (already configured in this workspace).
2. Copy `.env.example` to `.env` and adjust values (SECRET_KEY, DEBUG, DATABASE_URL/SQLITE_NAME, ALLOWED_HOSTS).

## Run

```pwsh
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

- API docs available at `http://localhost:8000/api/docs/`
- Create a superuser to access Django admin and perform movie management:

```pwsh
python manage.py createsuperuser
```

## Key Endpoints

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/users/register/` | POST | ❌ | Register a new user (returns profile + tokens) |
| `/api/users/login/` | POST | ❌ | Obtain JWT access/refresh tokens |
| `/api/users/profile/` | GET | ✅ | Fetch current user profile |
| `/api/users/profile/` | PUT/PATCH | ✅ | Update profile details |
| `/api/users/profile/` | DELETE | ✅ | Delete account |
| `/api/movies/` | GET | ❌ | List movies with ordering, search, rating & release-year filters |
| `/api/movies/` | POST | ✅ (admin) | Create movie |
| `/api/movies/<id>/` | GET | ❌ | Movie detail with review statistics |
| `/api/movies/<id>/` | PUT/DELETE | ✅ (admin) | Update/Delete movie |
| `/api/reviews/` | GET | ❌ | List reviews with pagination, rating ranges, and movie/user filters |
| `/api/reviews/` | POST | ✅ | Create review (one per user/movie) |
| `/api/reviews/<id>/` | GET | ❌ | Review detail |
| `/api/reviews/<id>/` | PUT/DELETE | ✅ (owner) | Update/Delete review |
| `/api/reviews/movie/<title>/` | GET | ❌ | Reviews for a specific movie title |
| `/api/reviews/search/` | GET | ❌ | Keyword & rating-based review search |

### Standard Response Format

Every endpoint returns a standardized payload:

```json
{
	"success": true,
	"message": "Movies retrieved successfully",
	"data": {},
	"timestamp": "2025-10-11T12:00:00.000Z"
}
```

Errors follow the same envelope with `success: false` and an `errors` object when validation issues occur.

## Testing

```pwsh
python manage.py test accounts movies reviews -v 2
```

All tests cover registration/login, profile operations, movie admin flow, review permissions, and filtering.
