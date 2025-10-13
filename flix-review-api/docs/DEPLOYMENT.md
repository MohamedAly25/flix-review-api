# Deployment Guide

This document outlines the checklist for deploying the Movie Review API to production (e.g., Heroku, Render, or PythonAnywhere).

## 1. Prerequisites

- Python 3.13 runtime
- PostgreSQL database (recommended for production)
- Environment variables configured (see `.env.example`)
- Static files bucket/folder prepared (WhiteNoise handles simple cases)

## 2. Install Dependencies

```bash
pip install -r requirements/production.txt
```

## 3. Environment Variables

Configure the following keys at minimum:

| Variable | Description |
| --- | --- |
| `SECRET_KEY` | Django secret key |
| `DEBUG` | Must be `False` in production |
| `ALLOWED_HOSTS` | Comma-separated list of allowed domains |
| `DATABASE_URL` | PostgreSQL connection string |
| `CORS_ALLOW_ALL_ORIGINS` / `CORS_ALLOWED_ORIGINS` | CORS policy |
| `CSRF_TRUSTED_ORIGINS` | Domains allowed for CSRF cookies |
| `SECURE_SSL_REDIRECT` and related HSTS flags | Security hardening |
| `DJANGO_LOG_LEVEL`, `APP_LOG_LEVEL` | Logging verbosity |

## 4. Static Files

The project ships with WhiteNoise enabled. Collect static assets during deployment:

```bash
python manage.py collectstatic --noinput
```

## 5. Database Migrations

```bash
python manage.py migrate
```

## 6. WSGI Server

The `Procfile` configures Gunicorn for platforms that respect it:

```
web: gunicorn movie_review_api.wsgi:application
```

## 7. Health Check

After deployment:

1. Hit `/api/docs/` to verify the API schema loads.
2. Run smoke tests with `python manage.py test accounts movies reviews` (optional but recommended in staging).
3. Confirm JWT authentication by creating a user and performing login via `/api/users/register/` and `/api/users/login/`.

## 8. Monitoring & Logging

Logs stream to STDOUT via the console handler defined in `LOGGING`. Plug in a log aggregator (Papertrail, LogDNA, etc.) for production visibility.

## 9. Rolling Back

Should issues arise, revert to a previous commit and redeploy, then restore the database from a backup if necessary.
