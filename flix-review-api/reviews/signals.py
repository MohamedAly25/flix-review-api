from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg
from .models import Review


@receiver([post_save, post_delete], sender=Review)
def update_movie_avg_rating(sender, instance, **kwargs):
    movie = instance.movie
    avg_rating = Review.objects.filter(movie=movie).aggregate(Avg('rating'))['rating__avg']
    movie.avg_rating = round(avg_rating, 2) if avg_rating is not None else 0.00
    movie.save()
