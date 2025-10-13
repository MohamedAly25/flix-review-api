from django.apps import AppConfig


class ReviewsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'reviews'

    def ready(self):
        # Use relative import so static analyzers can resolve it
        from . import signals  # noqa: F401
