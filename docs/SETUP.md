# 🚀 FlixReview API - Complete Setup Guide

**Last Updated**: October 14, 2025

---

## Quick Start (5 Minutes)

```bash
# 1. Clone repository
git clone <repository-url>
cd flix-review-api

# 2. Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate    # Linux/Mac

# 3. Install dependencies
pip install -r requirements/development.txt

# 4. Configure environment
cp .env.example .env
# Edit .env and add your TMDB_API_KEY

# 5. Setup database
python manage.py migrate
python seed_database.py

# 6. Run server
python manage.py runserver
```

**Access**:
- API: http://127.0.0.1:8000/api/
- Admin: http://127.0.0.1:8000/admin/ (admin@flixreview.com / admin123)
- Docs: http://127.0.0.1:8000/api/docs/

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required
- **Python**: 3.13+ (recommended 3.13.3)
- **pip**: Latest version
- **Git**: For version control

### Optional (Production)
- **PostgreSQL**: 14+ (for production database)
- **Redis**: 7+ (for caching and recommendations)
- **Docker**: For containerized deployment

---

## Installation

### 1. Virtual Environment

**Windows (PowerShell)**:
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1

# If you get execution policy error:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Linux/Mac**:
```bash
python3 -m venv venv
source venv/bin/activate
```

**Verify activation**:
```bash
# You should see (venv) in your prompt
python --version  # Should show Python 3.13.x
```

### 2. Install Dependencies

**Development** (recommended):
```bash
pip install --upgrade pip
pip install -r requirements/development.txt
```

**Production**:
```bash
pip install -r requirements/production.txt
```

**Package List** (70+ packages):
- Django 5.2.7
- Django REST Framework 3.16.1
- JWT Authentication
- TMDB Integration (tmdbv3api)
- ML Recommendations (scikit-learn, pandas)
- Testing (pytest, coverage)
- Code Quality (black, flake8)

---

## Environment Configuration

### 1. Create .env File

```bash
cp .env.example .env
```

### 2. Configure Variables

**Development (.env)**:
```bash
# Django
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite for development)
SQLITE_NAME=.secrets/db.sqlite3

# TMDB API (get from https://www.themoviedb.org/settings/api)
TMDB_API_KEY=your_tmdb_api_key_here

# Security
CORS_ALLOW_ALL_ORIGINS=True
```

**Production (.env)**:
```bash
# Django
DEBUG=False
SECRET_KEY=<generate-strong-50-char-key>
ALLOWED_HOSTS=your-domain.com

# Database (PostgreSQL)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=flixreview_db
DB_USER=flixreview_user
DB_PASSWORD=<strong-password>
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# TMDB API
TMDB_API_KEY=<production-api-key>

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=https://your-frontend.com
```

### 3. Generate Secret Key

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## Database Setup

### Development (SQLite)

```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
# Or use pre-configured:
python reset_admin.py

# Seed sample data
python seed_database.py
```

**Result**:
- Database: `.secrets/db.sqlite3`
- Admin: admin@flixreview.com / admin123
- Sample data: 4 users, 7 genres, 5 movies, 6 reviews

### Production (PostgreSQL)

**1. Install PostgreSQL**:
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql@14
```

**2. Create Database**:
```sql
sudo -u postgres psql
CREATE DATABASE flixreview_db;
CREATE USER flixreview_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE flixreview_db TO flixreview_user;
\q
```

**3. Run Migrations**:
```bash
python manage.py migrate
python manage.py createsuperuser
```

### Verify Database

```bash
python verify_database.py
```

---

## Running the Application

### Development Server

```bash
python manage.py runserver

# Custom port
python manage.py runserver 8080

# Allow external access
python manage.py runserver 0.0.0.0:8000
```

**Access**:
- API Root: http://127.0.0.1:8000/api/
- Admin Panel: http://127.0.0.1:8000/admin/
- API Documentation: http://127.0.0.1:8000/api/docs/
- ReDoc: http://127.0.0.1:8000/api/redoc/

### Production Server

**Using Gunicorn** (recommended):
```bash
pip install gunicorn
gunicorn movie_review_api.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

**Using Docker**:
```bash
docker-compose up -d
```

See [DOCKER.md](DOCKER.md) and [DEPLOYMENT.md](DEPLOYMENT.md) for details.

