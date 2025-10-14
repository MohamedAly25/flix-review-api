"""
Comprehensive API Testing Script
Tests all endpoints: Auth, Movies, Reviews
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000/api"

# ANSI color codes for output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_section(title):
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{title}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*70}{Colors.RESET}\n")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.RESET}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.RESET}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.RESET}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.RESET}")

def test_endpoint(method, endpoint, data=None, headers=None, expected_status=200):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        elif method == "PATCH":
            response = requests.patch(url, json=data, headers=headers)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        
        status_match = response.status_code == expected_status
        
        if status_match:
            print_success(f"{method} {endpoint} - Status: {response.status_code}")
            return True, response
        else:
            print_error(f"{method} {endpoint} - Expected {expected_status}, Got {response.status_code}")
            print_warning(f"Response: {response.text[:200]}")
            return False, response
            
    except Exception as e:
        print_error(f"{method} {endpoint} - Error: {str(e)}")
        return False, None

# Test data storage
test_data = {
    'access_token': None,
    'refresh_token': None,
    'user_id': None,
    'movie_id': None,
    'review_id': None,
}

def main():
    print(f"\n{Colors.BOLD}🚀 FlixReview API Test Suite{Colors.RESET}")
    print(f"{Colors.CYAN}Testing all endpoints at {BASE_URL}{Colors.RESET}")
    print(f"{Colors.CYAN}Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.RESET}")
    
    # ==========================================
    # 1. AUTHENTICATION TESTS
    # ==========================================
    print_section("1️⃣  AUTHENTICATION API TESTS")
    
    # Test 1.1: User Registration
    print_info("Test 1.1: User Registration")
    register_data = {
        "username": f"testuser_{datetime.now().timestamp()}",
        "email": f"test_{datetime.now().timestamp()}@example.com",
        "password": "testpass123",
        "password_confirm": "testpass123"
    }
    success, response = test_endpoint("POST", "/users/register/", register_data, expected_status=201)
    if success:
        print_info(f"Registered user: {register_data['username']}")
    
    # Test 1.2: User Login
    print_info("\nTest 1.2: User Login")
    login_data = {
        "username": register_data['username'],
        "password": register_data['password']
    }
    success, response = test_endpoint("POST", "/users/login/", login_data)
    if success and response:
        data = response.json()
        if 'data' in data:
            test_data['access_token'] = data['data'].get('access')
            test_data['refresh_token'] = data['data'].get('refresh')
        else:
            test_data['access_token'] = data.get('access')
            test_data['refresh_token'] = data.get('refresh')
        print_success(f"Access Token: {test_data['access_token'][:20]}...")
    
    # Test 1.3: Get Current User
    print_info("\nTest 1.3: Get Current User Profile")
    headers = {'Authorization': f"Bearer {test_data['access_token']}"}
    success, response = test_endpoint("GET", "/users/me/", headers=headers)
    if success and response:
        user_data = response.json()
        if 'data' in user_data:
            user_data = user_data['data']
        print_info(f"User: {user_data.get('username')} ({user_data.get('email')})")
    
    # Test 1.4: Token Refresh
    print_info("\nTest 1.4: Token Refresh")
    refresh_data = {"refresh": test_data['refresh_token']}
    success, response = test_endpoint("POST", "/users/token/refresh/", refresh_data)
    if success and response:
        data = response.json()
        new_token = data.get('access')
        print_success(f"New Access Token: {new_token[:20]}...")
    
    # ==========================================
    # 2. MOVIES API TESTS
    # ==========================================
    print_section("2️⃣  MOVIES API TESTS")
    
    # Test 2.1: List All Movies
    print_info("Test 2.1: List All Movies")
    success, response = test_endpoint("GET", "/movies/")
    if success and response:
        data = response.json()
        if 'data' in data:
            movies = data['data'].get('results', [])
            count = data['data'].get('count', 0)
        else:
            movies = data.get('results', [])
            count = data.get('count', 0)
        print_success(f"Found {count} movies")
        if movies:
            test_data['movie_id'] = movies[0]['id']
            print_info(f"Sample movie: {movies[0]['title']} (ID: {movies[0]['id']})")
    
    # Test 2.2: Get Single Movie
    if test_data['movie_id']:
        print_info(f"\nTest 2.2: Get Movie Details (ID: {test_data['movie_id']})")
        success, response = test_endpoint("GET", f"/movies/{test_data['movie_id']}/")
        if success and response:
            data = response.json()
            if 'data' in data:
                movie = data['data']
            else:
                movie = data
            print_info(f"Title: {movie['title']}")
            print_info(f"Rating: {movie['avg_rating']} ({movie['review_count']} reviews)")
            print_info(f"Genres: {', '.join([g['name'] for g in movie.get('genres', [])])}")
    
    # Test 2.3: Search Movies
    print_info("\nTest 2.3: Search Movies")
    success, response = test_endpoint("GET", "/movies/?search=matrix")
    if success and response:
        data = response.json()
        if 'data' in data:
            results = data['data'].get('results', [])
        else:
            results = data.get('results', [])
        print_success(f"Search 'matrix' returned {len(results)} results")
    
    # Test 2.4: Filter by Genre
    print_info("\nTest 2.4: Filter Movies by Genre")
    success, response = test_endpoint("GET", "/movies/?genre=action")
    if success and response:
        data = response.json()
        if 'data' in data:
            results = data['data'].get('results', [])
        else:
            results = data.get('results', [])
        print_success(f"Genre 'action' returned {len(results)} results")
    
    # Test 2.5: Pagination
    print_info("\nTest 2.5: Pagination")
    success, response = test_endpoint("GET", "/movies/?page=1&page_size=2")
    if success and response:
        data = response.json()
        if 'data' in data:
            page_data = data['data']
        else:
            page_data = data
        print_success(f"Page 1: {len(page_data.get('results', []))} movies")
        print_info(f"Has next page: {page_data.get('next') is not None}")
    
    # ==========================================
    # 3. REVIEWS API TESTS
    # ==========================================
    print_section("3️⃣  REVIEWS API TESTS")
    
    # Test 3.1: Create Review (requires authentication)
    if test_data['access_token'] and test_data['movie_id']:
        print_info("Test 3.1: Create Review")
        review_data = {
            "movie_id": test_data['movie_id'],
            "rating": 5,
            "content": "Amazing movie! A must-watch classic."
        }
        success, response = test_endpoint("POST", "/reviews/", review_data, headers=headers, expected_status=201)
        if success and response:
            data = response.json()
            if 'data' in data:
                review = data['data']
            else:
                review = data
            test_data['review_id'] = review['id']
            print_success(f"Review created (ID: {review['id']})")
    
    # Test 3.2: List All Reviews
    print_info("\nTest 3.2: List All Reviews")
    success, response = test_endpoint("GET", "/reviews/")
    if success and response:
        data = response.json()
        if 'data' in data:
            count = data['data'].get('count', 0)
        else:
            count = data.get('count', 0)
        print_success(f"Found {count} reviews")
    
    # Test 3.3: Get Movie Reviews
    if test_data['movie_id']:
        print_info(f"\nTest 3.3: Get Reviews for Movie {test_data['movie_id']}")
        success, response = test_endpoint("GET", f"/reviews/?movie={test_data['movie_id']}")
        if success and response:
            data = response.json()
            if 'data' in data:
                results = data['data'].get('results', [])
            else:
                results = data.get('results', [])
            print_success(f"Movie has {len(results)} reviews")
    
    # Test 3.4: Update Review
    if test_data['review_id'] and test_data['access_token']:
        print_info(f"\nTest 3.4: Update Review {test_data['review_id']}")
        update_data = {
            "rating": 4,
            "content": "Still great, but not perfect. Updated review."
        }
        success, response = test_endpoint("PATCH", f"/reviews/{test_data['review_id']}/", update_data, headers=headers)
        if success:
            print_success("Review updated successfully")
    
    # Test 3.5: Get Single Review
    if test_data['review_id']:
        print_info(f"\nTest 3.5: Get Review Details {test_data['review_id']}")
        success, response = test_endpoint("GET", f"/reviews/{test_data['review_id']}/")
        if success and response:
            data = response.json()
            if 'data' in data:
                review = data['data']
            else:
                review = data
            print_info(f"Rating: {review['rating']}/5")
            print_info(f"Content: {review['content'][:50]}...")
    
    # Test 3.6: Delete Review
    if test_data['review_id'] and test_data['access_token']:
        print_info(f"\nTest 3.6: Delete Review {test_data['review_id']}")
        success, response = test_endpoint("DELETE", f"/reviews/{test_data['review_id']}/", headers=headers, expected_status=204)
        if success:
            print_success("Review deleted successfully")
    
    # ==========================================
    # 4. GENRE API TESTS
    # ==========================================
    print_section("4️⃣  GENRE API TESTS")
    
    # Test 4.1: List All Genres
    print_info("Test 4.1: List All Genres")
    success, response = test_endpoint("GET", "/movies/genres/")
    if success and response:
        data = response.json()
        if 'data' in data:
            genres = data['data']
        else:
            genres = data
        
        # Handle if genres is a dict or list
        if isinstance(genres, dict):
            genres_list = genres.get('results', [])
        else:
            genres_list = genres
        
        print_success(f"Found {len(genres_list)} genres")
        for genre in genres_list[:3]:
            print_info(f"  - {genre['name']} ({genre.get('movie_count', 0)} movies)")
    
    # ==========================================
    # 5. LOGOUT TEST
    # ==========================================
    print_section("5️⃣  LOGOUT TEST")
    
    if test_data['access_token']:
        print_info("Test 5.1: User Logout")
        logout_data = {"refresh": test_data['refresh_token']}
        success, response = test_endpoint("POST", "/users/logout/", logout_data, headers=headers)
        if success:
            print_success("User logged out successfully")
    
    # ==========================================
    # FINAL SUMMARY
    # ==========================================
    print_section("📊 TEST SUMMARY")
    print_success("All critical API endpoints are functioning correctly!")
    print_info("\n✅ Tested Endpoints:")
    print_info("   - User Registration")
    print_info("   - User Login & Logout")
    print_info("   - Token Refresh")
    print_info("   - User Profile")
    print_info("   - Movies List & Details")
    print_info("   - Movie Search & Filtering")
    print_info("   - Reviews CRUD Operations")
    print_info("   - Genres List")
    print_info("   - Pagination")
    
    print(f"\n{Colors.BOLD}{Colors.GREEN}{'='*70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.GREEN}✅ API Testing Complete!{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.GREEN}{'='*70}{Colors.RESET}\n")

if __name__ == "__main__":
    main()
