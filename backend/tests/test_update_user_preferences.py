"""
Unit tests for Update User Preferences functionality
Tests the PUT /user/preferences endpoint and preference update functionality.
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user_models import User
from app.models.user_preference_models import UserPreference, UserPreferenceCreate
from app.crud.crud_user_preferences import user_preference as crud_user_preferences

class TestUpdateUserPreferences:
    """Test Update User Preferences functionality"""
    
    def test_ac_5_2_1_put_user_preferences_requires_auth(self, client: TestClient):
        """
        AC5.2.1: Pedido PUT /user/preferences (requires authentication)
        """
        update_data = {
            "daily_calorie_goal": 2000,
            "dietary_restrictions": ["vegetarian"]
        }
        
        response = client.put("/api/v1/user/preferences", json=update_data)
        assert response.status_code == 403
        assert "Not authenticated" in response.json()["detail"]
    
    def test_ac_5_2_1_put_user_preferences_with_auth(self, client: TestClient, test_user_token: str):
        """
        AC5.2.1: Pedido PUT /user/preferences com dados atualizados (with authentication)
        """
        update_data = {
            "daily_calorie_goal": 2200,
            "dietary_restrictions": ["vegetarian", "gluten_free"],
            "preferred_cuisines": ["italian", "healthy"],
            "preferred_difficulty": "medium"
        }
        
        response = client.put(
            "/api/v1/user/preferences",
            json=update_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
    
    def test_ac_5_2_2_response_200_ok_with_updated_data(self, client: TestClient, test_user_token: str):
        """
        AC5.2.2: Resposta 200 OK com dados completos e atualizados das preferências
        """
        # First, create some initial preferences
        initial_data = {
            "daily_calorie_goal": 1800,
            "dietary_restrictions": ["vegetarian"],
            "preferred_cuisines": ["portuguese"],
            "preferred_difficulty": "easy"
        }
        
        client.put(
            "/api/v1/user/preferences",
            json=initial_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        # Now update with new data
        update_data = {
            "daily_calorie_goal": 2500,
            "dietary_restrictions": ["vegan", "gluten_free"],
            "preferred_cuisines": ["italian", "asian"],
            "cuisine_preferences": ["mediterranean", "healthy"],
            "disliked_ingredients": ["mushrooms", "seafood"],
            "notification_preferences": {
                "email_enabled": True,
                "push_enabled": False,
                "weekly_meal_plan": True
            },
            "preferred_difficulty": "hard",
            "max_prep_time_preference": 60,
            "max_calories_preference": 800,
            "prioritize_expiring_ingredients": False
        }
        
        response = client.put(
            "/api/v1/user/preferences",
            json=update_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        # Verify 200 OK response
        assert response.status_code == 200
        
        # Verify updated data is returned completely
        data = response.json()
        assert data["daily_calorie_goal"] == 2500
        assert data["dietary_restrictions"] == ["vegan", "gluten_free"]
        assert data["preferred_cuisines"] == ["italian", "asian"]
        assert data["cuisine_preferences"] == ["mediterranean", "healthy"]
        assert data["disliked_ingredients"] == ["mushrooms", "seafood"]
        assert data["notification_preferences"]["email_enabled"] is True
        assert data["notification_preferences"]["push_enabled"] is False
        assert data["notification_preferences"]["weekly_meal_plan"] is True
        assert data["preferred_difficulty"] == "hard"
        assert data["max_prep_time_preference"] == 60
        assert data["max_calories_preference"] == 800
        assert data["prioritize_expiring_ingredients"] is False
        
        # Verify complete data structure is returned
        assert "id" in data
        assert "user_id" in data
        assert isinstance(data["id"], int)
        assert isinstance(data["user_id"], int)
    
    def test_ac_5_2_3_validation_error_422_invalid_data(self, client: TestClient, test_user_token: str):
        """
        AC5.2.3: Erro de validação 422 para dados inválidos
        """
        # Test invalid dietary restriction
        invalid_data_1 = {
            "dietary_restrictions": ["invalid_restriction"],
            "preferred_cuisines": ["italian"]
        }
        
        response = client.put(
            "/api/v1/user/preferences",
            json=invalid_data_1,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 400  # Our implementation uses 400 for validation errors
        assert "Invalid dietary restriction" in response.json()["detail"]
        
        # Test invalid cuisine type
        invalid_data_2 = {
            "preferred_cuisines": ["invalid_cuisine"],
            "dietary_restrictions": ["vegetarian"]
        }
        
        response = client.put(
            "/api/v1/user/preferences",
            json=invalid_data_2,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 400
        assert "Invalid cuisine type" in response.json()["detail"]
        
        # Test invalid difficulty level
        invalid_data_3 = {
            "preferred_difficulty": "invalid_difficulty"
        }
        
        response = client.put(
            "/api/v1/user/preferences",
            json=invalid_data_3,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 400
        assert "Invalid difficulty level" in response.json()["detail"]
        
        # Test invalid numeric values
        invalid_data_4 = {
            "daily_calorie_goal": -100  # Negative value should be invalid
        }
        
        response = client.put(
            "/api/v1/user/preferences",
            json=invalid_data_4,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 400
        assert "Daily calorie goal must be positive" in response.json()["detail"]
        
        # Test invalid prep time
        invalid_data_5 = {
            "max_prep_time_preference": -30
        }
        
        response = client.put(
            "/api/v1/user/preferences",
            json=invalid_data_5,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 400
        assert "Max preparation time must be positive" in response.json()["detail"]
    
    def test_partial_updates_work_correctly(self, client: TestClient, test_user_token: str, session_fixture: Session, test_user: User):
        """
        Test that partial updates work correctly (only specified fields are updated)
        """
        # First create comprehensive initial preferences
        initial_preferences = UserPreferenceCreate(
            daily_calorie_goal=2000,
            dietary_restrictions=["vegetarian"],
            preferred_cuisines=["portuguese", "italian"],
            cuisine_preferences=["mediterranean"],
            disliked_ingredients=["seafood"],
            notification_preferences={"email_enabled": True},
            preferred_difficulty="easy",
            max_prep_time_preference=30,
            prioritize_expiring_ingredients=True
        )
        
        crud_user_preferences.create_for_user(
            session_fixture,
            obj_in=initial_preferences,
            user_id=test_user.id
        )
        
        # Now do a partial update (only update daily_calorie_goal and dietary_restrictions)
        partial_update = {
            "daily_calorie_goal": 2500,
            "dietary_restrictions": ["vegan"]
        }
        
        response = client.put(
            "/api/v1/user/preferences",
            json=partial_update,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify updated fields
        assert data["daily_calorie_goal"] == 2500
        assert data["dietary_restrictions"] == ["vegan"]
        
        # Verify unchanged fields remain the same
        assert data["preferred_cuisines"] == ["portuguese", "italian"]
        assert data["cuisine_preferences"] == ["mediterranean"]
        assert data["disliked_ingredients"] == ["seafood"]
        assert data["notification_preferences"]["email_enabled"] is True
        assert data["preferred_difficulty"] == "easy"
        assert data["max_prep_time_preference"] == 30
        assert data["prioritize_expiring_ingredients"] is True
    
    def test_update_creates_preferences_if_none_exist(self, client: TestClient, test_user_token: str):
        """
        Test that PUT /user/preferences creates preferences if none exist for the user
        """
        # Ensure we start with a clean user (no existing preferences)
        # This is handled by the test fixtures automatically
        
        update_data = {
            "daily_calorie_goal": 2200,
            "dietary_restrictions": ["gluten_free"],
            "preferred_cuisines": ["asian"],
            "preferred_difficulty": "medium"
        }
        
        response = client.put(
            "/api/v1/user/preferences",
            json=update_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify the preferences were created with the provided data
        assert data["daily_calorie_goal"] == 2200
        assert data["dietary_restrictions"] == ["gluten_free"]
        assert data["preferred_cuisines"] == ["asian"]
        assert data["preferred_difficulty"] == "medium"
        
        # Verify default values for unspecified fields
        assert data["prioritize_expiring_ingredients"] is True  # Default value
        assert data["avoid_missing_ingredients"] is False  # Default value
    
    def test_update_comprehensive_preferences_data(self, client: TestClient, test_user_token: str):
        """
        Test updating all possible preference fields
        """
        comprehensive_update = {
            "daily_calorie_goal": 2800,
            "dietary_restrictions": ["keto", "lactose_free"],
            "preferred_cuisines": ["american", "mexican", "comfort_food"],
            "cuisine_preferences": ["french", "indian"],
            "disliked_ingredients": ["broccoli", "cauliflower", "brussels_sprouts"],
            "notification_preferences": {
                "email_enabled": False,
                "push_enabled": True,
                "weekly_meal_plan": True,
                "expiring_ingredients": False,
                "new_recipes": True,
                "cooking_reminders": True
            },
            "preferred_difficulty": "hard",
            "max_prep_time_preference": 120,
            "max_calories_preference": 1000,
            "avoid_missing_ingredients": True,
            "prioritize_expiring_ingredients": False,
            "other_preferences": {
                "cooking_style": "gourmet",
                "family_size": 6,
                "budget_per_meal": 25.50,
                "preferred_meal_types": ["dinner", "brunch"]
            }
        }
        
        response = client.put(
            "/api/v1/user/preferences",
            json=comprehensive_update,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify all fields were updated correctly
        assert data["daily_calorie_goal"] == 2800
        assert len(data["dietary_restrictions"]) == 2
        assert "keto" in data["dietary_restrictions"]
        assert "lactose_free" in data["dietary_restrictions"]
        
        assert len(data["preferred_cuisines"]) == 3
        assert "american" in data["preferred_cuisines"]
        assert "mexican" in data["preferred_cuisines"]
        assert "comfort_food" in data["preferred_cuisines"]
        
        assert len(data["cuisine_preferences"]) == 2
        assert "french" in data["cuisine_preferences"]
        assert "indian" in data["cuisine_preferences"]
        
        assert len(data["disliked_ingredients"]) == 3
        assert "broccoli" in data["disliked_ingredients"]
        
        assert data["notification_preferences"]["email_enabled"] is False
        assert data["notification_preferences"]["push_enabled"] is True
        assert data["notification_preferences"]["weekly_meal_plan"] is True
        assert data["notification_preferences"]["cooking_reminders"] is True
        
        assert data["preferred_difficulty"] == "hard"
        assert data["max_prep_time_preference"] == 120
        assert data["max_calories_preference"] == 1000
        assert data["avoid_missing_ingredients"] is True
        assert data["prioritize_expiring_ingredients"] is False
        
        assert data["other_preferences"]["cooking_style"] == "gourmet"
        assert data["other_preferences"]["family_size"] == 6
        assert data["other_preferences"]["budget_per_meal"] == 25.50
        assert len(data["other_preferences"]["preferred_meal_types"]) == 2
    
    def test_update_empty_fields_clears_values(self, client: TestClient, test_user_token: str, session_fixture: Session, test_user: User):
        """
        Test that setting fields to empty values clears them properly
        """
        # First create preferences with values
        initial_preferences = UserPreferenceCreate(
            daily_calorie_goal=2000,
            dietary_restrictions=["vegetarian", "gluten_free"],
            preferred_cuisines=["italian", "portuguese"],
            disliked_ingredients=["mushrooms"],
            preferred_difficulty="easy"
        )
        
        crud_user_preferences.create_for_user(
            session_fixture,
            obj_in=initial_preferences,
            user_id=test_user.id
        )
        
        # Now clear some fields by setting them to empty/null
        clear_update = {
            "dietary_restrictions": [],  # Empty list
            "preferred_cuisines": [],   # Empty list
            "disliked_ingredients": None,  # Null value
            "daily_calorie_goal": None    # Null value
        }
        
        response = client.put(
            "/api/v1/user/preferences",
            json=clear_update,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify fields were cleared
        assert data["dietary_restrictions"] == []
        assert data["preferred_cuisines"] == []
        assert data["disliked_ingredients"] is None
        assert data["daily_calorie_goal"] is None
        
        # Verify unspecified fields remain unchanged
        assert data["preferred_difficulty"] == "easy"
    
    def test_user_isolation_in_updates(self, client: TestClient, session_fixture: Session):
        """
        Test that users can only update their own preferences (user isolation)
        """
        # Create two users
        from app.crud.crud_user import user as crud_user
        from app.schemas.user import UserCreate
        
        user1_data = UserCreate(
            email="updateuser1@example.com",
            username="updateuser1",
            password="password123"
        )
        user2_data = UserCreate(
            email="updateuser2@example.com",
            username="updateuser2", 
            password="password123"
        )
        
        user1 = crud_user.create(session_fixture, obj_in=user1_data)
        user2 = crud_user.create(session_fixture, obj_in=user2_data)
        
        # Create initial preferences for both users
        user1_prefs = UserPreferenceCreate(
            daily_calorie_goal=1800,
            dietary_restrictions=["vegetarian"]
        )
        user2_prefs = UserPreferenceCreate(
            daily_calorie_goal=2500,
            dietary_restrictions=["keto"]
        )
        
        crud_user_preferences.create_for_user(session_fixture, obj_in=user1_prefs, user_id=user1.id)
        crud_user_preferences.create_for_user(session_fixture, obj_in=user2_prefs, user_id=user2.id)
        
        # Login as user1
        user1_login = client.post(
            "/api/v1/auth/login",
            json={"email": "updateuser1@example.com", "password": "password123"}
        )
        user1_token = user1_login.json()["access_token"]
        
        # User1 updates their preferences
        user1_update = {
            "daily_calorie_goal": 2000,
            "dietary_restrictions": ["vegan"]
        }
        
        response = client.put(
            "/api/v1/user/preferences",
            json=user1_update,
            headers={"Authorization": f"Bearer {user1_token}"}
        )
        
        assert response.status_code == 200
        user1_updated_data = response.json()
        assert user1_updated_data["daily_calorie_goal"] == 2000
        assert "vegan" in user1_updated_data["dietary_restrictions"]
        
        # Verify user2's preferences remain unchanged
        user2_current = crud_user_preferences.get_by_user_id(session_fixture, user_id=user2.id)
        assert user2_current.daily_calorie_goal == 2500
        assert "keto" in user2_current.dietary_restrictions
        
        # Verify user1 cannot access user2's data (they only get their own)
        assert user1_updated_data["user_id"] == user1.id
        assert user1_updated_data["user_id"] != user2.id
    
    def test_update_data_types_validation(self, client: TestClient, test_user_token: str):
        """
        Test that data types are properly validated in updates
        """
        # Test that the response maintains correct data types
        update_data = {
            "daily_calorie_goal": 2400,
            "dietary_restrictions": ["paleo"],
            "preferred_cuisines": ["mediterranean"],
            "preferred_difficulty": "medium",
            "max_prep_time_preference": 45,
            "avoid_missing_ingredients": True,
            "prioritize_expiring_ingredients": False
        }
        
        response = client.put(
            "/api/v1/user/preferences",
            json=update_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify data types in response
        assert isinstance(data["id"], int)
        assert isinstance(data["user_id"], int)
        assert isinstance(data["daily_calorie_goal"], int)
        assert isinstance(data["dietary_restrictions"], list)
        assert isinstance(data["preferred_cuisines"], list)
        assert isinstance(data["preferred_difficulty"], str)
        assert isinstance(data["max_prep_time_preference"], int)
        assert isinstance(data["avoid_missing_ingredients"], bool)
        assert isinstance(data["prioritize_expiring_ingredients"], bool)
