import pytest
from fastapi.testclient import TestClient
from datetime import date, timedelta
import json

from app.main import app

client = TestClient(app)

# Test configuration
TEST_USER = {
    "email": "test.delete@example.com",
    "password": "testpassword123",
    "name": "Test Delete User"
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
        "item_name": "Test Bread",
        "quantity": 1.0,
        "unit": "loaf",
        "expiration_date": str(date.today() + timedelta(days=3)),
        "purchase_date": str(date.today()),
        "calories_per_unit": 250
    }
    
    response = client.post("/api/v1/pantry/items", json=pantry_item_data, headers=headers)
    assert response.status_code == 200
    return response.json()

class TestUS25DeletePantryItem:
    """Test suite for US2.5 - Delete Pantry Item"""
    
    def test_ac25_1_delete_request(self):
        """AC2.5.1: DELETE /pantry/items/{item_id} request"""
        headers = setup_test_user_and_token()
        
        # Create a pantry item first
        item = create_test_pantry_item(headers)
        item_id = item["id"]
        
        # Send DELETE request
        response = client.delete(f"/api/v1/pantry/items/{item_id}", headers=headers)
        
        # Verify request structure and endpoint
        assert response.status_code == 204
        print(f"✅ AC2.5.1: DELETE request successful with status {response.status_code}")
    
    def test_ac25_2_response_204_no_content(self):
        """AC2.5.2: Response 204 No Content on success"""
        headers = setup_test_user_and_token()
        
        # Create a pantry item first
        item = create_test_pantry_item(headers)
        item_id = item["id"]
        
        # Send DELETE request
        response = client.delete(f"/api/v1/pantry/items/{item_id}", headers=headers)
        
        # Verify response status and content
        assert response.status_code == 204
        assert response.content == b""  # No content in response body
        
        print(f"✅ AC2.5.2: Correct 204 No Content response")
        print(f"   Response body is empty: {response.content == b''}")
    
    def test_ac25_3_item_removed_from_frontend_list(self):
        """AC2.5.3: Item removed from list in frontend"""
        headers = setup_test_user_and_token()
        
        # Create multiple pantry items
        item1 = create_test_pantry_item(headers)
        
        item2_data = {
            "item_name": "Test Cheese",
            "quantity": 200.0,
            "unit": "grams",
            "expiration_date": str(date.today() + timedelta(days=5))
        }
        item2_response = client.post("/api/v1/pantry/items", json=item2_data, headers=headers)
        assert item2_response.status_code == 200
        item2 = item2_response.json()
        
        # Verify both items exist in the list
        list_response_before = client.get("/api/v1/pantry/items", headers=headers)
        assert list_response_before.status_code == 200
        items_before = list_response_before.json()
        
        item_ids_before = [item["id"] for item in items_before]
        assert item1["id"] in item_ids_before
        assert item2["id"] in item_ids_before
        assert len(items_before) >= 2
        
        # Delete the first item
        delete_response = client.delete(f"/api/v1/pantry/items/{item1['id']}", headers=headers)
        assert delete_response.status_code == 204
        
        # Verify the item is removed from the list
        list_response_after = client.get("/api/v1/pantry/items", headers=headers)
        assert list_response_after.status_code == 200
        items_after = list_response_after.json()
        
        item_ids_after = [item["id"] for item in items_after]
        assert item1["id"] not in item_ids_after  # Deleted item should not be in list
        assert item2["id"] in item_ids_after      # Other item should still be there
        assert len(items_after) == len(items_before) - 1  # One less item
        
        print(f"✅ AC2.5.3: Item removed from list correctly")
        print(f"   Items before deletion: {len(items_before)}")
        print(f"   Items after deletion: {len(items_after)}")
        print(f"   Deleted item {item1['id']} not in list: {item1['id'] not in item_ids_after}")
    
    def test_ac25_4_error_404_item_not_found(self):
        """AC2.5.4: Error if item not found (404)"""
        headers = setup_test_user_and_token()
        
        # Try to delete non-existent item
        non_existent_id = 99999
        
        response = client.delete(f"/api/v1/pantry/items/{non_existent_id}", headers=headers)
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
        
        print(f"✅ AC2.5.4: 404 error for non-existent item")
    
    def test_ac25_4_error_403_not_belonging_to_user(self):
        """AC2.5.4: Error if item not belonging to user (403/404)"""
        # Create first user and their item
        headers1 = setup_test_user_and_token()
        item = create_test_pantry_item(headers1)
        item_id = item["id"]
        
        # Create second user
        test_user2 = {
            "email": "test.delete2@example.com",
            "password": "testpassword123",
            "name": "Test Delete User 2"
        }
        
        register_response = client.post("/api/v1/auth/register", json=test_user2)
        assert register_response.status_code == 200
        
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user2["email"],
            "password": test_user2["password"]
        })
        assert login_response.status_code == 200
        headers2 = {"Authorization": f"Bearer {login_response.json()['access_token']}"}
        
        # Try to delete first user's item with second user's token
        response = client.delete(f"/api/v1/pantry/items/{item_id}", headers=headers2)
        
        assert response.status_code == 404  # Item not found for this user (treated as not found for security)
        
        print(f"✅ AC2.5.4: Correct error for item not belonging to user")
        
        # Verify the item still exists for the original user
        verify_response = client.get(f"/api/v1/pantry/items/{item_id}", headers=headers1)
        assert verify_response.status_code == 200
        print(f"   Original item still exists for owner")
    
    def test_delete_item_twice(self):
        """Test deleting the same item twice (should fail on second attempt)"""
        headers = setup_test_user_and_token()
        
        # Create a pantry item
        item = create_test_pantry_item(headers)
        item_id = item["id"]
        
        # Delete the item first time
        first_delete = client.delete(f"/api/v1/pantry/items/{item_id}", headers=headers)
        assert first_delete.status_code == 204
        
        # Try to delete the same item again
        second_delete = client.delete(f"/api/v1/pantry/items/{item_id}", headers=headers)
        assert second_delete.status_code == 404
        
        print(f"✅ Double deletion handled correctly")
        print(f"   First deletion: 204")
        print(f"   Second deletion: 404")
    
    def test_delete_and_verify_get_individual_item_fails(self):
        """Test that getting individual item fails after deletion"""
        headers = setup_test_user_and_token()
        
        # Create a pantry item
        item = create_test_pantry_item(headers)
        item_id = item["id"]
        
        # Verify item exists by getting it individually
        get_response_before = client.get(f"/api/v1/pantry/items/{item_id}", headers=headers)
        assert get_response_before.status_code == 200
        
        # Delete the item
        delete_response = client.delete(f"/api/v1/pantry/items/{item_id}", headers=headers)
        assert delete_response.status_code == 204
        
        # Try to get the item individually after deletion
        get_response_after = client.get(f"/api/v1/pantry/items/{item_id}", headers=headers)
        assert get_response_after.status_code == 404
        
        print(f"✅ Individual item GET fails after deletion")
        print(f"   GET before deletion: 200")
        print(f"   GET after deletion: 404")
    
    def test_delete_multiple_items_sequentially(self):
        """Test deleting multiple items in sequence"""
        headers = setup_test_user_and_token()
        
        # Create multiple items
        items_to_create = [
            {"item_name": "Test Item 1", "quantity": 1.0, "unit": "piece"},
            {"item_name": "Test Item 2", "quantity": 2.0, "unit": "pieces"},
            {"item_name": "Test Item 3", "quantity": 3.0, "unit": "pieces"}
        ]
        
        created_items = []
        for item_data in items_to_create:
            response = client.post("/api/v1/pantry/items", json=item_data, headers=headers)
            assert response.status_code == 200
            created_items.append(response.json())
        
        # Get initial count
        list_response_initial = client.get("/api/v1/pantry/items", headers=headers)
        initial_count = len(list_response_initial.json())
        
        # Delete each item
        for i, item in enumerate(created_items):
            delete_response = client.delete(f"/api/v1/pantry/items/{item['id']}", headers=headers)
            assert delete_response.status_code == 204
            
            # Verify count decreases
            list_response = client.get("/api/v1/pantry/items", headers=headers)
            current_count = len(list_response.json())
            expected_count = initial_count - (i + 1)
            assert current_count == expected_count
        
        print(f"✅ Multiple sequential deletions work correctly")
        print(f"   Deleted {len(created_items)} items successfully")

if __name__ == "__main__":
    # Run tests
    test_instance = TestUS25DeletePantryItem()
    
    print("🧪 Running US2.5 Delete Pantry Item Tests...")
    print("=" * 60)
    
    try:
        test_instance.test_ac25_1_delete_request()
        test_instance.test_ac25_2_response_204_no_content()
        test_instance.test_ac25_3_item_removed_from_frontend_list()
        test_instance.test_ac25_4_error_404_item_not_found()
        test_instance.test_ac25_4_error_403_not_belonging_to_user()
        test_instance.test_delete_item_twice()
        test_instance.test_delete_and_verify_get_individual_item_fails()
        test_instance.test_delete_multiple_items_sequentially()
        
        print("\n" + "=" * 60)
        print("🎉 All US2.5 tests passed!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        raise
