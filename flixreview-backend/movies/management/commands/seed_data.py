from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from movies.models import Movie, Genre
from reviews.models import Review
from datetime import date

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed database with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write("=" * 70)
        self.stdout.write(self.style.SUCCESS('🌱 Seeding Database with Sample Data'))
        self.stdout.write("=" * 70)

        # Create admin user
        self.stdout.write("\n👤 Creating Admin User...")
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@flixreview.com',
                password='admin123'
            )
            self.stdout.write(self.style.SUCCESS('  ✅ Admin user created: admin@flixreview.com (password: admin123)'))
        else:
            self.stdout.write(self.style.WARNING('  ⚠️  Admin user already exists'))

        # Create sample users
        self.stdout.write("\n👥 Creating Sample Users...")
        sample_users = [
            {'username': 'john', 'email': 'john@example.com', 'password': 'user123'},
            {'username': 'sarah', 'email': 'sarah@example.com', 'password': 'user123'},
            {'username': 'mike', 'email': 'mike@example.com', 'password': 'user123'},
        ]

        for user_data in sample_users:
            if not User.objects.filter(username=user_data['username']).exists():
                User.objects.create_user(**user_data)
                self.stdout.write(self.style.SUCCESS(f"  ✅ Created user: {user_data['username']}"))
            else:
                self.stdout.write(self.style.WARNING(f"  ⚠️  User {user_data['username']} already exists"))

        # Create genres
        self.stdout.write("\n🎭 Creating Genres...")
        genres_data = [
            {'name': 'Action', 'slug': 'action', 'description': 'Fast-paced movies with lots of excitement'},
            {'name': 'Drama', 'slug': 'drama', 'description': 'Serious, plot-driven presentations'},
            {'name': 'Comedy', 'slug': 'comedy', 'description': 'Movies designed to make you laugh'},
            {'name': 'Sci-Fi', 'slug': 'scifi', 'description': 'Science fiction and futuristic themes'},
            {'name': 'Thriller', 'slug': 'thriller', 'description': 'Suspenseful and intense movies'},
            {'name': 'Horror', 'slug': 'horror', 'description': 'Movies designed to frighten and scare'},
            {'name': 'Romance', 'slug': 'romance', 'description': 'Love stories and romantic themes'},
        ]

        genre_objects = {}
        for genre_data in genres_data:
            genre, created = Genre.objects.get_or_create(
                slug=genre_data['slug'],
                defaults={'name': genre_data['name'], 'description': genre_data['description']}
            )
            genre_objects[genre_data['slug']] = genre
            if created:
                self.stdout.write(self.style.SUCCESS(f"  ✅ Created: {genre_data['name']}"))
            else:
                self.stdout.write(self.style.WARNING(f"  ⚠️  Exists: {genre_data['name']}"))

        # Create sample movies
        self.stdout.write("\n🎬 Creating Sample Movies...")
        movies_data = [
            {
                'title': 'The Matrix',
                'description': 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
                'release_date': date(1999, 3, 31),
                'poster_url': 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
                'tmdb_id': 603,
                'imdb_id': 'tt0133093',
                'runtime': 136,
                'budget': 63000000,
                'revenue': 463517383,
                'genres_slugs': ['action', 'scifi'],
            },
            {
                'title': 'Inception',
                'description': 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
                'release_date': date(2010, 7, 16),
                'poster_url': 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
                'tmdb_id': 27205,
                'imdb_id': 'tt1375666',
                'runtime': 148,
                'budget': 160000000,
                'revenue': 829895144,
                'genres_slugs': ['action', 'scifi', 'thriller'],
            },
            {
                'title': 'The Shawshank Redemption',
                'description': 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
                'release_date': date(1994, 9, 23),
                'poster_url': 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
                'tmdb_id': 278,
                'imdb_id': 'tt0111161',
                'runtime': 142,
                'budget': 25000000,
                'revenue': 28341469,
                'genres_slugs': ['drama'],
            },
            {
                'title': 'Pulp Fiction',
                'description': 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
                'release_date': date(1994, 10, 14),
                'poster_url': 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
                'tmdb_id': 680,
                'imdb_id': 'tt0110912',
                'runtime': 154,
                'budget': 8000000,
                'revenue': 213928762,
                'genres_slugs': ['thriller', 'drama'],
            },
            {
                'title': 'The Dark Knight',
                'description': 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
                'release_date': date(2008, 7, 18),
                'poster_url': 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
                'tmdb_id': 155,
                'imdb_id': 'tt0468569',
                'runtime': 152,
                'budget': 185000000,
                'revenue': 1004558444,
                'genres_slugs': ['action', 'drama', 'thriller'],
            },
        ]

        for movie_data in movies_data:
            genres_slugs = movie_data.pop('genres_slugs')
            
            if not Movie.objects.filter(title=movie_data['title']).exists():
                movie = Movie.objects.create(**movie_data)
                
                # Add genres
                for slug in genres_slugs:
                    if slug in genre_objects:
                        movie.genres.add(genre_objects[slug])
                
                self.stdout.write(self.style.SUCCESS(f"  ✅ Created: {movie.title}"))
            else:
                self.stdout.write(self.style.WARNING(f"  ⚠️  Exists: {movie_data['title']}"))

        # Create sample reviews
        self.stdout.write("\n⭐ Creating Sample Reviews...")
        users = list(User.objects.filter(username__in=['john', 'sarah', 'mike']))
        movies = list(Movie.objects.all())

        if users and movies:
            reviews_data = [
                {'user': users[0], 'movie': movies[0], 'rating': 5, 'content': 'Mind-blowing! One of the best sci-fi movies ever made.'},
                {'user': users[1], 'movie': movies[0], 'rating': 4, 'content': 'Great movie with amazing visual effects.'},
                {'user': users[0], 'movie': movies[1], 'rating': 5, 'content': 'Christopher Nolan at his best! Complex but brilliant.'},
                {'user': users[2], 'movie': movies[1], 'rating': 4, 'content': 'Amazing cinematography and storyline.'},
                {'user': users[1], 'movie': movies[2], 'rating': 5, 'content': 'A masterpiece. Best movie of all time!'},
                {'user': users[2], 'movie': movies[3], 'rating': 5, 'content': 'Tarantino is a genius. Loved every minute.'},
            ]
            
            for review_data in reviews_data:
                if not Review.objects.filter(user=review_data['user'], movie=review_data['movie']).exists():
                    Review.objects.create(**review_data)
                    self.stdout.write(self.style.SUCCESS(f"  ✅ Created review by {review_data['user'].username} for {review_data['movie'].title}"))
                else:
                    self.stdout.write(self.style.WARNING(f"  ⚠️  Review already exists"))

        self.stdout.write("\n" + "=" * 70)
        self.stdout.write(self.style.SUCCESS('✅ Database seeding completed!'))
        self.stdout.write("=" * 70)
        self.stdout.write("\n📊 Summary:")
        self.stdout.write(f"  👤 Users: {User.objects.count()}")
        self.stdout.write(f"  🎭 Genres: {Genre.objects.count()}")
        self.stdout.write(f"  🎬 Movies: {Movie.objects.count()}")
        self.stdout.write(f"  ⭐ Reviews: {Review.objects.count()}")
        self.stdout.write("\n🔐 Login Credentials:")
        self.stdout.write("  Admin: admin@flixreview.com / admin123")
        self.stdout.write("  Users: john@example.com / user123")
        self.stdout.write("         sarah@example.com / user123")
        self.stdout.write("         mike@example.com / user123")
        self.stdout.write("=" * 70)
