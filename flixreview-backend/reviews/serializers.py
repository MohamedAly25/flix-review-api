from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Review, ReviewLike, ReviewComment
from movies.models import Movie
from movies.serializers import MovieSerializer

User = get_user_model()


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    movie = MovieSerializer(read_only=True)
    movie_id = serializers.PrimaryKeyRelatedField(
        queryset=Movie.objects.all(),
        write_only=True,
        source='movie'
    )
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    user_has_liked = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            'id', 'user', 'movie', 'movie_id', 'content',
            'rating', 'created_at', 'updated_at', 'is_edited',
            'likes_count', 'comments_count', 'user_has_liked'
        )
        read_only_fields = ('user', 'created_at', 'updated_at', 'is_edited', 'likes_count', 'comments_count', 'user_has_liked')

    def get_user(self, obj):
        user = obj.user
        profile_picture_url = None
        if user.profile_picture:
            request = self.context.get('request')
            if request:
                profile_picture_url = request.build_absolute_uri(user.profile_picture.url)
            else:
                profile_picture_url = user.profile_picture.url
        
        return {
            'username': user.username,
            'profile_picture': {
                'url': profile_picture_url
            } if profile_picture_url else None
        }

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

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


class ReviewLikeSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = ReviewLike
        fields = ('id', 'user', 'review', 'created_at')
        read_only_fields = ('user', 'created_at')

    def get_user(self, obj):
        return {
            'username': obj.user.username,
            'id': obj.user.id
        }


class ReviewCommentSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    review_id = serializers.PrimaryKeyRelatedField(
        queryset=Review.objects.all(),
        write_only=True,
        source='review'
    )

    class Meta:
        model = ReviewComment
        fields = ('id', 'user', 'review', 'review_id', 'content', 'created_at', 'updated_at', 'is_edited')
        read_only_fields = ('user', 'created_at', 'updated_at', 'is_edited', 'review')

    def get_user(self, obj):
        user = obj.user
        profile_picture_url = None
        if user.profile_picture:
            request = self.context.get('request')
            if request:
                profile_picture_url = request.build_absolute_uri(user.profile_picture.url)
            else:
                profile_picture_url = user.profile_picture.url
        
        return {
            'username': user.username,
            'id': user.id,
            'profile_picture': {
                'url': profile_picture_url
            } if profile_picture_url else None
        }

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

