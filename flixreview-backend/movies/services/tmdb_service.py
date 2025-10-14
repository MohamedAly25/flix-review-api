"""
TMDB Service for importing movies from The Movie Database API.

This service provides methods to:
- Search for movies on TMDB
- Get detailed movie information  
- Import movies into our database
- Sync existing movies with TMDB data
"""
import logging
from typing import Dict, List, Optional
from django.conf import settings
from django.utils.text import slugify


logger = logging.getLogger(__name__)


class TMDBService:
    """Service for interacting with The Movie Database (TMDB) API"""
    
    def __init__(self):
        """Initialize TMDB client with API key from settings"""
        try:
            from tmdbv3api import TMDb, Movie as TMDbMovie
            
            self.tmdb = TMDb()
            self.tmdb.api_key = getattr(settings, 'TMDB_API_KEY', '')
            self.tmdb.language = 'en'
            self.movie_api = TMDbMovie()
            self.enabled = bool(self.tmdb.api_key)
            
            if not self.enabled:
                logger.warning("TMDB API key not configured. TMDB features will be disabled.")
        except ImportError:
            logger.error("tmdbv3api library not installed. Install with: pip install tmdbv3api")
            self.enabled = False
    
    def is_enabled(self) -> bool:
        """Check if TMDB integration is enabled"""
        return self.enabled
    
    def search_movies(self, query: str, page: int = 1) -> List[Dict]:
        """
        Search for movies on TMDB by title
        
        Args:
            query: Search query string
            page: Page number for pagination
            
        Returns:
            List of movie dictionaries with basic information
        """
        if not self.enabled:
            logger.warning("TMDB not enabled. Cannot search movies.")
            return []
        
        try:
            results = self.movie_api.search(query, page=page)
            return [self._format_search_result(movie) for movie in results]
        except Exception as e:
            logger.error(f"Error searching TMDB for '{query}': {str(e)}")
            return []
    
    def get_movie_details(self, tmdb_id: int) -> Optional[Dict]:
        """
        Get detailed information about a movie from TMDB
        
        Args:
            tmdb_id: TMDB movie ID
            
        Returns:
            Dictionary with full movie details or None if not found
        """
        if not self.enabled:
            logger.warning("TMDB not enabled. Cannot get movie details.")
            return None
        
        try:
            movie = self.movie_api.details(tmdb_id)
            return self._format_movie_details(movie)
        except Exception as e:
            logger.error(f"Error getting TMDB movie details for ID {tmdb_id}: {str(e)}")
            return None
    
    def import_movie(self, tmdb_id: int) -> Optional[Dict]:
        """
        Import a movie from TMDB into our database
        
        Args:
            tmdb_id: TMDB movie ID
            
        Returns:
            Dictionary with created/updated movie data or None if failed
        """
        from movies.models import Movie, Genre
        
        if not self.enabled:
            logger.warning("TMDB not enabled. Cannot import movie.")
            return None
        
        try:
            # Get detailed movie information from TMDB
            details = self.get_movie_details(tmdb_id)
            if not details:
                logger.error(f"Could not fetch details for TMDB ID {tmdb_id}")
                return None
            
            # Create or update movie in our database
            movie, created = Movie.objects.update_or_create(
                tmdb_id=tmdb_id,
                defaults={
                    'title': details['title'],
                    'description': details['overview'] or '',
                    'release_date': details['release_date'],
                    'poster_url': details['poster_url'],
                    'runtime': details.get('runtime'),
                    'imdb_id': details.get('imdb_id', ''),
                    'budget': details.get('budget', 0),
                    'revenue': details.get('revenue', 0),
                    'backdrop_url': details.get('backdrop_url', ''),
                }
            )
            
            # Handle genres
            if details.get('genres'):
                movie.genres.clear()  # Remove old genres
                for genre_name in details['genres']:
                    genre, _ = Genre.objects.get_or_create(
                        name=genre_name,
                        defaults={'slug': slugify(genre_name)}
                    )
                    movie.genres.add(genre)
            
            # Update old genre CharField for backward compatibility
            if details.get('genres'):
                movie.genre = ', '.join(details['genres'])
                movie.save(update_fields=['genre'])
            
            action = "Created" if created else "Updated"
            logger.info(f"{action} movie: {movie.title} (TMDB ID: {tmdb_id})")
            
            return {
                'id': movie.id,
                'tmdb_id': movie.tmdb_id,
                'title': movie.title,
                'created': created
            }
            
        except Exception as e:
            logger.error(f"Error importing movie from TMDB ID {tmdb_id}: {str(e)}")
            return None
    
    def sync_movie(self, movie_id: int) -> Optional[Dict]:
        """
        Sync an existing movie with latest TMDB data
        
        Args:
            movie_id: Our database movie ID
            
        Returns:
            Dictionary with sync status or None if failed
        """
        from movies.models import Movie
        
        try:
            movie = Movie.objects.get(id=movie_id)
            if not movie.tmdb_id:
                logger.warning(f"Movie {movie.title} has no TMDB ID. Cannot sync.")
                return None
            
            result = self.import_movie(movie.tmdb_id)
            if result:
                logger.info(f"Synced movie: {movie.title}")
            return result
            
        except Movie.DoesNotExist:
            logger.error(f"Movie with ID {movie_id} not found.")
            return None
        except Exception as e:
            logger.error(f"Error syncing movie ID {movie_id}: {str(e)}")
            return None
    
    def get_popular_movies(self, page: int = 1) -> List[Dict]:
        """
        Get popular movies from TMDB
        
        Args:
            page: Page number for pagination
            
        Returns:
            List of popular movie dictionaries
        """
        if not self.enabled:
            logger.warning("TMDB not enabled. Cannot get popular movies.")
            return []
        
        try:
            results = self.movie_api.popular(page=page)
            return [self._format_search_result(movie) for movie in results]
        except Exception as e:
            logger.error(f"Error getting popular movies: {str(e)}")
            return []
    
    def _format_search_result(self, movie) -> Dict:
        """Format TMDB search result into a dictionary"""
        return {
            'tmdb_id': movie.id,
            'title': movie.title,
            'overview': movie.overview or '',
            'release_date': movie.release_date if hasattr(movie, 'release_date') else None,
            'poster_path': movie.poster_path,
            'vote_average': movie.vote_average if hasattr(movie, 'vote_average') else 0,
            'vote_count': movie.vote_count if hasattr(movie, 'vote_count') else 0,
        }
    
    def _format_movie_details(self, movie) -> Dict:
        """Format TMDB movie details into a dictionary"""
        poster_url = f"https://image.tmdb.org/t/p/w500{movie.poster_path}" if movie.poster_path else ""
        backdrop_url = f"https://image.tmdb.org/t/p/original{movie.backdrop_path}" if hasattr(movie, 'backdrop_path') and movie.backdrop_path else ""
        
        genres = []
        if hasattr(movie, 'genres') and movie.genres:
            genres = [genre['name'] for genre in movie.genres]
        
        return {
            'tmdb_id': movie.id,
            'title': movie.title,
            'overview': movie.overview or '',
            'release_date': movie.release_date if hasattr(movie, 'release_date') else None,
            'poster_url': poster_url,
            'backdrop_url': backdrop_url,
            'runtime': movie.runtime if hasattr(movie, 'runtime') else None,
            'budget': movie.budget if hasattr(movie, 'budget') else 0,
            'revenue': movie.revenue if hasattr(movie, 'revenue') else 0,
            'imdb_id': movie.imdb_id if hasattr(movie, 'imdb_id') else '',
            'genres': genres,
            'vote_average': movie.vote_average if hasattr(movie, 'vote_average') else 0,
            'vote_count': movie.vote_count if hasattr(movie, 'vote_count') else 0,
            'popularity': movie.popularity if hasattr(movie, 'popularity') else 0,
        }
