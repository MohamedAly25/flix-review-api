from django.db import models
from django.contrib.auth import get_user_model
from movies.models import Movie

User = get_user_model()


class Review(models.Model):
	RATING_CHOICES = [(i, i) for i in range(1, 6)]

	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
	movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='reviews')
	content = models.TextField()
	rating = models.IntegerField(choices=RATING_CHOICES)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	is_edited = models.BooleanField(default=False)

	def __str__(self):
		return f"{self.user.username} - {self.movie.title}"

	class Meta:
		unique_together = ['user', 'movie']
		ordering = ['-created_at']
		indexes = [
			models.Index(fields=['movie', 'rating']),
			models.Index(fields=['user', 'created_at']),
			models.Index(fields=['rating', 'created_at']),
			models.Index(fields=['movie', 'created_at']),
		]


class ReviewLike(models.Model):
	"""Track which users have liked which reviews"""
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='review_likes')
	review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='likes')
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.user.username} likes {self.review}"

	class Meta:
		unique_together = ['user', 'review']
		ordering = ['-created_at']
		indexes = [
			models.Index(fields=['review', '-created_at']),
			models.Index(fields=['user', '-created_at']),
		]


class ReviewComment(models.Model):
	"""Comments on reviews"""
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='review_comments')
	review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='comments')
	content = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	is_edited = models.BooleanField(default=False)

	def __str__(self):
		return f"{self.user.username} commented on {self.review}"

	class Meta:
		ordering = ['-created_at']
		indexes = [
			models.Index(fields=['review', '-created_at']),
			models.Index(fields=['user', '-created_at']),
		]
