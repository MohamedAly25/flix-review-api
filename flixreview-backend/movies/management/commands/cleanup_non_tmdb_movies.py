from django.core.management.base import BaseCommand
from movies.models import Movie


class Command(BaseCommand):
    help = 'Delete movies that were not imported from TMDB (movies without tmdb_id)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Skip confirmation prompt',
        )

    def handle(self, *args, **options):
        # Get movies without TMDB ID
        movies_to_delete = Movie.objects.filter(tmdb_id__isnull=True)

        count = movies_to_delete.count()

        if count == 0:
            self.stdout.write(
                self.style.SUCCESS('No movies found without TMDB ID. All movies are imported from TMDB.')
            )
            return

        self.stdout.write(
            self.style.WARNING(f'Found {count} movies without TMDB ID that will be deleted:')
        )

        # Show movies that will be deleted
        for movie in movies_to_delete[:10]:  # Show first 10
            self.stdout.write(f'  - {movie.title} (ID: {movie.id})')

        if count > 10:
            self.stdout.write(f'  ... and {count - 10} more movies')

        if options['dry_run']:
            self.stdout.write(
                self.style.SUCCESS(f'Dry run completed. Would delete {count} movies.')
            )
            return

        # Confirm deletion unless --force is used
        if not options['force']:
            confirm = input(f'\nAre you sure you want to delete {count} movies? (yes/no): ')
            if confirm.lower() not in ['yes', 'y']:
                self.stdout.write(self.style.WARNING('Operation cancelled.'))
                return

        # Delete the movies
        deleted_count, _ = movies_to_delete.delete()

        self.stdout.write(
            self.style.SUCCESS(f'Successfully deleted {deleted_count} movies without TMDB ID.')
        )