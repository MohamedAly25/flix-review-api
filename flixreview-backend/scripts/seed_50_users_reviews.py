"""
Simple Database Seeding Script
Creates admin user and sample users
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movie_review_api.settings')
django.setup()

from django.contrib.auth import get_user_model
from movies.models import Movie, Genre
from reviews.models import Review
from datetime import date

User = get_user_model()

print("=" * 50)
print("Seeding Database with Sample Data")
print("=" * 50)

# Create superuser
print("\nCreating Admin User...")
if not User.objects.filter(username='admin').exists():
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@flixreview.com',
        password='admin123'
    )
    print("Admin user created: admin@flixreview.com (password: admin123)")
else:
    admin = User.objects.get(username='admin')
    print("Admin user already exists")

# Create sample users (50 users)
print("\nCreating 50 Sample Users...")
sample_users = []

# Create 50 users
for i in range(1, 51):
    sample_users.append({
        'username': f'user{i:02d}',  # user01, user02, ..., user50
        'email': f'user{i:02d}@example.com',
        'password': 'user123'
    })

created_users = []
for user_data in sample_users:
    if not User.objects.filter(username=user_data['username']).exists():
        user = User.objects.create_user(**user_data)
        created_users.append(user)
        print(f"Created user: {user_data['username']}")
    else:
        user = User.objects.get(username=user_data['username'])
        created_users.append(user)
        print(f"User {user_data['username']} already exists")

# Create sample reviews - one unique review per user
print("\nCreating Unique Reviews for Each User...")

# Get all movies
movies = list(Movie.objects.all())
if not movies:
    print("No movies found. Skipping review creation.")
else:
    # Review templates with different content
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

    reviews_created = 0
    for i, user in enumerate(created_users):
        # Assign each user to a different movie (cycle through movies if needed)
        movie_index = i % len(movies)
        movie = movies[movie_index]

        # Get unique review content for this user
        review_content = review_templates[i % len(review_templates)]
        rating = (i % 5) + 1  # Ratings from 1 to 5

        # Create review if it doesn't exist
        if not Review.objects.filter(user=user, movie=movie).exists():
            Review.objects.create(
                user=user,
                movie=movie,
                rating=rating,
                content=review_content
            )
            reviews_created += 1
            print(f"Created review by {user.username} for '{movie.title}' (rating: {rating})")
        else:
            print(f"Review already exists for {user.username} on '{movie.title}'")

    print(f"\nCreated {reviews_created} new reviews")

# Create genres
print("\nCreating Genres...")
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
    status = "Created" if created else "Exists"
    print(f"{status}: {genre_data['name']}")

print("\n" + "=" * 50)
print("Database seeding completed!")
print("=" * 50)
print("\nSummary:")
print(f"Users: {User.objects.count()}")
print(f"Genres: {Genre.objects.count()}")
print(f"Movies: {Movie.objects.count()}")
print(f"Reviews: {Review.objects.count()}")
print("\nLogin Credentials:")
print("Admin: admin@flixreview.com / admin123")
print("Users: john@example.com / user123")
print("       sarah@example.com / user123")
print("       mike@example.com / user123")
print("=" * 50)