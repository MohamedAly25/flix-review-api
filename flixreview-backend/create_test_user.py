#!/usr/bin/env python
"""Create or update test user for API testing"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movie_review_api.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Create or update test user
user, created = User.objects.get_or_create(
    username='testuser',
    defaults={
        'email': 'test@example.com',
        'first_name': 'Test',
        'last_name': 'User',
    }
)

# Always update password to ensure it's correct
user.set_password('testpass123')
user.save()

status = "created" if created else "updated"
print(f"✅ Test user {status}: {user.username}")
print(f"   Email: {user.email}")
print(f"   Password: testpass123")
