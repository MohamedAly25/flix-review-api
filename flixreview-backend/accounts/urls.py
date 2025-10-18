from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views


urlpatterns = [
	path('', views.UserListView.as_view(), name='user-list'),
	path('register/', views.UserRegistrationView.as_view(), name='user-register'),
	path('login/', views.CustomTokenObtainPairView.as_view(), name='user-login'),
	path('profile/', views.UserProfileView.as_view(), name='user-profile'),
	path('genres/', views.UserPreferredGenresView.as_view(), name='user-preferred-genres'),
	path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
	path('delete-account/', views.DeleteAccountView.as_view(), name='delete-account'),
	path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	path('<str:username>/', views.UserDetailView.as_view(), name='user-detail'),
]
