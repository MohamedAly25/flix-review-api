# 🛠️ FlixReview Backend Scripts# 📜 Scripts Directory



**Utility scripts for FlixReview development, testing, and maintenance**This directory contains utility scripts for project management and maintenance.



------



## 📋 Quick Reference## Available Scripts



| Script | Purpose | Use Case |### Database Management

|--------|---------|----------|

| **test_all_features.py** | 🎯 **MASTER TEST** - All-in-one testing | ⭐ Run before deployment |**`seed_database.py`** - Populate database with sample data

| comprehensive_api_test.py | Detailed API testing | Development/debugging |```bash

| create_sample_reviews.py | Generate test reviews | Enable recommendations |python scripts/seed_database.py

| import_popular_movies.py | Import from TMDB | Populate database |```

| seed_database.py | Initial test data | First-time setup |Creates sample users, movies, genres, and reviews for testing.

| verify_database.py | Database integrity check | Troubleshooting |

| check_admin.py | Verify admin user | Setup verification |**`verify_database.py`** - Verify database integrity

| reset_admin.py | Reset admin password | Recover access |```bash

| check_environment.py | Environment validation | Setup verification |python scripts/verify_database.py

```

---Checks database connection and displays current data counts.



## 🎯 MASTER TEST FILE---



### `test_all_features.py` ⭐ **RECOMMENDED**### Admin Management



**The ultimate merged test file** - combines all previous test scripts.**`check_admin.py`** - Check admin user status

```bash

**Recent Changes (Oct 15, 2025):**python scripts/check_admin.py

- ✅ Merged 4 test files into 1```

- ✅ Deleted: `test_genre_fix.py`, `test_tmdb_fix.py`, `final_test.py`, `test_all_apis.py`Verifies if admin user exists and displays credentials.

- ✅ Added grade system (A+ to D)

- ✅ Validates all recent fixes**`reset_admin.py`** - Reset admin password

```bash

**Usage:**python scripts/reset_admin.py

```bash```

cd flixreview-backendResets the admin user password to default.

python scripts/test_all_features.py

```---



**Tests 23+ Endpoints:**### Environment

- 🔐 Authentication (3 tests)

- 🎬 Movies API (5 tests) - includes genre filtering fix**`check_environment.py`** - Verify environment setup

- 🎭 Genres API (2 tests)```bash

- ⭐ Reviews API (3 tests)python scripts/check_environment.py

- 🎯 Recommendations (6 tests)```

- 🎥 TMDB Integration (1 test) - fixed searchComprehensive check of:

- 📊 Data Verification (3 tests)- Python version

- Django installation

**Expected Result:**- Database connection

```- Environment variables

📈 Success Rate: 90%+- Installed packages

✨ GRADE: A - EXCELLENT!- Migration status

```

---

---

## Usage Notes

## 💾 Data Scripts

### Running Scripts

### `create_sample_reviews.py`

Creates 31 reviews for testing recommendations.All scripts should be run from the **project root** directory:



```bash```bash

python scripts/create_sample_reviews.py# From: H:\WebApp_FlixReview(main)\flix-review-api\

```python scripts/script_name.py

```

### `import_popular_movies.py`

Imports movies from TMDB API.### Virtual Environment



```bashMake sure your virtual environment is activated:

python scripts/import_popular_movies.py

``````bash

# Windows

### `seed_database.py`.\venv\Scripts\activate

Creates initial test data.

# Linux/Mac

```bashsource venv/bin/activate

python scripts/seed_database.py```

```

### Common Workflow

---

1. **Check environment**

## 🔍 Verification Scripts   ```bash

   python scripts/check_environment.py

### `verify_database.py`   ```

Checks database integrity.

2. **Seed database** (for development)

```bash   ```bash

python scripts/verify_database.py   python scripts/seed_database.py

```   ```



### `check_environment.py`3. **Verify data**

Validates environment setup.   ```bash

   python scripts/verify_database.py

```bash   ```

python scripts/check_environment.py

```4. **Check/reset admin** (if needed)

   ```bash

---   python scripts/check_admin.py

   python scripts/reset_admin.py

## 👤 Admin Scripts   ```



### `check_admin.py`---

Verifies admin user exists.

## Script Dependencies

```bash

python scripts/check_admin.pyAll scripts require:

```- ✅ Virtual environment activated

- ✅ Django installed

### `reset_admin.py`- ✅ Database configured (.env file)

Resets admin password.- ✅ Migrations applied



```bash---

python scripts/reset_admin.py

```## Adding New Scripts



---When creating new utility scripts:



## 🚀 Workflows1. Place them in this `scripts/` directory

2. Add documentation to this README

### First Time Setup3. Follow naming convention: `verb_noun.py` (e.g., `backup_database.py`)

```bash4. Include proper error handling

python scripts/check_environment.py5. Add usage examples

python scripts/seed_database.py

python scripts/create_sample_reviews.py---

python scripts/test_all_features.py

```## Troubleshooting



### Before Deployment**Script not found?**

```bash```bash

python scripts/test_all_features.py  # Should show A or A+# Make sure you're in the project root

```cd H:\WebApp_FlixReview(main)\flix-review-api\

python scripts/script_name.py

### Troubleshooting```

```bash

python scripts/verify_database.py**Import errors?**

python scripts/check_environment.py```bash

```# Ensure venv is activated

.\venv\Scripts\activate  # Windows

---```



## 📈 Test Grades**Database errors?**

```bash

| Rate | Grade | Status |# Run migrations first

|------|-------|--------|python manage.py migrate

| 95-100% | A+ 🎉 | Ready for production |```

| 90-94% | A ✨ | Excellent |

| 80-89% | B 👍 | Good |---

| 70-79% | C ⚠️ | Needs work |

| < 70% | D ❌ | Major issues |**Last Updated**: October 14, 2025


---

**Last Updated:** October 15, 2025  
**Version:** 2.0  
**Recommended:** Use `test_all_features.py` for testing

---

## 🐘 PostgreSQL Setup Script

### `setup_postgresql.py` ⭐ **PRODUCTION DATABASE**

**Complete PostgreSQL content server setup and management**

```bash
# Interactive setup
python scripts/setup_postgresql.py setup

# Migrate from SQLite to PostgreSQL
python scripts/setup_postgresql.py migrate

# Test connection
python scripts/setup_postgresql.py test

# Check status
python scripts/setup_postgresql.py status
```

**Features:**
- ✅ Interactive PostgreSQL database setup
- ✅ Automatic environment configuration
- ✅ Data migration from SQLite to PostgreSQL
- ✅ Connection testing and validation
- ✅ Production-ready database configuration

**Requirements:**
```bash
pip install psycopg2-binary==2.9.10
```

**Environment Variables:**
```
DATABASE_URL=postgresql://user:password@host:port/database
```

**Usage Workflow:**
1. Install PostgreSQL and start service
2. Run setup: `python scripts/setup_postgresql.py setup`
3. Install psycopg2: `pip install psycopg2-binary`
4. Run migrations: `python manage.py migrate`
5. Migrate data (optional): `python scripts/setup_postgresql.py migrate`
