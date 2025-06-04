"""
Unit tests for View User Preferences functionality
Tests the GET /user/preferences endpoint and preference visualization functionality.
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user_models import User
from app.models.user_preference_models import UserPreference, UserPreferenceCreate
from app.crud.crud_user_preferences import user_preference as crud_user_preferences

class TestViewUserPreferences:
    """Test View User Preferences functionality"""
    
    def test_ac_5_1_1_get_user_preferences_endpoint_requires_auth(self, client: TestClient):
        """
        AC5.1.1: Pedido GET /user/preferences (requires authentication)
        """
        response = client.get("/api/v1/user/preferences")
        assert response.status_code == 403
        assert "Not authenticated" in response.json()["detail"]
    
    def test_ac_5_1_1_get_user_preferences_endpoint_authenticated(self, client: TestClient, test_user_token: str):
        """
        AC5.1.1: Pedido GET /user/preferences (with authentication)
        """
        response = client.get(
            "/api/v1/user/preferences",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert "user_id" in data
    
    def test_ac_5_1_2_current_preferences_displayed(self, client: TestClient, test_user_token: str, session_fixture: Session, test_user: User):
        """
        AC5.1.2: Preferências atuais exibidas
        """
        # First create some preferences for the user
        preferences_data = UserPreferenceCreate(
            daily_calorie_goal=2000,
            dietary_restrictions=["vegetarian", "gluten_free"],
            preferred_cuisines=["italian", "portuguese"],
            cuisine_preferences=["italian", "portuguese"],  # US5.1 compatibility
            disliked_ingredients=["mushrooms", "olives"],
            notification_preferences={"email_enabled": True, "push_enabled": False},
            preferred_difficulty="easy",
            max_prep_time_preference=30,
            prioritize_expiring_ingredients=True
        )
        
        crud_user_preferences.create_for_user(
            session_fixture,
            obj_in=preferences_data,
            user_id=test_user.id
        )
        
        # Now test that preferences are returned correctly
        response = client.get(
            "/api/v1/user/preferences",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["daily_calorie_goal"] == 2000
        assert data["dietary_restrictions"] == ["vegetarian", "gluten_free"]
        assert data["preferred_cuisines"] == ["italian", "portuguese"]
        assert data["cuisine_preferences"] == ["italian", "portuguese"]
        assert data["disliked_ingredients"] == ["mushrooms", "olives"]
        assert data["notification_preferences"]["email_enabled"] is True
        assert data["preferred_difficulty"] == "easy"
        assert data["max_prep_time_preference"] == 30
        assert data["prioritize_expiring_ingredients"] is True
    
    def test_ac_5_1_3_default_values_when_not_defined(self, client: TestClient, test_user_token: str):
        """
        AC5.1.3: Se não definidas, exibir valores padrão/vazios
        Backend pode criar entrada padrão (GET /user/preferences implica 200 OK)
        """
        # Test with a fresh user who has no preferences set
        response = client.get(
            "/api/v1/user/preferences",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        # Should return default/empty values
        assert data["daily_calorie_goal"] is None
        assert data["dietary_restrictions"] is None
        assert data["preferred_cuisines"] is None
        assert data["cuisine_preferences"] is None
        assert data["disliked_ingredients"] is None
        assert data["notification_preferences"] is None
        assert data["preferred_difficulty"] is None
        assert data["max_prep_time_preference"] is None
        assert data["prioritize_expiring_ingredients"] is True  # Default value
        assert data["avoid_missing_ingredients"] is False  # Default value
    
    def test_ac_5_1_4_required_fields_displayed(self, client: TestClient, test_user_token: str):
        """
        AC5.1.4: Campos exibidos: daily_calorie_goal, dietary_restrictions, 
        cuisine_preferences, disliked_ingredients, notification_preferences
        """
        response = client.get(
            "/api/v1/user/preferences",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify all required fields from AC5.1.4 are present
        required_fields = [
            "daily_calorie_goal",
            "dietary_restrictions", 
            "cuisine_preferences",
            "disliked_ingredients",
            "notification_preferences"
        ]
        
        for field in required_fields:
            assert field in data, f"Required field '{field}' is missing from response"
    
    def test_comprehensive_preference_data_structure(self, client: TestClient, test_user_token: str, session_fixture: Session, test_user: User):
        """
        Test comprehensive preference data structure with all possible fields
        """
        # Create comprehensive preferences
        comprehensive_preferences = UserPreferenceCreate(
            daily_calorie_goal=2200,
            dietary_restrictions=["vegetarian", "lactose_free"],
            preferred_cuisines=["italian", "asian", "healthy"],
            cuisine_preferences=["mediterranean", "portuguese"],
            disliked_ingredients=["eggplant", "anchovies", "blue_cheese"],
            notification_preferences={
                "email_enabled": True,
                "push_enabled": True,
                "weekly_meal_plan": False,
                "expiring_ingredients": True,
                "new_recipes": False
            },
            preferred_difficulty="medium",
            max_prep_time_preference=45,
            max_calories_preference=600,
            avoid_missing_ingredients=True,
            prioritize_expiring_ingredients=False,
            other_preferences={
                "cooking_style": "quick_and_easy",
                "family_size": 4,
                "budget_conscious": True
            }
        )
        
        crud_user_preferences.create_for_user(
            session_fixture,
            obj_in=comprehensive_preferences,
            user_id=test_user.id
        )
        
        response = client.get(
            "/api/v1/user/preferences",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify comprehensive data structure
        assert data["daily_calorie_goal"] == 2200
        assert len(data["dietary_restrictions"]) == 2
        assert "vegetarian" in data["dietary_restrictions"]
        assert "lactose_free" in data["dietary_restrictions"]
        
        assert len(data["preferred_cuisines"]) == 3
        assert "italian" in data["preferred_cuisines"]
        
        assert len(data["cuisine_preferences"]) == 2
        assert "mediterranean" in data["cuisine_preferences"]
        
        assert len(data["disliked_ingredients"]) == 3
        assert "eggplant" in data["disliked_ingredients"]
        
        assert data["notification_preferences"]["email_enabled"] is True
        assert data["notification_preferences"]["weekly_meal_plan"] is False
        
        assert data["preferred_difficulty"] == "medium"
        assert data["max_prep_time_preference"] == 45
        assert data["max_calories_preference"] == 600
        assert data["avoid_missing_ingredients"] is True
        assert data["prioritize_expiring_ingredients"] is False
        
        assert data["other_preferences"]["cooking_style"] == "quick_and_easy"
        assert data["other_preferences"]["family_size"] == 4
    
    def test_user_isolation_preferences(self, client: TestClient, session_fixture: Session):
        """
        Test that users can only see their own preferences (user isolation)
        """
        # Create two users with different preferences
        from app.crud.crud_user import user as crud_user
        from app.schemas.user import UserCreate
        
        user1_data = UserCreate(
            email="user1@example.com",
            username="user1",
            password="password123"
        )
        user2_data = UserCreate(
            email="user2@example.com", 
            username="user2",
            password="password123"
        )
        
        user1 = crud_user.create(session_fixture, obj_in=user1_data)
        user2 = crud_user.create(session_fixture, obj_in=user2_data)
        
        # Create different preferences for each user
        user1_prefs = UserPreferenceCreate(
            daily_calorie_goal=1800,
            dietary_restrictions=["vegan"],
            disliked_ingredients=["meat", "dairy"]
        )
        user2_prefs = UserPreferenceCreate(
            daily_calorie_goal=2500,
            dietary_restrictions=["keto"],
            disliked_ingredients=["bread", "pasta"]
        )
        
        crud_user_preferences.create_for_user(session_fixture, obj_in=user1_prefs, user_id=user1.id)
        crud_user_preferences.create_for_user(session_fixture, obj_in=user2_prefs, user_id=user2.id)
        
        # Login as user1
        user1_login = client.post(
            "/api/v1/auth/login",
            json={"email": "user1@example.com", "password": "password123"}
        )
        user1_token = user1_login.json()["access_token"]
        
        # Login as user2
        user2_login = client.post(
            "/api/v1/auth/login", 
            json={"email": "user2@example.com", "password": "password123"}
        )
        user2_token = user2_login.json()["access_token"]
        
        # Test user1 gets their own preferences
        user1_response = client.get(
            "/api/v1/user/preferences",
            headers={"Authorization": f"Bearer {user1_token}"}
        )
        assert user1_response.status_code == 200
        user1_data = user1_response.json()
        assert user1_data["daily_calorie_goal"] == 1800
        assert "vegan" in user1_data["dietary_restrictions"]
        assert "meat" in user1_data["disliked_ingredients"]
        
        # Test user2 gets their own preferences
        user2_response = client.get(
            "/api/v1/user/preferences",
            headers={"Authorization": f"Bearer {user2_token}"}
        )
        assert user2_response.status_code == 200
        user2_data = user2_response.json()
        assert user2_data["daily_calorie_goal"] == 2500
        assert "keto" in user2_data["dietary_restrictions"]
        assert "bread" in user2_data["disliked_ingredients"]
        
        # Verify users don't see each other's data
        assert user1_data["daily_calorie_goal"] != user2_data["daily_calorie_goal"]
        assert user1_data["dietary_restrictions"] != user2_data["dietary_restrictions"]
        assert user1_data["disliked_ingredients"] != user2_data["disliked_ingredients"]
    
    def test_preference_data_types_and_validation(self, client: TestClient, test_user_token: str):
        """
        Test that preference data types are correctly returned
        """
        response = client.get(
            "/api/v1/user/preferences",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # Test data types
        assert isinstance(data["id"], int)
        assert isinstance(data["user_id"], int)
        
        # Optional integer fields
        if data["daily_calorie_goal"] is not None:
            assert isinstance(data["daily_calorie_goal"], int)
        if data["max_prep_time_preference"] is not None:
            assert isinstance(data["max_prep_time_preference"], int)
        if data["max_calories_preference"] is not None:
            assert isinstance(data["max_calories_preference"], int)
        
        # List fields
        if data["dietary_restrictions"] is not None:
            assert isinstance(data["dietary_restrictions"], list)
        if data["preferred_cuisines"] is not None:
            assert isinstance(data["preferred_cuisines"], list)
        if data["cuisine_preferences"] is not None:
            assert isinstance(data["cuisine_preferences"], list)
        if data["disliked_ingredients"] is not None:
            assert isinstance(data["disliked_ingredients"], list)
        
        # Dictionary fields
        if data["notification_preferences"] is not None:
            assert isinstance(data["notification_preferences"], dict)
        if data["other_preferences"] is not None:
            assert isinstance(data["other_preferences"], dict)
        
        # Boolean fields
        assert isinstance(data["avoid_missing_ingredients"], bool)
        assert isinstance(data["prioritize_expiring_ingredients"], bool)
