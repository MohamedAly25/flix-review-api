# 🚀 FlixReview Stretch Goals - Implementation Plan

**Status**: 📋 Planning Phase  
**Current MVP**: ✅ 100% Complete (94% coverage, 24 tests)  
**Date**: October 14, 2025

---

## 📊 Overview

Now that the MVP is complete and production-ready, we can implement advanced features that will take FlixReview to the next level. These are **optional enhancements** beyond the core requirements.

---

## 🎯 Stretch Goals Roadmap

### Phase 4: Genre Normalization & Data Quality
**Status**: 🔜 Ready to Start  
**Estimated Time**: 2-3 hours  
**Priority**: HIGH (Foundation for other features)

#### Objectives:
- Create separate `Genre` model
- Migrate existing genre data from CharField
- Implement ManyToMany relationship with Movie
- Add genre management endpoints

#### Implementation Tasks:

1. **Create Genre Model** (30 min)
   ```python
   # movies/models.py
   class Genre(models.Model):
       name = models.CharField(max_length=50, unique=True)
       slug = models.SlugField(unique=True)
       description = models.TextField(blank=True)
       created_at = models.DateTimeField(auto_now_add=True)
       
       class Meta:
           ordering = ['name']
           indexes = [models.Index(fields=['slug'])]
   ```

2. **Update Movie Model** (20 min)
   ```python
   class Movie(models.Model):
       # ... existing fields ...
       genres = models.ManyToManyField(Genre, related_name='movies')
       # Remove: genre = models.CharField(max_length=100)
   ```

3. **Create Data Migration** (45 min)
   - Parse existing `genre` CharField (e.g., "Action, Sci-Fi")
   - Create Genre objects
   - Link movies to genres via ManyToMany
   - Preserve all existing data

4. **Add Genre API Endpoints** (30 min)
   - `GET /api/genres/` - List all genres
   - `POST /api/genres/` - Create genre (Admin)
   - `GET /api/genres/{slug}/` - Genre detail with movies
   - `PUT/PATCH /api/genres/{slug}/` - Update (Admin)
   - `DELETE /api/genres/{slug}/` - Delete (Admin)

5. **Update Movie Serializer** (15 min)
   ```python
   class MovieSerializer(serializers.ModelSerializer):
       genres = GenreSerializer(many=True, read_only=True)
       genre_ids = serializers.PrimaryKeyRelatedField(
           queryset=Genre.objects.all(),
           many=True,
           write_only=True,
           source='genres'
       )
   ```

6. **Update Tests** (30 min)
   - Test genre CRUD operations
   - Test movie-genre relationships
   - Test migration data integrity
   - Update existing movie tests

**Deliverables**:
- ✅ Genre model with proper relationships
- ✅ Data migration script
- ✅ 5 new API endpoints
- ✅ 8+ new tests
- ✅ Updated documentation

**Benefits**:
- Better data normalization
- Advanced filtering by multiple genres
- Genre popularity analytics
- Foundation for recommendation improvements

---

### Phase 5: Docker & CI/CD Pipeline
**Status**: 🔜 Ready to Start  
**Estimated Time**: 3-4 hours  
**Priority**: HIGH (Deployment efficiency)

#### Objectives:
- Dockerize the application
- Set up Docker Compose for local development
- Create GitHub Actions CI/CD pipeline
- Automated testing and deployment

#### Implementation Tasks:

1. **Create Dockerfile** (30 min)
   ```dockerfile
   FROM python:3.11-slim
   
   ENV PYTHONUNBUFFERED=1
   ENV PYTHONDONTWRITEBYTECODE=1
   
   WORKDIR /app
   
   # Install dependencies
   COPY requirements/ requirements/
   RUN pip install --no-cache-dir -r requirements/production.txt
   
   # Copy project
   COPY . .
   
   # Collect static files
   RUN python manage.py collectstatic --noinput
   
   # Run migrations and start server
   CMD ["gunicorn", "movie_review_api.wsgi:application", "--bind", "0.0.0.0:8000"]
   ```

