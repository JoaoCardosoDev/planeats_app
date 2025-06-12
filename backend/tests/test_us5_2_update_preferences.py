"""
Unit tests for US5.2 - Update User Preferences
Tests the PUT /user/preferences endpoint and all acceptance criteria.
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
import json

from app.main import app
from app.api.v1.deps import get_db, get_current_user
from app.models.user_models import User
from app.models.user_preference_models import UserPreference
from app.core.security import create_access_token

# Create test database
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

def create_test_db():
    SQLModel.metadata.create_all(engine)

def get_test_db():
    with Session(engine) as session:
        yield session

# Mock user for authentication
test_user = User(id=1, email="test@example.com", username="testuser", hashed_password="hashed", is_active=True)

def get_test_user():
    return test_user

app.dependency_overrides[get_db] = get_test_db
app.dependency_overrides[get_current_user] = get_test_user

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    """Setup test database before each test"""
    create_test_db()
    yield
    # Cleanup is automatic with in-memory database

class TestUS52UpdatePreferences:
    """Test suite for US5.2 - Update User Preferences"""
    
    def test_ac_5_2_1_put_preferences_with_updated_data(self):
        """
        AC5.2.1: Pedido PUT /user/preferences com dados atualizados
        Tests that the PUT endpoint accepts updated preference data
        """
        # Test data to update
        update_data = {
            "daily_calorie_goal": 2500,
            "dietary_restrictions": ["vegetarian", "lactose_free"],
            "cuisine_preferences": ["portuguese", "mediterranean"],
            "disliked_ingredients": ["onions"],
            "preferred_difficulty": "easy",
            "max_prep_time_preference": 30
        }
        
        response = client.put("/api/v1/user/preferences", json=update_data)
        
        # Should return 200 OK
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
        
        # Verify the request was processed
        data = response.json()
        assert "id" in data
        assert "user_id" in data
    
    def test_ac_5_2_2_response_200_with_complete_updated_data(self):
        """
        AC5.2.2: Resposta 200 OK com dados completos e atualizados das preferências
        Tests that PUT returns 200 OK with complete updated preference data
        """
        # Initial preferences
        initial_data = {
            "daily_calorie_goal": 2000,
            "dietary_restrictions": ["vegan"],
            "cuisine_preferences": ["italian"],
            "max_prep_time_preference": 60
        }
        
        # Set initial preferences
        client.put("/api/v1/user/preferences", json=initial_data)
        
        # Update preferences
        update_data = {
            "daily_calorie_goal": 2200,
            "dietary_restrictions": ["vegetarian", "gluten_free"],
            "cuisine_preferences": ["portuguese", "asian"],
            "disliked_ingredients": ["mushrooms", "cilantro"],
            "preferred_difficulty": "medium",
            "max_prep_time_preference": 45,
            "notification_preferences": {
                "email_notifications": True,
                "push_notifications": False
            }
        }
        
        response = client.put("/api/v1/user/preferences", json=update_data)
        
        # Verify 200 OK response
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify all updated data is returned correctly
        assert data["daily_calorie_goal"] == 2200
        assert set(data["dietary_restrictions"]) == {"vegetarian", "gluten_free"}
        assert set(data["cuisine_preferences"]) == {"portuguese", "asian"}
        assert set(data["disliked_ingredients"]) == {"mushrooms", "cilantro"}
        assert data["preferred_difficulty"] == "medium"
        assert data["max_prep_time_preference"] == 45
        assert data["notification_preferences"]["email_notifications"] == True
        assert data["notification_preferences"]["push_notifications"] == False
        
        # Verify response includes required identification fields
        assert "id" in data
        assert "user_id" in data
        assert data["user_id"] == test_user.id
    
    def test_ac_5_2_3_validation_error_422_for_invalid_data(self):
        """
        AC5.2.3: Erro de validação 422 para dados inválidos
        Tests that PUT returns 422 for invalid preference data
        """
        invalid_data_tests = [
            {
                "name": "Invalid dietary restriction",
                "data": {"dietary_restrictions": ["invalid_restriction"]},
                "description": "Should reject unknown dietary restrictions"
            },
            {
                "name": "Invalid cuisine type",
                "data": {"cuisine_preferences": ["invalid_cuisine"]},
                "description": "Should reject unknown cuisine types"
            },
            {
                "name": "Invalid difficulty level",
                "data": {"preferred_difficulty": "invalid_difficulty"},
                "description": "Should reject unknown difficulty levels"
            },
            {
                "name": "Negative calorie goal",
                "data": {"daily_calorie_goal": -100},
                "description": "Should reject negative calorie goals"
            },
            {
                "name": "Negative prep time",
                "data": {"max_prep_time_preference": -30},
                "description": "Should reject negative preparation times"
            },
            {
                "name": "Invalid max calories",
                "data": {"max_calories_preference": -50},
                "description": "Should reject negative max calories"
            }
        ]
        
        for test_case in invalid_data_tests:
            response = client.put("/api/v1/user/preferences", json=test_case["data"])
            
            # Should return 422 Unprocessable Entity for validation errors
            assert response.status_code == 422, f"Failed for {test_case['name']}: {test_case['description']}"
            
            # Response should include validation error details
            error_data = response.json()
            assert "detail" in error_data
    
    def test_ac_5_2_4_ui_allows_easy_editing_verification(self):
        """
        AC5.2.4: UI permite edição fácil de todos os campos de preferência
        This test verifies the backend supports all fields that the UI should allow editing
        """
        # Test that all expected editable fields are supported
        all_editable_fields = {
            "daily_calorie_goal": 2100,
            "dietary_restrictions": ["vegetarian", "gluten_free", "lactose_free"],
            "cuisine_preferences": ["portuguese", "italian", "asian", "mediterranean"],
            "disliked_ingredients": ["mushrooms", "anchovies", "cilantro", "blue_cheese"],
            "notification_preferences": {
                "email_recommendations": True,
                "push_notifications": True,
                "weekly_summary": False,
                "expiry_alerts": True
            },
            "preferred_difficulty": "medium",
            "max_prep_time_preference": 45,
            "max_calories_preference": 600,
            "avoid_missing_ingredients": True,
            "prioritize_expiring_ingredients": False
        }
        
        # Should successfully update all fields
        response = client.put("/api/v1/user/preferences", json=all_editable_fields)
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify all fields are properly saved and returned
        assert data["daily_calorie_goal"] == 2100
        assert len(data["dietary_restrictions"]) == 3
        assert len(data["cuisine_preferences"]) == 4
        assert len(data["disliked_ingredients"]) == 4
        assert data["notification_preferences"]["email_recommendations"] == True
        assert data["preferred_difficulty"] == "medium"
        assert data["max_prep_time_preference"] == 45
        assert data["max_calories_preference"] == 600
        assert data["avoid_missing_ingredients"] == True
        assert data["prioritize_expiring_ingredients"] == False
    
    def test_partial_updates(self):
        """
        Test that partial updates work correctly (only updating some fields)
        """
        # Set initial comprehensive preferences
        initial_data = {
            "daily_calorie_goal": 2000,
            "dietary_restrictions": ["vegetarian"],
            "cuisine_preferences": ["italian"],
            "preferred_difficulty": "easy",
            "max_prep_time_preference": 60
        }
        
        client.put("/api/v1/user/preferences", json=initial_data)
        
        # Partial update - only change calorie goal and add dietary restriction
        partial_update = {
            "daily_calorie_goal": 2300,
            "dietary_restrictions": ["vegetarian", "gluten_free"]
        }
        
        response = client.put("/api/v1/user/preferences", json=partial_update)
        assert response.status_code == 200
        
        data = response.json()
        
        # Updated fields should have new values
        assert data["daily_calorie_goal"] == 2300
        assert set(data["dietary_restrictions"]) == {"vegetarian", "gluten_free"}
        
        # Non-updated fields should retain original values or be reset based on update logic
        # This depends on your business logic - whether PUT is a full replacement or partial update
    
    def test_empty_lists_update(self):
        """
        Test updating preferences with empty lists (clearing preferences)
        """
        # Set initial preferences
        initial_data = {
            "dietary_restrictions": ["vegetarian", "vegan"],
            "cuisine_preferences": ["italian", "portuguese"],
            "disliked_ingredients": ["mushrooms"]
        }
        
        client.put("/api/v1/user/preferences", json=initial_data)
        
        # Clear all list preferences
        clear_data = {
            "dietary_restrictions": [],
            "cuisine_preferences": [],
            "disliked_ingredients": []
        }
        
        response = client.put("/api/v1/user/preferences", json=clear_data)
        assert response.status_code == 200
        
        data = response.json()
        
        # Lists should be empty
        assert data["dietary_restrictions"] == []
        assert data["cuisine_preferences"] == []
        assert data["disliked_ingredients"] == []
    
    def test_null_values_update(self):
        """
        Test updating preferences with null values (unsetting preferences)
        """
        # Set initial preferences
        initial_data = {
            "daily_calorie_goal": 2000,
            "preferred_difficulty": "medium",
            "max_prep_time_preference": 45
        }
        
        client.put("/api/v1/user/preferences", json=initial_data)
        
        # Unset some preferences by setting to null
        unset_data = {
            "daily_calorie_goal": None,
            "preferred_difficulty": None,
            "max_prep_time_preference": None
        }
        
        response = client.put("/api/v1/user/preferences", json=unset_data)
        assert response.status_code == 200
        
        data = response.json()
        
        # Values should be null/None
        assert data["daily_calorie_goal"] is None
        assert data["preferred_difficulty"] is None
        assert data["max_prep_time_preference"] is None
    
    def test_complex_notification_preferences(self):
        """
        Test complex notification preferences structure
        """
        complex_notifications = {
            "notification_preferences": {
                "email_recommendations": True,
                "push_notifications": False,
                "weekly_summary": True,
                "expiry_alerts": True,
                "new_recipe_alerts": False,
                "shopping_list_reminders": True,
                "frequency": "daily",
                "time_preference": "morning"
            }
        }
        
        response = client.put("/api/v1/user/preferences", json=complex_notifications)
        assert response.status_code == 200
        
        data = response.json()
        notifications = data["notification_preferences"]
        
        # Verify complex notification structure is preserved
        assert notifications["email_recommendations"] == True
        assert notifications["push_notifications"] == False
        assert notifications["weekly_summary"] == True
        assert notifications["expiry_alerts"] == True
        assert notifications["new_recipe_alerts"] == False
        assert notifications["shopping_list_reminders"] == True
        assert notifications["frequency"] == "daily"
        assert notifications["time_preference"] == "morning"
    
    def test_update_preserves_user_association(self):
        """
        Test that updates maintain correct user association
        """
        update_data = {
            "daily_calorie_goal": 2400,
            "dietary_restrictions": ["vegan"]
        }
        
        response = client.put("/api/v1/user/preferences", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        
        # User association should be maintained
        assert data["user_id"] == test_user.id
        
        # Verify by getting preferences again
        get_response = client.get("/api/v1/user/preferences")
        assert get_response.status_code == 200
        
        get_data = get_response.json()
        assert get_data["user_id"] == test_user.id
        assert get_data["daily_calorie_goal"] == 2400
        assert "vegan" in get_data["dietary_restrictions"]

def test_integration_get_after_put():
    """
    Integration test: Verify that GET returns updated data after PUT
    """
    # Update preferences
    update_data = {
        "daily_calorie_goal": 2800,
        "dietary_restrictions": ["keto", "lactose_free"],
        "cuisine_preferences": ["american", "mexican"],
        "preferred_difficulty": "hard",
        "max_prep_time_preference": 90
    }
    
    put_response = client.put("/api/v1/user/preferences", json=update_data)
    assert put_response.status_code == 200
    
    # Get preferences and verify they match
    get_response = client.get("/api/v1/user/preferences")
    assert get_response.status_code == 200
    
    get_data = get_response.json()
    put_data = put_response.json()
    
    # Data from GET should match data from PUT response
    assert get_data["daily_calorie_goal"] == put_data["daily_calorie_goal"]
    assert get_data["dietary_restrictions"] == put_data["dietary_restrictions"]
    assert get_data["cuisine_preferences"] == put_data["cuisine_preferences"]
    assert get_data["preferred_difficulty"] == put_data["preferred_difficulty"]
    assert get_data["max_prep_time_preference"] == put_data["max_prep_time_preference"]
    assert get_data["id"] == put_data["id"]
    assert get_data["user_id"] == put_data["user_id"]

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
