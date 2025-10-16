from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views


urlpatterns = [
	path('register/', views.UserRegistrationView.as_view(), name='user-register'),
	path('login/', views.CustomTokenObtainPairView.as_view(), name='user-login'),
	path('profile/', views.UserProfileView.as_view(), name='user-profile'),
	path('genres/', views.UserPreferredGenresView.as_view(), name='user-preferred-genres'),
	path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
