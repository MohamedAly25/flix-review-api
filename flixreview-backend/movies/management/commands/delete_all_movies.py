from django.core.management.base import BaseCommand
from movies.models import Movie


class Command(BaseCommand):
    help = 'Delete all movies from the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Skip confirmation prompt'
        )

    def handle(self, *args, **options):
        force = options['force']

        # Get total count
        total_movies = Movie.objects.count()

        if total_movies == 0:
            self.stdout.write(
                self.style.SUCCESS('No movies found in database.')
            )
            return

        self.stdout.write(
            self.style.WARNING(f'Found {total_movies} movies in database.')
        )

        # Confirm deletion unless --force is used
        if not force:
            confirm = input(f'\nAre you sure you want to delete ALL {total_movies} movies? (yes/no): ')
            if confirm.lower() not in ['yes', 'y']:
                self.stdout.write(self.style.WARNING('Operation cancelled.'))
                return

        # Delete all movies
        deleted_count, _ = Movie.objects.all().delete()

        self.stdout.write(
            self.style.SUCCESS(f'Successfully deleted {deleted_count} movies from database.')
        )