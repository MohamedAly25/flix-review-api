"""
TMDB Service for importing movies from The Movie Database API with Wikipedia fallback.

This service provides methods to:
- Search for movies on TMDB
- Get detailed movie information from TMDB
- Import movies into our database with Wikipedia fallback
- Sync existing movies with TMDB data
"""
import logging
import re
from typing import Dict, List, Optional
from django.conf import settings
from django.utils.text import slugify
import requests

try:
    import wikipedia  # type: ignore
    WIKIPEDIA_AVAILABLE = True
except ImportError:
    WIKIPEDIA_AVAILABLE = False
    logging.warning("Wikipedia library not available. Install with: pip install wikipedia")


logger = logging.getLogger(__name__)


class TMDBService:
    """Service for interacting with The Movie Database (TMDB) API with Wikipedia fallback"""
    
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
    
    def get_movie_details(self, tmdb_id: int, max_retries: int = 3) -> Optional[Dict]:
        """
        Get detailed information about a movie from TMDB with Wikipedia fallback
        
        Args:
            tmdb_id: TMDB movie ID
            max_retries: Maximum number of retry attempts
            
        Returns:
            Dictionary with full movie details or None if not found
        """
        if not self.enabled:
            logger.warning("TMDB not enabled. Trying Wikipedia fallback.")
            # Try Wikipedia directly if TMDB is not available
            return self._get_wikipedia_movie_details(tmdb_id)
        
        for attempt in range(max_retries):
            try:
                movie = self.movie_api.details(tmdb_id)
                return self._format_movie_details(movie)
            except Exception as e:
                error_msg = str(e)
                if "Read timed out" in error_msg or "timeout" in error_msg.lower():
                    if attempt < max_retries - 1:
                        wait_time = (attempt + 1) * 2  # Exponential backoff
                        logger.warning(f"Timeout getting TMDB movie details for ID {tmdb_id}, attempt {attempt + 1}/{max_retries}. Retrying in {wait_time}s...")
                        import time
                        time.sleep(wait_time)
                        continue
                    else:
                        logger.error(f"Failed to get TMDB movie details for ID {tmdb_id} after {max_retries} attempts: {error_msg}")
                        # Try Wikipedia fallback
                        logger.info(f"Trying Wikipedia fallback for TMDB ID {tmdb_id}")
                        return self._get_wikipedia_movie_details(tmdb_id)
                else:
                    logger.error(f"Error getting TMDB movie details for ID {tmdb_id}: {error_msg}")
                    # Try Wikipedia fallback
                    logger.info(f"Trying Wikipedia fallback for TMDB ID {tmdb_id}")
                    return self._get_wikipedia_movie_details(tmdb_id)
        
        return None
    
    def import_movie(self, tmdb_id: int) -> Optional[Dict]:
        """
        Import a movie from TMDB into our database with Wikipedia fallback
        
        Args:
            tmdb_id: TMDB movie ID
            
        Returns:
            Dictionary with created/updated movie data or None if failed
        """
        from movies.models import Movie, Genre
        from django.core.exceptions import ValidationError
        
        if not self.enabled:
            logger.warning("TMDB not enabled. Cannot import movie.")
            return None
        
        try:
            # Get detailed movie information from TMDB (with Wikipedia fallback)
            details = self.get_movie_details(tmdb_id)
            if not details:
                logger.error(f"Could not fetch details for TMDB ID {tmdb_id} from TMDB or Wikipedia")
                return None
            
            # Validate required fields
            if not details.get('title'):
                logger.error(f"Movie {tmdb_id} has no title. Skipping.")
                return None
            
            if not details.get('release_date'):
                logger.warning(f"Movie {tmdb_id} ({details.get('title', 'Unknown')}) has no release date. Using today's date.")
                from datetime import date
                details['release_date'] = date.today()
            
            # Ensure imdb_id is a string, not None
            imdb_id = details.get('imdb_id') or ''
            if imdb_id is None:
                imdb_id = ''
            
            # Create or update movie in our database
            movie, created = Movie.objects.update_or_create(
                tmdb_id=tmdb_id,
                defaults={
                    'title': details['title'],
                    'description': details['overview'] or '',
                    'release_date': details['release_date'],
                    'poster_url': details['poster_url'],
                    'runtime': details.get('runtime'),
                    'imdb_id': imdb_id,
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
            source = "Wikipedia" if not details.get('imdb_id') and details.get('overview') else "TMDB"
            logger.info(f"{action} movie: {movie.title} (TMDB ID: {tmdb_id}) from {source}")
            
            return {
                'id': movie.id,
                'tmdb_id': movie.tmdb_id,
                'title': movie.title,
                'created': created,
                'source': source
            }
            
        except ValidationError as e:
            logger.error(f"Validation error importing movie from TMDB ID {tmdb_id}: {str(e)}")
            return None
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
    
    def _get_wikipedia_movie_details(self, tmdb_id: int, movie_title: Optional[str] = None) -> Optional[Dict]:
        """
        Get movie details from Wikipedia as fallback

        Args:
            tmdb_id: TMDB movie ID
            movie_title: Optional movie title to search on Wikipedia directly

        Returns:
            Dictionary with movie details from Wikipedia or None if not found
        """
        if not WIKIPEDIA_AVAILABLE:
            logger.warning("Wikipedia library not available for fallback")
            return None

        try:
            title = movie_title

            # If no title provided, try to get it from TMDB first
            if not title and self.enabled:
                try:
                    movie = self.movie_api.details(tmdb_id)
                    title = movie.title
                except:
                    logger.warning(f"Could not get title for TMDB ID {tmdb_id} from TMDB")
                    return None
            elif not title:
                logger.warning("No movie title provided and TMDB not available")
                return None

            if not title:
                logger.warning("No movie title available for Wikipedia search")
                return None

            # Search Wikipedia for the movie
            try:
                wiki_page = wikipedia.page(title, auto_suggest=False)
                description = wiki_page.summary

                # Try to extract release year from description or title
                release_year = None
                year_match = re.search(r'\b(19|20)\d{2}\b', description)
                if year_match:
                    release_year = year_match.group(0)

                # Get poster image if available (Wikipedia library doesn't provide images easily)
                poster_url = ""

                from datetime import date
                release_date = None
                if release_year:
                    try:
                        release_date = date(int(release_year), 1, 1)  # Default to January 1st
                    except:
                        release_date = date.today()
                else:
                    release_date = date.today()

                logger.info(f"Successfully retrieved movie info from Wikipedia: {title}")

                return {
                    'tmdb_id': tmdb_id,
                    'title': title,
                    'overview': description[:1000] if description else '',  # Limit description length
                    'release_date': release_date,
                    'poster_url': poster_url,
                    'backdrop_url': "",
                    'runtime': None,
                    'budget': 0,
                    'revenue': 0,
                    'imdb_id': '',
                    'genres': [],
                    'vote_average': 0,
                    'vote_count': 0,
                    'popularity': 0,
                }

            except wikipedia.exceptions.DisambiguationError as e:
                # If there are multiple results, try the first one
                try:
                    wiki_page = wikipedia.page(e.options[0], auto_suggest=False)
                    description = wiki_page.summary

                    release_year = None
                    year_match = re.search(r'\b(19|20)\d{2}\b', description)
                    if year_match:
                        release_year = year_match.group(0)

                    from datetime import date
                    release_date = date(int(release_year), 1, 1) if release_year else date.today()

                    logger.info(f"Successfully retrieved movie info from Wikipedia (disambiguation): {title}")

                    return {
                        'tmdb_id': tmdb_id,
                        'title': title,
                        'overview': description[:1000] if description else '',
                        'release_date': release_date,
                        'poster_url': "",
                        'backdrop_url': "",
                        'runtime': None,
                        'budget': 0,
                        'revenue': 0,
                        'imdb_id': '',
                        'genres': [],
                        'vote_average': 0,
                        'vote_count': 0,
                        'popularity': 0,
                    }
                except:
                    logger.warning(f"Wikipedia disambiguation failed for movie: {title}")
                    return None

            except wikipedia.exceptions.PageError:
                logger.warning(f"Wikipedia page not found for movie: {title}")
                return None

        except Exception as e:
            logger.error(f"Error getting Wikipedia data for TMDB ID {tmdb_id}: {str(e)}")
            return None
    
    def get_wikipedia_movie_by_title(self, title: str) -> Optional[Dict]:
        """
        Get movie details from Wikipedia by title only (no TMDB dependency)
        
        Args:
            title: Movie title to search on Wikipedia
            
        Returns:
            Dictionary with movie details from Wikipedia or None if not found
        """
        return self._get_wikipedia_movie_details(0, title)  # Use 0 as dummy TMDB ID
    
    def import_movie_from_wikipedia(self, title: str) -> Optional[Dict]:
        """
        Import a movie directly from Wikipedia (no TMDB dependency)
        
        Args:
            title: Movie title to search on Wikipedia
            
        Returns:
            Dictionary with created/updated movie data or None if failed
        """
        from movies.models import Movie, Genre
        from django.core.exceptions import ValidationError
        
        try:
            # Get detailed movie information from Wikipedia
            details = self.get_wikipedia_movie_by_title(title)
            if not details:
                logger.error(f"Could not fetch details for movie '{title}' from Wikipedia")
                return None
            
            # Validate required fields
            if not details.get('title'):
                logger.error(f"Movie '{title}' has no title. Skipping.")
                return None
            
            if not details.get('release_date'):
                logger.warning(f"Movie '{title}' has no release date. Using today's date.")
                from datetime import date
                details['release_date'] = date.today()
            
            # Create or update movie in our database
            movie, created = Movie.objects.update_or_create(
                title=title,  # Use title as unique identifier since no TMDB ID
                defaults={
                    'description': details['overview'] or '',
                    'release_date': details['release_date'],
                    'poster_url': details['poster_url'],
                    'runtime': details.get('runtime'),
                    'imdb_id': details.get('imdb_id', ''),
                    'budget': details.get('budget', 0),
                    'revenue': details.get('revenue', 0),
                    'backdrop_url': details.get('backdrop_url', ''),
                    'tmdb_id': None,  # No TMDB ID for Wikipedia-only imports
                }
            )
            
            # Handle genres (Wikipedia doesn't provide genres easily, so skip)
            # Update old genre CharField for backward compatibility
            if not movie.genre:
                movie.genre = 'Unknown'  # Default genre
                movie.save(update_fields=['genre'])
            
            action = "Created" if created else "Updated"
            logger.info(f"{action} movie: {movie.title} from Wikipedia")
            
            return {
                'id': movie.id,
                'tmdb_id': None,
                'title': movie.title,
                'created': created,
                'source': 'Wikipedia'
            }
            
        except ValidationError as e:
            logger.error(f"Validation error importing movie from Wikipedia '{title}': {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error importing movie from Wikipedia '{title}': {str(e)}")
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
        from datetime import datetime
        
        poster_url = f"https://image.tmdb.org/t/p/w500{movie.poster_path}" if movie.poster_path else ""
        backdrop_url = f"https://image.tmdb.org/t/p/original{movie.backdrop_path}" if hasattr(movie, 'backdrop_path') and movie.backdrop_path else ""
        
        genres = []
        if hasattr(movie, 'genres') and movie.genres:
            genres = [genre['name'] for genre in movie.genres]
        
        # Handle release date parsing
        release_date = None
        if hasattr(movie, 'release_date') and movie.release_date:
            try:
                # Try to parse the date
                if isinstance(movie.release_date, str):
                    # Handle various date formats
                    if len(movie.release_date) == 4:  # Year only
                        release_date = datetime.strptime(f"{movie.release_date}-01-01", "%Y-%m-%d").date()
                    elif len(movie.release_date) == 7:  # Year-month
                        release_date = datetime.strptime(f"{movie.release_date}-01", "%Y-%m-%d").date()
                    else:
                        release_date = datetime.strptime(movie.release_date, "%Y-%m-%d").date()
                else:
                    release_date = movie.release_date
            except (ValueError, TypeError) as e:
                logger.warning(f"Invalid release date format for movie {movie.id}: {movie.release_date}. Using None.")
                release_date = None
        
        return {
            'tmdb_id': movie.id,
            'title': movie.title,
            'overview': movie.overview or '',
            'release_date': release_date,
            'poster_url': poster_url,
            'backdrop_url': backdrop_url,
            'runtime': movie.runtime if hasattr(movie, 'runtime') else None,
            'budget': movie.budget if hasattr(movie, 'budget') else 0,
            'revenue': movie.revenue if hasattr(movie, 'revenue') else 0,
            'imdb_id': movie.imdb_id if hasattr(movie, 'imdb_id') and movie.imdb_id else '',
            'genres': genres,
            'vote_average': movie.vote_average if hasattr(movie, 'vote_average') else 0,
            'vote_count': movie.vote_count if hasattr(movie, 'vote_count') else 0,
            'popularity': movie.popularity if hasattr(movie, 'popularity') else 0,
        }
