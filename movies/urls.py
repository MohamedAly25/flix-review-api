from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import MovieListView, MovieDetailView, GenreViewSet


# Router for GenreViewSet
router = DefaultRouter()
router.register(r'genres', GenreViewSet, basename='genre')

urlpatterns = [
	path('', MovieListView.as_view(), name='movie-list'),
	path('<int:pk>/', MovieDetailView.as_view(), name='movie-detail'),
	path('', include(router.urls)),  # /api/movies/genres/
]

