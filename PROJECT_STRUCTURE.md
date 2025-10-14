# 📂 Project Structure

**FlixReview API - Complete Directory Structure**

Last Updated: October 14, 2025

---

## 🗂️ Directory Tree

```
flix-review-api/
│
├── 📄 Configuration Files (Root Level)
│   ├── manage.py                # Django management script
│   ├── .env                     # Environment variables (DO NOT COMMIT)
│   ├── .env.example             # Environment template
│   ├── .gitignore               # Git ignore rules
│   ├── .dockerignore            # Docker ignore rules
│   ├── .coveragerc              # Test coverage config
│   ├── pytest.ini               # Pytest configuration
│   ├── Dockerfile               # Docker image definition
│   ├── docker-compose.yml       # Docker services config
│   ├── Procfile                 # Heroku deployment config
│   └── runtime.txt              # Python version for deployment
│
├── 📚 Documentation
│   ├── README.md                # Main project overview
│   ├── CHANGELOG.md             # Version history
│   ├── DOCS_MAP.md              # Documentation navigator
│   └── FlixReview ERD(MVP).svg  # Database diagram
│
├── 📁 docs/                     # Detailed documentation
│   ├── SETUP.md                 # Setup guide
│   ├── API.md                   # API reference
│   ├── DEVELOPMENT.md           # Development workflow
│   ├── TESTING.md               # Testing guide
│   ├── DEPLOYMENT.md            # Deployment guide
│   ├── DOCKER.md                # Docker guide
│   ├── STRETCH_GOALS_PLAN.md    # Future features
│   └── .docs-info.md            # Documentation metadata
│
├── 🔧 scripts/                  # Utility scripts
│   ├── README.md                # Scripts documentation
│   ├── check_admin.py           # Check admin user
│   ├── check_environment.py     # Environment verification
│   ├── reset_admin.py           # Reset admin password
│   ├── seed_database.py         # Populate test data
│   └── verify_database.py       # Database verification
│
├── 📦 requirements/             # Python dependencies
│   ├── base.txt                 # Core dependencies
│   ├── development.txt          # Dev dependencies
│   └── production.txt           # Production dependencies
│
├── 🔐 .secrets/                 # Sensitive data (NOT IN GIT)
│   ├── README.md                # Secrets overview
│   ├── GUIDE.md                 # Secrets management guide
│   ├── SECURITY_CHECKLIST.md    # Security guidelines
│   ├── DATABASE_README.md       # Database info
│   ├── admin_credentials.md     # Admin credentials
│   ├── db.sqlite3               # SQLite database (dev)
│   ├── backup_secrets.py        # Backup utility
│   └── move_database.py         # Database migration script
│
├── 🔄 .github/                  # GitHub Actions CI/CD
│   └── workflows/
│       └── ci.yml               # Continuous integration config
│
├── 🧪 Test Artifacts
│   ├── .pytest_cache/           # Pytest cache
│   ├── htmlcov/                 # Coverage HTML reports
│   └── .coverage                # Coverage data file
│
├── 🎬 Django Apps
│   ├── accounts/                # User authentication & management
│   │   ├── models.py            # User model
│   │   ├── serializers.py       # API serializers
│   │   ├── views.py             # API views
│   │   ├── urls.py              # URL routing
│   │   ├── admin.py             # Admin interface
│   │   ├── tests.py             # Unit tests
│   │   └── migrations/          # Database migrations
│   │
│   ├── movies/                  # Movie catalog management
│   │   ├── models.py            # Movie & Genre models
│   │   ├── serializers.py       # API serializers
│   │   ├── views.py             # API views
│   │   ├── urls.py              # URL routing
│   │   ├── admin.py             # Admin interface
│   │   ├── tests.py             # Unit tests
│   │   └── migrations/          # Database migrations
│   │
│   ├── reviews/                 # Review & rating system
│   │   ├── models.py            # Review model
│   │   ├── serializers.py       # API serializers
│   │   ├── views.py             # API views
│   │   ├── urls.py              # URL routing
│   │   ├── signals.py           # Database signals
│   │   ├── admin.py             # Admin interface
│   │   ├── tests.py             # Unit tests
│   │   └── migrations/          # Database migrations
│   │
│   ├── recommendations/         # Recommendation engine
│   │   ├── models.py            # Recommendation models
│   │   ├── serializers.py       # API serializers
│   │   ├── views.py             # API views
│   │   ├── urls.py              # URL routing
│   │   ├── admin.py             # Admin interface
│   │   ├── tests.py             # Unit tests
│   │   └── migrations/          # Database migrations
│   │
│   └── common/                  # Shared utilities
│       ├── responses.py         # Unified response format
│       ├── permissions.py       # Custom permissions
│       ├── pagination.py        # Pagination classes
│       ├── middleware.py        # Custom middleware
│       ├── mixins.py            # Reusable mixins
│       ├── exceptions.py        # Custom exceptions
│       └── migrations/          # Database migrations
│
└── ⚙️ movie_review_api/         # Django project settings
    ├── settings.py              # Project configuration
    ├── urls.py                  # Root URL configuration
    ├── wsgi.py                  # WSGI application
    └── asgi.py                  # ASGI application
```

