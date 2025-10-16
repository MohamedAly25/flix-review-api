from django.core.management.base import BaseCommand, CommandError
from movies.services.tmdb_service import TMDBService
import time


class Command(BaseCommand):
    help = 'Import movies directly from Wikipedia by title'

    def add_arguments(self, parser):
        parser.add_argument(
            'titles',
            nargs='+',
            help='Movie titles to import from Wikipedia',
        )
        parser.add_argument(
            '--delay',
            type=float,
            default=1.0,
            help='Delay between imports in seconds (default: 1.0)',
        )

    def handle(self, *args, **options):
        titles = options['titles']
        delay = options['delay']

        if delay < 0:
            raise CommandError('Delay must be non-negative')

        self.stdout.write(f'Importing {len(titles)} movie(s) from Wikipedia...')

        # Initialize TMDB service
        service = TMDBService()

        total_imported = 0
        total_failed = 0

        for title in titles:
            self.stdout.write(f'\nImporting: {title}')

            # Import the movie from Wikipedia
            result = service.import_movie_from_wikipedia(title)

            if result:
                action = "✓ Created" if result.get('created') else "↻ Updated"
                self.stdout.write(f'  {action}: {title} (Wikipedia)')
                total_imported += 1
            else:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Failed: {title}')
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
        if total_failed > 0:
            self.stdout.write(
                self.style.ERROR(f'✗ Failed: {total_failed} movies')
            )
        self.stdout.write('=' * 50)