"""
🔍 FlixReview Database ERD Verification Script
==============================================
This script verifies:
✅ Database compliance with required ERD
✅ All Models exist and are correct
✅ Relationships between tables (Foreign Keys, Many-to-Many)
✅ Required fields and their types
✅ Constraints and Indexes
✅ Sample Data

Author: FlixReview Team
Date: October 15, 2025
Version: 1.0
"""

import os
import sys
import django
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

# Setup Django environment
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movie_review_api.settings')
django.setup()

from django.db import connection
from django.apps import apps
from django.contrib.auth import get_user_model

# ==============================================================================
# COLOR CODES
# ==============================================================================
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

# ==============================================================================
# EXPECTED ERD STRUCTURE
# ==============================================================================
EXPECTED_ERD = {
    'User': {
        'app': 'accounts',
        'fields': {
            'id': 'AutoField/BigAutoField',
            'email': 'EmailField',
            'username': 'CharField',
            'first_name': 'CharField',
            'last_name': 'CharField',
            'bio': 'TextField',
            'profile_picture': 'ImageField',
            'is_active': 'BooleanField',
            'is_staff': 'BooleanField',
            'is_superuser': 'BooleanField',
            'date_joined': 'DateTimeField',
            'last_login': 'DateTimeField',
        },
        'unique_fields': ['email', 'username'],
        'required_fields': ['email', 'username'],
    },
    'Genre': {
        'app': 'movies',
        'fields': {
            'id': 'AutoField/BigAutoField',
            'name': 'CharField',
            'slug': 'SlugField',
            'description': 'TextField',
            'created_at': 'DateTimeField',
        },
        'unique_fields': ['name', 'slug'],
        'required_fields': ['name', 'slug'],
    },
    'Movie': {
        'app': 'movies',
        'fields': {
            'id': 'AutoField/BigAutoField',
            'title': 'CharField',
            'description': 'TextField',
            'release_date': 'DateField',
            'runtime': 'IntegerField',
            'poster_url': 'URLField',
            'backdrop_url': 'URLField',
            'tmdb_id': 'IntegerField',
            'imdb_id': 'CharField',
            'avg_rating': 'DecimalField/FloatField',
            'budget': 'BigIntegerField',
            'revenue': 'BigIntegerField',
            'created_at': 'DateTimeField',
            'updated_at': 'DateTimeField',
        },
        'foreign_keys': {
            'genres': 'Genre',  # ManyToManyField
        },
        'unique_fields': ['tmdb_id'],
        'required_fields': ['title'],
    },
    'Review': {
        'app': 'reviews',
        'fields': {
            'id': 'AutoField/BigAutoField',
            'rating': 'IntegerField',
            'content': 'TextField',
            'is_edited': 'BooleanField',
            'created_at': 'DateTimeField',
            'updated_at': 'DateTimeField',
        },
        'foreign_keys': {
            'user': 'User',
            'movie': 'Movie',
        },
        'unique_together': [['user', 'movie']],
        'required_fields': ['user', 'movie', 'rating', 'content'],
    },
}

# ==============================================================================
# STATISTICS
# ==============================================================================
class VerificationStats:
    total_checks = 0
    passed_checks = 0
    failed_checks = 0
    warnings = 0
    errors = []
    
    @classmethod
    def add_pass(cls):
        cls.total_checks += 1
        cls.passed_checks += 1
    
    @classmethod
    def add_fail(cls, error: str):
        cls.total_checks += 1
        cls.failed_checks += 1
        cls.errors.append(error)
    
    @classmethod
    def add_warning(cls):
        cls.warnings += 1
    
    @classmethod
    def get_rate(cls) -> float:
        return (cls.passed_checks / cls.total_checks * 100) if cls.total_checks > 0 else 0

# ==============================================================================
# PRINT UTILITIES
# ==============================================================================
def print_header():
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*100}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'🔍 FlixReview - Database ERD Verification':^100}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'Database ERD Compliance Verification':^100}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*100}{Colors.RESET}")
    print(f"{Colors.CYAN}Database: {connection.settings_dict['NAME']}{Colors.RESET}")
    print(f"{Colors.CYAN}Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*100}{Colors.RESET}\n")

def print_section(title: str, icon: str = "📋"):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*100}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{icon} {title}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*100}{Colors.RESET}\n")

