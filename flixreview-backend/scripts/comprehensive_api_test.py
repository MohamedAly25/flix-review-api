"""
🚀 FlixReview - Comprehensive API Testing Suite
================================================
Enhanced version combining best practices from multiple test files.
Tests all endpoints with proper error handling and detailed reporting.

Author: FlixReview Team
Date: October 15, 2025
Version: 2.0
"""

import requests
import json
from datetime import datetime
from typing import Dict, Any, Tuple, Optional

# Configuration
BASE_URL = "http://127.0.0.1:8000/api"
TIMEOUT = 10  # seconds

# ANSI color codes for beautiful output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'
    RESET = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

# Test statistics
class TestStats:
    total_tests = 0
    passed_tests = 0
    failed_tests = 0
    warnings = 0
    errors = []
    
    @classmethod
    def increment_total(cls):
        cls.total_tests += 1
    
    @classmethod
    def increment_passed(cls):
        cls.passed_tests += 1
    
    @classmethod
    def increment_failed(cls):
        cls.failed_tests += 1
    
    @classmethod
    def add_error(cls, error_msg: str):
        cls.errors.append(error_msg)
    
    @classmethod
    def add_warning(cls):
        cls.warnings += 1
    
    @classmethod
    def get_pass_rate(cls) -> float:
        if cls.total_tests == 0:
            return 0.0
        return (cls.passed_tests / cls.total_tests) * 100

def print_header():
    """Print beautiful header"""
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'🚀 FlixReview API Comprehensive Test Suite':^80}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}")
    print(f"{Colors.CYAN}Testing Backend: {BASE_URL}{Colors.RESET}")
    print(f"{Colors.CYAN}Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}\n")

