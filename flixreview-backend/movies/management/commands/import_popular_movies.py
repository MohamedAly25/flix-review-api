"""
Management command to import popular movies from TMDB

Usage:
    python manage.py import_popular_movies                    # Import 2000 movies (100 pages)
    python manage.py import_popular_movies --pages 5         # Import 100 movies (5 pages)
    python manage.py import_popular_movies --pages 2 --force # Force re-import 40 movies
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
            default=100,  # Default to 100 pages (2000 movies)
            help='Number of pages to import (20 movies per page, default: 100)'
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
        parser.add_argument(
            '--retry-failed',
            action='store_true',
            help='Retry importing movies that previously failed'
        )
        parser.add_argument(
            '--failed-pages',
            type=str,
            help='Comma-separated list of pages to retry (e.g., "1,5,10")'
        )

    def handle(self, *args, **options):
        pages = options['pages']
        force = options['force']
        delay = options['delay']
        retry_failed = options['retry_failed']
        failed_pages = options.get('failed_pages')
        
        if retry_failed and failed_pages:
            # Parse failed pages
            try:
                page_list = [int(p.strip()) for p in failed_pages.split(',')]
                pages = len(page_list)
                self.stdout.write(f'Retrying import for {pages} specific pages: {page_list}')
            except ValueError:
                raise CommandError('Invalid failed-pages format. Use comma-separated numbers like "1,5,10"')
        elif retry_failed:
            # Default retry behavior - try pages that might have failed
            page_list = list(range(1, pages + 1))
        else:
            page_list = list(range(1, pages + 1))
        
        if pages < 1 or pages > 500:
            raise CommandError('Pages must be between 1 and 500')
        
        if retry_failed:
            self.stdout.write(f'Retrying import of {pages} page(s) of popular movies from TMDB with enhanced error handling...')
        else:
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
        
        for page_idx, page in enumerate(page_list):
            if retry_failed and failed_pages:
                current_page = page
            else:
                current_page = page_idx + 1
                
            self.stdout.write(f'\nProcessing page {current_page}...')
            
            # Get popular movies for this page
            movies = service.get_popular_movies(page=current_page)
            
            if not movies:
                self.stdout.write(
                    self.style.WARNING(f'No movies found on page {current_page}')
                )
                continue
            
            # Import each movie
            for movie_data in movies:
                tmdb_id = movie_data['tmdb_id']
                title = movie_data['title']
                
                # Check if movie already exists
                from movies.models import Movie
                existing = Movie.objects.filter(tmdb_id=tmdb_id).first()
                
                if existing and not force and not retry_failed:
                    self.stdout.write(f'  ⊙ Skipped: {title} (already exists)')
                    total_skipped += 1
                    continue
                
                # Import the movie
                result = service.import_movie(tmdb_id)
                
                if result:
                    action = "↻" if result.get('created') is False else "✓"
                    source = result.get('source', 'TMDB')
                    self.stdout.write(f'  {action} Imported: {title} ({source})')
                    total_imported += 1
                else:
                    # Try to get more specific error information
                    error_msg = f"Failed to import: {title} (TMDB ID: {tmdb_id})"
                    self.stdout.write(
                        self.style.ERROR(f'  ✗ {error_msg}')
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