---

## Testing

### Run All Tests

```bash
# All tests (79 tests)
pytest

# Verbose output
pytest -v

# With coverage
pytest --cov

# Specific app
pytest movies/tests/
pytest recommendations/test_ml.py

# Specific test
pytest -k "test_content_based"
```

### Test Statistics
- ✅ Total Tests: 79
- ✅ Passing: 100%
- ✅ Coverage: High

See [TESTING.md](TESTING.md) for detailed testing guide.

---

## Troubleshooting

### Virtual Environment Issues

**Problem**: Can't activate venv on Windows
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Problem**: Wrong Python version
```bash
# Specify Python version
python3.13 -m venv venv
```

### Package Installation Issues

**Problem**: Package conflicts
```bash
pip install -r requirements/development.txt --force-reinstall
```

**Problem**: Outdated pip
```bash
python -m pip install --upgrade pip
```

### Database Issues

**Problem**: Database locked
```bash
# Close all connections, then:
rm .secrets/db.sqlite3
python manage.py migrate
python seed_database.py
```

**Problem**: Migration conflicts
```bash
# Reset migrations (CAUTION: Data loss)
python manage.py migrate --fake <app> zero
python manage.py migrate <app>
```

### TMDB Integration Issues

**Problem**: TMDB API key not working
- Verify key is active at https://www.themoviedb.org/settings/api
- Check `.env` has correct `TMDB_API_KEY=...`
- Restart server after changing `.env`

**Problem**: Import fails
```bash
# Test TMDB connection
python -c "from tmdbv3api import TMDb; tmdb = TMDb(); tmdb.api_key='YOUR_KEY'; print('✅ Connected')"
```

### Server Won't Start

**Problem**: Port already in use
```bash
# Use different port
python manage.py runserver 8080

# Or kill process (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Problem**: Module not found
```bash
# Ensure venv is activated
# Reinstall dependencies
pip install -r requirements/development.txt
```

### Test Failures

**Problem**: Tests failing after setup
```bash
# Recreate test database
pytest --create-db

# Run specific failing test with verbose output
pytest path/to/test.py::test_name -v
```

---

## Health Check

Run comprehensive environment check:

```bash
python check_environment.py
```

**Expected Output**:
```
✅ Python Version: 3.13.3
✅ Virtual Environment: Active
✅ Django: 5.2.7
✅ TMDB Integration: Ready
✅ ML Libraries: Ready
✅ Tests: 79 collected
✅ Database: Connected
✅ Secrets Protected: Yes
```

---

## Next Steps

After setup:

1. **Configure TMDB API Key**
   - Get key from https://www.themoviedb.org/settings/api
   - Add to `.env`

2. **Import Movies from TMDB**
   ```bash
   python manage.py import_tmdb_movie --tmdb-id 550
   python manage.py import_popular_movies --pages 2
   ```

3. **Explore API**
   - Visit http://127.0.0.1:8000/api/docs/
   - Try endpoints with Swagger UI

4. **Start Development**
   - See [DEVELOPMENT.md](DEVELOPMENT.md) for workflow
   - See [API.md](API.md) for endpoint details

---

## Security Notes

### Development
- ✅ `.secrets/` directory for sensitive files
- ✅ All secrets in `.gitignore`
- ✅ Environment variables for configuration

### Production
- 🔒 Never use DEBUG=True
- 🔒 Use strong SECRET_KEY (50+ chars)
- 🔒 Enable HTTPS (SSL/TLS)
- 🔒 Use environment variables or secrets manager
- 🔒 Regular security audits

See [.secrets/SECURITY_CHECKLIST.md](.secrets/SECURITY_CHECKLIST.md)

---

## Additional Resources

- **README.md** - Project overview
- **DEVELOPMENT.md** - Development workflow
- **API.md** - API documentation
- **TESTING.md** - Testing guide
- **DEPLOYMENT.md** - Production deployment
- **DOCKER.md** - Docker setup
- **.secrets/GUIDE.md** - Secrets management

---

## Support

If you encounter issues:
1. Check this guide thoroughly
2. Review error messages carefully
3. Check [Troubleshooting](#troubleshooting) section
4. Run health check: `python check_environment.py`
5. Review related documentation

---

**Setup Complete!** 🎉  
Your FlixReview API is ready for development.
