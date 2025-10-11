from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Review
from movies.models import Movie
from movies.serializers import MovieSerializer

User = get_user_model()


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    movie = MovieSerializer(read_only=True)
    movie_id = serializers.PrimaryKeyRelatedField(
        queryset=Movie.objects.all(),
        write_only=True,
        source='movie'
    )

    class Meta:
        model = Review
        fields = (
            'id', 'user', 'movie', 'movie_id', 'content',
            'rating', 'created_at', 'updated_at', 'is_edited'
        )
        read_only_fields = ('user', 'created_at', 'updated_at', 'is_edited')

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'movie' in validated_data:
            validated_data.pop('movie')
        return super().update(instance, validated_data)
