from django.db.models import Avg
from rest_framework import generics, permissions
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Movie
from .serializers import MovieSerializer
from common.permissions import IsAdminOrReadOnly


class MovieListView(generics.ListCreateAPIView):
	queryset = Movie.objects.all()
	serializer_class = MovieSerializer
	permission_classes = [permissions.IsAuthenticatedOrReadOnly]
	filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
	filterset_fields = ['genre']
	search_fields = ['title', 'description']
	ordering_fields = ['release_date', 'avg_rating', 'created_at']
	ordering = ['-created_at']

	def get_permissions(self):
		if self.request.method == 'POST':
			return [IsAdminOrReadOnly()]
		return super().get_permissions()


class MovieDetailView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Movie.objects.all()
	serializer_class = MovieSerializer
	permission_classes = [IsAdminOrReadOnly]

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
