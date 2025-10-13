import requests
import json

url = 'http://127.0.0.1:8000/api/auth/register/'
data = {
    'username': 'testuser',
    'email': 'test@example.com',
    'password': 'testpass123',
    'password2': 'testpass123'
}

try:
    response = requests.post(url, json=data)
    print(f'Status Code: {response.status_code}')
    print('Response:', response.text)
except Exception as e:
    print(f'Error: {e}')