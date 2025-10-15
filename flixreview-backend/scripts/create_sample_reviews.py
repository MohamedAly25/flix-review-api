"""
Create sample reviews for testing recommendations
"""
import os
import sys
import django
import random
from decimal import Decimal

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movie_review_api.settings')
django.setup()

from django.contrib.auth import get_user_model
from movies.models import Movie
from reviews.models import Review

User = get_user_model()

print("🎬 Creating Sample Reviews...")
print("=" * 60)

# Get or create test users
users = []
for i in range(1, 4):
    user, created = User.objects.get_or_create(
        username=f'testuser{i}',
        email=f'testuser{i}@example.com',
        defaults={
            'first_name': f'Test',
            'last_name': f'User{i}',
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"✅ Created user: {user.username}")
    else:
        print(f"📌 User exists: {user.username}")
    users.append(user)

# Get movies to review
movies = list(Movie.objects.all()[:20])  # First 20 movies
print(f"\n📝 Found {len(movies)} movies to review")

# Sample review texts
review_templates = {
    5: [
        "Absolutely masterpiece! One of the best films I've ever seen.",
        "Perfect in every way. Brilliant storytelling and performances.",
        "A true cinematic gem. Highly recommended!",
        "Flawless execution. This movie sets the bar high.",
    ],
    4: [
        "Great movie with solid performances. Highly enjoyable.",
        "Very good film with minor flaws. Worth watching.",
        "Impressive cinematography and acting. Recommended.",
        "Strong storyline with excellent character development.",
    ],
    3: [
        "Decent movie. Had its moments but nothing special.",
        "Average film with some good scenes. Watchable.",
        "Mixed feelings. Some parts were great, others not so much.",
        "Okay movie. Neither great nor terrible.",
    ],
    2: [
        "Disappointing. Expected better based on the premise.",
        "Below average. Plot was weak and predictable.",
        "Not impressed. Had potential but fell flat.",
        "Forgettable movie with few redeeming qualities.",
    ],
    1: [
        "Terrible. Waste of time. Do not recommend.",
        "Awful in every aspect. Couldn't finish it.",
        "One of the worst movies I've seen. Avoid.",
        "Completely disappointing. No redeeming qualities.",
    ],
}

# Create reviews
reviews_created = 0
for movie in movies:
    # Random number of reviews per movie (0-3)
    num_reviews = random.randint(0, 3)
    
    # Select random users for this movie
    reviewers = random.sample(users, min(num_reviews, len(users)))
    
    for user in reviewers:
        # Check if review already exists
        if Review.objects.filter(user=user, movie=movie).exists():
            continue
        
        # Random rating
        rating = random.choice([5, 5, 4, 4, 4, 3, 3, 2])  # Weighted towards higher ratings
        
        # Random review text
        content = random.choice(review_templates[rating])
        
        # Create review
        review = Review.objects.create(
            user=user,
            movie=movie,
            rating=rating,
            content=content
        )
        reviews_created += 1
        print(f"✅ {user.username} reviewed '{movie.title}' - {rating}⭐")

print("\n" + "=" * 60)
print(f"✅ Created {reviews_created} sample reviews!")

# Update movie ratings
print("\n📊 Updating movie ratings...")
from django.db.models import Avg

for movie in Movie.objects.all():
    avg = movie.reviews.aggregate(Avg('rating'))['rating__avg']
    if avg:
        movie.avg_rating = Decimal(str(round(avg, 2)))
        movie.save()
        print(f"✅ Updated {movie.title}: {movie.avg_rating}⭐ ({movie.reviews.count()} reviews)")

print("\n" + "=" * 60)
print("🎉 Sample reviews creation complete!")
print(f"\n📊 Final Statistics:")
print(f"   - Total users: {User.objects.count()}")
print(f"   - Total movies: {Movie.objects.count()}")
print(f"   - Total reviews: {Review.objects.count()}")
print(f"   - Movies with reviews: {Movie.objects.filter(reviews__isnull=False).distinct().count()}")
