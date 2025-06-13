"""
Test script to demonstrate the custom recipe generation functionality.
This would work with proper authentication in a real scenario.
"""

import json
import requests
from typing import Dict, Any

# Test data - simulating pantry items that would be retrieved from database
sample_pantry_items = [
    {
        "item_name": "chicken breast",
        "quantity": 2.0,
        "unit": "pieces",
        "expiration_date": "2025-06-10",
        "calories_per_unit": 150
    },
    {
        "item_name": "rice",
        "quantity": 1.5,
        "unit": "cups",
        "expiration_date": None,
        "calories_per_unit": 200
    },
    {
        "item_name": "broccoli",
        "quantity": 300,
        "unit": "grams",
        "expiration_date": "2025-06-05",
        "calories_per_unit": 25
    }
]

def test_gemini_service():
    """Test the Gemini service directly"""
    from app.services.gemini_service import generate_custom_recipe
    
    print("Testing Gemini Recipe Generation Service...")
    
    try:
        result = generate_custom_recipe(
            pantry_items=sample_pantry_items,
            max_calories=600,
            preparation_time_limit=30,
            dietary_restrictions="none",
            cuisine_preference="healthy",
            additional_notes="I prefer simple recipes"
        )
        
        if result["success"]:
            print("PASS: Recipe generation successful")
            print(f"Recipe Name: {result['recipe'].recipe_name}")
            print(f"Prep Time: {result['recipe'].preparation_time_minutes} minutes")
            print(f"Calories: {result['recipe'].estimated_calories}")
            print(f"Ingredients: {len(result['recipe'].ingredients)} items")
        else:
            print(f"FAIL: Recipe generation failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"FAIL: Test failed with exception: {str(e)}")

def test_endpoint_structure():
    """Test the endpoint structure without authentication"""
    print("\nTesting API Endpoint Structure...")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/ai/custom-recipes",
            json={
                "pantry_item_ids": [1, 2],
                "max_calories": 500,
                "preparation_time_limit": 30
            },
            timeout=5
        )
        
        if response.status_code == 403:
            print("PASS: Endpoint exists and authentication is working")
        else:
            print(f"FAIL: Unexpected response: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("FAIL: Could not connect to backend - make sure it's running")
    except Exception as e:
        print(f"FAIL: Endpoint test failed: {str(e)}")

if __name__ == "__main__":
    print("PlanEats Custom Recipe Generation Test")
    print("=" * 50)
    
    test_gemini_service()
    test_endpoint_structure()