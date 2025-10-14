from datetime import timedelta
from django.db.models import Count, Q, Avg
from django.utils import timezone
from django.core.cache import cache
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from movies.models import Movie
from movies.serializers import MovieSerializer
from common.mixins import ApiResponseMixin
from .services import RecommendationEngine


class TopRatedMoviesView(ApiResponseMixin, generics.ListAPIView):
	"""
	Returns top 10 movies ordered by average rating.
	Filters out movies with no reviews.
	"""
	serializer_class = MovieSerializer
	permission_classes = [permissions.AllowAny]
	success_messages = {'GET': 'Top rated movies retrieved successfully'}

	def get_queryset(self):
		return (
			Movie.objects
			.prefetch_related('reviews')
			.annotate(review_count=Count('reviews'))
			.filter(review_count__gt=0, avg_rating__gt=0)
			.order_by('-avg_rating', '-review_count')[:10]
		)


class TrendingMoviesView(ApiResponseMixin, generics.ListAPIView):
	"""
	Returns movies with most reviews in the last 30 days.
	Shows what's currently popular.
	"""
	serializer_class = MovieSerializer
	permission_classes = [permissions.AllowAny]
	success_messages = {'GET': 'Trending movies retrieved successfully'}

	def get_queryset(self):
		thirty_days_ago = timezone.now() - timedelta(days=30)
		
		return (
			Movie.objects
			.prefetch_related('reviews')
			.annotate(
				recent_review_count=Count(
					'reviews',
					filter=Q(reviews__created_at__gte=thirty_days_ago)
				),
				review_count=Count('reviews')
			)
			.filter(recent_review_count__gt=0)
			.order_by('-recent_review_count', '-avg_rating')[:10]
		)


class MostReviewedMoviesView(ApiResponseMixin, generics.ListAPIView):
	"""
	Returns movies with the highest number of total reviews.
	Shows most discussed movies of all time.
	"""
	serializer_class = MovieSerializer
	permission_classes = [permissions.AllowAny]
	success_messages = {'GET': 'Most reviewed movies retrieved successfully'}

	def get_queryset(self):
		return (
			Movie.objects
			.prefetch_related('reviews')
			.annotate(review_count=Count('reviews'))
			.filter(review_count__gt=0)
			.order_by('-review_count', '-avg_rating')[:10]
		)


class RecentMoviesView(ApiResponseMixin, generics.ListAPIView):
	"""
	Returns recently added movies to the platform.
	Helps users discover new content.
	"""
	serializer_class = MovieSerializer
	permission_classes = [permissions.AllowAny]
	success_messages = {'GET': 'Recent movies retrieved successfully'}

	def get_queryset(self):
		return (
			Movie.objects
			.prefetch_related('reviews')
			.annotate(review_count=Count('reviews'))
			.order_by('-created_at')[:10]
		)


class RecommendationsDashboardView(ApiResponseMixin, generics.GenericAPIView):
	"""
	Returns a comprehensive dashboard with all recommendation types.
	Useful for homepage/dashboard display.
	"""
	permission_classes = [permissions.AllowAny]
	success_messages = {'GET': 'Recommendations dashboard retrieved successfully'}

	def get(self, request, *args, **kwargs):
		thirty_days_ago = timezone.now() - timedelta(days=30)

		# Top Rated
		top_rated = (
			Movie.objects
			.prefetch_related('reviews')
			.annotate(review_count=Count('reviews'))
			.filter(review_count__gt=0, avg_rating__gt=0)
			.order_by('-avg_rating', '-review_count')[:5]
		)

		# Trending
		trending = (
			Movie.objects
			.prefetch_related('reviews')
			.annotate(
				recent_review_count=Count(
					'reviews',
					filter=Q(reviews__created_at__gte=thirty_days_ago)
				),
				review_count=Count('reviews')
			)
			.filter(recent_review_count__gt=0)
			.order_by('-recent_review_count', '-avg_rating')[:5]
		)

		# Most Reviewed
		most_reviewed = (
			Movie.objects
			.prefetch_related('reviews')
			.annotate(review_count=Count('reviews'))
			.filter(review_count__gt=0)
			.order_by('-review_count', '-avg_rating')[:5]
		)

		# Recent
		recent = (
			Movie.objects
			.prefetch_related('reviews')
			.annotate(review_count=Count('reviews'))
			.order_by('-created_at')[:5]
		)

		serializer = MovieSerializer(top_rated, many=True)
		data = {
			'top_rated': MovieSerializer(top_rated, many=True).data,
			'trending': MovieSerializer(trending, many=True).data,
			'most_reviewed': MovieSerializer(most_reviewed, many=True).data,
			'recent': MovieSerializer(recent, many=True).data,
		}

		return Response(data)


