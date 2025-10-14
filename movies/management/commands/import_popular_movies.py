"""
Management command to import popular movies from TMDB

Usage:
    python manage.py import_popular_movies
    python manage.py import_popular_movies --pages 5
    python manage.py import_popular_movies --pages 2 --force
"""
from django.core.management.base import BaseCommand, CommandError
from movies.services import TMDBService
import time


class Command(BaseCommand):
    help = 'Import popular movies from TMDB'

    def add_arguments(self, parser):
        parser.add_argument(
            '--pages',
            type=int,
            default=1,
            help='Number of pages to import (20 movies per page)'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force re-import even if movies already exist'
        )
        parser.add_argument(
            '--delay',
            type=float,
            default=0.5,
            help='Delay between requests in seconds (default: 0.5)'
        )

    def handle(self, *args, **options):
        pages = options['pages']
        force = options['force']
        delay = options['delay']
        
        if pages < 1 or pages > 10:
            raise CommandError('Pages must be between 1 and 10')
        
        self.stdout.write(f'Importing {pages} page(s) of popular movies from TMDB...')
        
        # Initialize TMDB service
        service = TMDBService()
        if not service.is_enabled():
            raise CommandError(
                'TMDB is not configured. Please set TMDB_API_KEY in your environment.'
            )
        
        total_imported = 0
        total_skipped = 0
        total_failed = 0
        
        for page in range(1, pages + 1):
            self.stdout.write(f'\nProcessing page {page}...')
            
            # Get popular movies for this page
            movies = service.get_popular_movies(page=page)
            
            if not movies:
                self.stdout.write(
                    self.style.WARNING(f'No movies found on page {page}')
                )
                continue
            
            # Import each movie
            for movie_data in movies:
                tmdb_id = movie_data['tmdb_id']
                title = movie_data['title']
                
                # Check if movie already exists
                from movies.models import Movie
                existing = Movie.objects.filter(tmdb_id=tmdb_id).first()
                
                if existing and not force:
                    self.stdout.write(f'  ⊙ Skipped: {title} (already exists)')
                    total_skipped += 1
                    continue
                
                # Import the movie
                result = service.import_movie(tmdb_id)
                
                if result:
                    action = "↻" if result.get('created') is False else "✓"
                    self.stdout.write(f'  {action} Imported: {title}')
                    total_imported += 1
                else:
                    self.stdout.write(
                        self.style.WARNING(f'  ✗ Failed: {title}')
                    )
                    total_failed += 1
                
                # Rate limiting delay
                if delay > 0:
                    time.sleep(delay)
        
        # Summary
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write(
            self.style.SUCCESS(
                f'✓ Imported: {total_imported} movies'
            )
        )
        if total_skipped > 0:
            self.stdout.write(f'⊙ Skipped: {total_skipped} movies (already exist)')
        if total_failed > 0:
            self.stdout.write(
                self.style.WARNING(f'✗ Failed: {total_failed} movies')
            )
        self.stdout.write('=' * 50)
