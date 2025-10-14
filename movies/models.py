from django.db import models
from django.utils.text import slugify


class Genre(models.Model):
	"""Genre model for movie categorization"""
	name = models.CharField(max_length=50, unique=True)
	slug = models.SlugField(unique=True, max_length=50)
	description = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['name']
		indexes = [
			models.Index(fields=['slug']),
			models.Index(fields=['name']),
		]

	def __str__(self):
		return self.name

	def save(self, *args, **kwargs):
		if not self.slug:
			self.slug = slugify(self.name)
		super().save(*args, **kwargs)


class Movie(models.Model):
	title = models.CharField(max_length=200)
	genre = models.CharField(max_length=100)  # Deprecated - will be removed after migration
	genres = models.ManyToManyField(Genre, related_name='movies', blank=True)
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
