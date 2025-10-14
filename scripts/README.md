# 📜 Scripts Directory

This directory contains utility scripts for project management and maintenance.

---

## Available Scripts

### Database Management

**`seed_database.py`** - Populate database with sample data
```bash
python scripts/seed_database.py
```
Creates sample users, movies, genres, and reviews for testing.

**`verify_database.py`** - Verify database integrity
```bash
python scripts/verify_database.py
```
Checks database connection and displays current data counts.

---

### Admin Management

**`check_admin.py`** - Check admin user status
```bash
python scripts/check_admin.py
```
Verifies if admin user exists and displays credentials.

**`reset_admin.py`** - Reset admin password
```bash
python scripts/reset_admin.py
```
Resets the admin user password to default.

---

### Environment

**`check_environment.py`** - Verify environment setup
```bash
python scripts/check_environment.py
```
Comprehensive check of:
- Python version
- Django installation
- Database connection
- Environment variables
- Installed packages
- Migration status

---

## Usage Notes

### Running Scripts

All scripts should be run from the **project root** directory:

```bash
# From: H:\WebApp_FlixReview(main)\flix-review-api\
python scripts/script_name.py
```

### Virtual Environment

Make sure your virtual environment is activated:

```bash
# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### Common Workflow

1. **Check environment**
   ```bash
   python scripts/check_environment.py
   ```

2. **Seed database** (for development)
   ```bash
   python scripts/seed_database.py
   ```

3. **Verify data**
   ```bash
   python scripts/verify_database.py
   ```

4. **Check/reset admin** (if needed)
   ```bash
   python scripts/check_admin.py
   python scripts/reset_admin.py
   ```

---

## Script Dependencies

All scripts require:
- ✅ Virtual environment activated
- ✅ Django installed
- ✅ Database configured (.env file)
- ✅ Migrations applied

---

## Adding New Scripts

When creating new utility scripts:

1. Place them in this `scripts/` directory
2. Add documentation to this README
3. Follow naming convention: `verb_noun.py` (e.g., `backup_database.py`)
4. Include proper error handling
5. Add usage examples

---

## Troubleshooting

**Script not found?**
```bash
# Make sure you're in the project root
cd H:\WebApp_FlixReview(main)\flix-review-api\
python scripts/script_name.py
```

**Import errors?**
```bash
# Ensure venv is activated
.\venv\Scripts\activate  # Windows
```

**Database errors?**
```bash
# Run migrations first
python manage.py migrate
```

---

**Last Updated**: October 14, 2025
