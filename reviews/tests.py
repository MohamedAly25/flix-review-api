from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from datetime import date

from movies.models import Movie
from .models import Review


User = get_user_model()


class ReviewAPITests(APITestCase):
	def setUp(self):
		self.movie = Movie.objects.create(
			title='Tenet',
			genre='Sci-Fi',
			description='Time inversion',
			release_date=date(2020, 9, 3)
		)
		self.list_url = reverse('review-list')
		self.search_url = reverse('review-search')
		self.detail_name = 'review-detail'
		self.by_movie_url = reverse('review-by-movie', kwargs={'title': self.movie.title})
		self.user = User.objects.create_user(
			email='user1@example.com', username='user1', password='UserPass123!'
		)
		self.other_user = User.objects.create_user(
			email='user2@example.com', username='user2', password='UserPass456!'
		)

	def authenticate(self, user):
		self.client.force_authenticate(user=user)

	def test_create_and_list_reviews_with_filters(self):
		self.authenticate(self.user)
		res = self.client.post(self.list_url, {
			'movie_id': self.movie.id,
			'content': 'Amazing film',
			'rating': 5
		}, format='json')
		self.assertEqual(res.status_code, status.HTTP_201_CREATED)
		self.assertEqual(res.data['data']['rating'], 5)

		Review.objects.create(user=self.other_user, movie=self.movie, content='Pretty good', rating=4)

		res = self.client.get(f"{self.list_url}?min_rating=5")
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertEqual(res.data['data']['count'], 1)
		self.assertEqual(len(res.data['data']['results']), 1)

		res = self.client.get(f"{self.list_url}?movie=ten")
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertEqual(res.data['data']['count'], 2)

		search_res = self.client.get(f"{self.search_url}?q=tenet&min_rating=4")
		self.assertEqual(search_res.status_code, status.HTTP_200_OK)
		self.assertEqual(search_res.data['data']['count'], 2)

	def test_only_owner_can_modify_review(self):
		review = Review.objects.create(user=self.user, movie=self.movie, content='Solid', rating=4)
		review_url = reverse(self.detail_name, args=[review.pk])

		self.authenticate(self.user)
		res = self.client.put(review_url, {
			'movie_id': self.movie.id,
			'content': 'Updated content',
			'rating': 3
		}, format='json')
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		review.refresh_from_db()
		self.assertTrue(review.is_edited)
		self.assertEqual(review.rating, 3)

		self.authenticate(self.other_user)
		res = self.client.put(review_url, {
			'movie_id': self.movie.id,
			'content': 'Hacked',
			'rating': 1
		}, format='json')
		self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
		self.assertFalse(res.data['success'])

		self.authenticate(self.user)
		res = self.client.delete(review_url)
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertFalse(Review.objects.filter(pk=review.pk).exists())

	def test_review_by_movie_endpoint(self):
		Review.objects.create(user=self.user, movie=self.movie, content='Loved it', rating=5)
		Review.objects.create(user=self.other_user, movie=self.movie, content='It was ok', rating=3)

		res = self.client.get(self.by_movie_url)
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertEqual(res.data['data']['count'], 2)
		self.assertEqual(len(res.data['data']['results']), 2)