def print_section(title: str, icon: str = "📋"):
    """Print section header"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{icon} {title}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.RESET}\n")

def print_success(message: str):
    """Print success message"""
    print(f"{Colors.GREEN}✅ {message}{Colors.RESET}")

def print_error(message: str):
    """Print error message"""
    print(f"{Colors.RED}❌ {message}{Colors.RESET}")

def print_info(message: str):
    """Print info message"""
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.RESET}")

def print_warning(message: str):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.RESET}")

def print_test_result(test_name: str, passed: bool, details: str = "", important: bool = False):
    """Print test result with consistent formatting"""
    TestStats.increment_total()
    
    if passed:
        TestStats.increment_passed()
        status = f"{Colors.GREEN}✓ PASS{Colors.RESET}"
        if important:
            print(f"\n{Colors.BOLD}{status} - {test_name}{Colors.RESET}")
        else:
            print(f"{status} - {test_name}")
        if details:
            print(f"  {Colors.CYAN}{details}{Colors.RESET}")
    else:
        TestStats.increment_failed()
        status = f"{Colors.RED}✗ FAIL{Colors.RESET}"
        print(f"\n{Colors.BOLD}{status} - {test_name}{Colors.RESET}")
        if details:
            print(f"  {Colors.YELLOW}{details}{Colors.RESET}")
            TestStats.add_error(f"{test_name}: {details}")

def make_request(method: str, endpoint: str, data: Optional[Dict] = None, 
                 headers: Optional[Dict] = None, expected_status: int = 200,
                 params: Optional[Dict] = None) -> Tuple[bool, Optional[requests.Response]]:
    """
    Make HTTP request with error handling
    
    Args:
        method: HTTP method (GET, POST, PATCH, DELETE)
        endpoint: API endpoint (e.g., '/users/login/')
        data: Request body data
        headers: Request headers
        expected_status: Expected HTTP status code
        params: URL query parameters
        
    Returns:
        Tuple of (success: bool, response: Response or None)
    """
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, params=params, timeout=TIMEOUT)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, params=params, timeout=TIMEOUT)
        elif method == "PATCH":
            response = requests.patch(url, json=data, headers=headers, params=params, timeout=TIMEOUT)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, params=params, timeout=TIMEOUT)
        else:
            return False, None
        
        success = response.status_code == expected_status
        return success, response
        
    except requests.exceptions.Timeout:
        print_error(f"Timeout: {method} {endpoint}")
        return False, None
    except requests.exceptions.ConnectionError:
        print_error(f"Connection Error: {method} {endpoint} - Is the server running?")
        return False, None
    except Exception as e:
        print_error(f"Exception: {method} {endpoint} - {str(e)}")
        return False, None

def extract_data(response: requests.Response) -> Any:
    """
    Extract data from response, handling both wrapped and unwrapped formats
    Supports: {"data": {...}}, {"results": [...]}, and direct data
    """
    try:
        json_data = response.json()
        
        # Check if data is wrapped in "data" key
        if isinstance(json_data, dict) and 'data' in json_data:
            return json_data['data']
        
        return json_data
    except:
        return None

# Global test data storage
test_data = {
    'access_token': None,
    'refresh_token': None,
    'user_id': None,
    'username': None,
    'movie_id': None,
    'review_id': None,
    'genre_slug': None,
}

def test_authentication():
    """Test all authentication endpoints"""
    print_section("AUTHENTICATION API TESTS", "🔐")
    
    # Generate unique username for this test run
    timestamp = datetime.now().timestamp()
    test_username = f"testuser_{int(timestamp)}"
    test_email = f"test_{int(timestamp)}@example.com"
    test_password = "TestPass123!"
    
    # Test 1: User Registration
    print_info("Test 1.1: User Registration")
    registration_data = {
        "username": test_username,
        "email": test_email,
        "password": test_password,
        "password_confirm": test_password
    }
    
    success, response = make_request("POST", "/users/register/", registration_data, expected_status=201)
    if success:
        print_test_result("User Registration", True, f"Created user: {test_username}")
        test_data['username'] = test_username
    else:
        error_msg = f"Status: {response.status_code if response else 'No response'}"
        if response:
            try:
                error_data = response.json()
                if 'errors' in error_data:
                    error_msg += f" | Errors: {error_data['errors']}"
            except:
                pass
        print_test_result("User Registration", False, error_msg)
        return  # Can't continue without registration
    
    # Test 2: User Login
    print_info("\nTest 1.2: User Login")
    login_data = {
        "email": test_email,  # Login uses email, not username
        "password": test_password
    }
    
    success, response = make_request("POST", "/users/login/", login_data, expected_status=200)
    if success and response:
        data = extract_data(response)
        test_data['access_token'] = data.get('access')
        test_data['refresh_token'] = data.get('refresh')
        test_data['user_id'] = data.get('user_id')
        
        token_preview = test_data['access_token'][:30] + "..." if test_data['access_token'] else "None"
        print_test_result("User Login", True, 
                         f"Access Token: {token_preview} | User ID: {test_data['user_id']}", 
                         important=True)
    else:
        error_msg = f"Status: {response.status_code if response else 'No response'}"
        if response:
            try:
                error_data = response.json()
                if 'errors' in error_data:
                    error_msg += f" | Errors: {error_data['errors']}"
            except:
                pass
        print_test_result("User Login", False, error_msg)
        return
    
    # Test 3: Get User Profile
    print_info("\nTest 1.3: Get User Profile")
    headers = {'Authorization': f"Bearer {test_data['access_token']}"}
    
    success, response = make_request("GET", "/users/profile/", headers=headers, expected_status=200)
    if success and response:
        data = extract_data(response)
        print_test_result("Get User Profile", True, 
                         f"User: {data.get('username')} | Email: {data.get('email')}")
    else:
        print_test_result("Get User Profile", False, 
                         f"Status: {response.status_code if response else 'No response'}")
    
    # Test 4: Update User Profile
    print_info("\nTest 1.4: Update User Profile")
    update_data = {
        "first_name": "Test",
        "last_name": "User",
        "bio": "Automated test user profile"
    }
    
    success, response = make_request("PATCH", "/users/profile/", update_data, headers=headers, expected_status=200)
    if success:
        print_test_result("Update User Profile", True, "Profile updated successfully")
    else:
        print_test_result("Update User Profile", False, 
                         f"Status: {response.status_code if response else 'No response'}")
    
    # Test 5: Token Refresh
    print_info("\nTest 1.5: Token Refresh")
    refresh_data = {"refresh": test_data['refresh_token']}
    
    success, response = make_request("POST", "/users/token/refresh/", refresh_data, expected_status=200)
    if success and response:
        data = extract_data(response)
        new_token = data.get('access', 'N/A')
        token_preview = new_token[:30] + "..." if len(str(new_token)) > 30 else new_token
        print_test_result("Token Refresh", True, f"New Token: {token_preview}")
    else:
        print_test_result("Token Refresh", False, 
                         f"Status: {response.status_code if response else 'No response'}")

def test_movies():
    """Test all movie endpoints"""
    print_section("MOVIES API TESTS", "🎬")
    
    # Test 1: List All Movies
    print_info("Test 2.1: List All Movies")
    success, response = make_request("GET", "/movies/", expected_status=200)
    
    if success and response:
        data = extract_data(response)
        movie_count = data.get('count', 0)
        results = data.get('results', [])
        
        if results:
            test_data['movie_id'] = results[0]['id']
            sample_movie = results[0]['title']
            print_test_result("List Movies", True, 
                            f"Found {movie_count} movies | Sample: {sample_movie} (ID: {test_data['movie_id']})",
                            important=True)
        else:
            print_test_result("List Movies", True, f"Found {movie_count} movies (empty database)")
    else:
        print_test_result("List Movies", False, 
                         f"Status: {response.status_code if response else 'No response'}")
    
    # Test 2: Get Movie Detail
    if test_data['movie_id']:
        print_info(f"\nTest 2.2: Get Movie Details (ID: {test_data['movie_id']})")
        success, response = make_request("GET", f"/movies/{test_data['movie_id']}/", expected_status=200)
        
        if success and response:
            movie = extract_data(response)
            genres = ', '.join([g['name'] for g in movie.get('genres', [])])
            print_test_result("Get Movie Detail", True,
                            f"Title: {movie['title']} | Rating: {movie.get('avg_rating', 0)} | Genres: {genres}")
        else:
            print_test_result("Get Movie Detail", False,
                            f"Status: {response.status_code if response else 'No response'}")
    else:
        print_warning("Skipping Movie Detail test - no movie_id available")
    
    # Test 3: Search Movies
    print_info("\nTest 2.3: Search Movies")
    success, response = make_request("GET", "/movies/", params={'search': 'god'}, expected_status=200)
    
    if success and response:
        data = extract_data(response)
        results = data.get('results', [])
        print_test_result("Search Movies", True, f"Search 'god' returned {len(results)} results")
    else:
        print_test_result("Search Movies", False,
                         f"Status: {response.status_code if response else 'No response'}")
    
    # Test 4: Filter by Genre
    print_info("\nTest 2.4: Filter Movies by Genre")
    success, response = make_request("GET", "/movies/", params={'genres__slug': 'action'}, expected_status=200)
    
    if success and response:
        data = extract_data(response)
        results = data.get('results', [])
        print_test_result("Filter by Genre", True, f"Genre 'action' returned {len(results)} results")
    else:
        print_test_result("Filter by Genre", False,
                         f"Status: {response.status_code if response else 'No response'}")
    
    # Test 5: Pagination
    print_info("\nTest 2.5: Pagination")
    success, response = make_request("GET", "/movies/", params={'page': 1, 'page_size': 5}, expected_status=200)
    
    if success and response:
        data = extract_data(response)
        results = data.get('results', [])
        has_next = data.get('next') is not None
        print_test_result("Pagination", True, 
                         f"Page 1: {len(results)} items | Has next: {has_next}")
    else:
        print_test_result("Pagination", False,
                         f"Status: {response.status_code if response else 'No response'}")
    
    # Test 6: Similar Movies
    if test_data['movie_id']:
        print_info(f"\nTest 2.6: Similar Movies (ID: {test_data['movie_id']})")
        success, response = make_request("GET", f"/recommendations/movies/{test_data['movie_id']}/similar/", 
                                        params={'limit': 6}, expected_status=200)
        
        if success and response:
            data = extract_data(response)
            if isinstance(data, list):
                count = len(data)
            else:
                count = len(data.get('results', []))
            print_test_result("Similar Movies", True, f"Found {count} similar movies")
        else:
            print_test_result("Similar Movies", False,
                            f"Status: {response.status_code if response else 'No response'}")

def test_genres():
    """Test all genre endpoints"""
    print_section("GENRES API TESTS", "🎭")
    
    # Test 1: List All Genres
    print_info("Test 3.1: List All Genres")
    success, response = make_request("GET", "/movies/genres/", expected_status=200)
    
    if success and response:
        data = extract_data(response)
        
        # Handle both list and paginated response
        if isinstance(data, dict):
            genres_list = data.get('results', [])
            total_count = data.get('count', len(genres_list))
        else:
            genres_list = data
            total_count = len(genres_list)
        
        if genres_list:
            test_data['genre_slug'] = genres_list[0].get('slug')
            
        print_test_result("List Genres", True, f"Found {total_count} genres", important=True)
        
        # Show top 3 genres with movie counts
        for genre in genres_list[:3]:
            print_info(f"  • {genre['name']} - {genre.get('movie_count', 0)} movies (slug: {genre['slug']})")
    else:
        print_test_result("List Genres", False,
                         f"Status: {response.status_code if response else 'No response'}")
    
    # Test 2: Get Genre Detail
    if test_data['genre_slug']:
        print_info(f"\nTest 3.2: Get Genre Detail (slug: {test_data['genre_slug']})")
        success, response = make_request("GET", f"/movies/genres/{test_data['genre_slug']}/", expected_status=200)
        
        if success and response:
            genre = extract_data(response)
            print_test_result("Get Genre Detail", True,
                            f"Genre: {genre.get('name')} | Movies: {genre.get('movie_count', 0)}")
        else:
            print_test_result("Get Genre Detail", False,
                            f"Status: {response.status_code if response else 'No response'}")
    else:
        print_warning("Skipping Genre Detail test - no genre_slug available")

def test_reviews():
    """Test all review endpoints"""
    print_section("REVIEWS API TESTS", "⭐")
    
    # Test 1: List All Reviews
    print_info("Test 4.1: List All Reviews")
    success, response = make_request("GET", "/reviews/", expected_status=200)
    
    if success and response:
        data = extract_data(response)
        count = data.get('count', 0)
        print_test_result("List Reviews", True, f"Found {count} reviews")
    else:
        print_test_result("List Reviews", False,
                         f"Status: {response.status_code if response else 'No response'}")
    
    # Test 2: Create Review (requires authentication and movie)
    if test_data['access_token'] and test_data['movie_id']:
        print_info(f"\nTest 4.2: Create Review (Movie ID: {test_data['movie_id']})")
        headers = {'Authorization': f"Bearer {test_data['access_token']}"}
        review_data = {
            "movie_id": test_data['movie_id'],
            "rating": 5,
            "content": "Amazing movie! This is an automated test review created by the comprehensive test suite."
        }
        
        success, response = make_request("POST", "/reviews/", review_data, headers=headers, expected_status=201)
        
        if success and response:
            review = extract_data(response)
            test_data['review_id'] = review.get('id')
            print_test_result("Create Review", True, 
                            f"Review ID: {test_data['review_id']} | Rating: {review.get('rating')}/5",
                            important=True)
        else:
            print_test_result("Create Review", False,
                            f"Status: {response.status_code if response else 'No response'}")
    else:
        print_warning("Skipping Create Review - authentication or movie_id not available")
    
    # Test 3: Get Movie Reviews
    if test_data['movie_id']:
        print_info(f"\nTest 4.3: Get Reviews for Movie {test_data['movie_id']}")
        success, response = make_request("GET", "/reviews/", params={'movie': test_data['movie_id']}, expected_status=200)
        
        if success and response:
            data = extract_data(response)
            results = data.get('results', [])
            print_test_result("Get Movie Reviews", True, f"Movie has {len(results)} reviews")
        else:
            print_test_result("Get Movie Reviews", False,
                            f"Status: {response.status_code if response else 'No response'}")
    
    # Test 4: Get Review Detail
    if test_data['review_id']:
        print_info(f"\nTest 4.4: Get Review Detail (ID: {test_data['review_id']})")
        success, response = make_request("GET", f"/reviews/{test_data['review_id']}/", expected_status=200)
        
        if success and response:
            review = extract_data(response)
            content_preview = review.get('content', '')[:50] + "..."
            print_test_result("Get Review Detail", True,
                            f"Rating: {review.get('rating')}/5 | Content: {content_preview}")
        else:
            print_test_result("Get Review Detail", False,
                            f"Status: {response.status_code if response else 'No response'}")
    
    # Test 5: Update Review
    if test_data['access_token'] and test_data['review_id']:
        print_info(f"\nTest 4.5: Update Review (ID: {test_data['review_id']})")
        headers = {'Authorization': f"Bearer {test_data['access_token']}"}
        update_data = {
            "rating": 4,
            "content": "Updated review content. Still a great movie but reduced rating for testing purposes."
        }
        
        success, response = make_request("PATCH", f"/reviews/{test_data['review_id']}/", 
                                        update_data, headers=headers, expected_status=200)
        
        if success:
            print_test_result("Update Review", True, "Review updated successfully")
        else:
            print_test_result("Update Review", False,
                            f"Status: {response.status_code if response else 'No response'}")
    
    # Test 6: Search Reviews
    print_info("\nTest 4.6: Search Reviews")
    success, response = make_request("GET", "/reviews/search/", params={'q': 'great'}, expected_status=200)
    
    if success and response:
        data = extract_data(response)
        results = data.get('results', [])
        print_test_result("Search Reviews", True, f"Search 'great' returned {len(results)} results")
    else:
        print_test_result("Search Reviews", False,
                         f"Status: {response.status_code if response else 'No response'}")
    
    # Test 7: Delete Review (cleanup)
    if test_data['access_token'] and test_data['review_id']:
        print_info(f"\nTest 4.7: Delete Review (ID: {test_data['review_id']})")
        headers = {'Authorization': f"Bearer {test_data['access_token']}"}
        
        success, response = make_request("DELETE", f"/reviews/{test_data['review_id']}/", 
                                        headers=headers, expected_status=204)
        
        if success:
            print_test_result("Delete Review", True, "Review deleted successfully (cleanup)")
        else:
            print_test_result("Delete Review", False,
                            f"Status: {response.status_code if response else 'No response'}")

def test_recommendations():
    """Test all recommendation endpoints"""
    print_section("RECOMMENDATIONS API TESTS", "🎯")
    
    # Test 1: Top Rated Movies
    print_info("Test 5.1: Top Rated Movies")
    success, response = make_request("GET", "/recommendations/top-rated/", expected_status=200)
    
    if success and response:
        data = extract_data(response)
        results = data.get('results', [])
        print_test_result("Top Rated Movies", True, f"Found {len(results)} top-rated movies")
    else:
        print_test_result("Top Rated Movies", False,
                         f"Status: {response.status_code if response else 'No response'}")
    
    # Test 2: Trending Movies
    print_info("\nTest 5.2: Trending Movies")
    success, response = make_request("GET", "/recommendations/trending/", expected_status=200)
    
    if success and response:
        data = extract_data(response)
        results = data.get('results', [])
        print_test_result("Trending Movies", True, f"Found {len(results)} trending movies")
    else:
        print_test_result("Trending Movies", False,
                         f"Status: {response.status_code if response else 'No response'}")
    
    # Test 3: Most Reviewed Movies
    print_info("\nTest 5.3: Most Reviewed Movies")
    success, response = make_request("GET", "/recommendations/most-reviewed/", expected_status=200)
    
    if success and response:
        data = extract_data(response)
        results = data.get('results', [])
        print_test_result("Most Reviewed Movies", True, f"Found {len(results)} most-reviewed movies")
    else:
        print_test_result("Most Reviewed Movies", False,
                         f"Status: {response.status_code if response else 'No response'}")
    
    # Test 4: Recent Movies
    print_info("\nTest 5.4: Recent Movies")
    success, response = make_request("GET", "/recommendations/recent/", expected_status=200)
    
    if success and response:
        data = extract_data(response)
        results = data.get('results', [])
        print_test_result("Recent Movies", True, f"Found {len(results)} recent movies")
    else:
        print_test_result("Recent Movies", False,
                         f"Status: {response.status_code if response else 'No response'}")
    
    # Test 5: Recommendations Dashboard
    print_info("\nTest 5.5: Recommendations Dashboard")
    success, response = make_request("GET", "/recommendations/dashboard/", expected_status=200)
    
    if success and response:
        data = extract_data(response)
        sections = len(data.keys()) if isinstance(data, dict) else 0
        print_test_result("Recommendations Dashboard", True, 
                         f"Dashboard has {sections} sections", important=True)
    else:
        print_test_result("Recommendations Dashboard", False,
                         f"Status: {response.status_code if response else 'No response'}")
    
    # Test 6: Personalized Recommendations (requires authentication)
    if test_data['access_token']:
        print_info("\nTest 5.6: Personalized Recommendations")
        headers = {'Authorization': f"Bearer {test_data['access_token']}"}
        
        success, response = make_request("GET", "/recommendations/personalized/", 
                                        headers=headers, expected_status=200)
        
        if success and response:
            data = extract_data(response)
            results = data.get('results', [])
            algorithm = data.get('algorithm', 'N/A')
            print_test_result("Personalized Recommendations", True,
                            f"Algorithm: {algorithm} | Results: {len(results)}")
        else:
            print_test_result("Personalized Recommendations", False,
                            f"Status: {response.status_code if response else 'No response'}")
    else:
        print_warning("Skipping Personalized Recommendations - authentication not available")
    
    # Test 7: User Taste Profile (requires authentication)
    if test_data['access_token']:
        print_info("\nTest 5.7: User Taste Profile")
        headers = {'Authorization': f"Bearer {test_data['access_token']}"}
        
        success, response = make_request("GET", "/recommendations/taste-profile/", 
                                        headers=headers, expected_status=200)
        
        if success and response:
            data = extract_data(response)
            total_reviews = data.get('total_reviews', 0)
            fav_genres = len(data.get('favorite_genres', []))
            print_test_result("User Taste Profile", True,
                            f"Reviews: {total_reviews} | Favorite Genres: {fav_genres}")
        else:
            print_test_result("User Taste Profile", False,
                            f"Status: {response.status_code if response else 'No response'}")

def test_tmdb_integration():
    """Test TMDB integration endpoints"""
    print_section("TMDB INTEGRATION TESTS", "🎥")
    
    # Test 1: Search TMDB
    print_info("Test 6.1: Search TMDB")
    success, response = make_request("GET", "/movies/search-tmdb/", 
                                    params={'q': 'inception'}, expected_status=200)
    
    if success and response:
        data = extract_data(response)
        results = data.get('results', [])
        print_test_result("Search TMDB", True, f"Search 'inception' returned {len(results)} results")
        
        if results:
            print_info(f"  • Sample: {results[0].get('title', 'N/A')} ({results[0].get('release_date', 'N/A')[:4]})")
    else:
        # TMDB search might fail if API key is missing or invalid
        TestStats.add_warning()
        print_warning(f"TMDB Search failed - Status: {response.status_code if response else 'No response'}")
        print_warning("  This might be due to missing/invalid TMDB API key")

def verify_data_integrity():
    """Verify database has expected data"""
    print_section("DATA INTEGRITY VERIFICATION", "🔍")
    
    # Verify Movies Count
    print_info("Test 7.1: Verify Movies Count (Expected: ≥98)")
    success, response = make_request("GET", "/movies/", expected_status=200)
    
    if success and response:
        data = extract_data(response)
        count = data.get('count', 0)
        passed = count >= 98
        
        if passed:
            print_test_result("Movies Count Verification", True, 
                            f"Database has {count} movies ✓", important=True)
        else:
            print_test_result("Movies Count Verification", False,
                            f"Database has only {count} movies (expected ≥98)")
    else:
        print_test_result("Movies Count Verification", False, "Could not fetch movies")
    
    # Verify Genres Count
    print_info("\nTest 7.2: Verify Genres Count (Expected: ≥10)")
    success, response = make_request("GET", "/movies/genres/", expected_status=200)
    
    if success and response:
        data = extract_data(response)
        
        if isinstance(data, dict):
            count = data.get('count', len(data.get('results', [])))
        else:
            count = len(data)
        
        passed = count >= 10
        
        if passed:
            print_test_result("Genres Count Verification", True,
                            f"Database has {count} genres ✓", important=True)
        else:
            print_test_result("Genres Count Verification", False,
                            f"Database has only {count} genres (expected ≥10)")
    else:
        print_test_result("Genres Count Verification", False, "Could not fetch genres")

def print_final_report():
    """Print comprehensive final report"""
    print_section("FINAL TEST REPORT", "📊")
    
    # Statistics
    pass_rate = TestStats.get_pass_rate()
    
    print(f"{Colors.BOLD}Test Statistics:{Colors.RESET}")
    print(f"  Total Tests: {Colors.CYAN}{TestStats.total_tests}{Colors.RESET}")
    print(f"  Passed: {Colors.GREEN}{TestStats.passed_tests}{Colors.RESET}")
    print(f"  Failed: {Colors.RED}{TestStats.failed_tests}{Colors.RESET}")
    print(f"  Warnings: {Colors.YELLOW}{TestStats.warnings}{Colors.RESET}")
    print(f"  Pass Rate: {Colors.BOLD}{pass_rate:.1f}%{Colors.RESET}")
    
    # Overall Status
    print(f"\n{Colors.BOLD}Overall Status:{Colors.RESET}")
    if pass_rate >= 90:
        print(f"{Colors.GREEN}✅ EXCELLENT - API is in great shape!{Colors.RESET}")
    elif pass_rate >= 75:
        print(f"{Colors.YELLOW}⚠️  GOOD - Some issues need attention{Colors.RESET}")
    elif pass_rate >= 50:
        print(f"{Colors.YELLOW}⚠️  FAIR - Multiple issues found{Colors.RESET}")
    else:
        print(f"{Colors.RED}❌ POOR - Significant issues detected{Colors.RESET}")
    
    # Errors Summary
    if TestStats.errors:
        print(f"\n{Colors.BOLD}Errors Found:{Colors.RESET}")
        for idx, error in enumerate(TestStats.errors[:10], 1):  # Show first 10 errors
            print(f"{Colors.RED}  {idx}. {error}{Colors.RESET}")
        
        if len(TestStats.errors) > 10:
            print(f"{Colors.YELLOW}  ... and {len(TestStats.errors) - 10} more errors{Colors.RESET}")
    
    # Recommendations
    print(f"\n{Colors.BOLD}Recommendations:{Colors.RESET}")
    if TestStats.failed_tests == 0:
        print(f"{Colors.GREEN}  ✅ All tests passed! API is production-ready.{Colors.RESET}")
    else:
        print(f"{Colors.YELLOW}  • Review failed tests and fix underlying issues{Colors.RESET}")
        print(f"{Colors.YELLOW}  • Check server logs for detailed error messages{Colors.RESET}")
        print(f"{Colors.YELLOW}  • Verify database migrations are up to date{Colors.RESET}")
    
    if TestStats.warnings > 0:
        print(f"{Colors.YELLOW}  • Address warnings for optimal functionality{Colors.RESET}")
    
    # Footer
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'Test Suite Completed':^80}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}\n")

def main():
    """Main test execution"""
    print_header()
    
    try:
        # Run all test suites
        test_authentication()
        test_movies()
        test_genres()
        test_reviews()
        test_recommendations()
        test_tmdb_integration()
        verify_data_integrity()
        
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}⚠️  Test suite interrupted by user{Colors.RESET}")
    except Exception as e:
        print(f"\n\n{Colors.RED}❌ Unexpected error: {str(e)}{Colors.RESET}")
    finally:
        # Always print final report
        print_final_report()

if __name__ == "__main__":
    main()
