from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model


User = get_user_model()


class AccountsAPITests(APITestCase):
    def setUp(self):
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        self.profile_url = '/api/auth/profile/'
        self.profile_update_url = '/api/auth/profile/update/'
        self.profile_delete_url = '/api/auth/profile/delete/'

        self.user_payload = {
            'username': 'tester',
            'email': 'tester@example.com',
            'password': 'StrongPass123!',
            'password_confirm': 'StrongPass123!'
        }

    def authenticate(self):
        # Register user
        res = self.client.post(self.register_url, self.user_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        access = res.data['tokens']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')

    def test_register_and_login_flow(self):
        # Register
        res = self.client.post(self.register_url, self.user_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='tester@example.com').exists())

        # Login
        login_res = self.client.post(self.login_url, {
            'email': 'tester@example.com',
            'password': 'StrongPass123!'
        }, format='json')
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_res.data)

    def test_profile_get_update_delete(self):
        self.authenticate()

        # GET profile
        res = self.client.get(self.profile_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], 'tester@example.com')

        # UPDATE profile (no password fields required)
        res = self.client.put(self.profile_update_url, {
            'username': 'tester2',
            'email': 'tester@example.com',
            'first_name': 'Test',
            'last_name': 'User'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['username'], 'tester2')

        # DELETE profile
        res = self.client.delete(self.profile_delete_url)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(email='tester@example.com').exists())
from django.test import TestCase

# Create your tests here.
