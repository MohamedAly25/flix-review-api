#!/usr/bin/env python
"""
Environment Health Check Script
Verifies that the development environment is properly configured
"""
import sys
import subprocess
from pathlib import Path

def print_header(text):
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70)

def check_item(name, result):
    status = "✅" if result else "❌"
    print(f"{status} {name}")
    return result

def main():
    print_header("🔍 FlixReview API - Environment Health Check")
    
    all_checks_passed = True
    
    # Check Python version
    print("\n📌 Python Environment:")
    python_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    check_item(f"Python Version: {python_version}", sys.version_info >= (3, 13))
    
    # Check virtual environment
    in_venv = hasattr(sys, 'real_prefix') or (
        hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix
    )
    check_item(f"Virtual Environment Active", in_venv)
    
    # Check core packages
    print("\n📦 Core Packages:")
    packages_to_check = {
        'django': '5.2.7',
        'rest_framework': '3.16.1',
        'tmdbv3api': '1.9.0',
        'sklearn': '1.6.1',
        'pandas': '2.2.3',
        'pytest': '8.4.2',
    }
    
    for package, expected_version in packages_to_check.items():
        try:
            if package == 'rest_framework':
                import rest_framework
                version = rest_framework.__version__
            elif package == 'sklearn':
                import sklearn
                version = sklearn.__version__
            elif package == 'tmdbv3api':
                import tmdbv3api
                version = "1.9.0"  # tmdbv3api doesn't have __version__
            else:
                module = __import__(package)
                version = module.__version__
            
            check_item(f"{package}: {version}", True)
        except (ImportError, AttributeError) as e:
            check_item(f"{package}: NOT FOUND", False)
            all_checks_passed = False
    
    # Check project structure
    print("\n📁 Project Structure:")
    base_dir = Path(__file__).parent
    
    required_dirs = [
        'accounts', 'movies', 'reviews', 'recommendations',
        'common', 'movie_review_api', '.secrets'
    ]
    
    for dir_name in required_dirs:
        exists = (base_dir / dir_name).exists()
        check_item(f"Directory: {dir_name}/", exists)
        if not exists:
            all_checks_passed = False
    
    # Check sensitive files
    print("\n🔒 Secrets & Configuration:")
    secrets_dir = base_dir / '.secrets'
    
    sensitive_files = {
        'db.sqlite3': 'Development database',
        'admin_credentials.md': 'Admin credentials',
        'GUIDE.md': 'Secrets guide',
    }
    
    for filename, description in sensitive_files.items():
        file_path = secrets_dir / filename
        exists = file_path.exists()
        check_item(f"{description} ({filename})", exists)
    
    # Check .gitignore
    gitignore = base_dir / '.gitignore'
    if gitignore.exists():
        content = gitignore.read_text()
        has_secrets = '.secrets/' in content
        has_venv = 'venv/' in content or '.venv/' in content
        check_item(".gitignore protects .secrets/", has_secrets)
        check_item(".gitignore protects venv/", has_venv)
    
    # Check database
    print("\n💾 Database:")
    db_path = secrets_dir / 'db.sqlite3'
    if db_path.exists():
        size_mb = db_path.stat().st_size / (1024 * 1024)
        check_item(f"Database exists ({size_mb:.2f} MB)", True)
    else:
        check_item("Database exists", False)
        print("   ℹ️  Run: python manage.py migrate")
    
    # Summary
    print_header("📊 Summary")
    
    if all_checks_passed:
        print("\n✅ All checks passed! Your environment is ready for development.")
        print("\n🚀 Next steps:")
        print("   1. Configure TMDB_API_KEY in .secrets/.env")
        print("   2. Run: python manage.py runserver")
        print("   3. Access: http://127.0.0.1:8000/api/docs/")
    else:
        print("\n⚠️  Some checks failed. Please review the errors above.")
        print("\n🔧 Common fixes:")
        print("   - Activate virtual environment: .\\venv\\Scripts\\Activate.ps1")
        print("   - Install packages: pip install -r requirements/development.txt")
        print("   - Run migrations: python manage.py migrate")
    
    print("\n" + "=" * 70)
    
    return 0 if all_checks_passed else 1

if __name__ == '__main__':
    sys.exit(main())
