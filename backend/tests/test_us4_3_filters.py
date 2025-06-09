#!/usr/bin/env python3

"""
Test script for US4.3 - Filtrar Recomendações de Receitas
Tests the new filtering parameters: max_calories, prioritize_expiring, limit, min_matching_ingredients
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "testpassword123"

def get_auth_token():
    """Get authentication token"""
    response = requests.post(f"{BASE_URL}/api/v1/auth/login", data={
        "username": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    })
    
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Authentication failed: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def test_us4_3_filters():
    """Test US4.3 filter parameters"""
    
    print("=== Testing US4.3: Filtrar Recomendações de Receitas ===\n")
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Failed to authenticate")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 1: AC4.3.1 - max_calories filter
    print("🧪 Test 1: AC4.3.1 - GET /recommendations?max_calories=...")
    response = requests.get(
        f"{BASE_URL}/api/v1/recommendations?max_calories=500", 
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Status: {response.status_code}")
        print(f"   Recommendations returned: {len(data['recommendations'])}")
        
        # Check if all recipes have max_calories <= 500 (or null)
        valid_calories = all(
            r['estimated_calories'] is None or r['estimated_calories'] <= 500 
            for r in data['recommendations']
        )
        print(f"   All recipes <= 500 calories: {'✅' if valid_calories else '❌'}")
    else:
        print(f"❌ Status: {response.status_code}")
        print(f"   Response: {response.text}")
    
    print()
    
    # Test 2: AC4.3.2 - prioritize_expiring filter
    print("🧪 Test 2: AC4.3.2 - GET /recommendations?prioritize_expiring=true")
    response = requests.get(
        f"{BASE_URL}/api/v1/recommendations?prioritize_expiring=true", 
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Status: {response.status_code}")
        print(f"   Recommendations returned: {len(data['recommendations'])}")
        
        # Check if recipes with expiring ingredients come first
        if data['recommendations']:
            has_expiring_first = True
            found_non_expiring = False
            for recipe in data['recommendations']:
                if len(recipe['expiring_ingredients_used']) == 0:
                    found_non_expiring = True
                elif found_non_expiring:
                    has_expiring_first = False
                    break
            
            print(f"   Expiring ingredients prioritized: {'✅' if has_expiring_first else '❌'}")
    else:
        print(f"❌ Status: {response.status_code}")
        print(f"   Response: {response.text}")
    
    print()
    
    # Test 3: AC4.3.3 - limit parameter
    print("🧪 Test 3: AC4.3.3 - GET /recommendations?limit=5")
    response = requests.get(
        f"{BASE_URL}/api/v1/recommendations?limit=5", 
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Status: {response.status_code}")
        print(f"   Recommendations returned: {len(data['recommendations'])}")
        print(f"   Limit respected (≤5): {'✅' if len(data['recommendations']) <= 5 else '❌'}")
    else:
        print(f"❌ Status: {response.status_code}")
        print(f"   Response: {response.text}")
    
    print()
    
    # Test 4: AC4.3.4 - min_matching_ingredients parameter
    print("🧪 Test 4: AC4.3.4 - GET /recommendations?min_matching_ingredients=2")
    response = requests.get(
        f"{BASE_URL}/api/v1/recommendations?min_matching_ingredients=2", 
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Status: {response.status_code}")
        print(f"   Recommendations returned: {len(data['recommendations'])}")
        
        # Check if all recipes have at least 2 matching ingredients
        valid_matching = all(
            len(r['matching_ingredients']) >= 2 
            for r in data['recommendations']
        )
        print(f"   All recipes >= 2 matching ingredients: {'✅' if valid_matching else '❌'}")
    else:
        print(f"❌ Status: {response.status_code}")
        print(f"   Response: {response.text}")
    
    print()
    
    # Test 5: Combined filters
    print("🧪 Test 5: Combined filters - max_calories=400&limit=3&min_matching_ingredients=1")
    response = requests.get(
        f"{BASE_URL}/api/v1/recommendations?max_calories=400&limit=3&min_matching_ingredients=1", 
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Status: {response.status_code}")
        print(f"   Recommendations returned: {len(data['recommendations'])}")
        print(f"   Limit respected (≤3): {'✅' if len(data['recommendations']) <= 3 else '❌'}")
        
        # Check calories and matching ingredients
        valid_calories = all(
            r['estimated_calories'] is None or r['estimated_calories'] <= 400 
            for r in data['recommendations']
        )
        valid_matching = all(
            len(r['matching_ingredients']) >= 1 
            for r in data['recommendations']
        )
        print(f"   All recipes <= 400 calories: {'✅' if valid_calories else '❌'}")
        print(f"   All recipes >= 1 matching ingredients: {'✅' if valid_matching else '❌'}")
    else:
        print(f"❌ Status: {response.status_code}")
        print(f"   Response: {response.text}")
    
    print()
    
    # Test 6: Parameter validation
    print("🧪 Test 6: Parameter validation - invalid values")
    
    # Test invalid limit (negative)
    response = requests.get(
        f"{BASE_URL}/api/v1/recommendations?limit=-1", 
        headers=headers
    )
    print(f"   Negative limit: {response.status_code} {'✅' if response.status_code == 422 else '❌'}")
    
    # Test invalid min_matching_ingredients (negative)
    response = requests.get(
        f"{BASE_URL}/api/v1/recommendations?min_matching_ingredients=0", 
        headers=headers
    )
    print(f"   Zero min_matching_ingredients: {response.status_code} {'✅' if response.status_code == 422 else '❌'}")
    
    print("\n=== US4.3 Testing Complete ===")
    return True

if __name__ == "__main__":
    success = test_us4_3_filters()
    sys.exit(0 if success else 1)
