from datetime import timedelta
from django.db.models import Count, Q, Avg
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.response import Response

from movies.models import Movie
from movies.serializers import MovieSerializer
from common.mixins import ApiResponseMixin


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