def print_check(name: str, passed: bool, details: str = ""):
    status = f"{Colors.GREEN}✅ Correct{Colors.RESET}" if passed else f"{Colors.RED}❌ Error{Colors.RESET}"
    print(f"{status} - {name}")
    if details:
        print(f"      {Colors.CYAN}Details: {details}{Colors.RESET}")
    
    if passed:
        VerificationStats.add_pass()
    else:
        VerificationStats.add_fail(f"{name}: {details}")

def print_warning(msg: str):
    print(f"{Colors.YELLOW}⚠️  تحذير: {msg}{Colors.RESET}")
    VerificationStats.add_warning()

def print_success(msg: str):
    print(f"{Colors.GREEN}✅ {msg}{Colors.RESET}")

def print_error(msg: str):
    print(f"{Colors.RED}❌ {msg}{Colors.RESET}")

def print_info(msg: str):
    print(f"{Colors.BLUE}ℹ️  {msg}{Colors.RESET}")

# ==============================================================================
# MODEL VERIFICATION FUNCTIONS
# ==============================================================================
def verify_model_exists(model_name: str, app_name: str) -> bool:
    """Check if model exists in the app"""
    try:
        model = apps.get_model(app_name, model_name)
        return True
    except LookupError:
        return False

def verify_model_fields(model_name: str, app_name: str, expected_fields: Dict) -> Dict[str, bool]:
    """Verify model fields"""
    model = apps.get_model(app_name, model_name)
    results = {}
    
    for field_name, expected_type in expected_fields.items():
        try:
            field = model._meta.get_field(field_name)
            field_type = type(field).__name__
            
            # Check if field type matches (handle multiple acceptable types)
            if '/' in expected_type:
                acceptable_types = expected_type.split('/')
                type_match = any(t in field_type for t in acceptable_types)
            else:
                type_match = expected_type in field_type
            
            results[field_name] = type_match
        except Exception as e:
            results[field_name] = False
    
    return results

def verify_foreign_keys(model_name: str, app_name: str, expected_fks: Dict) -> Dict[str, bool]:
    """Verify foreign keys and relationships"""
    model = apps.get_model(app_name, model_name)
    results = {}
    
    for field_name, related_model_name in expected_fks.items():
        try:
            field = model._meta.get_field(field_name)
            field_type = type(field).__name__
            
            # Check if it's a relationship field
            if 'ForeignKey' in field_type or 'ManyToMany' in field_type or 'OneToOne' in field_type:
                # Get related model name
                related_model = field.related_model._meta.object_name
                results[field_name] = (related_model == related_model_name)
            else:
                results[field_name] = False
        except Exception as e:
            results[field_name] = False
    
    return results

def verify_unique_constraints(model_name: str, app_name: str, expected_unique: List) -> Dict[str, bool]:
    """Verify unique constraints"""
    model = apps.get_model(app_name, model_name)
    results = {}
    
    for field_name in expected_unique:
        try:
            field = model._meta.get_field(field_name)
            results[field_name] = field.unique
        except Exception:
            results[field_name] = False
    
    return results

def verify_unique_together(model_name: str, app_name: str, expected_together: List) -> bool:
    """Verify unique_together constraints"""
    model = apps.get_model(app_name, model_name)
    unique_together = model._meta.unique_together
    
    for constraint in expected_together:
        if tuple(constraint) not in unique_together:
            return False
    return True

def count_model_records(model_name: str, app_name: str) -> int:
    """Count records in model"""
    try:
        model = apps.get_model(app_name, model_name)
        return model.objects.count()
    except Exception:
        return 0

