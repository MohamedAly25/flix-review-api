from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from datetime import date

from .models import Movie, Genre
from reviews.models import Review


User = get_user_model()


class GenreModelTests(TestCase):
	def test_genre_str_returns_name(self):
		genre = Genre.objects.create(name='Science Fiction')
		self.assertEqual(str(genre), 'Science Fiction')
	
	def test_genre_slug_auto_generated(self):
		genre = Genre.objects.create(name='Action & Adventure')
		self.assertEqual(genre.slug, 'action-adventure')
	
	def test_genre_ordering(self):
		sci_fi = Genre.objects.create(name='Sci-Fi')
		action = Genre.objects.create(name='Action')
		drama = Genre.objects.create(name='Drama')
		self.assertEqual(list(Genre.objects.all()), [action, drama, sci_fi])


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
	
	def test_movie_can_have_multiple_genres(self):
		movie = Movie.objects.create(
			title='The Matrix',
			genre='Action, Sci-Fi',
			description='Neo discovers the truth',
			release_date=date(1999, 3, 31)
		)
		action = Genre.objects.create(name='Action')
		sci_fi = Genre.objects.create(name='Sci-Fi')
		movie.genres.add(action, sci_fi)
		
		self.assertEqual(movie.genres.count(), 2)
		self.assertIn(action, movie.genres.all())
		self.assertIn(sci_fi, movie.genres.all())


class GenreAPITests(APITestCase):
	def setUp(self):
		self.admin = User.objects.create_superuser(
			email='admin@test.com', username='admin', password='AdminPass123!'
		)
		self.user = User.objects.create_user(
			email='user@test.com', username='user', password='UserPass123!'
		)
		self.genre_list_url = reverse('genre-list')
		self.action = Genre.objects.create(name='Action', description='Action movies')
		self.drama = Genre.objects.create(name='Drama', description='Dramatic films')
	
	def test_list_genres_public(self):
		"""Anyone can list genres"""
		res = self.client.get(self.genre_list_url)
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertTrue(res.data['success'])
		# Response is paginated
		self.assertIn('results', res.data['data'])
		self.assertEqual(len(res.data['data']['results']), 2)
	
	def test_retrieve_genre_by_slug(self):
		"""Anyone can retrieve a genre by slug"""
		url = reverse('genre-detail', args=[self.action.slug])
		res = self.client.get(url)
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertEqual(res.data['data']['name'], 'Action')
		self.assertEqual(res.data['data']['slug'], 'action')
	
	def test_create_genre_requires_admin(self):
		"""Only admin can create genres"""
		# Unauthenticated - returns 401
		res = self.client.post(self.genre_list_url, {'name': 'Horror'})
		self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
		
		# Regular user - returns 403
		self.client.force_authenticate(user=self.user)
		res = self.client.post(self.genre_list_url, {'name': 'Horror'})
		self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
		
		# Admin
		self.client.force_authenticate(user=self.admin)
		res = self.client.post(self.genre_list_url, {
			'name': 'Horror',
			'description': 'Scary movies'
		})
		self.assertEqual(res.status_code, status.HTTP_201_CREATED)
		self.assertTrue(res.data['success'])
		self.assertEqual(Genre.objects.count(), 3)
		self.assertEqual(res.data['data']['slug'], 'horror')
	
	def test_update_genre_requires_admin(self):
		"""Only admin can update genres"""
		url = reverse('genre-detail', args=[self.action.slug])
		
		# Regular user
		self.client.force_authenticate(user=self.user)
		res = self.client.patch(url, {'description': 'Updated description'})
		self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
		
		# Admin
		self.client.force_authenticate(user=self.admin)
		res = self.client.patch(url, {'description': 'Updated action description'})
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.action.refresh_from_db()
		self.assertEqual(self.action.description, 'Updated action description')
	
	def test_delete_genre_requires_admin(self):
		"""Only admin can delete genres"""
		url = reverse('genre-detail', args=[self.drama.slug])
		
		# Regular user
		self.client.force_authenticate(user=self.user)
		res = self.client.delete(url)
		self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
		
		# Admin
		self.client.force_authenticate(user=self.admin)
		res = self.client.delete(url)
		self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
		self.assertEqual(Genre.objects.count(), 1)
	
	def test_genre_movie_count(self):
		"""Genre serializer includes movie count"""
		movie1 = Movie.objects.create(
			title='Die Hard', genre='Action',
			description='Action movie', release_date=date(1988, 7, 15)
		)
		movie2 = Movie.objects.create(
			title='Mad Max', genre='Action',
			description='Another action movie', release_date=date(2015, 5, 15)
		)
		movie1.genres.add(self.action)
		movie2.genres.add(self.action)
		
		url = reverse('genre-detail', args=[self.action.slug])
		res = self.client.get(url)
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertEqual(res.data['data']['movie_count'], 2)


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
