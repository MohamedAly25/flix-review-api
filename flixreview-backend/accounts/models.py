from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser


class UserProfile(models.Model):
	"""Profile data linked to the custom user model"""

	user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
	preferred_genres = models.ManyToManyField('movies.Genre', blank=True, related_name='preferred_by_users')
	last_genre_update = models.DateTimeField(null=True, blank=True)

	def __str__(self) -> str:  # pragma: no cover - trivial
		return f"Profile for {self.user.email}"


class User(AbstractUser):
	email = models.EmailField(unique=True)
	bio = models.TextField(blank=True, null=True)
	profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)

	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = ['username']

	def __str__(self) -> str:
		return self.email


# Create your models here.