2. **Create docker-compose.yml** (45 min)
   ```yaml
   version: '3.8'
   
   services:
     db:
       image: postgres:15
       volumes:
         - postgres_data:/var/lib/postgresql/data
       environment:
         POSTGRES_DB: flixreview
         POSTGRES_USER: flixuser
         POSTGRES_PASSWORD: ${DB_PASSWORD}
     
     redis:
       image: redis:7-alpine
       
     web:
       build: .
       command: gunicorn movie_review_api.wsgi:application --bind 0.0.0.0:8000
       volumes:
         - .:/app
       ports:
         - "8000:8000"
       depends_on:
         - db
         - redis
       environment:
         - DATABASE_URL=postgresql://flixuser:${DB_PASSWORD}@db:5432/flixreview
         - REDIS_URL=redis://redis:6379/0
   ```

3. **GitHub Actions Workflow** (60 min)
   ```yaml
   # .github/workflows/ci.yml
   name: CI/CD Pipeline
   
   on:
     push:
       branches: [main, develop]
     pull_request:
       branches: [main]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       
       services:
         postgres:
           image: postgres:15
           env:
             POSTGRES_PASSWORD: postgres
           options: >-
             --health-cmd pg_isready
             --health-interval 10s
             --health-timeout 5s
             --health-retries 5
       
       steps:
         - uses: actions/checkout@v3
         
         - name: Set up Python
           uses: actions/setup-python@v4
           with:
             python-version: '3.11'
         
         - name: Install dependencies
           run: |
             pip install -r requirements/development.txt
         
         - name: Run tests
           run: |
             python manage.py test --no-input
             coverage run --source='.' manage.py test
             coverage report --fail-under=90
         
         - name: Upload coverage
           uses: codecov/codecov-action@v3
   ```

4. **Add Production Dependencies** (20 min)
   ```txt
   # requirements/production.txt
   -r base.txt
   gunicorn==21.2.0
   redis==5.0.1
   sentry-sdk==1.40.0
   ```

5. **Environment Configuration** (30 min)
   - Create `.env.example`
   - Update settings for Docker
   - Add health check endpoint
   - Configure logging for production

6. **Documentation** (30 min)
   - Docker setup guide
   - Local development with Docker Compose
   - CI/CD pipeline explanation
   - Deployment instructions

**Deliverables**:
- ✅ Dockerfile (multi-stage build)
- ✅ docker-compose.yml
- ✅ GitHub Actions workflow
- ✅ Production-ready configuration
- ✅ Deployment documentation

**Benefits**:
- Consistent development environment
- Automated testing on every commit
- Easy deployment to any cloud provider
- Scalable infrastructure

---

### Phase 6: TMDB API Integration
**Status**: 🔜 Ready to Start  
**Estimated Time**: 4-5 hours  
**Priority**: MEDIUM (Content enrichment)

#### Objectives:
- Integrate with The Movie Database (TMDB) API
- Import movies with metadata and posters
- Sync movie information automatically
- Add management commands for bulk import

#### Implementation Tasks:

1. **Install TMDB Library** (10 min)
   ```bash
   pip install tmdbv3api==1.9.0
   ```

2. **Create TMDB Service** (60 min)
   ```python
   # movies/services/tmdb_service.py
   from tmdbv3api import TMDb, Movie as TMDbMovie
   
   class TMDBService:
       def __init__(self):
           self.tmdb = TMDb()
           self.tmdb.api_key = settings.TMDB_API_KEY
           self.movie_api = TMDbMovie()
       
       def search_movies(self, query):
           """Search for movies on TMDB"""
           return self.movie_api.search(query)
       
       def get_movie_details(self, tmdb_id):
           """Get detailed movie information"""
           return self.movie_api.details(tmdb_id)
       
       def import_movie(self, tmdb_id):
           """Import a movie from TMDB to our database"""
           details = self.get_movie_details(tmdb_id)
           
           # Create or update movie
           movie, created = Movie.objects.update_or_create(
               tmdb_id=tmdb_id,
               defaults={
                   'title': details.title,
                   'description': details.overview,
                   'release_date': details.release_date,
                   'poster_url': f"https://image.tmdb.org/t/p/w500{details.poster_path}",
                   'runtime': details.runtime,
                   'imdb_id': details.imdb_id,
               }
           )
           
           # Add genres
           for genre in details.genres:
               genre_obj, _ = Genre.objects.get_or_create(
                   name=genre['name'],
                   defaults={'slug': slugify(genre['name'])}
               )
               movie.genres.add(genre_obj)
           
           return movie
   ```

