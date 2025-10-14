# 💻 Development Guide

Complete workflow and best practices for FlixReview API development.

---

## Daily Workflow

### Morning Setup
```bash
# 1. Activate environment
.\venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate    # Linux/Mac

# 2. Pull latest changes
git pull origin main

# 3. Install new dependencies (if any)
pip install -r requirements/development.txt

# 4. Run migrations
python manage.py migrate

# 5. Start development server
python manage.py runserver
```

### Before Committing
```bash
# 1. Run tests
pytest

# 2. Format code
black .

# 3. Check linting
flake8 .

# 4. Check for errors
python manage.py check

# 5. Verify no secrets
git status  # Ensure venv/, .secrets/ not included

# 6. Commit
git add .
git commit -m "feat: descriptive message"
git push
```

---

## Project Structure

```
flix-review-api/
├── accounts/           # User authentication app
│   ├── models.py      # Custom User model
│   ├── views.py       # Auth endpoints
│   ├── serializers.py # User serialization
│   └── tests/         # Auth tests
├── movies/            # Movies app + TMDB
│   ├── models.py      # Movie, Genre models
│   ├── views.py       # Movie endpoints
│   ├── serializers.py # Movie serialization
│   ├── services/      # TMDB integration
│   └── tests/         # Movie tests
├── reviews/           # Reviews app
│   ├── models.py      # Review model
│   ├── views.py       # Review endpoints
│   ├── signals.py     # Rating calculation
│   └── tests/         # Review tests
├── recommendations/   # ML recommendations
│   ├── ml_engine.py   # ML algorithms
│   ├── views.py       # Recommendation endpoints
│   └── tests/         # ML tests
├── common/            # Shared utilities
│   ├── models.py      # Base models
│   ├── permissions.py # Custom permissions
│   ├── pagination.py  # Custom pagination
│   └── middleware.py  # Rate limiting, logging
└── movie_review_api/  # Project settings
    ├── settings.py    # Django settings
    ├── urls.py        # URL routing
    └── wsgi.py        # WSGI application
```

---

## Code Style Guide

### Python Style (PEP 8)

**Use Black formatter**:
```bash
black .
```

**Maximum line length**: 88 characters (Black default)

**Imports**:
```python
# Standard library
import os
from datetime import datetime

# Third-party
from django.db import models
from rest_framework import serializers

# Local
from common.models import TimestampedModel
from accounts.models import User
```

**Docstrings**:
```python
def calculate_similarity(movie1, movie2):
    """
    Calculate similarity score between two movies.
    
    Args:
        movie1 (Movie): First movie instance
        movie2 (Movie): Second movie instance
    
    Returns:
        float: Similarity score between 0 and 1
    """
    # Implementation
    pass
```

### Django Best Practices

**Models**:
```python
class Movie(TimestampedModel):
    """Movie model with TMDB integration."""
    
    title = models.CharField(max_length=200)
    tmdb_id = models.IntegerField(unique=True, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tmdb_id']),
        ]
    
    def __str__(self):
        return self.title
```

**Views**:
```python
from rest_framework import generics, permissions

class MovieListView(generics.ListAPIView):
    """List all movies with filtering and pagination."""
    
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['genre']
    search_fields = ['title', 'description']
```

**Serializers**:
```python
class MovieSerializer(serializers.ModelSerializer):
    """Serializer for Movie model."""
    
    genres = GenreSerializer(many=True, read_only=True)
    total_reviews = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Movie
        fields = '__all__'
```

---

## Testing

### Write Tests

**Model Tests**:
```python
from django.test import TestCase
from movies.models import Movie

class MovieModelTest(TestCase):
    def setUp(self):
        self.movie = Movie.objects.create(
            title="Test Movie",
            genre="Action"
        )
    
    def test_movie_creation(self):
        self.assertEqual(self.movie.title, "Test Movie")
```

**API Tests**:
```python
from rest_framework.test import APITestCase

class MovieAPITest(APITestCase):
    def test_list_movies(self):
        response = self.client.get('/api/movies/')
        self.assertEqual(response.status_code, 200)
```

### Run Tests

```bash
# All tests
pytest

# Specific app
pytest movies/tests/

# With coverage
pytest --cov

# Verbose
pytest -v
```

See [TESTING.md](TESTING.md) for complete guide.

---

## Database Management

### Migrations

**Create migration**:
```bash
python manage.py makemigrations
```

**Apply migrations**:
```bash
python manage.py migrate
```

**View migrations**:
```bash
python manage.py showmigrations
```

**Rollback migration**:
```bash
python manage.py migrate app_name migration_name
```

### Database Shell

```bash
# Django shell
python manage.py shell

# Database shell
python manage.py dbshell
```

