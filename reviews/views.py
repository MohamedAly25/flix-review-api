from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Review
from .serializers import ReviewSerializer
from common.permissions import IsOwnerOrReadOnly


class ReviewListView(generics.ListCreateAPIView):
	queryset = Review.objects.all().select_related('user', 'movie')
	serializer_class = ReviewSerializer
	permission_classes = [permissions.IsAuthenticatedOrReadOnly]
	filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
	filterset_fields = ['rating', 'movie__title', 'movie__genre', 'user__username']
	search_fields = ['content', 'movie__title', 'movie__description']
	ordering_fields = ['rating', 'created_at', 'movie__avg_rating']
	ordering = ['-created_at']

	def perform_create(self, serializer):
		serializer.save(user=self.request.user)

	def get_queryset(self):
		queryset = super().get_queryset()

		min_rating = self.request.query_params.get('min_rating')
		max_rating = self.request.query_params.get('max_rating')
		movie_title = self.request.query_params.get('movie')
		username = self.request.query_params.get('user')

		if min_rating is not None:
			queryset = queryset.filter(rating__gte=min_rating)
		if max_rating is not None:
			queryset = queryset.filter(rating__lte=max_rating)
		if movie_title:
			queryset = queryset.filter(movie__title__icontains=movie_title)
		if username:
			queryset = queryset.filter(user__username=username)

		return queryset


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Review.objects.all().select_related('user', 'movie')
	serializer_class = ReviewSerializer
	permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

	def perform_update(self, serializer):
		serializer.save(is_edited=True)


class ReviewByMovieView(generics.ListAPIView):
	serializer_class = ReviewSerializer
	permission_classes = [permissions.IsAuthenticatedOrReadOnly]
	filter_backends = [DjangoFilterBackend, OrderingFilter]
	filterset_fields = ['rating']
	ordering_fields = ['rating', 'created_at']
	ordering = ['-created_at']

	def get_queryset(self):
		movie_id = self.kwargs['movie_id']
		return Review.objects.filter(movie_id=movie_id).select_related('user', 'movie')
