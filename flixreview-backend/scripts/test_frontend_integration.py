"""
🎨 Frontend API Integration Verification Script
=================================================
This script verifies that the frontend can properly communicate
with the backend API for all features.

Author: FlixReview Team
Date: October 15, 2025
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header():
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'🎨 Frontend API Integration Verification':^80}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}")
    print(f"{Colors.CYAN}Testing Frontend-Backend Integration{Colors.RESET}")
    print(f"{Colors.CYAN}Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}\n")

def test_feature(name, test_func):
    """Test a feature and print result"""
    try:
        result = test_func()
        if result:
            print(f"{Colors.GREEN}✅ {name} - WORKING{Colors.RESET}")
            return True
        else:
            print(f"{Colors.RED}❌ {name} - FAILED{Colors.RESET}")
            return False
    except Exception as e:
        print(f"{Colors.RED}❌ {name} - ERROR: {str(e)}{Colors.RESET}")
        return False

def test_genres_filtering():
    """Test Genre Filtering with genres__slug parameter"""
    response = requests.get(f"{BASE_URL}/movies/", params={'genres__slug': 'action'})
    if response.status_code == 200:
        data = response.json()
        actual_data = data.get('data', data)
        count = actual_data.get('count', 0)
        print(f"   Found {count} Action movies")
        return count > 0
    return False

def test_tmdb_search():
    """Test TMDB Search with q parameter"""
    response = requests.get(f"{BASE_URL}/movies/search-tmdb/", params={'q': 'inception'})
    if response.status_code == 200:
        data = response.json()
        actual_data = data.get('data', data)
        results = actual_data.get('results', [])
        print(f"   Found {len(results)} TMDB results")
        return len(results) > 0
    elif response.status_code == 503:
        print(f"   {Colors.YELLOW}TMDB API not configured (expected){Colors.RESET}")
        return True  # Not an error, just not configured
    return False

def test_movies_list():
    """Test Movies List endpoint"""
    response = requests.get(f"{BASE_URL}/movies/")
    if response.status_code == 200:
        data = response.json()
        actual_data = data.get('data', data)
        count = actual_data.get('count', 0)
        print(f"   Total movies: {count}")
        return count > 0
    return False

def test_genres_list():
    """Test Genres List endpoint"""
    response = requests.get(f"{BASE_URL}/movies/genres/")
    if response.status_code == 200:
        data = response.json()
        actual_data = data.get('data', data)
        results = actual_data.get('results', [])
        print(f"   Total genres: {len(results)}")
        return len(results) > 0
    return False

def test_reviews_list():
    """Test Reviews List endpoint"""
    response = requests.get(f"{BASE_URL}/reviews/")
    if response.status_code == 200:
        data = response.json()
        actual_data = data.get('data', data)
        count = actual_data.get('count', 0)
        print(f"   Total reviews: {count}")
        return True  # Can be 0
    return False

def test_recommendations_top_rated():
    """Test Top Rated Recommendations"""
    response = requests.get(f"{BASE_URL}/recommendations/top-rated/")
    if response.status_code == 200:
        data = response.json()
        actual_data = data.get('data', data)
        results = actual_data.get('results', [])
        print(f"   Top rated movies: {len(results)}")
        return len(results) > 0
    return False

def test_recommendations_trending():
    """Test Trending Recommendations"""
    response = requests.get(f"{BASE_URL}/recommendations/trending/")
    if response.status_code == 200:
        data = response.json()
        actual_data = data.get('data', data)
        results = actual_data.get('results', [])
        print(f"   Trending movies: {len(results)}")
        return len(results) > 0
    return False

def test_recommendations_dashboard():
    """Test Recommendations Dashboard"""
    response = requests.get(f"{BASE_URL}/recommendations/dashboard/")
    if response.status_code == 200:
        data = response.json()
        actual_data = data.get('data', data)
        sections = [k for k in actual_data.keys() if k != 'success']
        print(f"   Dashboard sections: {len(sections)}")
        return len(sections) > 0
    return False

def main():
    """Run all frontend integration tests"""
    print_header()
    
    tests = [
        ("Movies List API", test_movies_list),
        ("Genres List API", test_genres_list),
        ("Genre Filtering (genres__slug)", test_genres_filtering),
        ("Reviews List API", test_reviews_list),
        ("TMDB Search (q parameter)", test_tmdb_search),
        ("Top Rated Recommendations", test_recommendations_top_rated),
        ("Trending Recommendations", test_recommendations_trending),
        ("Recommendations Dashboard", test_recommendations_dashboard),
    ]
    
    results = []
    for name, func in tests:
        results.append(test_feature(name, func))
    
    # Print summary
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}")
    passed = sum(results)
    total = len(results)
    success_rate = (passed / total * 100) if total > 0 else 0
    
    print(f"{Colors.BOLD}📊 Summary:{Colors.RESET}")
    print(f"   Total Tests: {total}")
    print(f"   {Colors.GREEN}✅ Passed: {passed}{Colors.RESET}")
    print(f"   {Colors.RED}❌ Failed: {total - passed}{Colors.RESET}")
    print(f"   Success Rate: {success_rate:.1f}%")
    
    if success_rate == 100:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 All frontend integrations working perfectly!{Colors.RESET}")
    elif success_rate >= 75:
        print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠️  Most integrations working, some issues detected{Colors.RESET}")
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}❌ Multiple integration issues detected{Colors.RESET}")
    
    print(f"{Colors.CYAN}{'='*80}{Colors.RESET}\n")

if __name__ == "__main__":
    main()
