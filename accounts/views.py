from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from common.mixins import ApiResponseMixin

from .serializers import (
	UserRegistrationSerializer,
	CustomTokenObtainPairSerializer,
	UserProfileSerializer,
)


User = get_user_model()


@method_decorator(ratelimit(key='ip', rate='3/h', method='POST'), name='dispatch')
class UserRegistrationView(ApiResponseMixin, generics.CreateAPIView):
	"""
	User registration endpoint with rate limiting.
	Rate limit: 3 registration attempts per hour per IP address.
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
		return self.request.user

	def destroy(self, request, *args, **kwargs):
		instance = self.get_object()
		self.perform_destroy(instance)
		return Response({'detail': 'User account deleted'}, status=status.HTTP_200_OK)
