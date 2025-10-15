"""
Script to import 100 popular movies from TMDB
Run: python manage.py shell < scripts/import_popular_movies.py
Or: python scripts/import_popular_movies.py
"""

import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movie_review_api.settings')
django.setup()

import requests
from movies.models import Movie, Genre
from django.conf import settings

TMDB_API_KEY = settings.TMDB_API_KEY
TMDB_BASE_URL = "https://api.themoviedb.org/3"

def get_popular_movies(pages=5):
    """Get popular movies from TMDB (20 movies per page)"""
    movies = []
    for page in range(1, pages + 1):
        url = f"{TMDB_BASE_URL}/movie/popular"
        params = {
            'api_key': TMDB_API_KEY,
            'language': 'en-US',
            'page': page
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            movies.extend(data.get('results', []))
            print(f"✓ Fetched page {page} - {len(data.get('results', []))} movies")
        except Exception as e:
            print(f"✗ Error fetching page {page}: {str(e)}")
            
    return movies

def get_movie_details(tmdb_id):
    """Get detailed movie information"""
    url = f"{TMDB_BASE_URL}/movie/{tmdb_id}"
    params = {
        'api_key': TMDB_API_KEY,
        'language': 'en-US'
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"✗ Error fetching details for movie {tmdb_id}: {str(e)}")
        return None

def create_or_update_genres(genre_data):
    """Create or update genres from TMDB data"""
    genres = []
    for g in genre_data:
        genre, created = Genre.objects.get_or_create(
            name=g['name'],
            defaults={'description': f"{g['name']} movies"}
        )
        genres.append(genre)
    return genres

def import_movie(movie_data):
    """Import a single movie from TMDB"""
    tmdb_id = movie_data.get('id')
    
    # Check if movie already exists
    if Movie.objects.filter(tmdb_id=tmdb_id).exists():
        print(f"  ⊙ Movie '{movie_data.get('title')}' already exists (TMDB ID: {tmdb_id})")
        return False
    
    # Get detailed information
    details = get_movie_details(tmdb_id)
    if not details:
        return False
    
    try:
        # Prepare movie data
        release_date = details.get('release_date') or None
        
        movie = Movie.objects.create(
            title=details.get('title', ''),
            description=details.get('overview', ''),
            release_date=release_date,
            tmdb_id=tmdb_id,
            imdb_id=details.get('imdb_id'),
            runtime=details.get('runtime'),
            budget=details.get('budget', 0),
            revenue=details.get('revenue', 0),
            poster_url=f"https://image.tmdb.org/t/p/w500{details['poster_path']}" if details.get('poster_path') else None,
            backdrop_url=f"https://image.tmdb.org/t/p/original{details['backdrop_path']}" if details.get('backdrop_path') else None,
        )
        
        # Add genres
        if details.get('genres'):
            genres = create_or_update_genres(details['genres'])
            movie.genres.set(genres)
        
        # Extract year for display
        year = release_date.split('-')[0] if release_date else 'N/A'
        print(f"  ✓ Imported: {movie.title} ({year})")
        return True
        
    except Exception as e:
        print(f"  ✗ Error importing movie {tmdb_id}: {str(e)}")
        return False

def main():
    print("=" * 60)
    print("Importing 100 Popular Movies from TMDB")
    print("=" * 60)
    
    # Get 100 movies (5 pages × 20 movies)
    print("\n📡 Fetching popular movies from TMDB...")
    movies = get_popular_movies(pages=5)
    print(f"\n📊 Found {len(movies)} movies to import\n")
    
    # Import movies
    imported_count = 0
    skipped_count = 0
    
    for i, movie_data in enumerate(movies, 1):
        print(f"[{i}/{len(movies)}] Processing: {movie_data.get('title')}...")
        if import_movie(movie_data):
            imported_count += 1
        else:
            skipped_count += 1
    
    # Summary
    print("\n" + "=" * 60)
    print("Import Summary")
    print("=" * 60)
    print(f"✓ Successfully imported: {imported_count} movies")
    print(f"⊙ Skipped (already exist): {skipped_count} movies")
    print(f"📊 Total movies in database: {Movie.objects.count()}")
    print(f"🎭 Total genres in database: {Genre.objects.count()}")
    print("=" * 60)

if __name__ == '__main__':
    main()
