from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from datetime import date

from .models import Movie
from reviews.models import Review


User = get_user_model()


class MovieAPITests(APITestCase):
	def setUp(self):
		self.list_url = reverse('movie-list')
		self.admin = User.objects.create_superuser(
			email='admin@example.com', username='admin', password='AdminPass123!'
		)
		self.movie = Movie.objects.create(
			title='Inception',
			genre='Sci-Fi',
			description='Mind bending',
			release_date=date(2010, 7, 16)
		)

	def test_movie_list_and_create_requires_admin(self):
		# Unauthenticated GET allowed
		res = self.client.get(self.list_url)
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertEqual(len(res.data), 1)

		# Non-admin POST forbidden
		user = User.objects.create_user(
			email='user@example.com', username='user', password='UserPass123!'
		)
		self.client.force_authenticate(user=user)
		res = self.client.post(self.list_url, {
			'title': 'Matrix',
			'genre': 'Action',
			'description': 'Another classic',
			'release_date': '1999-03-31'
		})
		self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

		# Admin can create
		self.client.force_authenticate(user=self.admin)
		res = self.client.post(self.list_url, {
			'title': 'Interstellar',
			'genre': 'Sci-Fi',
			'description': 'Space adventures',
			'release_date': '2014-11-07'
		}, format='json')
		self.assertEqual(res.status_code, status.HTTP_201_CREATED)
		self.assertEqual(Movie.objects.count(), 2)

	def test_movie_detail_includes_review_stats(self):
		user = User.objects.create_user(
			email='reviewer@example.com', username='reviewer', password='ReviewPass123!'
		)
		Review.objects.create(user=user, movie=self.movie, content='Great!', rating=5)
		Review.objects.create(user=self.admin, movie=self.movie, content='Also good', rating=4)

		detail_url = reverse('movie-detail', args=[self.movie.pk])
		res = self.client.get(detail_url)
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertIn('review_stats', res.data)
		stats = res.data['review_stats']
		self.assertEqual(stats['total_reviews'], 2)
		self.assertEqual(stats['rating_distribution'][5], 1)