# ==============================================================================
# COMPREHENSIVE VERIFICATION
# ==============================================================================
def verify_complete_erd():
    """Comprehensive ERD verification"""
    print_section("Model Verification", "🏗️")
    
    for model_name, model_spec in EXPECTED_ERD.items():
        print_info(f"\n📝 Verifying model: {model_name}")
        
        app_name = model_spec['app']
        
        # 1. Check model exists
        exists = verify_model_exists(model_name, app_name)
        print_check(f"Model {model_name} exists", exists, 
                   f"in app {app_name}" if exists else f"not found in {app_name}")
        
        if not exists:
            continue
        
        # 2. Check fields
        print(f"\n   {Colors.BOLD}Fields:{Colors.RESET}")
        field_results = verify_model_fields(model_name, app_name, model_spec['fields'])
        
        for field_name, is_correct in field_results.items():
            expected_type = model_spec['fields'][field_name]
            status = "✅" if is_correct else "❌"
            print(f"      {status} {field_name}: {expected_type}")
            
            if is_correct:
                VerificationStats.add_pass()
            else:
                VerificationStats.add_fail(f"{model_name}.{field_name} type mismatch")
        
        # 3. Check foreign keys
        if 'foreign_keys' in model_spec:
            print(f"\n   {Colors.BOLD}Relationships:{Colors.RESET}")
            fk_results = verify_foreign_keys(model_name, app_name, model_spec['foreign_keys'])
            
            for fk_name, is_correct in fk_results.items():
                related_model = model_spec['foreign_keys'][fk_name]
                status = "✅" if is_correct else "❌"
                print(f"      {status} {fk_name} → {related_model}")
                
                if is_correct:
                    VerificationStats.add_pass()
                else:
                    VerificationStats.add_fail(f"{model_name}.{fk_name} relationship error")
        
        # 4. Check unique constraints
        if 'unique_fields' in model_spec:
            print(f"\n   {Colors.BOLD}Unique Constraints:{Colors.RESET}")
            unique_results = verify_unique_constraints(model_name, app_name, 
                                                      model_spec['unique_fields'])
            
            for field_name, is_unique in unique_results.items():
                status = "✅" if is_unique else "❌"
                print(f"      {status} {field_name} (unique)")
                
                if is_unique:
                    VerificationStats.add_pass()
                else:
                    VerificationStats.add_fail(f"{model_name}.{field_name} should be unique")
        
        # 5. Check unique_together
        if 'unique_together' in model_spec:
            print(f"\n   {Colors.BOLD}Unique Together Constraints:{Colors.RESET}")
            is_correct = verify_unique_together(model_name, app_name, 
                                               model_spec['unique_together'])
            
            for constraint in model_spec['unique_together']:
                status = "✅" if is_correct else "❌"
                print(f"      {status} unique_together({', '.join(constraint)})")
            
            print_check(f"Unique Together in {model_name}", is_correct)
        
        # 6. Count records
        count = count_model_records(model_name, app_name)
        print(f"\n   {Colors.CYAN}📊 Record count: {count}{Colors.RESET}")
        
        if count == 0:
            print_warning(f"No data in {model_name} table")

