"""
Docker Container Test Script
Tests the AI service Docker container locally
"""

import time
import requests
import sys

print("🐳 Testing AI Service Docker Container\n")

# Test configuration
BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_endpoint(name, url, expected_keys=None):
    """Test an API endpoint"""
    try:
        print(f"Testing {name}... ", end="")
        response = requests.get(url, timeout=TIMEOUT)
        
        if response.status_code != 200:
            print(f"❌ FAILED (Status: {response.status_code})")
            return False
        
        data = response.json()
        
        if expected_keys:
            for key in expected_keys:
                if key not in data:
                    print(f"❌ FAILED (Missing key: {key})")
                    return False
        
        print("✅ PASSED")
        print(f"   Response: {data}")
        return True
    
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED ({str(e)})")
        return False
    except Exception as e:
        print(f"❌ FAILED ({str(e)})")
        return False

def main():
    print(f"Target: {BASE_URL}\n")
    print("=" * 60)
    
    # Wait for container to be ready
    print("⏳ Waiting for container to start...")
    max_retries = 10
    for i in range(max_retries):
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=5)
            if response.status_code == 200:
                print("✅ Container is ready!\n")
                break
        except:
            pass
        
        if i < max_retries - 1:
            time.sleep(3)
    else:
        print("❌ Container failed to start within timeout\n")
        sys.exit(1)
    
    print("=" * 60)
    print("\n📋 Running Tests:\n")
    
    results = []
    
    # Test 1: Root endpoint
    results.append(test_endpoint(
        "Root Endpoint",
        f"{BASE_URL}/",
        ["service", "version", "status"]
    ))
    print()
    
    # Test 2: Health check
    results.append(test_endpoint(
        "Health Check",
        f"{BASE_URL}/health",
        ["status", "model", "cache"]
    ))
    print()
    
    # Test 3: Model info
    results.append(test_endpoint(
        "Model Info",
        f"{BASE_URL}/model-info",
        ["success", "data"]
    ))
    print()
    
    # Test 4: Cache stats
    results.append(test_endpoint(
        "Cache Stats",
        f"{BASE_URL}/cache/stats",
        ["success", "data"]
    ))
    print()
    
    # Summary
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"\n📊 Test Summary: {passed}/{total} tests passed")
    
    if passed == total:
        print("✅ All tests passed! Container is working correctly.\n")
        return 0
    else:
        print(f"❌ {total - passed} test(s) failed.\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
