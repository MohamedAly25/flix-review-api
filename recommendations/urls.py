from django.urls import path

from .views import (
	TopRatedMoviesView,
	TrendingMoviesView,
	MostReviewedMoviesView,
	RecentMoviesView,
	RecommendationsDashboardView,
)


urlpatterns = [
	path('top-rated/', TopRatedMoviesView.as_view(), name='recommendations-top-rated'),
	path('trending/', TrendingMoviesView.as_view(), name='recommendations-trending'),
	path('most-reviewed/', MostReviewedMoviesView.as_view(), name='recommendations-most-reviewed'),
	path('recent/', RecentMoviesView.as_view(), name='recommendations-recent'),
	path('dashboard/', RecommendationsDashboardView.as_view(), name='recommendations-dashboard'),
]
