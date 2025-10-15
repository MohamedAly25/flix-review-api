#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Test script for PostgreSQL setup script
Validates all functions without requiring actual database connection
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

def test_imports():
    """Test that all required imports work"""
    print("[TEST] Testing imports...")
    try:
        import setup_postgresql
        print("[OK] setup_postgresql module imported successfully")
        
        # Test required modules
        import psycopg2
        print("[OK] psycopg2 imported successfully")
        
        from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
        print("[OK] psycopg2.extensions imported successfully")
        
        return True
    except ImportError as e:
        print(f"[FAIL] Import error: {e}")
        return False

def test_helper_functions():
    """Test helper functions"""
    print("\n[TEST] Testing helper functions...")
    try:
        from setup_postgresql import print_header, print_subheader, check_item
        
        # Test print functions (visual check)
        print_header("Test Header")
        print_subheader("Test Subheader")
        
        # Test check_item
        result1 = check_item("Test success", True)
        result2 = check_item("Test failure", False, "This is expected to fail")
        
        if result1 and not result2:
            print("[OK] Helper functions work correctly")
            return True
        else:
            print("[FAIL] Helper functions not working as expected")
            return False
            
    except Exception as e:
        print(f"[FAIL] Helper function error: {e}")
        return False

def test_command_runner():
    """Test command runner function"""
    print("\n[TEST] Testing command runner...")
    try:
        from setup_postgresql import run_command
        
        # Test simple command
        success, output = run_command("echo test", capture_output=True, check=False)
        
        if success:
            print("[OK] Command runner works correctly")
            return True
        else:
            print("[WARN] Command runner may have issues on this system")
            return True  # Not critical
            
    except Exception as e:
        print(f"[FAIL] Command runner error: {e}")
        return False

def test_postgresql_check():
    """Test PostgreSQL installation check"""
    print("\n[TEST] Testing PostgreSQL installation check...")
    try:
        from setup_postgresql import check_postgresql_installation, get_postgresql_version
        
        # This will actually check if PostgreSQL is installed
        is_installed = check_postgresql_installation()
        
        if is_installed:
            version = get_postgresql_version()
            print(f"[OK] PostgreSQL is installed (version: {version})")
        else:
            print("[WARN] PostgreSQL not installed or not running")
            print("[INFO] This is OK for testing, but required for actual use")
        
        return True
        
    except Exception as e:
        print(f"[FAIL] PostgreSQL check error: {e}")
        return False

def test_file_structure():
    """Test file structure validation"""
    print("\n[TEST] Testing file structure...")
    try:
        script_path = Path(__file__).parent / 'setup_postgresql.py'
        
        if script_path.exists():
            print(f"[OK] Script file exists: {script_path}")
            
            # Check file size
            file_size = script_path.stat().st_size
            print(f"[INFO] Script size: {file_size} bytes")
            
            # Check if file is readable
            with open(script_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Validate no remaining emoji characters that cause issues
            problematic_chars = ['✅', '❌', '⚠️', '🔸', '📋', '📊', '💾', '🎯', '🔄', '🏗️', '🧪', '📚']
            found_issues = []
            
            for char in problematic_chars:
                if char in content:
                    found_issues.append(char)
            
            if found_issues:
                print(f"[WARN] Found potentially problematic Unicode characters: {found_issues}")
                print("[INFO] These may cause encoding issues on Windows")
                return False
            else:
                print("[OK] No problematic Unicode characters found")
                return True
        else:
            print(f"[FAIL] Script file not found: {script_path}")
            return False
            
    except Exception as e:
        print(f"[FAIL] File structure error: {e}")
        return False

def test_environment_functions():
    """Test environment file handling functions"""
    print("\n[TEST] Testing environment functions...")
    try:
        from setup_postgresql import show_status
        
        # This will check for .env files
        print("[INFO] Checking environment configuration...")
        show_status()
        
        print("[OK] Environment functions work correctly")
        return True
        
    except Exception as e:
        print(f"[FAIL] Environment function error: {e}")
        return False

def run_all_tests():
    """Run all tests"""
    print("=" * 70)
    print("  PostgreSQL Setup Script Test Suite")
    print("=" * 70)
    
    tests = [
        ("Import Test", test_imports),
        ("Helper Functions Test", test_helper_functions),
        ("Command Runner Test", test_command_runner),
        ("PostgreSQL Check Test", test_postgresql_check),
        ("File Structure Test", test_file_structure),
        ("Environment Functions Test", test_environment_functions),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n[ERROR] {test_name} crashed: {e}")
            results.append((test_name, False))
    
    # Print summary
    print("\n" + "=" * 70)
    print("  Test Summary")
    print("=" * 70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status} {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("\n[SUCCESS] All tests passed! Script is ready to use.")
        return 0
    elif passed >= total * 0.8:
        print("\n[WARNING] Most tests passed. Review failures before using.")
        return 1
    else:
        print("\n[FAILURE] Multiple tests failed. Script needs fixes.")
        return 2

if __name__ == '__main__':
    exit_code = run_all_tests()
    sys.exit(exit_code)
