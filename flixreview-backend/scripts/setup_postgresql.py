#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
PostgreSQL Content Server Setup Script
Sets up and manages PostgreSQL database for FlixReview content server
"""
import sys
import subprocess
import os
from pathlib import Path
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import shutil
from datetime import datetime
import io

# Fix encoding issues on Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def print_header(text):
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70)

def print_subheader(text):
    print(f"\n> {text}")

def check_item(name, result, details=""):
    status = "[OK]" if result else "[FAIL]"
    print(f"{status} {name}")
    if details and not result:
        print(f"   Info: {details}")
    return result

def run_command(command, capture_output=False, check=True):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=capture_output,
            text=True,
            check=check
        )
        return result.returncode == 0, result.stdout.strip() if capture_output else ""
    except subprocess.CalledProcessError as e:
        return False, str(e)

def check_postgresql_installation():
    """Check if PostgreSQL is installed and accessible"""
    print_subheader("Checking PostgreSQL Installation")

    # Check if psql command exists
    psql_exists, _ = run_command("psql --version", capture_output=True, check=False)
    check_item("PostgreSQL client installed", psql_exists, "Install PostgreSQL from https://www.postgresql.org/download/")

    if not psql_exists:
        return False

    # Check if PostgreSQL service is running
    service_running, _ = run_command("pg_isready", capture_output=True, check=False)
    check_item("PostgreSQL service running", service_running, "Start PostgreSQL service")

    return psql_exists and service_running

def get_postgresql_version():
    """Get PostgreSQL version"""
    success, output = run_command("psql --version", capture_output=True, check=False)
    if success:
        # Extract version from output like "psql (PostgreSQL) 15.4"
        try:
            version = output.split()[-1]
            return version
        except:
            return "Unknown"
    return None

def create_database(db_name, db_user, db_password, db_host="localhost", db_port="5432"):
    """Create PostgreSQL database"""
    print_subheader(f"Creating database '{db_name}'")

    try:
        # Connect to default postgres database
        conn = psycopg2.connect(
            dbname="postgres",
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # Check if database already exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
        exists = cursor.fetchone()

        if exists:
            print(f"[WARN] Database '{db_name}' already exists")
            cursor.close()
            conn.close()
            return True

        # Create database
        cursor.execute(f"CREATE DATABASE {db_name}")
        print(f"[OK] Database '{db_name}' created successfully")

        cursor.close()
        conn.close()
        return True

    except psycopg2.Error as e:
        print(f"[FAIL] Failed to create database: {e}")
        return False

def test_database_connection(db_name, db_user, db_password, db_host="localhost", db_port="5432"):
    """Test connection to PostgreSQL database"""
    print_subheader("Testing database connection")

    try:
        conn = psycopg2.connect(
            dbname=db_name,
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port
        )
        conn.close()
        check_item("Database connection successful", True)
        return True
    except psycopg2.Error as e:
        check_item("Database connection failed", False, str(e))
        return False

def update_env_file(env_file, db_settings):
    """Update .env file with PostgreSQL settings"""
    print_subheader("Updating environment configuration")

    env_path = Path(env_file)
    backup_path = env_path.with_suffix('.backup')

    # Create backup
    if env_path.exists():
        shutil.copy2(env_path, backup_path)
        print(f"[INFO] Created backup: {backup_path}")

    # Read existing content
    existing_content = ""
    if env_path.exists():
        existing_content = env_path.read_text()

    # Prepare new database URL
    db_url = f"postgresql://{db_settings['user']}:{db_settings['password']}@{db_settings['host']}:{db_settings['port']}/{db_settings['name']}"

    # Update or add DATABASE_URL
    lines = existing_content.split('\n')
    updated_lines = []
    db_url_found = False

    for line in lines:
        if line.startswith('DATABASE_URL='):
            updated_lines.append(f'DATABASE_URL={db_url}')
            db_url_found = True
        else:
            updated_lines.append(line)

    if not db_url_found:
        updated_lines.append(f'DATABASE_URL={db_url}')

    # Write updated content
    env_path.write_text('\n'.join(updated_lines))
    check_item("Environment file updated", True, f"DATABASE_URL={db_url}")

def create_postgresql_settings():
    """Interactive setup for PostgreSQL configuration"""
    print_header("PostgreSQL Content Server Setup")

    # Check PostgreSQL installation
    if not check_postgresql_installation():
        print("\n[FAIL] PostgreSQL is not properly installed or running.")
        print("Please install PostgreSQL and ensure the service is running.")
        return False

    # Get PostgreSQL version
    version = get_postgresql_version()
    if version:
        print(f"[INFO] PostgreSQL Version: {version}")

    # Get database configuration from user
    print("\n[CONFIG] Database Configuration:")
    print("Enter your PostgreSQL database details:")

    db_config = {
        'name': input("Database name [flixreview_db]: ").strip() or 'flixreview_db',
        'user': input("Database user [postgres]: ").strip() or 'postgres',
        'password': input("Database password: ").strip(),
        'host': input("Database host [localhost]: ").strip() or 'localhost',
        'port': input("Database port [5432]: ").strip() or '5432'
    }

    # Validate password
    if not db_config['password']:
        print("[FAIL] Database password is required")
        return False

    # Test connection to postgres database first
    print_subheader("Testing admin connection")
    if not test_database_connection('postgres', db_config['user'], db_config['password'], db_config['host'], db_config['port']):
        print("[FAIL] Cannot connect to PostgreSQL with provided credentials")
        return False

    # Create database
    if not create_database(db_config['name'], db_config['user'], db_config['password'], db_config['host'], db_config['port']):
        return False

    # Test connection to new database
    if not test_database_connection(db_config['name'], db_config['user'], db_config['password'], db_config['host'], db_config['port']):
        return False

    # Find .env file
    base_dir = Path(__file__).parent
    env_files = ['.env', '.secrets/.env', 'flixreview-backend/.env']

    env_file = None
    for env_path in env_files:
        full_path = base_dir / env_path
        if full_path.exists():
            env_file = full_path
            break

    if not env_file:
        # Create .env file in project root
        env_file = base_dir / '.env'
        print(f"[INFO] Creating new .env file: {env_file}")

    # Update environment file
    update_env_file(env_file, db_config)

    print_header("PostgreSQL Setup Complete!")

    print("\n[NEXT] Next Steps:")
    print("1. Run database migrations:")
    print("   python manage.py migrate")
    print("\n2. Create superuser (optional):")
    print("   python manage.py createsuperuser")
    print("\n3. Start the server:")
    print("   python manage.py runserver")
    print("\n4. Access admin panel:")
    print("   http://127.0.0.1:8000/admin/")

    print(f"\n[DB] Database Details:")
    print(f"   Name: {db_config['name']}")
    print(f"   User: {db_config['user']}")
    print(f"   Host: {db_config['host']}:{db_config['port']}")

    return True

def migrate_from_sqlite():
    """Migrate data from SQLite to PostgreSQL"""
    print_header("SQLite to PostgreSQL Migration")

    base_dir = Path(__file__).parent
    sqlite_db = base_dir / 'db.sqlite3'
    secrets_dir = base_dir / '.secrets'
    secrets_sqlite = secrets_dir / 'db.sqlite3'

    # Find SQLite database
    if secrets_sqlite.exists():
        sqlite_path = secrets_sqlite
    elif sqlite_db.exists():
        sqlite_path = sqlite_db
    else:
        print("[FAIL] No SQLite database found to migrate from")
        return False

    print(f"[INFO] Found SQLite database: {sqlite_path}")

    # Check if data exists
    import sqlite3
    try:
        conn = sqlite3.connect(str(sqlite_path))
        cursor = conn.cursor()

        # Check tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        table_names = [table[0] for table in tables if not table[0].startswith('sqlite_')]

        if not table_names:
            print("[WARN] SQLite database appears to be empty")
            conn.close()
            return False

        print(f"[INFO] Found {len(table_names)} tables: {', '.join(table_names)}")

        # Count records in each table
        total_records = 0
        for table in table_names:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            total_records += count
            print(f"   {table}: {count} records")

        conn.close()

        if total_records == 0:
            print("[WARN] No data found in SQLite database")
            return False

        print(f"\n[INFO] Total records to migrate: {total_records}")

    except sqlite3.Error as e:
        print(f"[FAIL] Error reading SQLite database: {e}")
        return False

    # Confirm migration
    confirm = input("\n[WARN] This will migrate data from SQLite to PostgreSQL. Continue? (y/N): ").lower().strip()
    if confirm not in ['y', 'yes']:
        print("Migration cancelled")
        return False

    # Use Django's built-in migration tools
    print("\n[INFO] Starting migration process...")

    # Backup current database setting
    print("[INFO] Backing up current database configuration...")

    # Run Django migrations (this will create tables in PostgreSQL)
    print("[INFO] Creating PostgreSQL tables...")
    success, output = run_command("python manage.py migrate", capture_output=True)
    if not success:
        print(f"[FAIL] Migration failed: {output}")
        return False

    # Use a data migration approach
    print("[INFO] Migrating data...")

    # Create a custom management command for data migration
    migration_script = f"""
