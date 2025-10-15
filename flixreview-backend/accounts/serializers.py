from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


User = get_user_model()


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

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'bio', 'profile_picture', 'profile_picture_url'
        )
        read_only_fields = ('id', 'email',)

    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None
