from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
	email = models.EmailField(unique=True)
	bio = models.TextField(blank=True, null=True)
	profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)

	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = ['username']

	def __str__(self) -> str:
		return self.email


# Create your models here.
