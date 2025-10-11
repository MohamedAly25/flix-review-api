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
2. Copy `.env.example` to `.env` and adjust values (SECRET_KEY, DEBUG, DATABASE_URL/SQLITE_NAME, ALLOWED_HOSTS, security flags, CORS/CSRF origins).
3. Install required packages using the layered requirement files:

	```pwsh
	pip install -r requirements/development.txt
	```

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

## Environment Variables

Key variables exposed via `.env.example`:

- `DEBUG`, `ALLOWED_HOSTS`, `DATABASE_URL` / `SQLITE_NAME`
- `CORS_ALLOW_ALL_ORIGINS` or `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- Security flags (`SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SECURE_HSTS_*`)
- Logging levels (`DJANGO_LOG_LEVEL`, `APP_LOG_LEVEL`)

All security-related values default to production-friendly settings when `DEBUG=False`.

## Testing

```pwsh
python manage.py test accounts movies reviews -v 2
```

Coverage now includes:

- Model unit tests for users, movies, and reviews (signals + ordering)
- Authentication and profile API flows with unified responses
- Movie and review API scenarios (filters, search, pagination, permissions)

## Deployment

### Heroku Quickstart

1. Ensure requirements are installed with `pip install -r requirements/production.txt`.
2. Set up the application:
	```pwsh
	heroku create your-app-name
	heroku config:set $(Get-Content .env | Where-Object {$_ -and $_ -notmatch '^#'} )
	git push heroku main
	```
3. Run migrations and collect static assets:
	```pwsh
	heroku run python manage.py migrate
	heroku run python manage.py collectstatic --noinput
	```
4. Optionally create an admin user:
	```pwsh
	heroku run python manage.py createsuperuser
	```

The repo ships with a `Procfile`, `runtime.txt`, and WhiteNoise-powered static handling so deployment platforms only need environment variables and `collectstatic` to go live.

See `docs/DEPLOYMENT.md` for a full production checklist.
