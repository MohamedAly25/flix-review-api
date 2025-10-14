from decimal import Decimal, InvalidOperation

from django.db.models import Avg, Count
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Movie, Genre
from .serializers import MovieSerializer, GenreSerializer
from .services import TMDBService
from common.permissions import IsAdminOrReadOnly
from common.mixins import ApiResponseMixin


class GenreViewSet(ApiResponseMixin, viewsets.ModelViewSet):
	"""
	ViewSet for Genre CRUD operations.
	- List/Read: Anyone
	- Create/Update/Delete: Admin only
	"""
	queryset = Genre.objects.all()
	serializer_class = GenreSerializer
	permission_classes = [IsAdminOrReadOnly]
	lookup_field = 'slug'
	filter_backends = [SearchFilter, OrderingFilter]
	search_fields = ['name', 'description']
	ordering_fields = ['name', 'created_at']
	ordering = ['name']
	success_messages = {
		'GET': 'Genre retrieved successfully',
		'POST': 'Genre created successfully',
		'PUT': 'Genre updated successfully',
		'PATCH': 'Genre updated successfully',
		'DELETE': 'Genre deleted successfully',
	}
	
	def get_queryset(self):
		"""Prefetch related movies for efficiency"""
		return super().get_queryset().prefetch_related('movies')


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
		queryset = super().get_queryset().prefetch_related('reviews', 'genres').annotate(review_count=Count('reviews'))
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
		return super().get_queryset().prefetch_related('reviews', 'genres').annotate(review_count=Count('reviews'))

	def destroy(self, request, *args, **kwargs):
		instance = self.get_object()
		self.perform_destroy(instance)
		return Response({'detail': 'Movie deleted'}, status=status.HTTP_200_OK)


# TMDB Integration Endpoints

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_tmdb(request):
	"""
	Search for movies on TMDB
	
	Query Parameters:
	- q: Search query (required)
	- page: Page number (default: 1)
	"""
	query = request.query_params.get('q', '').strip()
	page = request.query_params.get('page', 1)
	
	if not query:
		return Response(
			{'error': 'Search query (q) is required'},
			status=status.HTTP_400_BAD_REQUEST
		)
	
	try:
		page = int(page)
		if page < 1:
			page = 1
	except (ValueError, TypeError):
		page = 1
	
	service = TMDBService()
	if not service.is_enabled():
		return Response(
			{'error': 'TMDB integration is not configured'},
			status=status.HTTP_503_SERVICE_UNAVAILABLE
		)
	
	results = service.search_movies(query, page=page)
	
	return Response({
		'success': True,
		'message': f'Found {len(results)} results for "{query}"',
		'data': {
			'query': query,
			'page': page,
			'results': results,
			'count': len(results)
		}
	})


@api_view(['POST'])
@permission_classes([IsAdminOrReadOnly])
def import_tmdb_movie(request):
	"""
	Import a movie from TMDB by ID (Admin only)
	
	Request Body:
	{
		"tmdb_id": 550,
		"force": false  // Optional: force re-import
	}
	"""
	tmdb_id = request.data.get('tmdb_id')
	force = request.data.get('force', False)
	
	if not tmdb_id:
		return Response(
			{'error': 'tmdb_id is required'},
			status=status.HTTP_400_BAD_REQUEST
		)
	
	try:
		tmdb_id = int(tmdb_id)
	except (ValueError, TypeError):
		return Response(
			{'error': 'tmdb_id must be a valid integer'},
			status=status.HTTP_400_BAD_REQUEST
		)
	
	# Check if movie already exists
	if not force:
		existing = Movie.objects.filter(tmdb_id=tmdb_id).first()
		if existing:
			return Response(
				{
					'error': f'Movie already exists with TMDB ID {tmdb_id}',
					'movie': MovieSerializer(existing).data
				},
				status=status.HTTP_409_CONFLICT
			)
	
	service = TMDBService()
	if not service.is_enabled():
		return Response(
			{'error': 'TMDB integration is not configured'},
			status=status.HTTP_503_SERVICE_UNAVAILABLE
		)
	
	result = service.import_movie(tmdb_id)
	
	if result:
		movie = Movie.objects.get(id=result['id'])
		action = "updated" if result.get('created') is False else "created"
		
		return Response({
			'success': True,
			'message': f'Movie {action} successfully',
			'data': {
				'action': action,
				'movie': MovieSerializer(movie).data
			}
		}, status=status.HTTP_201_CREATED if result.get('created') else status.HTTP_200_OK)
	else:
		return Response(
			{'error': f'Failed to import movie with TMDB ID {tmdb_id}'},
			status=status.HTTP_500_INTERNAL_SERVER_ERROR
		)


@api_view(['POST'])
@permission_classes([IsAdminOrReadOnly])
def sync_tmdb_movie(request, pk):
	"""
	Sync an existing movie with latest TMDB data (Admin only)
	
	URL: /api/movies/{id}/sync-tmdb/
	"""
	try:
		movie = Movie.objects.get(pk=pk)
	except Movie.DoesNotExist:
		return Response(
			{'error': 'Movie not found'},
			status=status.HTTP_404_NOT_FOUND
		)
	
	if not movie.tmdb_id:
		return Response(
			{'error': 'This movie has no TMDB ID and cannot be synced'},
			status=status.HTTP_400_BAD_REQUEST
		)
	
	service = TMDBService()
	if not service.is_enabled():
		return Response(
			{'error': 'TMDB integration is not configured'},
			status=status.HTTP_503_SERVICE_UNAVAILABLE
		)
	
	result = service.sync_movie(pk)
	
	if result:
		movie.refresh_from_db()
		return Response({
			'success': True,
			'message': 'Movie synced successfully with TMDB',
			'data': {
				'movie': MovieSerializer(movie).data
			}
		})
	else:
		return Response(
			{'error': f'Failed to sync movie with TMDB ID {movie.tmdb_id}'},
			status=status.HTTP_500_INTERNAL_SERVER_ERROR
		)