3. **Update Movie Model** (20 min)
   ```python
   class Movie(models.Model):
       # ... existing fields ...
       tmdb_id = models.IntegerField(unique=True, null=True, blank=True)
       imdb_id = models.CharField(max_length=20, blank=True)
       runtime = models.IntegerField(null=True, blank=True)  # minutes
       budget = models.BigIntegerField(null=True, blank=True)
       revenue = models.BigIntegerField(null=True, blank=True)
       backdrop_url = models.URLField(max_length=500, blank=True)
   ```

4. **Create Management Commands** (90 min)
   ```python
   # movies/management/commands/import_tmdb_movie.py
   class Command(BaseCommand):
       help = 'Import a movie from TMDB by ID'
       
       def add_arguments(self, parser):
           parser.add_argument('tmdb_id', type=int)
       
       def handle(self, *args, **options):
           service = TMDBService()
           movie = service.import_movie(options['tmdb_id'])
           self.stdout.write(self.style.SUCCESS(f'Imported: {movie.title}'))
   
   # movies/management/commands/import_popular_movies.py
   class Command(BaseCommand):
       help = 'Import popular movies from TMDB'
       
       def add_arguments(self, parser):
           parser.add_argument('--pages', type=int, default=5)
       
       def handle(self, *args, **options):
           service = TMDBService()
           for page in range(1, options['pages'] + 1):
               popular = service.movie_api.popular(page=page)
               for movie_data in popular:
                   service.import_movie(movie_data.id)
                   self.stdout.write(f'Imported: {movie_data.title}')
   ```

5. **Add API Endpoints** (45 min)
   - `GET /api/movies/search-tmdb/?q=inception` - Search TMDB
   - `POST /api/movies/import-tmdb/` - Import from TMDB (Admin)
   - `POST /api/movies/{id}/sync-tmdb/` - Sync movie data (Admin)

6. **Add Celery for Async Tasks** (60 min)
   ```python
   # movies/tasks.py
   from celery import shared_task
   
   @shared_task
   def import_tmdb_movie_async(tmdb_id):
       service = TMDBService()
       return service.import_movie(tmdb_id)
   
   @shared_task
   def sync_all_movies_with_tmdb():
       movies = Movie.objects.exclude(tmdb_id__isnull=True)
       for movie in movies:
           import_tmdb_movie_async.delay(movie.tmdb_id)
   ```

7. **Tests** (45 min)
   - Mock TMDB API responses
   - Test movie import
   - Test data synchronization
   - Test management commands

**Deliverables**:
- ✅ TMDB integration service
- ✅ 2 management commands
- ✅ 3 new API endpoints
- ✅ Celery task queue setup
- ✅ 10+ new tests
- ✅ Updated documentation

**Benefits**:
- Rich movie metadata
- Professional movie posters
- Automated content import
- Always up-to-date information
- Easier content management

---

### Phase 7: Advanced ML-Based Recommendations
**Status**: 🔜 Ready to Start  
**Estimated Time**: 6-8 hours  
**Priority**: MEDIUM (User engagement)

#### Objectives:
- Implement collaborative filtering
- Content-based recommendations
- Personalized user recommendations
- Similar movies feature

#### Implementation Tasks:

1. **Install ML Libraries** (10 min)
   ```bash
   pip install scikit-learn==1.4.0
   pip install pandas==2.2.0
   pip install scipy==1.12.0
   ```

