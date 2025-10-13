from django.db import models


class Movie(models.Model):
	title = models.CharField(max_length=200)
	genre = models.CharField(max_length=100)
	description = models.TextField()
	release_date = models.DateField()
	avg_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
	poster_url = models.URLField(blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.title

	class Meta:
		ordering = ['-created_at']
		indexes = [
			models.Index(fields=['title']),
			models.Index(fields=['genre']),
			models.Index(fields=['avg_rating']),
		]


# Create your models here.
