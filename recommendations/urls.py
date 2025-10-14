from django.urls import path

from .views import (
	TopRatedMoviesView,
	TrendingMoviesView,
	MostReviewedMoviesView,
	RecentMoviesView,
	RecommendationsDashboardView,
	personalized_recommendations,
	similar_movies,
	user_taste_profile,
	clear_recommendation_cache,
)


urlpatterns = [
	# Original recommendation endpoints
	path('top-rated/', TopRatedMoviesView.as_view(), name='recommendations-top-rated'),
	path('trending/', TrendingMoviesView.as_view(), name='recommendations-trending'),
	path('most-reviewed/', MostReviewedMoviesView.as_view(), name='recommendations-most-reviewed'),
	path('recent/', RecentMoviesView.as_view(), name='recommendations-recent'),
	path('dashboard/', RecommendationsDashboardView.as_view(), name='recommendations-dashboard'),
	
	# ML-powered recommendation endpoints (Phase 7)
	path('for-you/', personalized_recommendations, name='recommendations-for-you'),
	path('movies/<int:pk>/similar/', similar_movies, name='similar-movies'),
	path('profile/taste/', user_taste_profile, name='taste-profile'),
	path('cache/clear/', clear_recommendation_cache, name='clear-cache'),
]
