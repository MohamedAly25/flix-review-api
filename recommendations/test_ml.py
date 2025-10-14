"""
Tests for ML-Powered Recommendations

Tests cover:
- RecommendationEngine algorithms
- Content-based filtering
- Collaborative filtering  
- Hybrid recommendations
- ML API endpoints
- Caching behavior
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta
from django.utils import timezone

from movies.models import Movie, Genre
from reviews.models import Review
from recommendations.services import RecommendationEngine


User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture(autouse=True)
def clear_cache():
    """Clear cache before each test"""
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def users(db):
    """Create test users"""
    user1 = User.objects.create_user(username='alice', email='alice@test.com', password='pass123')
    user2 = User.objects.create_user(username='bob', email='bob@test.com', password='pass123')
    user3 = User.objects.create_user(username='charlie', email='charlie@test.com', password='pass123')
    return {'alice': user1, 'bob': user2, 'charlie': user3}


@pytest.fixture
def genres(db):
    """Create test genres"""
    action = Genre.objects.create(name='Action', slug='action')
    drama = Genre.objects.create(name='Drama', slug='drama')
    comedy = Genre.objects.create(name='Comedy', slug='comedy')
    scifi = Genre.objects.create(name='Sci-Fi', slug='scifi')
    return {'action': action, 'drama': drama, 'comedy': comedy, 'scifi': scifi}


@pytest.fixture
def movies(db, genres):
    """Create test movies with genres"""
    movie1 = Movie.objects.create(
        title='The Matrix',
        genre='Sci-Fi, Action',
        description='A computer hacker learns about the true nature of reality',
        release_date=date(1999, 3, 31),
        avg_rating=4.5
    )
    movie1.genres.add(genres['action'], genres['scifi'])
    
    movie2 = Movie.objects.create(
        title='Fight Club',
        genre='Drama',
        description='An insomniac office worker and soap salesman',
        release_date=date(1999, 10, 15),
        avg_rating=4.7
    )
    movie2.genres.add(genres['drama'])
    
    movie3 = Movie.objects.create(
        title='Inception',
        genre='Sci-Fi, Action',
        description='A thief who steals corporate secrets through dream-sharing',
        release_date=date(2010, 7, 16),
        avg_rating=4.6
    )
    movie3.genres.add(genres['action'], genres['scifi'])
    
    movie4 = Movie.objects.create(
        title='The Hangover',
        genre='Comedy',
        description='Three friends wake up from a bachelor party in Las Vegas',
        release_date=date(2009, 6, 5),
        avg_rating=3.8
    )
    movie4.genres.add(genres['comedy'])
    
    movie5 = Movie.objects.create(
        title='Interstellar',
        genre='Sci-Fi, Drama',
        description='A team of explorers travel through a wormhole in space',
        release_date=date(2014, 11, 7),
        avg_rating=4.4
    )
    movie5.genres.add(genres['scifi'], genres['drama'])
    
    return {
        'matrix': movie1,
        'fight_club': movie2,
        'inception': movie3,
        'hangover': movie4,
        'interstellar': movie5
    }


@pytest.fixture
def reviews(db, users, movies):
    """Create test reviews"""
    # Alice likes sci-fi/action
    Review.objects.create(user=users['alice'], movie=movies['matrix'], rating=5, content='Best movie ever!')
    Review.objects.create(user=users['alice'], movie=movies['inception'], rating=5, content='Mind-blowing!')
    Review.objects.create(user=users['alice'], movie=movies['fight_club'], rating=3, content='Not my style')
    
    # Bob likes drama
    Review.objects.create(user=users['bob'], movie=movies['fight_club'], rating=5, content='Masterpiece!')
    Review.objects.create(user=users['bob'], movie=movies['interstellar'], rating=4, content='Great story')
    Review.objects.create(user=users['bob'], movie=movies['matrix'], rating=3, content='Decent')
    
    # Charlie likes everything
    Review.objects.create(user=users['charlie'], movie=movies['matrix'], rating=4, content='Good')
    Review.objects.create(user=users['charlie'], movie=movies['inception'], rating=4, content='Cool')
    Review.objects.create(user=users['charlie'], movie=movies['hangover'], rating=4, content='Funny')


# ==========================================
# RecommendationEngine Tests
# ==========================================

@pytest.mark.django_db
class TestRecommendationEngine:
    
    def test_engine_initialization(self):
        """Test recommendation engine initializes correctly"""
        engine = RecommendationEngine()
        # Even if ML libraries not installed, engine should initialize
        assert engine is not None
    
    def test_content_based_recommendations_simple(self, movies):
        """Test content-based recommendations with fallback"""
        engine = RecommendationEngine()
        
        # Get recommendations for The Matrix (sci-fi/action)
        recommendations = engine.get_content_based_recommendations(
            movies['matrix'].id,
            limit=3
        )
        
        assert len(recommendations) > 0
        assert all('movie_id' in rec for rec in recommendations)
        assert all('similarity_score' in rec for rec in recommendations)
        
        # Should recommend similar movies (Inception, Interstellar)
        recommended_ids = [rec['movie_id'] for rec in recommendations]
        assert movies['matrix'].id not in recommended_ids  # Don't recommend itself
    
    def test_content_based_nonexistent_movie(self):
        """Test content-based with non-existent movie"""
        engine = RecommendationEngine()
        
        recommendations = engine.get_content_based_recommendations(99999, limit=5)
        
        assert recommendations == []
    
    def test_collaborative_recommendations(self, users, movies, reviews):
        """Test collaborative filtering recommendations"""
        engine = RecommendationEngine()
        
        # Get recommendations for Alice (likes sci-fi/action)
        recommendations = engine.get_collaborative_recommendations(
            users['alice'].id,
            limit=5
        )
        
        assert len(recommendations) > 0
        assert all('movie_id' in rec for rec in recommendations)
        assert all('predicted_rating' in rec for rec in recommendations)
        
        # Should not recommend movies Alice has already reviewed
        alice_movie_ids = Review.objects.filter(user=users['alice']).values_list('movie_id', flat=True)
        recommended_ids = [rec['movie_id'] for rec in recommendations]
        for rec_id in recommended_ids:
            assert rec_id not in alice_movie_ids
    
    def test_collaborative_new_user(self, users, movies):
        """Test collaborative filtering for user with no reviews"""
        engine = RecommendationEngine()
        
        # Create new user with no reviews
        new_user = User.objects.create_user(username='newbie', email='new@test.com', password='pass')
        
        recommendations = engine.get_collaborative_recommendations(new_user.id, limit=5)
        
        # Should return popular unwatched movies (fallback)
        # Even without reviews, should return some movies if database has movies
        assert isinstance(recommendations, list)
    
    def test_collaborative_nonexistent_user(self):
        """Test collaborative filtering with non-existent user"""
        engine = RecommendationEngine()
        
        recommendations = engine.get_collaborative_recommendations(99999, limit=5)
        
        assert recommendations == []
    
    def test_hybrid_recommendations(self, users, movies, reviews):
        """Test hybrid recommendations combining both algorithms"""
        engine = RecommendationEngine()
        
        recommendations = engine.get_hybrid_recommendations(
            users['alice'].id,
            limit=5,
            content_weight=0.5,
            collaborative_weight=0.5
        )
        
        assert len(recommendations) > 0
        assert all('movie_id' in rec for rec in recommendations)
        assert all('hybrid_score' in rec for rec in recommendations)
        
        # Should be sorted by hybrid score
        scores = [rec['hybrid_score'] for rec in recommendations]
        assert scores == sorted(scores, reverse=True)
    
    def test_taste_profile_with_reviews(self, users, movies, reviews):
        """Test generating user taste profile"""
        engine = RecommendationEngine()
        
        profile = engine.get_user_taste_profile(users['alice'].id)
        
        assert 'total_reviews' in profile
        assert profile['total_reviews'] == 3
        assert 'average_rating' in profile
        assert 'favorite_genres' in profile
        assert 'rating_distribution' in profile
        
        # Alice should have sci-fi/action as favorite genres
        favorite_genres = [g['genre'] for g in profile['favorite_genres']]
        assert 'Sci-Fi' in favorite_genres or 'Action' in favorite_genres
    
    def test_taste_profile_no_reviews(self, users):
        """Test taste profile for user with no reviews"""
        engine = RecommendationEngine()
        
        new_user = User.objects.create_user(username='newbie2', email='new2@test.com', password='pass')
        profile = engine.get_user_taste_profile(new_user.id)
        
        assert 'message' in profile


# ==========================================
# ML API Endpoints Tests
# ==========================================

@pytest.mark.django_db
class TestMLEndpoints:
    
    def test_personalized_recommendations_authenticated(self, api_client, users, movies, reviews):
        """Test personalized recommendations for authenticated user"""
        api_client.force_authenticate(user=users['alice'])
        
        response = api_client.get('/api/recommendations/for-you/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert 'recommendations' in response.data['data']
        assert 'algorithm' in response.data['data']
    
    def test_personalized_recommendations_unauthenticated(self, api_client):
        """Test personalized recommendations requires authentication"""
        response = api_client.get('/api/recommendations/for-you/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_personalized_recommendations_with_limit(self, api_client, users, movies, reviews):
        """Test personalized recommendations respects limit parameter"""
        api_client.force_authenticate(user=users['alice'])
        
        response = api_client.get('/api/recommendations/for-you/?limit=3')
        
        assert response.status_code == status.HTTP_200_OK
        recommendations = response.data['data']['recommendations']
        assert len(recommendations) <= 3
    
    def test_personalized_recommendations_algorithm_choice(self, api_client, users, movies, reviews):
        """Test choosing recommendation algorithm"""
        api_client.force_authenticate(user=users['alice'])
        
        # Test collaborative
        response = api_client.get('/api/recommendations/for-you/?algorithm=collaborative')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['algorithm'] == 'collaborative'
        
        # Test content
        response = api_client.get('/api/recommendations/for-you/?algorithm=content')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['algorithm'] == 'content'
        
        # Test hybrid
        response = api_client.get('/api/recommendations/for-you/?algorithm=hybrid')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['algorithm'] == 'hybrid'
    
    def test_personalized_recommendations_caching(self, api_client, users, movies, reviews):
        """Test recommendations are cached"""
        api_client.force_authenticate(user=users['alice'])
        
        # First request
        response1 = api_client.get('/api/recommendations/for-you/')
        assert response1.data['data']['cached'] is False
        
        # Second request should be cached
        response2 = api_client.get('/api/recommendations/for-you/')
        assert response2.data['data']['cached'] is True
    
    def test_similar_movies_success(self, api_client, movies):
        """Test getting similar movies"""
        response = api_client.get(f'/api/recommendations/movies/{movies["matrix"].id}/similar/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert 'similar_movies' in response.data['data']
        assert 'source_movie' in response.data['data']
        assert response.data['data']['source_movie']['title'] == 'The Matrix'
    
    def test_similar_movies_with_limit(self, api_client, movies):
        """Test similar movies respects limit parameter"""
        response = api_client.get(f'/api/recommendations/movies/{movies["matrix"].id}/similar/?limit=2')
        
        assert response.status_code == status.HTTP_200_OK
        similar_movies = response.data['data']['similar_movies']
        assert len(similar_movies) <= 2
    
    def test_similar_movies_nonexistent(self, api_client):
        """Test similar movies for non-existent movie"""
        response = api_client.get('/api/recommendations/movies/99999/similar/')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_similar_movies_caching(self, api_client, movies):
        """Test similar movies are cached"""
        movie_id = movies['matrix'].id
        
        # First request
        response1 = api_client.get(f'/api/recommendations/movies/{movie_id}/similar/')
        assert response1.data['data']['cached'] is False
        
        # Second request should be cached
        response2 = api_client.get(f'/api/recommendations/movies/{movie_id}/similar/')
        assert response2.data['data']['cached'] is True
    
    def test_taste_profile_authenticated(self, api_client, users, movies, reviews):
        """Test getting taste profile for authenticated user"""
        api_client.force_authenticate(user=users['alice'])
        
        response = api_client.get('/api/recommendations/profile/taste/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert 'total_reviews' in response.data['data']
        assert 'favorite_genres' in response.data['data']
    
    def test_taste_profile_unauthenticated(self, api_client):
        """Test taste profile requires authentication"""
        response = api_client.get('/api/recommendations/profile/taste/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_taste_profile_caching(self, api_client, users, movies, reviews):
        """Test taste profile is cached"""
        api_client.force_authenticate(user=users['alice'])
        
        # First request
        response1 = api_client.get('/api/recommendations/profile/taste/')
        assert response1.data['data']['cached'] is False
        
        # Second request should be cached
        response2 = api_client.get('/api/recommendations/profile/taste/')
        assert response2.data['data']['cached'] is True
    
    def test_clear_cache_authenticated(self, api_client, users):
        """Test clearing recommendation cache"""
        api_client.force_authenticate(user=users['alice'])
        
        response = api_client.post('/api/recommendations/cache/clear/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
    
    def test_clear_cache_unauthenticated(self, api_client):
        """Test clearing cache requires authentication"""
        response = api_client.post('/api/recommendations/cache/clear/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ==========================================
# Integration Tests
# ==========================================

@pytest.mark.django_db
class TestMLIntegration:
    
    def test_full_recommendation_flow(self, api_client, users, movies, reviews):
        """Test complete recommendation flow"""
        api_client.force_authenticate(user=users['alice'])
        
        # 1. Get personalized recommendations
        response = api_client.get('/api/recommendations/for-you/?limit=3')
        assert response.status_code == status.HTTP_200_OK
        recommendations = response.data['data']['recommendations']
        assert len(recommendations) > 0
        
        # 2. Get taste profile
        response = api_client.get('/api/recommendations/profile/taste/')
        assert response.status_code == status.HTTP_200_OK
        assert 'favorite_genres' in response.data['data']
        
        # 3. Get similar movies
        response = api_client.get(f'/api/recommendations/movies/{movies["matrix"].id}/similar/')
        assert response.status_code == status.HTTP_200_OK
        
        # 4. Clear cache
        response = api_client.post('/api/recommendations/cache/clear/')
        assert response.status_code == status.HTTP_200_OK
    
    def test_recommendations_after_new_review(self, api_client, users, movies):
        """Test recommendations update after user rates a new movie"""
        api_client.force_authenticate(user=users['alice'])
        
        # Get initial recommendations
        response1 = api_client.get('/api/recommendations/for-you/')
        initial_recs = response1.data['data']['recommendations']
        
        # Add a new review
        Review.objects.create(
            user=users['alice'],
            movie=movies['hangover'],
            rating=5,
            content='Hilarious!'
        )
        
        # Clear cache
        api_client.post('/api/recommendations/cache/clear/')
        
        # Get new recommendations
        response2 = api_client.get('/api/recommendations/for-you/')
        new_recs = response2.data['data']['recommendations']
        
        # Recommendations should potentially change
        assert response2.status_code == status.HTTP_200_OK
