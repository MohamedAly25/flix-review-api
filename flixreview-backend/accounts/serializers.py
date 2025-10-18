from datetime import timedelta

from django.core.cache import cache
from django.utils import timezone
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from movies.models import Genre
from movies.serializers import GenreSerializer
from .models import UserProfile


User = get_user_model()


class UserListSerializer(serializers.ModelSerializer):
	"""Simplified serializer for user list view"""
	profile_picture_url = serializers.SerializerMethodField()
	reviews_count = serializers.SerializerMethodField()

	class Meta:
		model = User
		fields = ('id', 'username', 'first_name', 'last_name', 'bio', 'profile_picture_url', 'reviews_count')
		read_only_fields = ('id', 'username', 'reviews_count')

	def get_profile_picture_url(self, obj):
		if obj.profile_picture:
			request = self.context.get('request')
			if request:
				return request.build_absolute_uri(obj.profile_picture.url)
			return obj.profile_picture.url
		return None

	def get_reviews_count(self, obj):
		return obj.reviews.count()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'bio', 'profile_picture'
        )

    def validate_email(self, value):
        """
        Check for existing email (case-insensitive) and provide user-friendly error.
        """
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                'An account with this email already exists. Please log in or use a different email address.'
            )
        return value.lower()  # Normalize email to lowercase

    def validate_username(self, value):
        """
        Check for existing username (case-insensitive) and provide user-friendly error.
        """
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                'This username is already taken. Please choose a different username.'
            )
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.get_token(self.user)

        data['access'] = str(refresh.access_token)
        data['refresh'] = str(refresh)
        data['user_id'] = self.user.id
        data['username'] = self.user.username
        data['email'] = self.user.email

        return data


class UserProfileSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()
    preferred_genres = serializers.SerializerMethodField()
    preferred_genre_ids = serializers.SerializerMethodField()
    last_genre_update = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'bio',
            'profile_picture',
            'profile_picture_url',
            'preferred_genres',
            'preferred_genre_ids',
            'last_genre_update',
        )
        read_only_fields = ('id', 'email', 'preferred_genres', 'preferred_genre_ids', 'last_genre_update')

    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None

    def _get_profile(self, obj):
        return getattr(obj, 'profile', None)

    def get_preferred_genres(self, obj):
        profile = self._get_profile(obj)
        if not profile:
            return []
        return GenreSerializer(profile.preferred_genres.all(), many=True).data

    def get_preferred_genre_ids(self, obj):
        profile = self._get_profile(obj)
        if not profile:
            return []
        return list(profile.preferred_genres.values_list('id', flat=True))

    def get_last_genre_update(self, obj):
        profile = self._get_profile(obj)
        if not profile or not profile.last_genre_update:
            return None
        return profile.last_genre_update


class UserPreferredGenresSerializer(serializers.ModelSerializer):
    preferred_genres = GenreSerializer(many=True, read_only=True)
    preferred_genre_ids = serializers.PrimaryKeyRelatedField(
        queryset=Genre.objects.all(),
        many=True,
        write_only=True,
        source='preferred_genres',
        required=True,
    )
    cooldown_active = serializers.SerializerMethodField()
    next_update_available_at = serializers.SerializerMethodField()
    days_until_next_update = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = (
            'preferred_genres',
            'preferred_genre_ids',
            'last_genre_update',
            'cooldown_active',
            'next_update_available_at',
            'days_until_next_update',
        )
        read_only_fields = ('preferred_genres', 'last_genre_update', 'cooldown_active', 'next_update_available_at', 'days_until_next_update')

    COOLDOWN_PERIOD = timedelta(days=7)

    def get_cooldown_active(self, obj):
        if not obj.last_genre_update:
            return False
        return (timezone.now() - obj.last_genre_update) < self.COOLDOWN_PERIOD

    def get_next_update_available_at(self, obj):
        if not obj.last_genre_update:
            return None
        return obj.last_genre_update + self.COOLDOWN_PERIOD

    def get_days_until_next_update(self, obj):
        if not obj.last_genre_update:
            return 0
        remaining = (obj.last_genre_update + self.COOLDOWN_PERIOD) - timezone.now()
        if remaining.total_seconds() <= 0:
            return 0
        return max(1, remaining.days + (1 if remaining.seconds else 0))

    def validate(self, attrs):
        preferred_genres = attrs.get('preferred_genres', [])
        genre_ids = [genre.id for genre in preferred_genres]

        if len(genre_ids) > 3:
            raise serializers.ValidationError({'preferred_genre_ids': 'You can select a maximum of 3 genres.'})

        if len(set(genre_ids)) != len(genre_ids):
            raise serializers.ValidationError({'preferred_genre_ids': 'Duplicate genres are not allowed.'})

        profile = self.instance
        if profile:
            current_ids = set(profile.preferred_genres.values_list('id', flat=True))
            new_ids = set(genre_ids)

            # If nothing changes, allow without cooldown
            if new_ids != current_ids:
                if profile.last_genre_update:
                    elapsed = timezone.now() - profile.last_genre_update
                    if elapsed < self.COOLDOWN_PERIOD:
                        days_remaining = self.get_days_until_next_update(profile)
                        message = f'You can update your preferences after {days_remaining} day(s).'
                        raise serializers.ValidationError({'detail': message})

        return attrs

    def update(self, instance, validated_data):
        preferred_genres = validated_data.get('preferred_genres', [])
        new_ids = {genre.id for genre in preferred_genres}
        current_ids = set(instance.preferred_genres.values_list('id', flat=True))

        if new_ids != current_ids:
            instance.preferred_genres.set(preferred_genres)
            instance.last_genre_update = timezone.now()
            instance.save(update_fields=['last_genre_update'])
        else:
            # Ensure the stored relations reflect the submitted order/count even if identical
            instance.preferred_genres.set(preferred_genres)
        self._invalidate_recommendation_cache(instance.user_id)
        return instance

    def _invalidate_recommendation_cache(self, user_id: int) -> None:
        cache.delete(f"taste_profile:user:{user_id}")
        for algorithm in ('hybrid', 'collaborative', 'content'):
            for limit in (10, 20, 30, 40, 50):
                cache.delete(f"recommendations:user:{user_id}:algo:{algorithm}:limit:{limit}")


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True, required=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password_confirm": "New passwords don't match."})
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class DeleteAccountSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, required=True)

    def validate_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Password is incorrect.")
        return value
