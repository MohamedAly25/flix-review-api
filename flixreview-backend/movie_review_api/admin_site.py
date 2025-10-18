from django.contrib.admin import AdminSite
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.urls import path
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from movies.models import Movie, Genre
from reviews.models import Review


class CustomAdminSite(AdminSite):
    """Custom admin site with enhanced dashboard"""

    site_header = "FlixReview Admin"
    site_title = "FlixReview Administration"
    index_title = "Dashboard"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('dashboard/', self.admin_view(self.dashboard_view), name='dashboard'),
        ]
        return custom_urls + urls

    def index(self, request, extra_context=None):
        """Override index to add quick stats"""
        extra_context = extra_context or {}
        extra_context.update({
            'user_count': User.objects.count(),
            'movie_count': Movie.objects.count(),
            'review_count': Review.objects.count(),
            'genre_count': Genre.objects.count(),
        })
        return super().index(request, extra_context)

    @staff_member_required
    def dashboard_view(self, request):
        """Custom dashboard with statistics and analytics"""

        # Time periods
        now = timezone.now()
        last_7_days = now - timedelta(days=7)
        last_30_days = now - timedelta(days=30)

        # User statistics
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        staff_users = User.objects.filter(is_staff=True).count()
        new_users_7d = User.objects.filter(date_joined__gte=last_7_days).count()
        new_users_30d = User.objects.filter(date_joined__gte=last_30_days).count()

        # Movie statistics
        total_movies = Movie.objects.count()
        movies_with_reviews = Movie.objects.annotate(
            review_count=Count('reviews')
        ).filter(review_count__gt=0).count()
        avg_rating_global = Movie.objects.filter(avg_rating__gt=0).aggregate(
            avg=Avg('avg_rating')
        )['avg'] or 0

        # Review statistics
        total_reviews = Review.objects.count()
        reviews_7d = Review.objects.filter(created_at__gte=last_7_days).count()
        reviews_30d = Review.objects.filter(created_at__gte=last_30_days).count()
        avg_rating_reviews = Review.objects.aggregate(avg=Avg('rating'))['avg'] or 0

        # Genre statistics
        total_genres = Genre.objects.count()
        genres_with_movies = Genre.objects.annotate(
            movie_count=Count('movies')
        ).filter(movie_count__gt=0).count()

        # Recent activity
        recent_users = User.objects.order_by('-date_joined')[:5]
        recent_reviews = Review.objects.select_related('user', 'movie').order_by('-created_at')[:10]
        recent_movies = Movie.objects.order_by('-created_at')[:5]

        # Top rated movies
        top_movies = Movie.objects.filter(avg_rating__gt=0).order_by('-avg_rating')[:5]

        # Rating distribution
        rating_distribution = Review.objects.values('rating').annotate(
            count=Count('rating')
        ).order_by('rating')

        context = {
            'title': 'Dashboard',
            'stats': {
                'users': {
                    'total': total_users,
                    'active': active_users,
                    'staff': staff_users,
                    'new_7d': new_users_7d,
                    'new_30d': new_users_30d,
                },
                'movies': {
                    'total': total_movies,
                    'with_reviews': movies_with_reviews,
                    'avg_rating': round(avg_rating_global, 2),
                },
                'reviews': {
                    'total': total_reviews,
                    'last_7d': reviews_7d,
                    'last_30d': reviews_30d,
                    'avg_rating': round(avg_rating_reviews, 2),
                },
                'genres': {
                    'total': total_genres,
                    'with_movies': genres_with_movies,
                },
            },
            'recent_activity': {
                'users': recent_users,
                'reviews': recent_reviews,
                'movies': recent_movies,
            },
            'top_movies': top_movies,
            'rating_distribution': rating_distribution,
        }

        return render(request, 'admin/dashboard.html', context)


# Create custom admin site instance
admin_site = CustomAdminSite(name='flixreview_admin')

# Register all models with the custom admin site
from accounts.admin import CustomUserAdmin
from movies.admin import GenreAdmin, MovieAdmin
from reviews.admin import ReviewAdmin

admin_site.register(User, CustomUserAdmin)
admin_site.register(Genre, GenreAdmin)
admin_site.register(Movie, MovieAdmin)
admin_site.register(Review, ReviewAdmin)