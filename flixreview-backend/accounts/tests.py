from django.test import TestCase, override_settings
from django.core.cache import cache
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model


User = get_user_model()




class UserModelTests(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			email='model@example.com',
			username='modeluser',
			password='StrongPass123!'
		)

	def test_str_returns_email(self):
		self.assertEqual(str(self.user), 'model@example.com')

	def test_username_field_configuration(self):
		self.assertEqual(User.USERNAME_FIELD, 'email')
		self.assertIn('username', User.REQUIRED_FIELDS)


class AccountsAPITests(APITestCase):
	def setUp(self):
		self.register_url = '/api/users/register/'
		self.login_url = '/api/users/login/'
		self.profile_url = '/api/users/profile/'

		self.user_payload = {
			'username': 'tester',
			'email': 'tester@example.com',
			'password': 'StrongPass123!',
			'password_confirm': 'StrongPass123!'
		}

	def authenticate(self):
		res = self.client.post(self.register_url, self.user_payload, format='json')
		self.assertEqual(res.status_code, status.HTTP_201_CREATED)
		access = res.data['data']['tokens']['access']
		self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')

	def test_register_and_login_flow(self):
		res = self.client.post(self.register_url, self.user_payload, format='json')
		self.assertEqual(res.status_code, status.HTTP_201_CREATED)
		self.assertTrue(User.objects.filter(email='tester@example.com').exists())
		self.assertTrue(res.data['success'])
		self.assertEqual(res.data['message'], 'User registered successfully')

		login_res = self.client.post(self.login_url, {
			'email': 'tester@example.com',
			'password': 'StrongPass123!'
		}, format='json')
		self.assertEqual(login_res.status_code, status.HTTP_200_OK)
		self.assertIn('access', login_res.data['data'])
		self.assertEqual(login_res.data['message'], 'Login successful')

	def test_profile_get_update_delete(self):
		self.authenticate()

		res = self.client.get(self.profile_url)
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertEqual(res.data['data']['email'], 'tester@example.com')

		res = self.client.put(self.profile_url, {
			'username': 'tester2',
			'email': 'tester@example.com',
			'first_name': 'Test',
			'last_name': 'User'
		}, format='json')
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertEqual(res.data['data']['username'], 'tester2')

		res = self.client.delete(self.profile_url)
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertFalse(User.objects.filter(email='tester@example.com').exists())


class SecurityTests(APITestCase):
	"""Test rate limiting and security measures on authentication endpoints."""
	
	def setUp(self):
		# Clear rate limit cache before each test
		cache.clear()
		
		self.register_url = '/api/users/register/'
		self.login_url = '/api/users/login/'
		
		# Create a test user for login attempts
		self.test_user = User.objects.create_user(
			email='testuser@example.com',
			username='testuser',
			password='StrongPass123!'
		)

	def tearDown(self):
		# Clear rate limit cache after each test
		cache.clear()

	@override_settings(RATELIMIT_ENABLE=True)
	def test_registration_rate_limit(self):
		"""Test that registration is rate limited to 30 attempts per hour."""
		# First 30 registration attempts should succeed or fail normally
		for i in range(30):
			res = self.client.post(self.register_url, {
				'username': f'user{i}',
				'email': f'user{i}@example.com',
				'password': 'StrongPass123!',
				'password_confirm': 'StrongPass123!'
			}, format='json')
			# Should either succeed (201) or have validation errors (400), but not rate limited
			self.assertIn(res.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])
		
		# 31st attempt should be rate limited
		res = self.client.post(self.register_url, {
			'username': 'user31',
			'email': 'user31@example.com',
			'password': 'StrongPass123!',
			'password_confirm': 'StrongPass123!'
		}, format='json')
		self.assertEqual(res.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
		data = res.json()
		self.assertFalse(data['success'])
		self.assertIn('too many', data['message'].lower())

	@override_settings(RATELIMIT_ENABLE=True)
	def test_login_rate_limit(self):
		"""Test that login is rate limited to 5 attempts per minute."""
		# First 5 login attempts should proceed normally (even if they fail auth)
		for i in range(5):
			res = self.client.post(self.login_url, {
				'email': 'testuser@example.com',
				'password': 'WrongPassword123!'
			}, format='json')
			# Should either succeed or have auth errors, but not rate limited
			self.assertIn(res.status_code, [status.HTTP_200_OK, status.HTTP_401_UNAUTHORIZED])
		
		# 6th attempt should be rate limited
		res = self.client.post(self.login_url, {
			'email': 'testuser@example.com',
			'password': 'StrongPass123!'
		}, format='json')
		self.assertEqual(res.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
		data = res.json()
		self.assertFalse(data['success'])
		self.assertIn('too many', data['message'].lower())

	@override_settings(RATELIMIT_ENABLE=False)
	def test_rate_limiting_can_be_disabled(self):
		"""Test that rate limiting can be disabled via settings."""
		# Make more than the rate limit number of requests
		for i in range(10):
			res = self.client.post(self.login_url, {
				'email': 'testuser@example.com',
				'password': 'WrongPassword123!'
			}, format='json')
			# None should be rate limited when RATELIMIT_ENABLE=False
			self.assertNotEqual(res.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