2. **Create Recommendation Engine** (120 min)
   ```python
   # recommendations/services/ml_engine.py
   from sklearn.feature_extraction.text import TfidfVectorizer
   from sklearn.metrics.pairwise import cosine_similarity
   import pandas as pd
   
   class RecommendationEngine:
       
       def content_based_recommendations(self, movie_id, limit=10):
           """Recommend similar movies based on content"""
           # Get all movies
           movies = Movie.objects.all().values(
               'id', 'title', 'description', 'genres__name'
           )
           df = pd.DataFrame(movies)
           
           # Create feature vectors from description + genres
           df['features'] = df['description'] + ' ' + df['genres__name']
           
           # Calculate TF-IDF
           tfidf = TfidfVectorizer(stop_words='english')
           tfidf_matrix = tfidf.fit_transform(df['features'])
           
           # Calculate cosine similarity
           similarity = cosine_similarity(tfidf_matrix)
           
           # Get similar movies
           idx = df[df['id'] == movie_id].index[0]
           similar_indices = similarity[idx].argsort()[-limit-1:-1][::-1]
           
           return df.iloc[similar_indices]['id'].tolist()
       
       def collaborative_filtering(self, user_id, limit=10):
           """Recommend based on user-user similarity"""
           # Get user-movie rating matrix
           reviews = Review.objects.all().values('user_id', 'movie_id', 'rating')
           df = pd.DataFrame(reviews)
           
           # Create user-item matrix
           user_movie_matrix = df.pivot_table(
               index='user_id',
               columns='movie_id',
               values='rating'
           ).fillna(0)
           
           # Calculate user similarity
           user_similarity = cosine_similarity(user_movie_matrix)
           user_similarity_df = pd.DataFrame(
               user_similarity,
               index=user_movie_matrix.index,
               columns=user_movie_matrix.index
           )
           
           # Find similar users
           similar_users = user_similarity_df[user_id].sort_values(ascending=False)[1:11]
           
           # Get movies rated by similar users
           similar_user_ids = similar_users.index
           recommended_movies = df[
               df['user_id'].isin(similar_user_ids) &
               ~df['movie_id'].isin(df[df['user_id'] == user_id]['movie_id'])
           ].groupby('movie_id')['rating'].mean().sort_values(ascending=False)
           
           return recommended_movies.head(limit).index.tolist()
       
       def hybrid_recommendations(self, user_id, limit=10):
           """Combine collaborative and content-based"""
           # Get 50% from each method
           collab = self.collaborative_filtering(user_id, limit // 2)
           
           # Get user's favorite genres
           user_genres = Review.objects.filter(
               user_id=user_id,
               rating__gte=4
           ).values_list('movie__genres__name', flat=True)
           
           # Content-based from favorite genres
           content = Movie.objects.filter(
               genres__name__in=user_genres
           ).exclude(
               id__in=collab
           ).order_by('-avg_rating')[:limit // 2]
           
           return list(collab) + [m.id for m in content]
   ```

3. **Add ML API Endpoints** (60 min)
   - `GET /api/recommendations/for-you/` - Personalized (auth)
   - `GET /api/movies/{id}/similar/` - Similar movies
   - `GET /api/recommendations/by-genre/{slug}/` - Genre-based
   - `GET /api/users/profile/taste-profile/` - User preferences

4. **Caching Layer** (45 min)
   ```python
   from django.core.cache import cache
   
   def get_cached_recommendations(user_id, method='hybrid'):
       cache_key = f'recommendations:{user_id}:{method}'
       cached = cache.get(cache_key)
       
       if cached is None:
           engine = RecommendationEngine()
           if method == 'hybrid':
               cached = engine.hybrid_recommendations(user_id)
           cache.set(cache_key, cached, 3600)  # 1 hour
       
       return cached
   ```

5. **Background Processing** (60 min)
   ```python
   # recommendations/tasks.py
   @shared_task
   def precompute_recommendations():
       """Precompute recommendations for active users"""
       active_users = User.objects.filter(
           reviews__created_at__gte=timezone.now() - timedelta(days=30)
       ).distinct()
       
       engine = RecommendationEngine()
       for user in active_users:
           recommendations = engine.hybrid_recommendations(user.id)
           cache.set(f'recommendations:{user.id}:hybrid', recommendations, 86400)
   
   # Schedule with Celery Beat
   from celery.schedules import crontab
   
   app.conf.beat_schedule = {
       'precompute-recommendations': {
           'task': 'recommendations.tasks.precompute_recommendations',
           'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
       },
   }
   ```

6. **User Taste Profile** (45 min)
   ```python
   class UserTasteProfile:
       def __init__(self, user_id):
           self.user = User.objects.get(id=user_id)
       
       def get_favorite_genres(self):
           return Review.objects.filter(
               user=self.user,
               rating__gte=4
           ).values('movie__genres__name').annotate(
               count=Count('id')
           ).order_by('-count')
       
       def get_average_rating_given(self):
           return Review.objects.filter(
               user=self.user
           ).aggregate(Avg('rating'))['rating__avg']
       
       def get_review_activity(self):
           return {
               'total_reviews': self.user.reviews.count(),
               'last_review': self.user.reviews.order_by('-created_at').first(),
               'reviews_this_month': self.user.reviews.filter(
                   created_at__gte=timezone.now() - timedelta(days=30)
               ).count()
           }
   ```

