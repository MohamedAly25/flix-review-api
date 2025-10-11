from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from datetime import date

from .models import Movie
from reviews.models import Review


User = get_user_model()


class MovieModelTests(TestCase):
	def test_str_returns_title(self):
		movie = Movie.objects.create(
			title='The Prestige',
			genre='Drama',
			description='Magicians',
			release_date=date(2006, 10, 20)
		)
		self.assertEqual(str(movie), 'The Prestige')

	def test_default_ordering_newest_first(self):
		first = Movie.objects.create(
			title='Old Film',
			genre='Classic',
			description='Vintage',
			release_date=date(1980, 5, 1)
		)
		second = Movie.objects.create(
			title='New Film',
			genre='Modern',
			description='Contemporary',
			release_date=date(2024, 1, 1)
		)
		self.assertEqual(list(Movie.objects.all()), [second, first])


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
		res = self.client.get(self.list_url)
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertEqual(res.data['data']['count'], 1)
		self.assertEqual(len(res.data['data']['results']), 1)
		self.assertEqual(res.data['data']['results'][0]['review_count'], 0)

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
		self.assertFalse(res.data['success'])

		self.client.force_authenticate(user=self.admin)
		res = self.client.post(self.list_url, {
			'title': 'Interstellar',
			'genre': 'Sci-Fi',
			'description': 'Space adventures',
			'release_date': '2014-11-07'
		}, format='json')
		self.assertEqual(res.status_code, status.HTTP_201_CREATED)
		self.assertEqual(Movie.objects.count(), 2)
		self.assertEqual(res.data['data']['title'], 'Interstellar')

	def test_movie_detail_includes_review_stats(self):
		user = User.objects.create_user(
			email='reviewer@example.com', username='reviewer', password='ReviewPass123!'
		)
		Review.objects.create(user=user, movie=self.movie, content='Great!', rating=5)
		Review.objects.create(user=self.admin, movie=self.movie, content='Also good', rating=4)

		detail_url = reverse('movie-detail', args=[self.movie.pk])
		res = self.client.get(detail_url)
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertIn('review_stats', res.data['data'])
		stats = res.data['data']['review_stats']
		self.assertEqual(stats['total_reviews'], 2)
		self.assertEqual(stats['rating_distribution'][5], 1)
		self.assertEqual(res.data['data']['review_count'], 2)

	def test_movie_filters_by_rating_and_year(self):
		user = User.objects.create_user(
			email='filter@example.com', username='filter', password='FilterPass123!'
		)
		Review.objects.create(user=user, movie=self.movie, content='Amazing', rating=5)
		Review.objects.create(user=self.admin, movie=self.movie, content='Solid', rating=4)

		older_movie = Movie.objects.create(
			title='Classic Film',
			genre='Drama',
			description='Old but gold',
			release_date=date(2000, 1, 1)
		)
		Review.objects.create(user=user, movie=older_movie, content='Too old', rating=3)

		res = self.client.get(f"{self.list_url}?min_rating=4.5&year_from=2005&year_to=2015")
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertEqual(res.data['data']['count'], 1)
		movie_data = res.data['data']['results'][0]
		self.assertEqual(movie_data['title'], 'Inception')
		self.assertEqual(movie_data['review_count'], 2)
