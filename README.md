# Movie Review API (Phase 1 & 2)

Backend API built with Django + DRF to manage movies and reviews with JWT authentication.

## Features

- Custom user model with email login and JWT auth (Phase 1)
- Movie & review models with automatic average rating updates (Phase 1)
- Movie list/detail endpoints with filtering, search, ordering, and review stats (Phase 2)
- Review CRUD with ownership permissions, filtering, and movie-specific listings (Phase 2)
- OpenAPI schema + Swagger UI via drf-spectacular

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
| `/api/auth/register/` | POST | ❌ | Register a new user (returns tokens) |
| `/api/auth/login/` | POST | ❌ | Obtain JWT access/refresh tokens |
| `/api/auth/profile/` | GET | ✅ | Current user profile |
| `/api/auth/profile/update/` | PUT | ✅ | Update profile |
| `/api/auth/profile/delete/` | DELETE | ✅ | Delete account |
| `/api/movies/` | GET | ❌ | List movies with filtering/search/ordering |
| `/api/movies/` | POST | ✅ (admin) | Create movie |
| `/api/movies/<id>/` | GET | ❌ | Movie detail with review statistics |
| `/api/movies/<id>/` | PUT/DELETE | ✅ (admin) | Update/Delete movie |
| `/api/reviews/` | GET | ❌ | List reviews with filtering/search |
| `/api/reviews/` | POST | ✅ | Create review (one per user/movie) |
| `/api/reviews/<id>/` | GET | ❌ | Review detail |
| `/api/reviews/<id>/` | PUT/DELETE | ✅ (owner) | Update/Delete review |
| `/api/reviews/movie/<movie_id>/` | GET | ❌ | Reviews for a specific movie |

## Testing

```pwsh
python manage.py test accounts movies reviews -v 2
```

All tests cover registration/login, profile operations, movie admin flow, review permissions, and filtering.
