#!/usr/bin/env python3
"""
Simple test to check if recipes endpoint works
"""
import requests
import json

def test_recipes_endpoint():
    """Test the recipes endpoint directly"""
    
    # Test basic endpoint
    try:
        response = requests.get("http://localhost:8000/api/v1/recipes", timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"Error Response: {response.text}")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_recipes_endpoint()