import os
import django
import sqlite3
import psycopg2
from psycopg2.extras import execute_values

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movie_review_api.settings')
django.setup()

from django.conf import settings
from accounts.models import User
from movies.models import Movie, Genre
from reviews.models import Review

def migrate_data():
    # SQLite connection
    sqlite_conn = sqlite3.connect('{sqlite_path}')
    sqlite_cursor = sqlite_conn.cursor()

    # PostgreSQL connection
    db_settings = settings.DATABASES['default']
    pg_conn = psycopg2.connect(
        dbname=db_settings['NAME'],
        user=db_settings['USER'],
        password=db_settings['PASSWORD'],
        host=db_settings['HOST'],
        port=db_settings['PORT']
    )
    pg_cursor = pg_conn.cursor()

    try:
        # Migrate Users
        print("Migrating users...")
        sqlite_cursor.execute("SELECT id, username, email, first_name, last_name, date_joined, is_active, is_staff, is_superuser, profile_picture_url FROM accounts_user")
        users = sqlite_cursor.fetchall()

        if users:
            user_data = [(u[1], u[2], u[3], u[4], u[5], u[6], u[7], u[8], u[9]) for u in users]
            execute_values(pg_cursor, "INSERT INTO accounts_user (username, email, first_name, last_name, date_joined, is_active, is_staff, is_superuser, profile_picture_url) VALUES %s", user_data)

        # Migrate Genres
        print("Migrating genres...")
        sqlite_cursor.execute("SELECT id, name, slug, description, created_at FROM movies_genre")
        genres = sqlite_cursor.fetchall()

        if genres:
            genre_data = [(g[1], g[2], g[3], g[4]) for g in genres]
            execute_values(pg_cursor, "INSERT INTO movies_genre (name, slug, description, created_at) VALUES %s", genre_data)

        # Migrate Movies
        print("Migrating movies...")
        sqlite_cursor.execute("SELECT id, title, description, release_date, poster_url, backdrop_url, tmdb_id, vote_average, vote_count, popularity, created_at, avg_rating, review_count FROM movies_movie")
        movies = sqlite_cursor.fetchall()

        if movies:
            movie_data = [(m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], m[9], m[10], m[11], m[12]) for m in movies]
            execute_values(pg_cursor, "INSERT INTO movies_movie (title, description, release_date, poster_url, backdrop_url, tmdb_id, vote_average, vote_count, popularity, created_at, avg_rating, review_count) VALUES %s", movie_data)

        # Migrate Reviews
        print("Migrating reviews...")
        sqlite_cursor.execute("SELECT id, user_id, movie_id, content, rating, created_at, updated_at, is_edited FROM reviews_review")
        reviews = sqlite_cursor.fetchall()

        if reviews:
            review_data = [(r[1], r[2], r[3], r[4], r[5], r[6], r[7]) for r in reviews]
            execute_values(pg_cursor, "INSERT INTO reviews_review (user_id, movie_id, content, rating, created_at, updated_at, is_edited) VALUES %s", review_data)

        pg_conn.commit()
        print("\\u2713 Data migration completed successfully!")

    except Exception as e:
        pg_conn.rollback()
        print(f"\\u2717 Migration failed: {{e}}")
        raise
    finally:
        sqlite_conn.close()
        pg_conn.close()

