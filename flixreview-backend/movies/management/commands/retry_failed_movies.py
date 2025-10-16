"""
Management command to retry importing failed movies from TMDB

Usage:
    python manage.py retry_failed_movies --tmdb-ids "1498658,1558545,1336473"
    python manage.py retry_failed_movies --pages "1,2,3" --delay 1.0
"""
from django.core.management.base import BaseCommand, CommandError
from movies.services import TMDBService
import time


class Command(BaseCommand):
    help = 'Retry importing movies that previously failed from TMDB'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tmdb-ids',
            type=str,
            help='Comma-separated list of TMDB IDs to retry (e.g., "1498658,1558545")'
        )
        parser.add_argument(
            '--pages',
            type=str,
            help='Comma-separated list of pages to retry (e.g., "1,5,10")'
        )
        parser.add_argument(
            '--delay',
            type=float,
            default=1.0,
            help='Delay between requests in seconds (default: 1.0)'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force re-import even if movies already exist'
        )

    def handle(self, *args, **options):
        tmdb_ids_str = options.get('tmdb_ids')
        pages_str = options.get('pages')
        delay = options['delay']
        force = options['force']

        if not tmdb_ids_str and not pages_str:
            raise CommandError('Must specify either --tmdb-ids or --pages')

        # Initialize TMDB service
        service = TMDBService()
        if not service.is_enabled():
            raise CommandError(
                'TMDB is not configured. Please set TMDB_API_KEY in your environment.'
            )

        total_imported = 0
        total_skipped = 0
        total_failed = 0

        # Process specific TMDB IDs
        if tmdb_ids_str:
            try:
                tmdb_ids = [int(id.strip()) for id in tmdb_ids_str.split(',')]
            except ValueError:
                raise CommandError('Invalid TMDB IDs format. Use comma-separated numbers like "1498658,1558545"')

            self.stdout.write(f'Retrying import for {len(tmdb_ids)} specific TMDB IDs...')

            for tmdb_id in tmdb_ids:
                # Check if movie already exists
                from movies.models import Movie
                existing = Movie.objects.filter(tmdb_id=tmdb_id).first()

                if existing and not force:
                    self.stdout.write(f'  ⊙ Skipped: TMDB ID {tmdb_id} (already exists as "{existing.title}")')
                    total_skipped += 1
                    continue

                # Try to get movie title first for better logging
                movie_details = service.get_movie_details(tmdb_id)
                title = movie_details.get('title', f'TMDB ID {tmdb_id}') if movie_details else f'TMDB ID {tmdb_id}'

                # Import the movie
                result = service.import_movie(tmdb_id)

                if result:
                    action = "↻" if result.get('created') is False else "✓"
                    self.stdout.write(f'  {action} Imported: {title}')
                    total_imported += 1
                else:
                    self.stdout.write(
                        self.style.ERROR(f'  ✗ Failed: {title} (TMDB ID: {tmdb_id})')
                    )
                    total_failed += 1

                # Rate limiting delay
                if delay > 0:
                    time.sleep(delay)

        # Process pages
        elif pages_str:
            try:
                page_list = [int(p.strip()) for p in pages_str.split(',')]
            except ValueError:
                raise CommandError('Invalid pages format. Use comma-separated numbers like "1,5,10"')

            self.stdout.write(f'Retrying import for {len(page_list)} pages with enhanced error handling...')

            for page in page_list:
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

                # Import the movie with retry logic
                result = service.import_movie(tmdb_id)
                
                if result:
                    action = "↻" if result.get('created') is False else "✓"
                    source = result.get('source', 'TMDB')
                    self.stdout.write(f'  {action} Imported: {title} ({source})')
                    total_imported += 1
                else:
                    self.stdout.write(
                        self.style.ERROR(f'  ✗ Failed: {title} (TMDB ID: {tmdb_id})')
                    )
                    total_failed += 1                    # Rate limiting delay
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
                self.style.ERROR(f'✗ Failed: {total_failed} movies')
            )
        self.stdout.write('=' * 50)