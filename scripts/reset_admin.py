"""
Reset Admin Password
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movie_review_api.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 70)
print("🔄 Resetting Admin Password")
print("=" * 70)

admin = User.objects.filter(username='admin').first()
if admin:
    print(f"\n📧 Current Email: {admin.email}")
    
    # Update email
    admin.email = 'admin@flixreview.com'
    
    # Reset password
    admin.set_password('admin123')
    admin.save()
    
    print(f"✅ Updated Email: {admin.email}")
    print(f"✅ Password Reset: admin123")
    
    # Verify
    if admin.check_password('admin123'):
        print(f"\n✅ Password verification: SUCCESS")
    
    print(f"\n🔐 New Login Credentials:")
    print(f"   Username: admin")
    print(f"   Email: admin@flixreview.com")
    print(f"   Password: admin123")
else:
    print("\n❌ Admin user not found")

print("=" * 70)
