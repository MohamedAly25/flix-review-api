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


# Create your models here.
