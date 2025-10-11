from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model


User = get_user_model()


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
