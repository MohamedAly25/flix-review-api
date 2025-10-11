from django.urls import path

from .views import ReviewByMovieView, ReviewDetailView, ReviewListView, ReviewSearchView


urlpatterns = [
	path('', ReviewListView.as_view(), name='review-list'),
	path('search/', ReviewSearchView.as_view(), name='review-search'),
	path('<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),
	path('movie/<str:title>/', ReviewByMovieView.as_view(), name='review-by-movie'),
]
