"""
Quick check - why does create review show warning
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api"

print("🔍 Investigating Create Review Warning...\n")

# 1. Register a test user
import random
rand = random.randint(10000, 99999)
reg_data = {
    "username": f"debug_test_{rand}",
    "email": f"debug{rand}@test.com",
    "password": "DebugPass123!",
    "password_confirm": "DebugPass123!",
    "first_name": "Debug",
    "last_name": "Test"
}

print("1️⃣ Registering new user...")
r = requests.post(f"{BASE_URL}/users/register/", json=reg_data)
if r.status_code in [200, 201]:
    print(f"✅ User created: {reg_data['username']}")
    
    # 2. Login
    print("\n2️⃣ Logging in...")
    login_data = {
        "email": reg_data['email'],
        "password": reg_data['password']
    }
    r = requests.post(f"{BASE_URL}/users/login/", json=login_data)
    if r.status_code == 200:
        token = r.json()['data']['access']
        print(f"✅ Login successful, got token")
        
        # 3. Try to create review for The Godfather (movie 201)
        print("\n3️⃣ Attempting to create review for Movie 201...")
        headers = {"Authorization": f"Bearer {token}"}
        review_data = {
            "movie": 201,
            "rating": 5,
            "content": "Debug test review!"
        }
        
        r = requests.post(f"{BASE_URL}/reviews/", json=review_data, headers=headers)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.json()}")
        
        if r.status_code == 201:
            print("✅ Review created successfully!")
        else:
            print(f"⚠️ Could not create review: {r.status_code}")
            
        # 4. Try again (should fail with duplicate)
        print("\n4️⃣ Attempting to create DUPLICATE review...")
        r = requests.post(f"{BASE_URL}/reviews/", json=review_data, headers=headers)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.json()}")
        
        if r.status_code == 400:
            print("✅ Correctly prevented duplicate review!")
        
    else:
        print(f"❌ Login failed: {r.status_code}")
else:
    print(f"❌ Registration failed: {r.status_code}")
    print(f"Response: {r.text}")

print("\n" + "="*60)
print("✅ Investigation complete!")
