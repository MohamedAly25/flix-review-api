from django.urls import path

from .views import ReviewListView, ReviewDetailView, ReviewByMovieView


urlpatterns = [
	path('', ReviewListView.as_view(), name='review-list'),
	path('<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),
	path('movie/<int:movie_id>/', ReviewByMovieView.as_view(), name='review-by-movie'),
]