# ==================================================
# ML-Powered Recommendation Endpoints
# ==================================================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def personalized_recommendations(request):
	"""
	Get personalized movie recommendations for the authenticated user
	
	Uses hybrid ML approach combining collaborative and content-based filtering
	
	Query Parameters:
	- limit: Number of recommendations (default: 10, max: 50)
	- algorithm: 'hybrid' (default), 'collaborative', or 'content'
	"""
	user = request.user
	limit = int(request.query_params.get('limit', 10))
	algorithm = request.query_params.get('algorithm', 'hybrid')
	
	# Validate limit
	if limit < 1:
		limit = 10
	elif limit > 50:
		limit = 50
	
	# Check cache first
	cache_key = f"recommendations:user:{user.id}:algo:{algorithm}:limit:{limit}"
	cached_result = cache.get(cache_key)
	
	if cached_result:
		return Response({
			'success': True,
			'message': 'Personalized recommendations retrieved successfully',
			'data': {
				'recommendations': cached_result,
				'cached': True,
				'algorithm': algorithm
			}
		})
	
	# Generate recommendations
	engine = RecommendationEngine()
	
	if algorithm == 'collaborative':
		recommendations = engine.get_collaborative_recommendations(user.id, limit=limit)
	elif algorithm == 'content':
		# Use most recent highly-rated movie as seed
		from reviews.models import Review
		recent_liked = Review.objects.filter(
			user=user,
			rating__gte=4
		).order_by('-created_at').select_related('movie').first()
		
		if recent_liked:
			recommendations = engine.get_content_based_recommendations(
				recent_liked.movie_id,
				limit=limit
			)
		else:
			# Fallback to popular movies
			recommendations = []
	else:  # hybrid (default)
		recommendations = engine.get_hybrid_recommendations(user.id, limit=limit)
	
	# Cache for 1 hour
	cache.set(cache_key, recommendations, 3600)
	
	return Response({
		'success': True,
		'message': f'Found {len(recommendations)} personalized recommendations',
		'data': {
			'recommendations': recommendations,
			'cached': False,
			'algorithm': algorithm,
			'ml_enabled': engine.is_enabled()
		}
	})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def similar_movies(request, pk):
	"""
	Get movies similar to the specified movie
	
	Uses content-based filtering (TF-IDF on description + genres)
	
	URL: /api/recommendations/movies/{id}/similar/
	Query Parameters:
	- limit: Number of recommendations (default: 10, max: 30)
	"""
	limit = int(request.query_params.get('limit', 10))
	
	# Validate limit
	if limit < 1:
		limit = 10
	elif limit > 30:
		limit = 30
	
	# Check if movie exists
	try:
		movie = Movie.objects.get(pk=pk)
	except Movie.DoesNotExist:
		return Response(
			{'error': 'Movie not found'},
			status=status.HTTP_404_NOT_FOUND
		)
	
	# Check cache
	cache_key = f"similar_movies:movie:{pk}:limit:{limit}"
	cached_result = cache.get(cache_key)
	
	if cached_result:
		return Response({
			'success': True,
			'message': f'Found {len(cached_result)} similar movies',
			'data': {
				'source_movie': {
					'id': movie.id,
					'title': movie.title
				},
				'similar_movies': cached_result,
				'cached': True
			}
		})
	
	# Generate similar movies
	engine = RecommendationEngine()
	similar = engine.get_content_based_recommendations(pk, limit=limit)
	
	# Cache for 6 hours
	cache.set(cache_key, similar, 21600)
	
	return Response({
		'success': True,
		'message': f'Found {len(similar)} similar movies',
		'data': {
			'source_movie': {
				'id': movie.id,
				'title': movie.title
			},
			'similar_movies': similar,
			'cached': False,
			'ml_enabled': engine.is_enabled()
		}
	})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_taste_profile(request):
	"""
	Get user's taste profile based on their rating history
	
	Returns:
	- Favorite genres
	- Rating statistics
	- Favorite decades
	- Rating distribution
	"""
	user = request.user
	
	# Check cache
	cache_key = f"taste_profile:user:{user.id}"
	cached_result = cache.get(cache_key)
	
	if cached_result:
		return Response({
			'success': True,
			'message': 'Taste profile retrieved successfully',
			'data': {
				**cached_result,
				'cached': True
			}
		})
	
	# Generate taste profile
	engine = RecommendationEngine()
	profile = engine.get_user_taste_profile(user.id)
	
	# Cache for 30 minutes
	cache.set(cache_key, profile, 1800)
	
	return Response({
		'success': True,
		'message': 'Taste profile retrieved successfully',
		'data': {
			**profile,
			'cached': False
		}
	})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def clear_recommendation_cache(request):
	"""
	Clear cached recommendations for the authenticated user
	
	Useful after user has rated new movies
	"""
	user = request.user
	
	# Clear all user-related recommendation caches
	cache_patterns = [
		f"recommendations:user:{user.id}:*",
		f"taste_profile:user:{user.id}"
	]
	
	cleared = 0
	# Note: This is a simplified version. In production, use Redis SCAN for pattern matching
	for pattern in cache_patterns:
		try:
			cache.delete(pattern)
			cleared += 1
		except:
			pass
	
	return Response({
		'success': True,
		'message': 'Recommendation cache cleared successfully',
		'data': {
			'cleared_patterns': cleared
		}
	})