---

## 📋 Directory Descriptions

### Configuration Files (Root)
Essential configuration files for the project. Keep root clean!

**What belongs here:**
- ✅ Django management script (`manage.py`)
- ✅ Environment files (`.env`, `.env.example`)
- ✅ Git configuration (`.gitignore`)
- ✅ Docker files (`Dockerfile`, `docker-compose.yml`)
- ✅ Deployment files (`Procfile`, `runtime.txt`)
- ✅ Test configuration (`pytest.ini`, `.coveragerc`)

**What doesn't belong here:**
- ❌ Utility scripts → Move to `scripts/`
- ❌ Documentation → Move to `docs/`
- ❌ Test data → Move to fixtures or `scripts/`

### Documentation (`docs/`)
All project documentation organized by purpose.

**Contents:**
- Technical guides (SETUP, DEVELOPMENT, TESTING)
- API documentation
- Deployment instructions
- Docker guide
- Future planning

### Scripts (`scripts/`)
Utility scripts for development and maintenance.

**Purpose:**
- Database seeding and verification
- Admin user management
- Environment checks
- Development utilities

**Usage:** `python scripts/script_name.py`

### Requirements (`requirements/`)
Python package dependencies organized by environment.

**Files:**
- `base.txt` - Core dependencies (Django, DRF, etc.)
- `development.txt` - Dev tools (pytest, black, etc.)
- `production.txt` - Production-only packages

### Secrets (`.secrets/`)
Sensitive data that should NEVER be committed to Git.

**Contents:**
- Database file (SQLite for dev)
- Admin credentials
- Backup scripts
- Security documentation

**⚠️ IMPORTANT:** This directory is in `.gitignore`!

### GitHub Actions (`.github/`)
CI/CD workflows for automated testing and deployment.

**Workflows:**
- `ci.yml` - Run tests on every push/PR

### Django Apps
Each app follows Django's standard structure:

```
app_name/
├── models.py       # Database models
├── serializers.py  # API serializers
├── views.py        # API endpoints
├── urls.py         # URL routing
├── admin.py        # Admin interface config
├── tests.py        # Unit tests
└── migrations/     # Database migrations
```

**Apps:**
- `accounts` - User authentication
- `movies` - Movie catalog
- `reviews` - Reviews & ratings
- `recommendations` - Recommendation engine
- `common` - Shared utilities

### Project Settings (`movie_review_api/`)
Django project configuration and root URL routing.

---

## 🎯 File Organization Rules

### ✅ DO

1. **Keep root clean** - Only config files in root
2. **Group by purpose** - Related files in same directory
3. **Use clear names** - Descriptive file/folder names
4. **Document structure** - Keep this file updated
5. **Follow conventions** - Django app structure

### ❌ DON'T

1. **Scatter utilities** - Keep scripts in `scripts/`
2. **Mix concerns** - Don't put docs in code folders
3. **Commit secrets** - Use `.secrets/` and `.gitignore`
4. **Create deep nesting** - Keep structure flat when possible
5. **Duplicate files** - One file, one purpose, one location

---

## 🔍 Quick Find

**Where is...**

| What you're looking for | Location |
|------------------------|----------|
| Setup instructions | `docs/SETUP.md` |
| API documentation | `docs/API.md` |
| Environment config | `.env` (or `.env.example` for template) |
| Database file | `.secrets/db.sqlite3` |
| Utility scripts | `scripts/` |
| Test configuration | `pytest.ini` |
| Dependencies | `requirements/` |
| User model | `accounts/models.py` |
| Movie model | `movies/models.py` |
| Review model | `reviews/models.py` |
| API endpoints | `*/views.py` in each app |
| URL routing | `*/urls.py` in each app |
| Database migrations | `*/migrations/` in each app |
| Admin credentials | `.secrets/admin_credentials.md` |
| CI/CD config | `.github/workflows/ci.yml` |

---

## 📊 Size Reference

Typical sizes (development):

- **Root config files**: < 1 MB total
- **Documentation**: ~110 KB
- **Scripts**: ~20 KB
- **Requirements**: < 10 KB
- **.secrets**: ~250 KB (with database)
- **Django apps**: ~50 KB each (code only)
- **venv**: ~412 MB (not in repo)
- **.pytest_cache**: ~1 MB
- **htmlcov**: ~1-2 MB

---

## 🔄 Maintenance

### When Adding Files

1. **Ask:** Does this belong in root? (Usually NO)
2. **Scripts?** → Put in `scripts/`
3. **Documentation?** → Put in `docs/`
4. **Configuration?** → Only if project-wide
5. **Update this file** when structure changes

### When Removing Files

1. **Check dependencies** - Is it used elsewhere?
2. **Update documentation** - Remove references
3. **Update this file** - Keep structure current

---

## 🎓 Best Practices

1. **Consistent naming**: Use lowercase, underscores for files
2. **Clear purposes**: Each directory has one clear role
3. **Logical grouping**: Related files together
4. **Minimal nesting**: Don't go more than 3 levels deep
5. **Document changes**: Update this file when structure changes

---

**Structure last reviewed**: October 14, 2025  
**Status**: Clean & organized (87.5% file reduction completed)
