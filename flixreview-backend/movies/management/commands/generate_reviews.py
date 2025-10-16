"""
Management command to generate 1000 reviews distributed across different genres

Usage:
    python manage.py generate_reviews --count 1000
"""
from django.core.management.base import BaseCommand, CommandError
from movies.models import Movie, Genre
from reviews.models import Review
from django.contrib.auth import get_user_model
import random
from datetime import datetime, timedelta


class Command(BaseCommand):
    help = 'Generate reviews distributed across different genres'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=1000,
            help='Number of reviews to generate (default: 1000)'
        )

    def handle(self, *args, **options):
        count = options['count']

        if count <= 0:
            raise CommandError('Count must be greater than 0')

        User = get_user_model()

        # Get all users (excluding admin)
        users = list(User.objects.exclude(username='admin'))
        if not users:
            raise CommandError('No users found to create reviews')

        # Get all movies
        movies = list(Movie.objects.all())
        if not movies:
            raise CommandError('No movies found to review')

        self.stdout.write(f'Generating {count} reviews across different genres...')

        # Review templates for variety
        review_templates = [
            "Amazing movie! The plot was incredible and kept me engaged throughout.",
            "Great cinematography and excellent acting. Highly recommended!",
            "One of the best films I've seen this year. Outstanding performance.",
            "The storyline was compelling and the ending was surprising.",
            "Fantastic direction and beautiful visuals. A must-watch!",
            "Excellent script and character development. Very impressive.",
            "Thrilling and suspenseful. Couldn't take my eyes off the screen.",
            "Heartwarming story with great emotional depth.",
            "Innovative and creative filmmaking at its best.",
            "Powerful message delivered through excellent storytelling.",
            "The special effects were mind-blowing. A visual masterpiece.",
            "Brilliant performances by the entire cast.",
            "Thought-provoking and intellectually stimulating.",
            "Captivating from start to finish. Time flew by!",
            "Masterful storytelling that keeps you guessing.",
            "Emotionally moving and beautifully crafted.",
            "Innovative approach to the genre. Very refreshing.",
            "The soundtrack perfectly complemented the visuals.",
            "Intense and gripping throughout the entire runtime.",
            "A cinematic experience that stays with you long after.",
            "Perfectly balanced mix of action and emotion.",
            "The dialogue was sharp and the pacing was perfect.",
            "Visually stunning with a compelling narrative.",
            "A true masterpiece of modern cinema.",
            "Engaging characters and a plot that surprises.",
            "Exceptional production values and attention to detail.",
            "The chemistry between actors was palpable.",
            "A rollercoaster of emotions and excitement.",
            "Brilliantly directed with innovative techniques.",
            "A film that challenges your perceptions.",
            "Beautifully shot with incredible attention to detail.",
            "The themes explored were profound and meaningful.",
            "A perfect blend of humor and heart.",
            "Intensely suspenseful and utterly captivating.",
            "Groundbreaking in its approach to storytelling.",
            "The performances elevated an already great script.",
            "A visually spectacular and emotionally resonant film.",
            "Cleverly written with unexpected twists.",
            "A cinematic journey that's both thrilling and moving.",
            "Exceptional craftsmanship in every department.",
            "The film's atmosphere was immersive and haunting.",
            "A powerful exploration of human emotions.",
            "Technically brilliant with a strong narrative core.",
            "The film's energy was infectious and exciting.",
            "A masterful blend of genres and styles.",
            "Deeply moving with universal themes.",
            "Innovative visuals that push cinematic boundaries.",
            "The film's intelligence shines through in every scene.",
            "A perfect storm of talent and creativity.",
            "Emotionally charged and intellectually satisfying.",
            "A film that demands and rewards your attention.",
            "Visually poetic with a compelling human story.",
            "The film's rhythm and pacing were impeccable.",
            "A profound meditation on important themes.",
            "Technically innovative and narratively bold.",
            "The film's emotional impact is lasting and powerful.",
        ]

        # Get genre distribution for balanced reviews
        genres = Genre.objects.all()
        genre_movies = {}
        total_movies = 0

        for genre in genres:
            genre_movies_list = list(Movie.objects.filter(genres__name=genre.name))
            if genre_movies_list:
                genre_movies[genre.name] = genre_movies_list
                total_movies += len(genre_movies_list)

        if not genre_movies:
            raise CommandError('No movies with genres found')

        # Calculate target reviews per genre (roughly proportional to movie count)
        target_reviews_per_genre = {}
        for genre_name, movies_list in genre_movies.items():
            # Aim for roughly proportional distribution, but ensure minimum reviews
            proportion = len(movies_list) / total_movies
            target = max(50, int(count * proportion))  # Minimum 50 reviews per genre
            target_reviews_per_genre[genre_name] = min(target, len(movies_list) * 3)  # Max 3 reviews per movie

        # Adjust total target if needed
        total_target = sum(target_reviews_per_genre.values())
        if total_target > count:
            # Scale down proportionally
            scale_factor = count / total_target
            for genre_name in target_reviews_per_genre:
                target_reviews_per_genre[genre_name] = int(target_reviews_per_genre[genre_name] * scale_factor)

        self.stdout.write(f'Target reviews per genre: {target_reviews_per_genre}')

        # Generate reviews
        reviews_created = 0
        genre_review_counts = {genre_name: 0 for genre_name in target_reviews_per_genre}

        # Create reviews for each genre
        for genre_name, target_count in target_reviews_per_genre.items():
            movies_in_genre = genre_movies[genre_name]
            genre_reviews_created = 0

            self.stdout.write(f'Creating reviews for {genre_name}...')

            while genre_reviews_created < target_count and reviews_created < count:
                # Pick random movie from this genre
                movie = random.choice(movies_in_genre)

                # Pick random user
                user = random.choice(users)

                # Check if review already exists
                if Review.objects.filter(user=user, movie=movie).exists():
                    continue

                # Generate review data
                rating = random.randint(1, 5)
                content = random.choice(review_templates)

                # Create review
                Review.objects.create(
                    user=user,
                    movie=movie,
                    rating=rating,
                    content=content
                )

                genre_reviews_created += 1
                reviews_created += 1

                if reviews_created % 100 == 0:
                    self.stdout.write(f'Created {reviews_created} reviews...')

            genre_review_counts[genre_name] = genre_reviews_created

        # Summary
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(
            self.style.SUCCESS(f'✓ Successfully created {reviews_created} reviews!')
        )

        self.stdout.write('\nReviews created by genre:')
        for genre_name, count in genre_review_counts.items():
            self.stdout.write(f'  {genre_name}: {count} reviews')

        final_total = Review.objects.count()
        self.stdout.write(f'\nTotal reviews in database: {final_total}')
        self.stdout.write('=' * 60)