**Common queries**:
```python
from movies.models import Movie
from reviews.models import Review

# Get all movies
Movie.objects.all()

# Filter movies
Movie.objects.filter(genre__icontains='Sci-Fi')

# Aggregate
from django.db.models import Avg
Movie.objects.aggregate(Avg('avg_rating'))

# Complex queries
Movie.objects.prefetch_related('reviews').filter(
    avg_rating__gte=4.0
).order_by('-release_date')
```

---

## API Development

### Creating New Endpoints

**1. Define Model** (`movies/models.py`):
```python
class Director(models.Model):
    name = models.CharField(max_length=100)
    bio = models.TextField()
```

**2. Create Serializer** (`movies/serializers.py`):
```python
class DirectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Director
        fields = '__all__'
```

**3. Create View** (`movies/views.py`):
```python
class DirectorViewSet(viewsets.ModelViewSet):
    queryset = Director.objects.all()
    serializer_class = DirectorSerializer
```

**4. Register URL** (`movies/urls.py`):
```python
router.register('directors', DirectorViewSet)
```

**5. Add Tests** (`movies/tests/test_directors.py`):
```python
class DirectorAPITest(APITestCase):
    # Test cases
    pass
```

---

## Git Workflow

### Branch Strategy

```bash
# Main branches
main        # Production-ready code
develop     # Development branch

# Feature branches
feature/movie-rating
feature/user-profiles

# Bugfix branches
bugfix/review-validation
```

### Commit Messages

**Format**: `type: description`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Examples**:
```bash
feat: add TMDB movie import functionality
fix: resolve rating calculation bug
docs: update API documentation
test: add tests for review endpoints
```

### Pull Request Process

1. Create feature branch
2. Make changes
3. Run tests
4. Create PR
5. Code review
6. Merge to develop

---

## Debugging

### Django Debug Toolbar

**Install**:
```bash
pip install django-debug-toolbar
```

**Add to INSTALLED_APPS**:
```python
INSTALLED_APPS = [
    # ...
    'debug_toolbar',
]

MIDDLEWARE = [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    # ...
]
```

### Logging

**Configure** (`settings.py`):
```python
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'movies': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

**Use in code**:
```python
import logging

logger = logging.getLogger(__name__)

def my_view(request):
    logger.debug('Processing request')
    logger.info('User logged in')
    logger.error('Error occurred')
```

### Django Shell

```bash
python manage.py shell
```

```python
# Debug queries
from django.db import connection
print(connection.queries)

# Test imports
from movies.services.tmdb_service import TMDbService
service = TMDbService()
service.search_movies('matrix')
```

---

## Performance Optimization

### Database Queries

**Use select_related for ForeignKey**:
```python
# Bad
movies = Movie.objects.all()
for movie in movies:
    print(movie.user.username)  # N+1 queries

# Good
movies = Movie.objects.select_related('user')
```

**Use prefetch_related for ManyToMany**:
```python
# Bad
movies = Movie.objects.all()
for movie in movies:
    print(movie.genres.all())  # N+1 queries

# Good
movies = Movie.objects.prefetch_related('genres')
```

### Caching

**Use Redis** (configured):
```python
from django.core.cache import cache

# Set cache
cache.set('movie_list', movies, 3600)  # 1 hour

# Get cache
movies = cache.get('movie_list')
if not movies:
    movies = Movie.objects.all()
    cache.set('movie_list', movies, 3600)
```

---

## Environment Management

### Development vs Production

**Development** (`.env`):
```bash
DEBUG=True
DB_ENGINE=django.db.backends.sqlite3
```

**Production** (`.env.production`):
```bash
DEBUG=False
DB_ENGINE=django.db.backends.postgresql
SECURE_SSL_REDIRECT=True
```

### Environment Variables

**Load in `settings.py`**:
```python
import environ

env = environ.Env()
environ.Env.read_env()

DEBUG = env.bool('DEBUG', default=False)
SECRET_KEY = env('SECRET_KEY')
```

---

## Common Tasks

### Add New Dependency

```bash
# Install package
pip install package-name

# Update requirements
pip freeze > requirements/base.txt

# Or add manually to requirements/base.txt
```

### Create Management Command

**Create** `movies/management/commands/import_movies.py`:
```python
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Import movies from TMDB'
    
    def add_arguments(self, parser):
        parser.add_argument('--pages', type=int, default=1)
    
    def handle(self, *args, **options):
        pages = options['pages']
        # Implementation
        self.stdout.write(self.style.SUCCESS('Import complete'))
```

**Run**:
```bash
python manage.py import_movies --pages 5
```

---

## Resources

- **Django Docs**: https://docs.djangoproject.com/
- **DRF Docs**: https://www.django-rest-framework.org/
- **pytest-django**: https://pytest-django.readthedocs.io/
- **Black**: https://black.readthedocs.io/

---

## Support

- **Setup Guide**: [SETUP.md](SETUP.md)
- **API Docs**: [API.md](API.md)
- **Testing Guide**: [TESTING.md](TESTING.md)
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)