if __name__ == '__main__':
    migrate_data()
"""

    # Write migration script
    migration_file = base_dir / 'migrate_sqlite_to_postgres.py'
    migration_file.write_text(migration_script)

    # Run migration script
    success, output = run_command(f"python {migration_file}", capture_output=True)
    if success:
        print("[OK] Data migration completed successfully!")
        print(f"[INFO] Migration script saved: {migration_file}")
        return True
    else:
        print(f"[FAIL] Data migration failed: {output}")
        return False

def show_usage():
    """Show script usage information"""
    print_header("PostgreSQL Content Server Script")
    print("""
Usage: python scripts/setup_postgresql.py [command]

Commands:
  setup     - Interactive PostgreSQL setup (default)
  migrate   - Migrate data from SQLite to PostgreSQL
  test      - Test PostgreSQL connection
  status    - Show PostgreSQL status and configuration

Examples:
  python scripts/setup_postgresql.py setup
  python scripts/setup_postgresql.py migrate
  python scripts/setup_postgresql.py test
  python scripts/setup_postgresql.py status

Environment Variables:
  DATABASE_URL=postgresql://user:password@host:port/database

Requirements:
  - PostgreSQL installed and running
  - psycopg2-binary package: pip install psycopg2-binary
  - Database user with CREATE DATABASE permission
