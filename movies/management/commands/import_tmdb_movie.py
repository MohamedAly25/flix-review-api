"""
Management command to import a single movie from TMDB by ID

Usage:
    python manage.py import_tmdb_movie --tmdb-id 550
    python manage.py import_tmdb_movie --tmdb-id 550 --force
"""
from django.core.management.base import BaseCommand, CommandError
from movies.services import TMDBService


class Command(BaseCommand):
    help = 'Import a movie from TMDB by its TMDB ID'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tmdb-id',
            type=int,
            required=True,
            help='TMDB movie ID to import'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force re-import even if movie already exists'
        )

    def handle(self, *args, **options):
        tmdb_id = options['tmdb_id']
        force = options['force']
        
        self.stdout.write(f'Importing movie from TMDB ID: {tmdb_id}...')
        
        # Initialize TMDB service
        service = TMDBService()
        if not service.is_enabled():
            raise CommandError(
                'TMDB is not configured. Please set TMDB_API_KEY in your environment.'
            )
        
        # Check if movie already exists
        from movies.models import Movie
        existing = Movie.objects.filter(tmdb_id=tmdb_id).first()
        
        if existing and not force:
            self.stdout.write(
                self.style.WARNING(
                    f'Movie "{existing.title}" (ID: {existing.id}) already exists with TMDB ID {tmdb_id}.'
                )
            )
            self.stdout.write('Use --force to re-import and update the movie.')
            return
        
        # Import the movie
        result = service.import_movie(tmdb_id)
        
        if result:
            action = "Updated" if result.get('created') is False else "Created"
            self.stdout.write(
                self.style.SUCCESS(
                    f'{action} movie: {result["title"]} (ID: {result["id"]}, TMDB: {result["tmdb_id"]})'
                )
            )
        else:
            raise CommandError(f'Failed to import movie with TMDB ID {tmdb_id}')
