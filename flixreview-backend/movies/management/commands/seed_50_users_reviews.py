from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from movies.models import Movie, Genre
from reviews.models import Review

User = get_user_model()


class Command(BaseCommand):
    help = 'Create 50 users with unique reviews'

    def handle(self, *args, **options):
        self.stdout.write("=" * 50)
        self.stdout.write("Creating 50 Users with Unique Reviews")
        self.stdout.write("=" * 50)

        # Create admin user if it doesn't exist
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@flixreview.com',
                password='admin123'
            )
            self.stdout.write("Created admin user: admin@flixreview.com")

        # Create 50 users
        self.stdout.write("\nCreating 50 users...")
        created_users = []
        for i in range(1, 51):
            username = f'user{i:02d}'
            email = f'user{i:02d}@example.com'

            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password='user123'
                )
                created_users.append(user)
                self.stdout.write(f"Created user: {username}")
            else:
                user = User.objects.get(username=username)
                created_users.append(user)

        # Create genres if they don't exist
        genres_data = [
            {'name': 'Action', 'slug': 'action'},
            {'name': 'Drama', 'slug': 'drama'},
            {'name': 'Comedy', 'slug': 'comedy'},
            {'name': 'Sci-Fi', 'slug': 'scifi'},
            {'name': 'Thriller', 'slug': 'thriller'},
        ]

        genre_objects = {}
        for genre_data in genres_data:
            genre, created = Genre.objects.get_or_create(
                slug=genre_data['slug'],
                defaults={'name': genre_data['name'], 'description': f'{genre_data["name"]} movies'}
            )
            genre_objects[genre_data['slug']] = genre

        # Create reviews for each user
        self.stdout.write("\nCreating unique reviews...")

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
        ]

        movies = list(Movie.objects.all())
        if not movies:
            self.stdout.write("No movies found. Skipping review creation.")
            return

        reviews_created = 0
        for i, user in enumerate(created_users):
            movie_index = i % len(movies)
            movie = movies[movie_index]

            review_content = review_templates[i % len(review_templates)]
            rating = (i % 5) + 1

            if not Review.objects.filter(user=user, movie=movie).exists():
                Review.objects.create(
                    user=user,
                    movie=movie,
                    rating=rating,
                    content=review_content
                )
                reviews_created += 1
                self.stdout.write(f"Created review by {user.username} for '{movie.title}'")

        self.stdout.write("\n" + "=" * 50)
        self.stdout.write("Seeding completed!")
        self.stdout.write("=" * 50)
        self.stdout.write(f"\nUsers: {User.objects.count()}")
        self.stdout.write(f"Genres: {Genre.objects.count()}")
        self.stdout.write(f"Movies: {Movie.objects.count()}")
        self.stdout.write(f"Reviews: {Review.objects.count()}")
        self.stdout.write(f"New reviews created: {reviews_created}")