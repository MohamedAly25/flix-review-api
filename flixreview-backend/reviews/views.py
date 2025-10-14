from urllib.parse import unquote_plus

from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions, status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from .models import Review
from .serializers import ReviewSerializer
from common.mixins import ApiResponseMixin
from common.permissions import IsOwnerOrReadOnly


class ReviewFilterMixin:
	def apply_common_filters(self, queryset):
		params = self.request.query_params

		min_rating = params.get('min_rating')
		max_rating = params.get('max_rating')
		movie_title = params.get('movie') or params.get('title')
		username = params.get('user') or params.get('username')

		if min_rating is not None:
			try:
				queryset = queryset.filter(rating__gte=int(min_rating))
			except ValueError:
				pass
		if max_rating is not None:
			try:
				queryset = queryset.filter(rating__lte=int(max_rating))
			except ValueError:
				pass
		if movie_title:
			queryset = queryset.filter(movie__title__icontains=movie_title)
		if username:
			queryset = queryset.filter(user__username=username)

		return queryset


class ReviewListView(ApiResponseMixin, ReviewFilterMixin, generics.ListCreateAPIView):
	queryset = Review.objects.all().select_related('user', 'movie')
	serializer_class = ReviewSerializer
	permission_classes = [permissions.IsAuthenticatedOrReadOnly]
	filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
	filterset_fields = ['rating', 'movie__title', 'movie__genre', 'user__username']
	search_fields = ['content', 'movie__title', 'movie__description']
	ordering_fields = ['rating', 'created_at', 'movie__avg_rating']
	ordering = ['-created_at']
	success_messages = {
		'GET': 'Reviews retrieved successfully',
		'POST': 'Review created successfully',
	}

	def perform_create(self, serializer):
		serializer.save(user=self.request.user)

	def get_queryset(self):
		queryset = super().get_queryset()
		return self.apply_common_filters(queryset)


class ReviewDetailView(ApiResponseMixin, generics.RetrieveUpdateDestroyAPIView):
	queryset = Review.objects.all().select_related('user', 'movie')
	serializer_class = ReviewSerializer
	permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
	success_messages = {
		'GET': 'Review retrieved successfully',
		'PUT': 'Review updated successfully',
		'PATCH': 'Review updated successfully',
		'DELETE': 'Review deleted successfully',
	}

	def perform_update(self, serializer):
		serializer.save(is_edited=True)

	def destroy(self, request, *args, **kwargs):
		instance = self.get_object()
		self.perform_destroy(instance)
		return Response({'detail': 'Review deleted'}, status=status.HTTP_200_OK)


class ReviewByMovieView(ApiResponseMixin, ReviewFilterMixin, generics.ListAPIView):
	serializer_class = ReviewSerializer
	permission_classes = [permissions.IsAuthenticatedOrReadOnly]
	filter_backends = [DjangoFilterBackend, OrderingFilter]
	filterset_fields = ['rating']
	ordering_fields = ['rating', 'created_at']
	ordering = ['-created_at']
	success_messages = {
		'GET': 'Reviews retrieved successfully',
	}

	def get_queryset(self):
		title_param = unquote_plus(self.kwargs['title'])
		queryset = Review.objects.filter(movie__title__iexact=title_param).select_related('user', 'movie')
		return self.apply_common_filters(queryset)


class ReviewSearchView(ApiResponseMixin, ReviewFilterMixin, generics.ListAPIView):
	serializer_class = ReviewSerializer
	permission_classes = [permissions.IsAuthenticatedOrReadOnly]
	filter_backends = [OrderingFilter]
	ordering_fields = ['rating', 'created_at', 'movie__avg_rating']
	ordering = ['-created_at']
	success_messages = {
		'GET': 'Reviews retrieved successfully',
	}

	def get_queryset(self):
		queryset = Review.objects.all().select_related('user', 'movie')
		queryset = self.apply_common_filters(queryset)

		params = self.request.query_params
		search_term = params.get('q') or params.get('query')
		title = params.get('title')
		rating = params.get('rating')

		if search_term:
			queryset = queryset.filter(
				Q(content__icontains=search_term) |
				Q(movie__title__icontains=search_term)
			)
		if title:
			queryset = queryset.filter(movie__title__icontains=title)
		if rating is not None:
			try:
				queryset = queryset.filter(rating=int(rating))
			except ValueError:
				pass

		return queryset
