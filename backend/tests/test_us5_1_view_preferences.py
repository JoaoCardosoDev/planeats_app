"""
Unit tests for US5.1 - View User Preferences
Tests the GET /user/preferences endpoint and all acceptance criteria.
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

class TestUS51ViewPreferences:
    """Test suite for US5.1 - View User Preferences"""
    
    def test_ac_5_1_1_get_preferences_endpoint(self):
        """
        AC5.1.1: Pedido GET /user/preferences
        Tests that the GET endpoint exists and is accessible
        """
        response = client.get("/api/v1/user/preferences")
        
        # Should return 200 OK (preferences exist or are created)
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
    
    def test_ac_5_1_2_current_preferences_displayed(self):
        """
        AC5.1.2: Preferências atuais exibidas
        Tests that current preferences are properly displayed
        """
        # First, create some preferences
        preferences_data = {
            "daily_calorie_goal": 2000,
            "dietary_restrictions": ["vegetarian", "gluten_free"],
            "cuisine_preferences": ["portuguese", "italian"],
            "disliked_ingredients": ["mushrooms", "anchovies"],
            "max_prep_time_preference": 45
        }
        
        # Create preferences
        client.put("/api/v1/user/preferences", json=preferences_data)
        
        # Get preferences
        response = client.get("/api/v1/user/preferences")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify all set preferences are returned
        assert data["daily_calorie_goal"] == 2000
        assert "vegetarian" in data["dietary_restrictions"]
        assert "gluten_free" in data["dietary_restrictions"]
        assert "portuguese" in data["cuisine_preferences"]
        assert "italian" in data["cuisine_preferences"]
        assert "mushrooms" in data["disliked_ingredients"]
        assert data["max_prep_time_preference"] == 45
    
    def test_ac_5_1_3_default_values_when_not_defined(self):
        """
        AC5.1.3: Se não definidas, exibir valores padrão/vazios
        Tests that default/empty values are shown when preferences aren't set
        """
        response = client.get("/api/v1/user/preferences")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify that the response includes all expected fields
        # Even if they're None/null, they should be present
        expected_fields = [
            "daily_calorie_goal",
            "dietary_restrictions", 
            "cuisine_preferences",
            "disliked_ingredients",
            "notification_preferences",
            "preferred_difficulty",
            "max_prep_time_preference",
            "max_calories_preference"
        ]
        
        for field in expected_fields:
            assert field in data
    
    def test_ac_5_1_4_all_required_fields_displayed(self):
        """
        AC5.1.4: Campos exibidos conforme especificação
        Tests that all required fields are present in the response
        """
        response = client.get("/api/v1/user/preferences")
        
        assert response.status_code == 200
        data = response.json()
        
        # Required fields from US5.1 specification
        required_fields = [
            "daily_calorie_goal",
            "dietary_restrictions",
            "cuisine_preferences", 
            "disliked_ingredients",
            "notification_preferences"
        ]
        
        for field in required_fields:
            assert field in data, f"Required field '{field}' missing from response"
        
        # Verify field types
        assert isinstance(data.get("daily_calorie_goal"), (int, type(None)))
        assert isinstance(data.get("dietary_restrictions"), (list, type(None)))
        assert isinstance(data.get("cuisine_preferences"), (list, type(None)))
        assert isinstance(data.get("disliked_ingredients"), (list, type(None)))
        assert isinstance(data.get("notification_preferences"), (dict, type(None)))
    
    def test_comprehensive_preference_structure(self):
        """
        Test that the complete preference structure is supported
        """
        # Create comprehensive preferences
        comprehensive_preferences = {
            "daily_calorie_goal": 2200,
            "dietary_restrictions": ["vegan", "gluten_free"],
            "cuisine_preferences": ["asian", "mediterranean"],
            "disliked_ingredients": ["cilantro", "blue_cheese"],
            "notification_preferences": {
                "email_recommendations": True,
                "push_notifications": False,
                "weekly_summary": True
            },
            "preferred_difficulty": "medium",
            "max_prep_time_preference": 60,
            "max_calories_preference": 800,
            "avoid_missing_ingredients": True,
            "prioritize_expiring_ingredients": True
        }
        
        # Set preferences
        put_response = client.put("/api/v1/user/preferences", json=comprehensive_preferences)
        assert put_response.status_code == 200
        
        # Get preferences and verify all fields
        get_response = client.get("/api/v1/user/preferences")
        assert get_response.status_code == 200
        
        data = get_response.json()
        
        # Verify all comprehensive fields are preserved
        assert data["daily_calorie_goal"] == 2200
        assert set(data["dietary_restrictions"]) == {"vegan", "gluten_free"}
        assert set(data["cuisine_preferences"]) == {"asian", "mediterranean"}
        assert set(data["disliked_ingredients"]) == {"cilantro", "blue_cheese"}
        assert data["notification_preferences"]["email_recommendations"] == True
        assert data["preferred_difficulty"] == "medium"
        assert data["max_prep_time_preference"] == 60
        assert data["max_calories_preference"] == 800
        assert data["avoid_missing_ingredients"] == True
        assert data["prioritize_expiring_ingredients"] == True
    
    def test_response_includes_user_and_id_fields(self):
        """
        Test that response includes proper identification fields
        """
        response = client.get("/api/v1/user/preferences")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should include user identification
        assert "user_id" in data
        assert "id" in data
        assert data["user_id"] == test_user.id
    
    def test_empty_lists_vs_null_handling(self):
        """
        Test proper handling of empty lists vs null values
        """
        # Set preferences with empty lists
        preferences_with_empty_lists = {
            "dietary_restrictions": [],
            "cuisine_preferences": [],
            "disliked_ingredients": []
        }
        
        client.put("/api/v1/user/preferences", json=preferences_with_empty_lists)
        
        response = client.get("/api/v1/user/preferences")
        assert response.status_code == 200
        
        data = response.json()
        
        # Empty lists should be preserved (not converted to null)
        assert data["dietary_restrictions"] == []
        assert data["cuisine_preferences"] == []
        assert data["disliked_ingredients"] == []

def test_get_preferences_options_endpoint():
    """
    Test the helper endpoint for getting available preference options
    """
    response = client.get("/api/v1/user/preferences/options")
    
    assert response.status_code == 200
    data = response.json()
    
    # Should include all available options
    assert "dietary_restrictions" in data
    assert "cuisine_types" in data
    assert "difficulty_levels" in data
    
    # Verify some expected values
    assert "vegetarian" in data["dietary_restrictions"]
    assert "vegan" in data["dietary_restrictions"]
    assert "portuguese" in data["cuisine_types"]
    assert "italian" in data["cuisine_types"]
    assert "easy" in data["difficulty_levels"]
    assert "medium" in data["difficulty_levels"]
    assert "hard" in data["difficulty_levels"]

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
