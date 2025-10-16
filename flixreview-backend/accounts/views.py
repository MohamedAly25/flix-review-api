from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from common.mixins import ApiResponseMixin

from .models import UserProfile
from .serializers import (
	UserRegistrationSerializer,
	CustomTokenObtainPairSerializer,
	UserProfileSerializer,
	UserPreferredGenresSerializer,
	ChangePasswordSerializer,
	DeleteAccountSerializer,
)


User = get_user_model()


@method_decorator(ratelimit(key='ip', rate='30/h', method='POST'), name='dispatch')
class UserRegistrationView(ApiResponseMixin, generics.CreateAPIView):
	"""
	User registration endpoint with rate limiting.
	Rate limit: 30 registration attempts per hour per IP address.
	"""
	queryset = User.objects.all()
	serializer_class = UserRegistrationSerializer
	permission_classes = [permissions.AllowAny]
	success_messages = {'POST': 'User registered successfully'}

	def create(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = serializer.save()

		login_serializer = CustomTokenObtainPairSerializer(
			data={'email': user.email, 'password': request.data.get('password')}
		)
		login_serializer.is_valid(raise_exception=True)
		tokens = login_serializer.validated_data

		user_data = UserProfileSerializer(user).data
		return Response({'user': user_data, 'tokens': tokens}, status=status.HTTP_201_CREATED)


@method_decorator(ratelimit(key='ip', rate='5/m', method='POST'), name='dispatch')
class CustomTokenObtainPairView(ApiResponseMixin, TokenObtainPairView):
	"""
	User login endpoint with rate limiting.
	Rate limit: 5 login attempts per minute per IP address.
	"""
	serializer_class = CustomTokenObtainPairSerializer
	success_messages = {'POST': 'Login successful'}


class UserProfileView(ApiResponseMixin, generics.RetrieveUpdateDestroyAPIView):
	serializer_class = UserProfileSerializer
	permission_classes = [permissions.IsAuthenticated]
	success_messages = {
		'GET': 'Profile retrieved successfully',
		'PUT': 'Profile updated successfully',
		'PATCH': 'Profile updated successfully',
		'DELETE': 'User account deleted successfully',
	}

	def get_object(self):
		UserProfile.objects.get_or_create(user=self.request.user)
		return self.request.user

	def destroy(self, request, *args, **kwargs):
		instance = self.get_object()
		self.perform_destroy(instance)
		return Response({'detail': 'User account deleted'}, status=status.HTTP_200_OK)


class UserPreferredGenresView(ApiResponseMixin, generics.GenericAPIView):
	serializer_class = UserPreferredGenresSerializer
	permission_classes = [permissions.IsAuthenticated]
	success_messages = {
		'GET': 'Preferred genres retrieved successfully',
		'POST': 'Preferred genres updated successfully',
	}

	def get_profile(self):
		profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
		return profile

	def get(self, request, *args, **kwargs):
		profile = self.get_profile()
		serializer = self.get_serializer(profile, context={'request': request})
		return Response(serializer.data)

	def post(self, request, *args, **kwargs):
		profile = self.get_profile()
		serializer = self.get_serializer(profile, data=request.data, context={'request': request})
		serializer.is_valid(raise_exception=True)
		updated_profile = serializer.save()
		response_data = self.get_serializer(updated_profile, context={'request': request}).data
		return Response(response_data)


@method_decorator(ratelimit(key='user', rate='3/h', method='POST'), name='dispatch')
class ChangePasswordView(ApiResponseMixin, generics.GenericAPIView):
	"""
	Change user password with current password verification.
	Rate limit: 3 password changes per hour per user.
	"""
	serializer_class = ChangePasswordSerializer
	permission_classes = [permissions.IsAuthenticated]
	success_messages = {'POST': 'Password changed successfully'}

	def post(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response({'detail': 'Password changed successfully'})


@method_decorator(ratelimit(key='user', rate='1/h', method='POST'), name='dispatch')
class DeleteAccountView(ApiResponseMixin, generics.GenericAPIView):
	"""
	Delete user account with password verification.
	Rate limit: 1 account deletion per hour per user.
	"""
	serializer_class = DeleteAccountSerializer
	permission_classes = [permissions.IsAuthenticated]
	success_messages = {'POST': 'Account deleted successfully'}

	def post(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		# Delete the user account
		user = request.user
		user.delete()

		return Response({'detail': 'Account deleted successfully'}, status=status.HTTP_200_OK)
