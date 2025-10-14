"""
Check Admin User Credentials
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movie_review_api.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 70)
print("🔍 Checking Admin User")
print("=" * 70)

admin = User.objects.filter(username='admin').first()
if admin:
    print(f"\n✅ Admin User Found:")
    print(f"   Username: {admin.username}")
    print(f"   Email: {admin.email}")
    print(f"   Is Staff: {admin.is_staff}")
    print(f"   Is Superuser: {admin.is_superuser}")
    print(f"   Is Active: {admin.is_active}")
    
    print(f"\n🔐 Login Credentials for Admin Panel:")
    print(f"   Username: admin")
    print(f"   Password: admin123")
    print(f"\n   OR")
    print(f"   Email: {admin.email}")
    print(f"   Password: admin123")
    
    # Test password
    if admin.check_password('admin123'):
        print(f"\n✅ Password 'admin123' is CORRECT")
    else:
        print(f"\n❌ Password 'admin123' is INCORRECT")
else:
    print("\n❌ Admin user not found")
    print("\nCreating new admin user...")
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@flixreview.com',
        password='admin123'
    )
    print(f"✅ Admin created: admin@flixreview.com / admin123")

print("=" * 70)