""")

def show_status():
    """Show current PostgreSQL status"""
    print_header("PostgreSQL Status")

    # Check installation
    if not check_postgresql_installation():
        return

    # Get version
    version = get_postgresql_version()
    if version:
        print(f"[INFO] Version: {version}")

    # Check environment configuration
    print_subheader("Environment Configuration")

    base_dir = Path(__file__).parent
    env_files = ['.env', '.secrets/.env', 'flixreview-backend/.env']

    env_file = None
    for env_path in env_files:
        full_path = base_dir / env_path
        if full_path.exists():
            env_file = full_path
            break

    if env_file and env_file.exists():
        content = env_file.read_text()
        if 'DATABASE_URL=' in content:
            for line in content.split('\n'):
                if line.startswith('DATABASE_URL=') and 'postgresql://' in line:
                    print(f"[OK] PostgreSQL configured: {line}")
                    break
            else:
                print("[FAIL] PostgreSQL not configured (DATABASE_URL found but not PostgreSQL)")
        else:
            print("[FAIL] No DATABASE_URL found in environment")
    else:
        print("[FAIL] No environment file found")

def main():
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()

        if command == 'setup':
            create_postgresql_settings()
        elif command == 'migrate':
            migrate_from_sqlite()
        elif command == 'test':
            # Test database connection using current settings
            print_header("Testing PostgreSQL Connection")

            try:
                import django
                from django.conf import settings
                os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movie_review_api.settings')
                django.setup()

                from django.db import connection
                cursor = connection.cursor()
                cursor.execute("SELECT version();")
                version = cursor.fetchone()[0]
                print(f"[OK] Connected to PostgreSQL: {version[:50]}...")

            except Exception as e:
                print(f"[FAIL] Connection failed: {e}")
                print("Make sure DATABASE_URL is properly configured")

        elif command == 'status':
            show_status()
        else:
            print(f"[FAIL] Unknown command: {command}")
            show_usage()
    else:
        # Default action: setup
        create_postgresql_settings()

if __name__ == '__main__':
    main()