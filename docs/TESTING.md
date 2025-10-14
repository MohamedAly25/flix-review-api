# 🧪 Testing Guide

**FlixReview API - Complete Testing Documentation**

Last Updated: October 14, 2025

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Test Coverage](#test-coverage)
6. [Test Data](#test-data)
7. [Testing Patterns](#testing-patterns)
8. [CI/CD Integration](#cicd-integration)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Run All Tests
```bash
# Activate virtual environment first
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html
```

### Run Specific Tests
```bash
# Single test file
pytest accounts/tests.py

# Single test class
pytest accounts/tests.py::UserRegistrationTests

# Single test method
pytest accounts/tests.py::UserRegistrationTests::test_register_user

# By keyword
pytest -k "authentication"
```

---

## 📁 Test Structure

### File Organization
```
flix-review-api/
├── accounts/tests.py          # User authentication tests
├── movies/tests.py            # Movie model and API tests
├── reviews/tests.py           # Review and rating tests
├── common/tests.py            # Common utilities tests
└── pytest.ini                 # pytest configuration
```

### Test Naming Convention
```python
# File: app_name/tests.py
class TestModelName:
    """Tests for ModelName model"""
    
    def test_feature_description(self):
        """Test that feature works correctly"""
        pass
```

---

## 🏃 Running Tests

### Basic Commands

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run with very verbose output (show each test)
pytest -vv

# Run tests in parallel (faster)
pytest -n auto

# Stop at first failure
pytest -x

# Run last failed tests only
pytest --lf

# Show print statements
pytest -s
```

### Filter Tests

```bash
# By file
pytest accounts/tests.py movies/tests.py

# By directory
pytest accounts/

# By marker
pytest -m "slow"
pytest -m "not slow"

# By keyword
pytest -k "user or authentication"
pytest -k "not tmdb"
```

### Output Options

```bash
# Quiet mode (less output)
pytest -q

# Show local variables on failure
pytest -l

# Show full diff on assertion errors
pytest -vv

# Generate JUnit XML report
pytest --junit-xml=report.xml
```

---

## ✍️ Writing Tests

### Basic Test Structure

```python
# accounts/tests.py
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRegistrationTests(TestCase):
    """Test user registration functionality"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        self.register_url = '/api/accounts/register/'
        self.valid_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'TestPass123!',
            'password2': 'TestPass123!'
        }
    
    def test_register_valid_user(self):
        """Test registering a user with valid data"""
        response = self.client.post(self.register_url, self.valid_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertTrue(User.objects.filter(username='testuser').exists())
    
    def test_register_duplicate_username(self):
        """Test registering with duplicate username fails"""
        # Create first user
        User.objects.create_user(username='testuser', email='first@example.com')
        
        # Try to create second user with same username
        response = self.client.post(self.register_url, self.valid_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)
```

### Testing Models

```python
# movies/tests.py
from django.test import TestCase
from movies.models import Movie, Genre

class MovieModelTests(TestCase):
    """Test Movie model functionality"""
    
    def setUp(self):
        """Create test data"""
        self.genre = Genre.objects.create(name="Action")
        self.movie = Movie.objects.create(
            title="Test Movie",
            description="A test movie",
            release_date="2024-01-01",
            tmdb_id=12345
        )
        self.movie.genres.add(self.genre)
    
    def test_movie_creation(self):
        """Test movie is created correctly"""
        self.assertEqual(self.movie.title, "Test Movie")
        self.assertEqual(self.movie.tmdb_id, 12345)
        self.assertIn(self.genre, self.movie.genres.all())
    
    def test_movie_str_method(self):
        """Test movie string representation"""
        self.assertEqual(str(self.movie), "Test Movie (2024)")
    
    def test_average_rating(self):
        """Test average rating calculation"""
        # Create reviews
        user1 = User.objects.create_user(username='user1')
        user2 = User.objects.create_user(username='user2')
        
        Review.objects.create(movie=self.movie, user=user1, rating=4)
        Review.objects.create(movie=self.movie, user=user2, rating=5)
        
        self.assertEqual(self.movie.average_rating, 4.5)
```

### Testing API Endpoints

```python
# reviews/tests.py
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from movies.models import Movie
from reviews.models import Review

User = get_user_model()

class ReviewAPITests(APITestCase):
    """Test Review API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        # Create user and authenticate
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create movie
        self.movie = Movie.objects.create(
            title="Test Movie",
            release_date="2024-01-01"
        )
        
        self.list_url = '/api/reviews/'
        self.detail_url = lambda pk: f'/api/reviews/{pk}/'
    
    def test_create_review(self):
        """Test creating a review"""
        data = {
            'movie': self.movie.id,
            'rating': 5,
            'comment': 'Great movie!'
        }
        
        response = self.client.post(self.list_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)
        self.assertEqual(Review.objects.first().rating, 5)
    
    def test_update_own_review(self):
        """Test user can update their own review"""
        review = Review.objects.create(
            movie=self.movie,
            user=self.user,
            rating=3,
            comment='Okay movie'
        )
        
        data = {
            'rating': 4,
            'comment': 'Actually pretty good'
        }
        
        response = self.client.patch(self.detail_url(review.id), data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        review.refresh_from_db()
        self.assertEqual(review.rating, 4)
    
    def test_cannot_update_others_review(self):
        """Test user cannot update another user's review"""
        other_user = User.objects.create_user(username='other')
        review = Review.objects.create(
            movie=self.movie,
            user=other_user,
            rating=3
        )
        
        data = {'rating': 5}
        response = self.client.patch(self.detail_url(review.id), data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
```

### Testing with Fixtures

```python
# Using pytest fixtures
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture
def user(db):
    """Create a test user"""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )

@pytest.fixture
def authenticated_client(user):
    """Create authenticated API client"""
    from rest_framework.test import APIClient
    client = APIClient()
    client.force_authenticate(user=user)
    return client

@pytest.mark.django_db
def test_user_profile(authenticated_client, user):
    """Test user can access their profile"""
    response = authenticated_client.get('/api/accounts/profile/')
    assert response.status_code == 200
    assert response.data['username'] == user.username
```

---

## 📊 Test Coverage

### Generate Coverage Report

```bash
# HTML report (recommended)
pytest --cov=. --cov-report=html

# Open report
start htmlcov/index.html  # Windows
open htmlcov/index.html   # Mac
xdg-open htmlcov/index.html  # Linux

# Terminal report
pytest --cov=. --cov-report=term

# XML report (for CI/CD)
pytest --cov=. --cov-report=xml

# Missing lines report
pytest --cov=. --cov-report=term-missing
```

### Coverage Goals

```python
# pytest.ini or setup.cfg
[tool:pytest]
addopts = 
    --cov=.
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=80
```

### Coverage Best Practices

✅ **Aim for 80%+ coverage** overall  
✅ **100% coverage** for critical paths (auth, payments)  
✅ **Focus on business logic**, not just line coverage  
✅ **Test edge cases** and error conditions  
❌ Don't skip tests to inflate coverage  

---

## 🎲 Test Data

### Using Factories (Optional)

```python
# Install factory-boy
pip install factory-boy

# factories.py
import factory
from movies.models import Movie, Genre

class GenreFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Genre
    
    name = factory.Sequence(lambda n: f"Genre {n}")

class MovieFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Movie
    
    title = factory.Sequence(lambda n: f"Movie {n}")
    description = factory.Faker('paragraph')
    release_date = factory.Faker('date')
    tmdb_id = factory.Sequence(lambda n: n)
    
    @factory.post_generation
    def genres(self, create, extracted, **kwargs):
        if not create:
            return
        if extracted:
            for genre in extracted:
                self.genres.add(genre)

# Usage in tests
def test_with_factory():
    genre = GenreFactory()
    movie = MovieFactory(genres=[genre])
    assert movie.genres.count() == 1
```

### Fixtures (JSON/YAML)

```python
# Load from fixture file
from django.core.management import call_command

def setUp(self):
    call_command('loaddata', 'test_data.json')
```

---

## 🎯 Testing Patterns

### Test Unauthenticated vs Authenticated

```python
class AuthenticationRequiredTests(APITestCase):
    def test_unauthenticated_cannot_create_review(self):
        """Test unauthenticated user cannot create review"""
        response = self.client.post('/api/reviews/', {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_authenticated_can_create_review(self):
        """Test authenticated user can create review"""
        user = User.objects.create_user(username='test', password='test')
        self.client.force_authenticate(user=user)
        
        data = {'movie': 1, 'rating': 5, 'comment': 'Great!'}
        response = self.client.post('/api/reviews/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
```

### Test Permissions

```python
def test_user_can_edit_own_review(self):
    """Test user can edit their own review"""
    # ... authenticated as owner
    response = self.client.patch(url, data)
    self.assertEqual(response.status_code, status.HTTP_200_OK)

def test_user_cannot_edit_others_review(self):
    """Test user cannot edit another user's review"""
    # ... authenticated as different user
    response = self.client.patch(url, data)
    self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

def test_admin_can_edit_any_review(self):
    """Test admin can edit any review"""
    # ... authenticated as admin
    response = self.client.patch(url, data)
    self.assertEqual(response.status_code, status.HTTP_200_OK)
```

### Test Validation

```python
def test_rating_must_be_between_1_and_5(self):
    """Test rating validation"""
    invalid_data = [
        {'rating': 0},  # Too low
        {'rating': 6},  # Too high
        {'rating': -1}, # Negative
    ]
    
    for data in invalid_data:
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('rating', response.data)
```

### Test Database Queries (Performance)

```python
from django.test import TestCase
from django.test.utils import override_settings

class QueryOptimizationTests(TestCase):
    def test_movie_list_query_count(self):
        """Test movie list endpoint uses optimal queries"""
        # Create test data
        for i in range(10):
            MovieFactory()
        
        with self.assertNumQueries(2):  # 1 for movies, 1 for genres
            response = self.client.get('/api/movies/')
            self.assertEqual(len(response.data['results']), 10)
```

---

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements/development.txt
      
      - name: Run tests
        run: |
          pytest --cov=. --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
        with:
          file: ./coverage.xml
```

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/sh
echo "Running tests before commit..."
pytest
if [ $? -ne 0 ]; then
    echo "Tests failed. Commit aborted."
    exit 1
fi
```

---

## 🐛 Troubleshooting

### Common Issues

#### Tests Failing in CI but Pass Locally

```bash
# Ensure same Python version
python --version

# Ensure same dependencies
pip freeze > requirements-local.txt
# Compare with requirements.txt

# Check for hardcoded paths or URLs
grep -r "localhost" tests/
grep -r "C:/" tests/
```

#### Database Errors

```python
# Use in-memory SQLite for faster tests
# settings.py
if 'test' in sys.argv:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
```

#### Slow Tests

```bash
# Identify slow tests
pytest --durations=10

# Run in parallel
pytest -n auto

# Use --reuse-db to keep test database
pytest --reuse-db
```

#### Import Errors

```bash
# Ensure PYTHONPATH is set
export PYTHONPATH="${PYTHONPATH}:/path/to/project"

# Or add conftest.py at project root
# conftest.py
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
```

---

## 📚 Best Practices

### DO ✅

- **Test behavior, not implementation**
- **Use descriptive test names**
- **Keep tests independent** (no shared state)
- **Test edge cases and errors**
- **Mock external services** (TMDB API, etc.)
- **Use fixtures for common setup**
- **Aim for fast tests** (<1s each)
- **Run tests before committing**

### DON'T ❌

- Don't test Django/DRF internals
- Don't make tests depend on each other
- Don't use production data in tests
- Don't skip flaky tests (fix them!)
- Don't test too many things in one test
- Don't forget to test error cases
- Don't commit failing tests

---

## 📈 Test Metrics

### Current Status

```bash
# Run to get current stats
pytest --collect-only

# Example output:
# collected 47 items
# 
# accounts/tests.py: 12 tests
# movies/tests.py: 15 tests
# reviews/tests.py: 14 tests
# common/tests.py: 6 tests
```

### Coverage Report

```
Name                           Stmts   Miss  Cover
--------------------------------------------------
accounts/models.py                45      2    96%
accounts/serializers.py           38      1    97%
accounts/views.py                 52      5    90%
movies/models.py                  67      3    96%
movies/views.py                   89      8    91%
reviews/models.py                 34      1    97%
reviews/views.py                  76      7    91%
--------------------------------------------------
TOTAL                            401     27    93%
```

---

## 🎓 Learning Resources

### Documentation
- [pytest Documentation](https://docs.pytest.org/)
- [Django Testing](https://docs.djangoproject.com/en/5.0/topics/testing/)
- [DRF Testing](https://www.django-rest-framework.org/api-guide/testing/)

### Tools
- **pytest** - Test framework
- **pytest-django** - Django integration
- **pytest-cov** - Coverage plugin
- **factory-boy** - Test data factories
- **faker** - Fake data generation
- **mock** - Mocking library

---

## ✅ Quick Checklist

Before committing code:
- [ ] All tests pass locally
- [ ] New features have tests
- [ ] Coverage is maintained/improved
- [ ] No skipped tests
- [ ] Tests run in reasonable time
- [ ] No hardcoded values in tests
- [ ] Tests are documented

---

**Happy Testing! 🧪**
