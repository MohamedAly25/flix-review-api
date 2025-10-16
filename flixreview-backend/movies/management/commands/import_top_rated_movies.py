"""
Management command to import top-rated movies from TMDB

Usage:
    python manage.py import_top_rated_movies                    # Import 2000 movies (100 pages)
    python manage.py import_top_rated_movies --pages 5         # Import 100 movies (5 pages)
    python manage.py import_top_rated_movies --pages 2 --force # Force re-import 40 movies
"""
from django.core.management.base import BaseCommand, CommandError
from movies.services import TMDBService
import time


class Command(BaseCommand):
    help = 'Import top-rated movies from TMDB'

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

    def handle(self, *args, **options):
        pages = options['pages']
        force = options['force']
        delay = options['delay']

        if pages < 1 or pages > 500:
            raise CommandError('Pages must be between 1 and 500')

        self.stdout.write(f'Importing {pages} page(s) of top-rated movies from TMDB...')

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

            # Get top-rated movies for this page
            movies = service.get_top_rated_movies(page=page)

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