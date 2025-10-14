from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
	MovieListView, 
	MovieDetailView, 
	GenreViewSet,
	search_tmdb,
	import_tmdb_movie,
	sync_tmdb_movie
)


# Router for GenreViewSet
router = DefaultRouter()
router.register(r'genres', GenreViewSet, basename='genre')

urlpatterns = [
	path('', MovieListView.as_view(), name='movie-list'),
	path('<int:pk>/', MovieDetailView.as_view(), name='movie-detail'),
	
	# TMDB Integration endpoints
	path('search-tmdb/', search_tmdb, name='search-tmdb'),
	path('import-tmdb/', import_tmdb_movie, name='import-tmdb'),
	path('<int:pk>/sync-tmdb/', sync_tmdb_movie, name='sync-tmdb'),
	
	path('', include(router.urls)),  # /api/movies/genres/
]

