from decimal import Decimal, InvalidOperation

from django.db.models import Avg, Count
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Movie
from .serializers import MovieSerializer
from common.permissions import IsAdminOrReadOnly
from common.mixins import ApiResponseMixin

class MovieListView(ApiResponseMixin, generics.ListCreateAPIView):
	queryset = Movie.objects.all()
	serializer_class = MovieSerializer
	permission_classes = [permissions.IsAuthenticatedOrReadOnly]
	filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
	filterset_fields = ['genre']
	search_fields = ['title', 'description']
	ordering_fields = ['release_date', 'avg_rating', 'created_at', 'review_count']
	ordering = ['-created_at']
	success_messages = {
		'GET': 'Movies retrieved successfully',
		'POST': 'Movie created successfully',
	}

	def get_permissions(self):
		if self.request.method == 'POST':
			return [IsAdminOrReadOnly()]
		return super().get_permissions()

	def get_queryset(self):
		queryset = super().get_queryset().prefetch_related('reviews').annotate(review_count=Count('reviews'))
		params = self.request.query_params

		min_rating = params.get('min_rating')
		max_rating = params.get('max_rating')
		year_from = params.get('year_from')
		year_to = params.get('year_to')

		if min_rating is not None:
			try:
				queryset = queryset.filter(avg_rating__gte=Decimal(min_rating))
			except (InvalidOperation, TypeError):
				pass
		if max_rating is not None:
			try:
				queryset = queryset.filter(avg_rating__lte=Decimal(max_rating))
			except (InvalidOperation, TypeError):
				pass
		if year_from is not None:
			try:
				year_val = int(year_from)
				queryset = queryset.filter(release_date__year__gte=year_val)
			except ValueError:
				pass
		if year_to is not None:
			try:
				year_val = int(year_to)
				queryset = queryset.filter(release_date__year__lte=year_val)
			except ValueError:
				pass

		return queryset

class MovieDetailView(ApiResponseMixin, generics.RetrieveUpdateDestroyAPIView):
	queryset = Movie.objects.all()
	serializer_class = MovieSerializer
	permission_classes = [IsAdminOrReadOnly]
	success_messages = {
		'GET': 'Movie retrieved successfully',
		'PUT': 'Movie updated successfully',
		'PATCH': 'Movie updated successfully',
		'DELETE': 'Movie deleted successfully',
	}

	def retrieve(self, request, *args, **kwargs):
		instance = self.get_object()
		serializer = self.get_serializer(instance)

		reviews = instance.reviews.all()
		review_stats = {
			'total_reviews': reviews.count(),
			'average_rating': reviews.aggregate(Avg('rating'))['rating__avg'] or 0,
			'rating_distribution': {i: reviews.filter(rating=i).count() for i in range(1, 6)},
		}

		data = serializer.data
		data['review_stats'] = review_stats
		return Response(data)

	def get_queryset(self):
		return super().get_queryset().prefetch_related('reviews').annotate(review_count=Count('reviews'))

	def destroy(self, request, *args, **kwargs):
		instance = self.get_object()
		self.perform_destroy(instance)
		return Response({'detail': 'Movie deleted'}, status=status.HTTP_200_OK)