7. **Tests** (90 min)
   - Test content-based recommendations
   - Test collaborative filtering
   - Test hybrid algorithm
   - Test caching behavior
   - Test similar movies
   - Integration tests

**Deliverables**:
- ✅ ML recommendation engine
- ✅ 4 new API endpoints
- ✅ Caching layer
- ✅ Background task scheduling
- ✅ User taste profile
- ✅ 15+ new tests
- ✅ Performance benchmarks

**Benefits**:
- Personalized user experience
- Increased user engagement
- Better movie discovery
- Competitive feature set
- Data-driven recommendations

---

## 📋 Implementation Priority

### Recommended Order:
1. **Phase 4**: Genre Normalization (Foundation)
2. **Phase 5**: Docker & CI/CD (Infrastructure)
3. **Phase 6**: TMDB Integration (Content)
4. **Phase 7**: ML Recommendations (Engagement)

### Alternative Approach (Parallel):
- **Track A**: Phase 4 → Phase 6 (Data & Content)
- **Track B**: Phase 5 → Phase 7 (Infrastructure & ML)

---

## 📊 Estimated Total Timeline

| Phase | Time | Complexity | Priority |
|-------|------|------------|----------|
| Phase 4: Genre Normalization | 2-3 hours | MEDIUM | HIGH |
| Phase 5: Docker & CI/CD | 3-4 hours | MEDIUM | HIGH |
| Phase 6: TMDB Integration | 4-5 hours | HIGH | MEDIUM |
| Phase 7: ML Recommendations | 6-8 hours | HIGH | MEDIUM |
| **TOTAL** | **15-20 hours** | - | - |

---

## 🎯 Success Metrics

### Phase 4 Completion:
- ✅ Genre model with data migration
- ✅ 5 genre endpoints working
- ✅ All existing tests still passing
- ✅ 95%+ code coverage maintained

### Phase 5 Completion:
- ✅ Docker image builds successfully
- ✅ Docker Compose runs locally
- ✅ CI pipeline passes on every commit
- ✅ Automated deployment working

### Phase 6 Completion:
- ✅ Can import movies from TMDB
- ✅ Automatic poster download
- ✅ Management commands working
- ✅ 500+ movies in database

### Phase 7 Completion:
- ✅ Personalized recommendations working
- ✅ Similar movies feature
- ✅ <500ms response time (cached)
- ✅ Recommendations update daily

---

## 🚀 Getting Started

### To Begin Phase 4:
```bash
# Create feature branch
git checkout -b feature/genre-normalization

# Start with the model
# Edit movies/models.py
```

### To Begin Phase 5:
```bash
# Create Dockerfile
touch Dockerfile docker-compose.yml

# Create CI workflow
mkdir -p .github/workflows
touch .github/workflows/ci.yml
```

### To Begin Phase 6:
```bash
# Install TMDB library
pip install tmdbv3api==1.9.0

# Get API key from https://www.themoviedb.org/settings/api
# Add to .env: TMDB_API_KEY=your_key_here
```

### To Begin Phase 7:
```bash
# Install ML libraries
pip install scikit-learn pandas scipy

# Create ML service
mkdir -p recommendations/services
touch recommendations/services/ml_engine.py
```

---

## 💡 Notes

- All phases are **optional** - MVP is already complete
- Each phase is **independent** (except Phase 7 benefits from Phase 4)
- Can be implemented in **any order**
- Each phase includes **full testing**
- Documentation updated with each phase
- Code coverage target: **>90%** for all new code

---

## 🎓 Learning Opportunities

### Phase 4: Data Modeling
- Advanced Django ORM
- Data migrations
- ManyToMany relationships

### Phase 5: DevOps
- Docker containerization
- CI/CD pipelines
- Infrastructure as Code

### Phase 6: API Integration
- Third-party API integration
- Async task processing
- Data synchronization

### Phase 7: Machine Learning
- Recommendation algorithms
- scikit-learn
- Performance optimization

---

**Ready to start?** Let me know which phase you'd like to begin with! 🚀