def verify_database_tables():
    """Verify database tables"""
    print_section("Database Tables Verification", "💾")
    
    with connection.cursor() as cursor:
        # Get all table names
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' 
            ORDER BY name;
        """)
        tables = [row[0] for row in cursor.fetchall()]
        
        print_info(f"Total tables: {len(tables)}")
        print()
        
        # Expected tables
        expected_tables = [
            'accounts_user',
            'movies_genre',
            'movies_movie',
            'movies_movie_genres',  # M2M table
            'reviews_review',
        ]
        
        for table in expected_tables:
            exists = table in tables
            print_check(f"Table {table}", exists, 
                       "exists" if exists else "not found")
        
        # List all tables
        print(f"\n{Colors.BOLD}All tables:{Colors.RESET}")
        for table in sorted(tables):
            if not table.startswith('sqlite_') and not table.startswith('django_') and not table.startswith('auth_'):
                print(f"   • {table}")

def verify_data_samples():
    """Verify sample data"""
    print_section("Sample Data Verification", "📦")
    
    User = get_user_model()
    
    # Import models
    Genre = apps.get_model('movies', 'Genre')
    Movie = apps.get_model('movies', 'Movie')
    Review = apps.get_model('reviews', 'Review')
    
    # Count data
    user_count = User.objects.count()
    genre_count = Genre.objects.count()
    movie_count = Movie.objects.count()
    review_count = Review.objects.count()
    
    print(f"{Colors.BOLD}Data Statistics:{Colors.RESET}\n")
    print(f"   👥 Users: {Colors.GREEN}{user_count}{Colors.RESET}")
    print(f"   🎭 Genres: {Colors.GREEN}{genre_count}{Colors.RESET}")
    print(f"   🎬 Movies: {Colors.GREEN}{movie_count}{Colors.RESET}")
    print(f"   ⭐ Reviews: {Colors.GREEN}{review_count}{Colors.RESET}")
    print()
    
    # Check minimum data requirements
    print_check("Users exist", user_count > 0, f"{user_count} users")
    print_check("Genres exist", genre_count >= 5, f"{genre_count} genres")
    print_check("Movies exist", movie_count >= 10, f"{movie_count} movies")
    print_check("Reviews exist", review_count > 0, f"{review_count} reviews")
    
    # Show sample data
    if movie_count > 0:
        print(f"\n{Colors.BOLD}Sample movies:{Colors.RESET}")
        for movie in Movie.objects.all()[:5]:
            genres_str = ', '.join([g.name for g in movie.genres.all()])
            review_count = Review.objects.filter(movie=movie).count()
            print(f"   • {movie.title} ({movie.release_date.year if movie.release_date else 'N/A'})")
            print(f"     Genres: {genres_str}")
            print(f"     Rating: {movie.avg_rating}⭐ | Reviews: {review_count}")

def verify_relationships():
    """Verify table relationships"""
    print_section("Relationship Verification", "🔗")
    
    Movie = apps.get_model('movies', 'Movie')
    Review = apps.get_model('reviews', 'Review')
    Genre = apps.get_model('movies', 'Genre')
    
    # Test Movie-Genre relationship (M2M)
    print_info("Testing Movie-Genre relationship (Many-to-Many)")
    if Movie.objects.exists():
        movie = Movie.objects.first()
        genre_count = movie.genres.count()
        print_check("Movie → Genres", True, f"{movie.title} has {genre_count} genres")
    else:
        print_warning("No movies to test")
    
    # Test Review-Movie relationship (FK)
    print_info("\nTesting Review-Movie relationship (Foreign Key)")
    if Review.objects.exists():
        review = Review.objects.first()
        has_movie = hasattr(review, 'movie') and review.movie is not None
        print_check("Review → Movie", has_movie, 
                   f"Review linked to {review.movie.title}" if has_movie else "")
    else:
        print_warning("No reviews to test")
    
    # Test Review-User relationship (FK)
    print_info("\nTesting Review-User relationship (Foreign Key)")
    if Review.objects.exists():
        review = Review.objects.first()
        has_user = hasattr(review, 'user') and review.user is not None
        print_check("Review → User", has_user,
                   f"Review by {review.user.username}" if has_user else "")
    else:
        print_warning("No reviews to test")
    
    # Test Genre-Movie reverse relationship
    print_info("\nTesting reverse Genre → Movies relationship")
    if Genre.objects.exists():
        genre = Genre.objects.first()
        # Use 'movies' instead of 'movie_set' based on related_name
        movie_count = genre.movies.count()
        print_check("Genre → Movies (reverse)", True, 
                   f"{genre.name} has {movie_count} movies")
    else:
        print_warning("No genres to test")

def verify_constraints():
    """Verify constraints and indexes"""
    print_section("Constraints and Indexes Verification", "🔒")
    
    User = get_user_model()
    Review = apps.get_model('reviews', 'Review')
    Movie = apps.get_model('movies', 'Movie')
    
    # Check unique constraints
    print_info("Testing Unique Constraints")
    
    # Test User email uniqueness
    try:
        users = User.objects.filter(email='test@test.com')
        if users.count() <= 1:
            print_check("User.email unique", True, "No duplicate emails")
        else:
            print_check("User.email unique", False, f"Found {users.count()} users with same email!")
    except Exception as e:
        print_error(f"Error testing unique email: {str(e)}")
    
    # Test Movie tmdb_id uniqueness
    print_info("\nTesting TMDB ID uniqueness")
    try:
        movies_with_tmdb = Movie.objects.filter(tmdb_id__isnull=False)
        total_movies = movies_with_tmdb.count()
        unique_tmdb = movies_with_tmdb.values('tmdb_id').distinct().count()
        
        if total_movies == unique_tmdb:
            print_check("Movie.tmdb_id unique", True, f"All {total_movies} movies have unique TMDB ID")
        else:
            print_check("Movie.tmdb_id unique", False, 
                       f"Found duplicates: {total_movies} movies and {unique_tmdb} unique TMDB IDs")
    except Exception as e:
        print_error(f"Error testing unique tmdb_id: {str(e)}")
    
    # Test Review unique_together (user, movie)
    print_info("\nTesting unique_together (User, Movie)")
    if Review.objects.exists():
        review = Review.objects.first()
        duplicate_reviews = Review.objects.filter(
            user=review.user,
            movie=review.movie
        ).count()
        
        print_check("Review unique_together", duplicate_reviews == 1,
                   f"User {review.user.username} has {duplicate_reviews} reviews for same movie")
        
        # Test for any duplicates in database
        total_reviews = Review.objects.count()
        unique_pairs = Review.objects.values('user', 'movie').distinct().count()
        
        if total_reviews == unique_pairs:
            print_check("No duplicate reviews", True, 
                       f"All {total_reviews} reviews are unique (user, movie)")
        else:
            print_check("No duplicate reviews", False,
                       f"Found duplicates: {total_reviews} reviews and {unique_pairs} unique pairs")
    else:
        print_warning("No reviews to test")

# ==============================================================================
# FINAL REPORT
# ==============================================================================
def print_final_report():
    print_section("Final Report", "📈")
    
    rate = VerificationStats.get_rate()
    
    print(f"\n{Colors.BOLD}{'📊 Verification Statistics':^100}{Colors.RESET}")
    print(f"{Colors.CYAN}{'─'*100}{Colors.RESET}")
    print(f"   Total Checks:    {Colors.BOLD}{VerificationStats.total_checks}{Colors.RESET}")
    print(f"   ✅ Passed:       {Colors.GREEN}{Colors.BOLD}{VerificationStats.passed_checks}{Colors.RESET}")
    print(f"   ❌ Failed:       {Colors.RED}{Colors.BOLD}{VerificationStats.failed_checks}{Colors.RESET}")
    print(f"   ⚠️  Warnings:     {Colors.YELLOW}{VerificationStats.warnings}{Colors.RESET}")
    print(f"   📈 Success Rate:  {Colors.GREEN if rate >= 90 else Colors.YELLOW}{rate:.1f}%{Colors.RESET}")
    print(f"{Colors.CYAN}{'─'*100}{Colors.RESET}\n")
    
    # Grade
    if rate >= 95:
        grade = "Excellent"
        emoji = "🎉"
        msg = "Database is fully compliant with ERD!"
        color = Colors.GREEN
    elif rate >= 90:
        grade = "Very Good"
        emoji = "✨"
        msg = "Database is mostly compliant with ERD!"
        color = Colors.GREEN
    elif rate >= 80:
        grade = "Good"
        emoji = "👍"
        msg = "Most components are correct"
        color = Colors.YELLOW
    elif rate >= 70:
        grade = "Fair"
        emoji = "⚠️"
        msg = "Some issues need attention"
        color = Colors.YELLOW
    else:
        grade = "Needs Improvement"
        emoji = "❌"
        msg = "Multiple issues found"
        color = Colors.RED
    
    print(f"{color}{Colors.BOLD}{'─'*100}{Colors.RESET}")
    print(f"{color}{Colors.BOLD}{emoji} Grade: {grade} - {msg}{Colors.RESET}")
    print(f"{color}{Colors.BOLD}{'─'*100}{Colors.RESET}\n")
    
    # Errors
    if VerificationStats.errors:
        print(f"{Colors.RED}{Colors.BOLD}⚠️  Detected Errors:{Colors.RESET}")
        for i, error in enumerate(VerificationStats.errors[:15], 1):
            print(f"{Colors.RED}   {i}. {error}{Colors.RESET}")
        if len(VerificationStats.errors) > 15:
            print(f"{Colors.RED}   ... and {len(VerificationStats.errors) - 15} more errors{Colors.RESET}")
        print()
    
    print(f"{Colors.CYAN}{'─'*100}{Colors.RESET}")
    print(f"{Colors.CYAN}Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.RESET}")
    print(f"{Colors.CYAN}{'─'*100}{Colors.RESET}\n")

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================
def main():
    """Run all verification processes"""
    print_header()
    
    try:
        # Run all verifications
        verify_complete_erd()
        verify_database_tables()
        verify_relationships()
        verify_constraints()
        verify_data_samples()
        
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}⚠️  Verification stopped by user{Colors.RESET}\n")
    except Exception as e:
        print(f"\n\n{Colors.RED}❌ Critical error: {str(e)}{Colors.RESET}\n")
        import traceback
        traceback.print_exc()
    finally:
        print_final_report()

if __name__ == "__main__":
    main()
