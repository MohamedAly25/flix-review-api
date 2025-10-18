from django.urls import path

from .views import (
	ReviewByMovieView, 
	ReviewDetailView, 
	ReviewListView, 
	ReviewSearchView,
	ReviewLikeToggleView,
	MostLikedReviewsView,
	ReviewCommentListCreateView,
	ReviewCommentDetailView,
)


urlpatterns = [
	path('', ReviewListView.as_view(), name='review-list'),
	path('search/', ReviewSearchView.as_view(), name='review-search'),
	path('most-liked/', MostLikedReviewsView.as_view(), name='most-liked-reviews'),
	path('<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),
	path('<int:pk>/like/', ReviewLikeToggleView.as_view(), name='review-like-toggle'),
	path('<int:review_id>/comments/', ReviewCommentListCreateView.as_view(), name='review-comments'),
	path('comments/<int:pk>/', ReviewCommentDetailView.as_view(), name='review-comment-detail'),
	path('movie/<str:title>/', ReviewByMovieView.as_view(), name='review-by-movie'),
]
