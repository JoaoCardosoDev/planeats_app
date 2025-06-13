from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

from app.main import app
from app.api.v1.deps import get_db, get_current_user
from app.models.pantry_models import PantryItem
from app.models.user_models import User

# Test database
DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

def create_test_db():
    SQLModel.metadata.create_all(engine)

def get_test_db():
    with Session(engine) as session:
        yield session

def get_test_user():
    return User(id=1, email="test@example.com", full_name="Test User")

# Override dependencies
app.dependency_overrides[get_db] = get_test_db
app.dependency_overrides[get_current_user] = get_test_user

client = TestClient(app)

def test_pantry_filtering_and_sorting():
    """Test filtering and sorting functionality for pantry items"""
    create_test_db()
    
    # Create test pantry items
    today = date.today()
    items_data = [
        {
            "item_name": "Milk",
            "quantity": 1.0,
            "unit": "L",
            "expiration_date": (today + timedelta(days=2)).isoformat(),
            "purchase_date": today.isoformat()
        },
        {
            "item_name": "Bread",
            "quantity": 1.0,
            "unit": "unidades",
            "expiration_date": (today + timedelta(days=10)).isoformat(),
            "purchase_date": today.isoformat()
        },
        {
            "item_name": "Apples",
            "quantity": 5.0,
            "unit": "unidades",
            "expiration_date": (today + timedelta(days=5)).isoformat(),
            "purchase_date": today.isoformat()
        }
    ]
    
    # Create items
    for item_data in items_data:
        response = client.post("/api/v1/pantry/items", json=item_data)
        assert response.status_code == 200
    
    # Test 1: Get all items (no filters)
    response = client.get("/api/v1/pantry/items")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 3
    
    # Test 2: Filter expiring soon (within 7 days)
    response = client.get("/api/v1/pantry/items?expiring_soon=true")
    assert response.status_code == 200
    expiring_items = response.json()
    assert len(expiring_items) == 2  # Milk (2 days) and Apples (5 days)
    
    # Test 3: Sort by item_name ascending
    response = client.get("/api/v1/pantry/items?sort_by=item_name&sort_order=asc")
    assert response.status_code == 200
    sorted_items = response.json()
    assert sorted_items[0]["item_name"] == "Apples"
    assert sorted_items[1]["item_name"] == "Bread"
    assert sorted_items[2]["item_name"] == "Milk"
    
    # Test 4: Sort by item_name descending  
    response = client.get("/api/v1/pantry/items?sort_by=item_name&sort_order=desc")
    assert response.status_code == 200
    sorted_items = response.json()
    assert sorted_items[0]["item_name"] == "Milk"
    assert sorted_items[1]["item_name"] == "Bread"
    assert sorted_items[2]["item_name"] == "Apples"
    
    # Test 5: Sort by expiration_date ascending
    response = client.get("/api/v1/pantry/items?sort_by=expiration_date&sort_order=asc")
    assert response.status_code == 200
    sorted_items = response.json()
    assert sorted_items[0]["item_name"] == "Milk"  # Expires in 2 days
    assert sorted_items[1]["item_name"] == "Apples"  # Expires in 5 days
    assert sorted_items[2]["item_name"] == "Bread"  # Expires in 10 days
    
    # Test 6: Combine filtering and sorting
    response = client.get("/api/v1/pantry/items?expiring_soon=true&sort_by=expiration_date&sort_order=asc")
    assert response.status_code == 200
    filtered_sorted_items = response.json()
    assert len(filtered_sorted_items) == 2
    assert filtered_sorted_items[0]["item_name"] == "Milk"
    assert filtered_sorted_items[1]["item_name"] == "Apples"

if __name__ == "__main__":
    test_pantry_filtering_and_sorting()
    print("✅ All pantry filtering and sorting tests passed!")
