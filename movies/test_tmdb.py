"""
Tests for TMDB Integration

Tests cover:
- TMDBService class methods
- Management commands
- TMDB API endpoints
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date

from movies.models import Movie, Genre
from movies.services import TMDBService


User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        username='admin',
        email='admin@test.com',
        password='admin123'
    )


@pytest.fixture
def regular_user(db):
    return User.objects.create_user(
        username='user',
        email='user@test.com',
        password='user123'
    )


@pytest.fixture
def sample_movie(db):
    """Create a sample movie without TMDB ID"""
    return Movie.objects.create(
        title='Test Movie',
        genre='Action',
        description='A test movie',
        release_date=date(2020, 1, 1),
        poster_url='https://example.com/poster.jpg'
    )


@pytest.fixture
def sample_tmdb_movie(db):
    """Create a sample movie with TMDB ID"""
    movie = Movie.objects.create(
        title='Fight Club',
        genre='Drama',
        description='An insomniac office worker...',
        release_date=date(1999, 10, 15),
        poster_url='https://image.tmdb.org/t/p/w500/poster.jpg',
        tmdb_id=550,
        imdb_id='tt0137523',
        runtime=139,
        budget=63000000,
        revenue=100853753
    )
    # Add genres
    action, _ = Genre.objects.get_or_create(name='Action', defaults={'slug': 'action'})
    drama, _ = Genre.objects.get_or_create(name='Drama', defaults={'slug': 'drama'})
    movie.genres.add(action, drama)
    return movie


# ==========================================
# TMDBService Tests
# ==========================================

@pytest.mark.django_db
class TestTMDBService:
    
    @patch('tmdbv3api.TMDb')
    @patch('tmdbv3api.Movie')
    def test_service_initialization_with_api_key(self, mock_movie_class, mock_tmdb_class):
        """Test TMDB service initializes correctly with API key"""
        # Mock the TMDb instance
        mock_tmdb_instance = Mock()
        mock_tmdb_instance.api_key = ''
        mock_tmdb_class.return_value = mock_tmdb_instance
        
        # Set API key in settings
        from django.conf import settings
        with patch.object(settings, 'TMDB_API_KEY', 'test_api_key_123'):
            service = TMDBService()
            assert service.is_enabled() == True
    
    @patch('tmdbv3api.TMDb')
    @patch('tmdbv3api.Movie')
    def test_service_initialization_without_api_key(self, mock_movie_class, mock_tmdb_class):
        """Test TMDB service handles missing API key"""
        # Mock the TMDb instance
        mock_tmdb_instance = Mock()
        mock_tmdb_instance.api_key = ''
        mock_tmdb_class.return_value = mock_tmdb_instance
        
        # No API key
        from django.conf import settings
        with patch.object(settings, 'TMDB_API_KEY', ''):
            service = TMDBService()
            assert service.is_enabled() == False
    
    @patch('movies.services.tmdb_service.TMDBService.__init__')
    def test_search_movies_success(self, mock_init):
        """Test searching for movies on TMDB"""
        # Mock initialization
        mock_init.return_value = None
        service = TMDBService()
        service.enabled = True
        
        # Mock movie API
        mock_movie = Mock()
        mock_movie.id = 550
        mock_movie.title = 'Fight Club'
        mock_movie.overview = 'An insomniac office worker...'
        mock_movie.release_date = '1999-10-15'
        mock_movie.poster_path = '/poster.jpg'
        mock_movie.vote_average = 8.4
        mock_movie.vote_count = 26000
        
        service.movie_api = Mock()
        service.movie_api.search.return_value = [mock_movie]
        
        results = service.search_movies('Fight Club')
        
        assert len(results) == 1
        assert results[0]['tmdb_id'] == 550
        assert results[0]['title'] == 'Fight Club'
        service.movie_api.search.assert_called_once_with('Fight Club', page=1)
    
    @patch('movies.services.tmdb_service.TMDBService.__init__')
    def test_search_movies_disabled(self, mock_init):
        """Test search returns empty when TMDB is disabled"""
        mock_init.return_value = None
        service = TMDBService()
        service.enabled = False
        
        results = service.search_movies('Fight Club')
        
        assert results == []
    
    @patch('movies.services.tmdb_service.TMDBService.__init__')
    def test_get_movie_details_success(self, mock_init):
        """Test getting movie details from TMDB"""
        mock_init.return_value = None
        service = TMDBService()
        service.enabled = True
        
        # Mock movie details
        mock_movie = Mock()
        mock_movie.id = 550
        mock_movie.title = 'Fight Club'
        mock_movie.overview = 'An insomniac office worker...'
        mock_movie.release_date = '1999-10-15'
        mock_movie.poster_path = '/poster.jpg'
        mock_movie.backdrop_path = '/backdrop.jpg'
        mock_movie.runtime = 139
        mock_movie.budget = 63000000
        mock_movie.revenue = 100853753
        mock_movie.imdb_id = 'tt0137523'
        mock_movie.genres = [{'name': 'Drama'}, {'name': 'Thriller'}]
        mock_movie.vote_average = 8.4
        mock_movie.vote_count = 26000
        mock_movie.popularity = 42.5
        
        service.movie_api = Mock()
        service.movie_api.details.return_value = mock_movie
        
        details = service.get_movie_details(550)
        
        assert details['tmdb_id'] == 550
        assert details['title'] == 'Fight Club'
        assert details['runtime'] == 139
        assert details['budget'] == 63000000
        assert 'Drama' in details['genres']
        assert 'Thriller' in details['genres']
    
    @patch('movies.services.tmdb_service.TMDBService.__init__')
    def test_import_movie_creates_new(self, mock_init, db):
        """Test importing a new movie from TMDB"""
        mock_init.return_value = None
        service = TMDBService()
        service.enabled = True
        
        # Mock get_movie_details
        service.get_movie_details = Mock(return_value={
            'tmdb_id': 550,
            'title': 'Fight Club',
            'overview': 'An insomniac office worker...',
            'release_date': '1999-10-15',
            'poster_url': 'https://image.tmdb.org/t/p/w500/poster.jpg',
            'backdrop_url': 'https://image.tmdb.org/t/p/original/backdrop.jpg',
            'runtime': 139,
            'budget': 63000000,
            'revenue': 100853753,
            'imdb_id': 'tt0137523',
            'genres': ['Drama', 'Thriller'],
            'vote_average': 8.4,
            'vote_count': 26000,
            'popularity': 42.5
        })
        
        result = service.import_movie(550)
        
        assert result is not None
        assert result['created'] == True
        assert result['tmdb_id'] == 550
        
        # Verify movie was created in database
        movie = Movie.objects.get(tmdb_id=550)
        assert movie.title == 'Fight Club'
        assert movie.runtime == 139
        assert movie.imdb_id == 'tt0137523'
        assert movie.genres.count() == 2
    
    @patch('movies.services.tmdb_service.TMDBService.__init__')
    def test_import_movie_updates_existing(self, mock_init, sample_tmdb_movie):
        """Test updating an existing movie from TMDB"""
        mock_init.return_value = None
        service = TMDBService()
        service.enabled = True
        
        # Mock get_movie_details with updated data
        service.get_movie_details = Mock(return_value={
            'tmdb_id': 550,
            'title': 'Fight Club - Updated',
            'overview': 'Updated description...',
            'release_date': '1999-10-15',
            'poster_url': 'https://image.tmdb.org/t/p/w500/new_poster.jpg',
            'backdrop_url': 'https://image.tmdb.org/t/p/original/new_backdrop.jpg',
            'runtime': 140,  # Changed
            'budget': 63000000,
            'revenue': 150000000,  # Changed
            'imdb_id': 'tt0137523',
            'genres': ['Drama', 'Thriller', 'Mystery'],
            'vote_average': 8.5,
            'vote_count': 30000,
            'popularity': 50.0
        })
        
        result = service.import_movie(550)
        
        assert result is not None
        assert result['created'] == False  # Updated, not created
        
        # Verify movie was updated
        sample_tmdb_movie.refresh_from_db()
        assert sample_tmdb_movie.title == 'Fight Club - Updated'
        assert sample_tmdb_movie.runtime == 140
        assert sample_tmdb_movie.revenue == 150000000
        assert sample_tmdb_movie.genres.count() == 3
    
    @patch('movies.services.tmdb_service.TMDBService.__init__')
    def test_sync_movie_success(self, mock_init, sample_tmdb_movie):
        """Test syncing an existing movie with TMDB"""
        mock_init.return_value = None
        service = TMDBService()
        service.enabled = True
        
        # Mock import_movie
        service.import_movie = Mock(return_value={
            'id': sample_tmdb_movie.id,
            'tmdb_id': 550,
            'title': 'Fight Club',
            'created': False
        })
        
        result = service.sync_movie(sample_tmdb_movie.id)
        
        assert result is not None
        service.import_movie.assert_called_once_with(550)
    
    @patch('movies.services.tmdb_service.TMDBService.__init__')
    def test_sync_movie_no_tmdb_id(self, mock_init, sample_movie):
        """Test syncing a movie without TMDB ID fails gracefully"""
        mock_init.return_value = None
        service = TMDBService()
        service.enabled = True
        
        result = service.sync_movie(sample_movie.id)
        
        assert result is None


# ==========================================
# Management Commands Tests
# ==========================================

@pytest.mark.django_db
class TestManagementCommands:
    
    @patch('movies.management.commands.import_tmdb_movie.TMDBService')
    def test_import_tmdb_movie_command_success(self, mock_service_class):
        """Test import_tmdb_movie command successfully imports a movie"""
        # Mock service
        mock_service = Mock()
        mock_service.is_enabled.return_value = True
        mock_service.import_movie.return_value = {
            'id': 1,
            'tmdb_id': 550,
            'title': 'Fight Club',
            'created': True
        }
        mock_service_class.return_value = mock_service
        
        # Call command
        call_command('import_tmdb_movie', '--tmdb-id=550')
        
        mock_service.import_movie.assert_called_once_with(550)
    
    @patch('movies.management.commands.import_tmdb_movie.TMDBService')
    def test_import_tmdb_movie_command_already_exists(self, mock_service_class, sample_tmdb_movie):
        """Test import_tmdb_movie command skips existing movies"""
        mock_service = Mock()
        mock_service.is_enabled.return_value = True
        mock_service_class.return_value = mock_service
        
        # Should not call import_movie when movie exists and --force not used
        call_command('import_tmdb_movie', '--tmdb-id=550')
        
        mock_service.import_movie.assert_not_called()
    
    @patch('movies.management.commands.import_popular_movies.TMDBService')
    def test_import_popular_movies_command(self, mock_service_class):
        """Test import_popular_movies command imports multiple movies"""
        # Mock service
        mock_service = Mock()
        mock_service.is_enabled.return_value = True
        mock_service.get_popular_movies.return_value = [
            {'tmdb_id': 550, 'title': 'Fight Club'},
            {'tmdb_id': 680, 'title': 'Pulp Fiction'},
        ]
        mock_service.import_movie.return_value = {
            'id': 1,
            'tmdb_id': 550,
            'title': 'Fight Club',
            'created': True
        }
        mock_service_class.return_value = mock_service
        
        # Call command
        call_command('import_popular_movies', '--pages=1', '--delay=0')
        
        assert mock_service.import_movie.call_count == 2


# ==========================================
# API Endpoints Tests
# ==========================================

@pytest.mark.django_db
class TestTMDBEndpoints:
    
    @patch('movies.views.TMDBService')
    def test_search_tmdb_success(self, mock_service_class, api_client):
        """Test searching TMDB via API"""
        # Mock service
        mock_service = Mock()
        mock_service.is_enabled.return_value = True
        mock_service.search_movies.return_value = [
            {
                'tmdb_id': 550,
                'title': 'Fight Club',
                'overview': 'An insomniac office worker...',
                'release_date': '1999-10-15',
                'poster_path': '/poster.jpg',
                'vote_average': 8.4,
                'vote_count': 26000
            }
        ]
        mock_service_class.return_value = mock_service
        
        response = api_client.get('/api/movies/search-tmdb/?q=Fight Club')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert len(response.data['data']['results']) == 1
        assert response.data['data']['results'][0]['title'] == 'Fight Club'
    
    def test_search_tmdb_missing_query(self, api_client):
        """Test search endpoint requires query parameter"""
        response = api_client.get('/api/movies/search-tmdb/')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data
    
    @patch('movies.views.TMDBService')
    def test_import_tmdb_movie_as_admin(self, mock_service_class, api_client, admin_user, db):
        """Test importing a movie from TMDB as admin"""
        # Login as admin
        api_client.force_authenticate(user=admin_user)
        
        # Create a movie to return from import
        from movies.models import Movie
        from datetime import date
        test_movie = Movie.objects.create(
            title='Fight Club',
            genre='Drama',
            description='Test movie',
            release_date=date(1999, 10, 15),
            tmdb_id=550
        )
        
        # Mock service
        mock_service = Mock()
        mock_service.is_enabled.return_value = True
        mock_service.import_movie.return_value = {
            'id': test_movie.id,
            'tmdb_id': 550,
            'title': 'Fight Club',
            'created': True
        }
        mock_service_class.return_value = mock_service
        
        response = api_client.post('/api/movies/import-tmdb/', {'tmdb_id': 550, 'force': True})
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['success'] is True
        assert 'movie' in response.data['data']
    
    def test_import_tmdb_movie_as_regular_user(self, api_client, regular_user):
        """Test importing a movie is restricted to admins"""
        api_client.force_authenticate(user=regular_user)
        
        response = api_client.post('/api/movies/import-tmdb/', {'tmdb_id': 550})
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_import_tmdb_movie_missing_id(self, api_client, admin_user):
        """Test import endpoint requires tmdb_id"""
        api_client.force_authenticate(user=admin_user)
        
        response = api_client.post('/api/movies/import-tmdb/', {})
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data
    
    @patch('movies.views.TMDBService')
    def test_sync_tmdb_movie_as_admin(self, mock_service_class, api_client, admin_user, sample_tmdb_movie):
        """Test syncing a movie with TMDB as admin"""
        api_client.force_authenticate(user=admin_user)
        
        # Mock service
        mock_service = Mock()
        mock_service.is_enabled.return_value = True
        mock_service.sync_movie.return_value = {
            'id': sample_tmdb_movie.id,
            'tmdb_id': 550,
            'title': 'Fight Club',
            'created': False
        }
        mock_service_class.return_value = mock_service
        
        response = api_client.post(f'/api/movies/{sample_tmdb_movie.id}/sync-tmdb/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
    
    def test_sync_tmdb_movie_without_tmdb_id(self, api_client, admin_user, sample_movie):
        """Test syncing a movie without TMDB ID fails"""
        api_client.force_authenticate(user=admin_user)
        
        response = api_client.post(f'/api/movies/{sample_movie.id}/sync-tmdb/')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data
    
    def test_sync_tmdb_movie_not_found(self, api_client, admin_user):
        """Test syncing non-existent movie"""
        api_client.force_authenticate(user=admin_user)
        
        response = api_client.post('/api/movies/99999/sync-tmdb/')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
