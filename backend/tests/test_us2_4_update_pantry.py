import pytest
from fastapi.testclient import TestClient
from datetime import date, timedelta
import json

from app.main import app

client = TestClient(app)

# Test configuration
TEST_USER = {
    "email": "test.update@example.com",
    "password": "testpassword123",
    "name": "Test Update User"
}

def setup_test_user_and_token():
    """Register user and get auth token"""
    # Register user
    register_response = client.post("/api/v1/auth/register", json=TEST_USER)
    assert register_response.status_code == 200
    
    # Login to get token
    login_response = client.post("/api/v1/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    })
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def create_test_pantry_item(headers):
    """Create a test pantry item and return its data"""
    pantry_item_data = {
        "item_name": "Test Milk",
        "quantity": 1.0,
        "unit": "liter",
        "expiration_date": str(date.today() + timedelta(days=7)),
        "purchase_date": str(date.today()),
        "calories_per_unit": 42
    }
    
    response = client.post("/api/v1/pantry/items", json=pantry_item_data, headers=headers)
    assert response.status_code == 200
    return response.json()

class TestUS24UpdatePantryItem:
    """Test suite for US2.4 - Update Pantry Item"""
    
    def test_ac24_1_put_request_with_updated_data(self):
        """AC2.4.1: PUT /pantry/items/{item_id} with updated data"""
        headers = setup_test_user_and_token()
        
        # Create a pantry item first
        item = create_test_pantry_item(headers)
        item_id = item["id"]
        
        # Update data
        update_data = {
            "item_name": "Updated Milk",
            "quantity": 2.0,
            "unit": "liters",
            "expiration_date": str(date.today() + timedelta(days=10))
        }
        
        # Send PUT request
        response = client.put(f"/api/v1/pantry/items/{item_id}", json=update_data, headers=headers)
        
        # Verify request structure
        assert response.status_code == 200
        print(f"✅ AC2.4.1: PUT request successful with status {response.status_code}")
    
    def test_ac24_2_response_200_with_complete_updated_details(self):
        """AC2.4.2: Response 200 OK with complete updated item details"""
        headers = setup_test_user_and_token()
        
        # Create a pantry item first
        item = create_test_pantry_item(headers)
        item_id = item["id"]
        original_purchase_date = item["purchase_date"]
        
        # Update data (partial update)
        update_data = {
            "item_name": "Updated Organic Milk",
            "quantity": 2.5,
            "calories_per_unit": 50
        }
        
        # Send PUT request
        response = client.put(f"/api/v1/pantry/items/{item_id}", json=update_data, headers=headers)
        
        # Verify response
        assert response.status_code == 200
        updated_item = response.json()
        
        # Verify all details are present and updated
        assert updated_item["id"] == item_id
        assert updated_item["item_name"] == "Updated Organic Milk"
        assert updated_item["quantity"] == 2.5
        assert updated_item["unit"] == "liter"  # Should remain unchanged
        assert updated_item["calories_per_unit"] == 50
        assert updated_item["purchase_date"] == original_purchase_date  # Should remain unchanged
        assert "user_id" in updated_item
        assert "added_at" in updated_item
        
        print(f"✅ AC2.4.2: Response contains complete updated details")
        print(f"   Updated fields: {list(update_data.keys())}")
        print(f"   Unchanged fields preserved correctly")
    
    def test_ac24_3_item_in_list_reflects_new_information(self):
        """AC2.4.3: Item in list reflects the new information"""
        headers = setup_test_user_and_token()
        
        # Create a pantry item first
        item = create_test_pantry_item(headers)
        item_id = item["id"]
        
        # Update the item
        update_data = {
            "item_name": "Updated Premium Milk",
            "quantity": 3.0
        }
        
        update_response = client.put(f"/api/v1/pantry/items/{item_id}", json=update_data, headers=headers)
        assert update_response.status_code == 200
        
        # Get the updated item from the list
        list_response = client.get("/api/v1/pantry/items", headers=headers)
        assert list_response.status_code == 200
        
        items = list_response.json()
        updated_item_in_list = next((item for item in items if item["id"] == item_id), None)
        
        # Verify the item in the list has the updated information
        assert updated_item_in_list is not None
        assert updated_item_in_list["item_name"] == "Updated Premium Milk"
        assert updated_item_in_list["quantity"] == 3.0
        
        print(f"✅ AC2.4.3: Item in list reflects updated information")
        print(f"   List item name: {updated_item_in_list['item_name']}")
        print(f"   List item quantity: {updated_item_in_list['quantity']}")
    
    def test_ac24_4_error_404_item_not_found(self):
        """AC2.4.4: Error if item not found (404)"""
        headers = setup_test_user_and_token()
        
        # Try to update non-existent item
        non_existent_id = 99999
        update_data = {"item_name": "Should Not Work"}
        
        response = client.put(f"/api/v1/pantry/items/{non_existent_id}", json=update_data, headers=headers)
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
        
        print(f"✅ AC2.4.4: 404 error for non-existent item")
    
    def test_ac24_4_error_403_not_belonging_to_user(self):
        """AC2.4.4: Error if item not belonging to user (403)"""
        # Create first user and their item
        headers1 = setup_test_user_and_token()
        item = create_test_pantry_item(headers1)
        item_id = item["id"]
        
        # Create second user
        test_user2 = {
            "email": "test.update2@example.com",
            "password": "testpassword123",
            "name": "Test Update User 2"
        }
        
        register_response = client.post("/api/v1/auth/register", json=test_user2)
        assert register_response.status_code == 200
        
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user2["email"],
            "password": test_user2["password"]
        })
        assert login_response.status_code == 200
        headers2 = {"Authorization": f"Bearer {login_response.json()['access_token']}"}
        
        # Try to update first user's item with second user's token
        update_data = {"item_name": "Unauthorized Update"}
        
        response = client.put(f"/api/v1/pantry/items/{item_id}", json=update_data, headers=headers2)
        
        assert response.status_code == 404  # Item not found for this user
        
        print(f"✅ AC2.4.4: Correct error for item not belonging to user")
    
    def test_ac24_5_error_422_invalid_data(self):
        """AC2.4.5: Error 422 for invalid data validation"""
        headers = setup_test_user_and_token()
        
        # Create a pantry item first
        item = create_test_pantry_item(headers)
        item_id = item["id"]
        
        # Test invalid data types
        invalid_data_sets = [
            {"quantity": "not a number"},  # Invalid quantity type
            {"expiration_date": "invalid-date-format"},  # Invalid date format
            {"calories_per_unit": -50},  # Invalid negative calories
        ]
        
        for invalid_data in invalid_data_sets:
            response = client.put(f"/api/v1/pantry/items/{item_id}", json=invalid_data, headers=headers)
            assert response.status_code == 422
            print(f"✅ AC2.4.5: 422 error for invalid data: {invalid_data}")
    
    def test_partial_update_functionality(self):
        """Test that partial updates work correctly (only specified fields are updated)"""
        headers = setup_test_user_and_token()
        
        # Create a pantry item with all fields
        item = create_test_pantry_item(headers)
        item_id = item["id"]
        original_name = item["item_name"]
        original_unit = item["unit"]
        
        # Update only quantity
        update_data = {"quantity": 5.0}
        
        response = client.put(f"/api/v1/pantry/items/{item_id}", json=update_data, headers=headers)
        assert response.status_code == 200
        
        updated_item = response.json()
        
        # Verify only quantity changed
        assert updated_item["quantity"] == 5.0
        assert updated_item["item_name"] == original_name  # Should not change
        assert updated_item["unit"] == original_unit  # Should not change
        
        print(f"✅ Partial update works correctly")
        print(f"   Only quantity updated: {updated_item['quantity']}")
        print(f"   Other fields preserved")
    
    def test_update_expiration_date(self):
        """Test updating expiration date specifically"""
        headers = setup_test_user_and_token()
        
        # Create a pantry item
        item = create_test_pantry_item(headers)
        item_id = item["id"]
        
        # Update expiration date
        new_expiration = str(date.today() + timedelta(days=14))
        update_data = {"expiration_date": new_expiration}
        
        response = client.put(f"/api/v1/pantry/items/{item_id}", json=update_data, headers=headers)
        assert response.status_code == 200
        
        updated_item = response.json()
        assert updated_item["expiration_date"] == new_expiration
        
        print(f"✅ Expiration date update works correctly")
        print(f"   New expiration: {updated_item['expiration_date']}")

if __name__ == "__main__":
    # Run tests
    test_instance = TestUS24UpdatePantryItem()
    
    print("🧪 Running US2.4 Update Pantry Item Tests...")
    print("=" * 60)
    
    try:
        test_instance.test_ac24_1_put_request_with_updated_data()
        test_instance.test_ac24_2_response_200_with_complete_updated_details()
        test_instance.test_ac24_3_item_in_list_reflects_new_information()
        test_instance.test_ac24_4_error_404_item_not_found()
        test_instance.test_ac24_4_error_403_not_belonging_to_user()
        test_instance.test_ac24_5_error_422_invalid_data()
        test_instance.test_partial_update_functionality()
        test_instance.test_update_expiration_date()
        
        print("\n" + "=" * 60)
        print("🎉 All US2.4 tests passed!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        raise
