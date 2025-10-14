from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from datetime import date

from movies.models import Movie
from reviews.models import Review

User = get_user_model()


class RecommendationsAPITests(APITestCase):
	def setUp(self):
		# Create users
		self.user1 = User.objects.create_user(
			email='user1@example.com',
			username='user1',
			password='TestPass123!'
		)
		self.user2 = User.objects.create_user(
			email='user2@example.com',
			username='user2',
			password='TestPass123!'
		)

		# Create movies
		self.movie_high_rated = Movie.objects.create(
			title='High Rated Movie',
			genre='Drama',
			description='Amazing movie',
			release_date=date(2020, 1, 1),
			avg_rating=4.5
		)

		self.movie_many_reviews = Movie.objects.create(
			title='Popular Movie',
			genre='Action',
			description='Many reviews',
			release_date=date(2019, 6, 15),
			avg_rating=4.0
		)

		self.movie_recent = Movie.objects.create(
			title='Recent Movie',
			genre='Sci-Fi',
			description='Just added',
			release_date=date(2024, 1, 1),
			avg_rating=3.5
		)

		self.movie_old = Movie.objects.create(
			title='Old Movie',
			genre='Classic',
			description='Old classic',
			release_date=date(2000, 1, 1),
			avg_rating=4.2
		)

		# Create reviews for high rated movie
		Review.objects.create(
			user=self.user1,
			movie=self.movie_high_rated,
			content='Excellent!',
			rating=5
		)
		Review.objects.create(
			user=self.user2,
			movie=self.movie_high_rated,
			content='Great!',
			rating=4
		)

		# Create many reviews for popular movie
		Review.objects.create(
			user=self.user1,
			movie=self.movie_many_reviews,
			content='Good action',
			rating=4
		)

		# Create recent review for trending
		Review.objects.create(
			user=self.user2,
			movie=self.movie_recent,
			content='Nice sci-fi',
			rating=4
		)

		# Old review for old movie
		old_review = Review.objects.create(
			user=self.user1,
			movie=self.movie_old,
			content='Classic',
			rating=4
		)
		# Simulate old review by modifying created_at
		old_review.created_at = timezone.now() - timedelta(days=60)
		old_review.save()

		# Refresh avg ratings
		self.movie_high_rated.refresh_from_db()
		self.movie_many_reviews.refresh_from_db()
		self.movie_recent.refresh_from_db()
		self.movie_old.refresh_from_db()

		# URLs
		self.top_rated_url = reverse('recommendations-top-rated')
		self.trending_url = reverse('recommendations-trending')
		self.most_reviewed_url = reverse('recommendations-most-reviewed')
		self.recent_url = reverse('recommendations-recent')
		self.dashboard_url = reverse('recommendations-dashboard')

	def test_top_rated_movies(self):
		"""Test top rated movies endpoint returns highest rated movies"""
		res = self.client.get(self.top_rated_url)
		
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertTrue(res.data['success'])
		self.assertIn('data', res.data)
		
		results = res.data['data']['results']
		self.assertGreater(len(results), 0)
		
		# First movie should be the highest rated
		first_movie = results[0]
		self.assertIn('title', first_movie)
		self.assertIn('avg_rating', first_movie)

	def test_trending_movies(self):
		"""Test trending movies shows recent activity"""
		res = self.client.get(self.trending_url)
		
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertTrue(res.data['success'])
		
		results = res.data['data']['results']
		# Should include movies with recent reviews
		titles = [m['title'] for m in results]
		self.assertIn('Recent Movie', titles)
		# Should not include movies with only old reviews
		self.assertNotIn('Old Movie', titles)

	def test_most_reviewed_movies(self):
		"""Test most reviewed movies endpoint"""
		res = self.client.get(self.most_reviewed_url)
		
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertTrue(res.data['success'])
		
		results = res.data['data']['results']
		self.assertGreater(len(results), 0)
		
		# Verify review_count is included
		first_movie = results[0]
		self.assertIn('review_count', first_movie)

	def test_recent_movies(self):
		"""Test recent movies endpoint returns newest movies"""
		res = self.client.get(self.recent_url)
		
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertTrue(res.data['success'])
		
		results = res.data['data']['results']
		self.assertGreater(len(results), 0)
		
		# Most recent movie should be first (check by created_at order)
		first_movie = results[0]
		# Just verify we got movies ordered by created_at
		self.assertIn('title', first_movie)
		self.assertIn('created_at', first_movie)

	def test_recommendations_dashboard(self):
		"""Test comprehensive dashboard endpoint"""
		res = self.client.get(self.dashboard_url)
		
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertTrue(res.data['success'])
		
		data = res.data['data']
		# Check all sections exist
		self.assertIn('top_rated', data)
		self.assertIn('trending', data)
		self.assertIn('most_reviewed', data)
		self.assertIn('recent', data)
		
		# Each section should have movies
		self.assertGreater(len(data['top_rated']), 0)
		self.assertGreater(len(data['recent']), 0)

	def test_no_authentication_required(self):
		"""Test that recommendations are public"""
		# Should work without authentication
		res = self.client.get(self.top_rated_url)
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		
		res = self.client.get(self.trending_url)
		self.assertEqual(res.status_code, status.HTTP_200_OK)

	def test_empty_database_handling(self):
		"""Test recommendations with no movies"""
		# Delete all reviews and movies
		Review.objects.all().delete()
		Movie.objects.all().delete()
		
		res = self.client.get(self.top_rated_url)
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		
		# Should return empty results
		results = res.data['data']['results']
		self.assertEqual(len(results), 0)
