#!/usr/bin/env python3
"""
Quick test to verify backend connectivity and recommendations endpoint
"""
import requests
import sys

def test_backend_connectivity():
    """Test if backend is running and accessible"""
    print("🧪 Testing Backend Connectivity")
    
    # Test basic connectivity
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running and accessible")
            print(f"   Health check response: {response.json()}")
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend at http://localhost:8000")
        print("   Make sure the backend is running with: python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        return False
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")
        return False
    
    # Test API docs accessibility
    try:
        response = requests.get("http://localhost:8000/docs", timeout=5)
        if response.status_code == 200:
            print("✅ API docs accessible at http://localhost:8000/docs")
        else:
            print(f"⚠️  API docs status: {response.status_code}")
    except Exception as e:
        print(f"⚠️  API docs not accessible: {e}")
    
    # Test recommendations endpoint (without auth - should get 401)
    try:
        response = requests.get("http://localhost:8000/api/v1/recommendations", timeout=5)
        if response.status_code == 401:
            print("✅ Recommendations endpoint is accessible (returns 401 as expected without auth)")
        elif response.status_code == 404:
            print("❌ Recommendations endpoint not found (404)")
            print("   This suggests the endpoint is not properly registered")
            return False
        else:
            print(f"⚠️  Recommendations endpoint status: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
    except Exception as e:
        print(f"❌ Error accessing recommendations endpoint: {e}")
        return False
    
    # Test CORS headers
    try:
        response = requests.options("http://localhost:8000/api/v1/recommendations", 
                                  headers={"Origin": "http://localhost:3000"}, 
                                  timeout=5)
        cors_headers = {
            'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
            'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
            'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        }
        print(f"✅ CORS headers: {cors_headers}")
        
        if cors_headers['access-control-allow-origin'] in ['*', 'http://localhost:3000']:
            print("✅ CORS is properly configured for frontend")
        else:
            print(f"⚠️  CORS might be misconfigured: {cors_headers['access-control-allow-origin']}")
    except Exception as e:
        print(f"⚠️  Could not test CORS: {e}")
    
    return True

def test_authentication():
    """Test basic authentication flow"""
    print("\n🔐 Testing Authentication")
    
    # This is a simplified test - in real testing you'd use a test user
    try:
        # Try to register/login a test user (simplified)
        response = requests.get("http://localhost:8000/api/v1/auth/me", timeout=5)
        if response.status_code == 401:
            print("✅ Authentication required as expected")
        else:
            print(f"⚠️  Auth endpoint status: {response.status_code}")
    except Exception as e:
        print(f"⚠️  Could not test auth endpoint: {e}")

if __name__ == "__main__":
    print("🚀 Backend Connectivity Test")
    print("=" * 50)
    
    if test_backend_connectivity():
        test_authentication()
        print("\n🎉 Backend connectivity test completed!")
        print("\nNext steps:")
        print("1. Ensure backend is running: python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        print("2. Check that you're logged in the frontend")
        print("3. Visit http://localhost:3000/receitas-sugeridas")
    else:
        print("\n❌ Backend connectivity issues detected!")
        print("\nTroubleshooting:")
        print("1. Start the backend: python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        print("2. Check for any error messages in the backend console")
        print("3. Verify the backend is listening on port 8000")
        sys.exit(1)
