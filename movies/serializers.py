from rest_framework import serializers

from .models import Movie


class MovieSerializer(serializers.ModelSerializer):
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Movie
        fields = (
            'id', 'title', 'genre', 'description', 'release_date',
            'avg_rating', 'poster_url', 'created_at', 'updated_at', 'review_count'
        )
        read_only_fields = ('avg_rating', 'created_at', 'updated_at', 'review_count')
