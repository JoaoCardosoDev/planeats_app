import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel

from app.core.config import settings
settings.DATABASE_URL = "sqlite:///:memory:"


from app.main import app
from app.db.session import engine as app_engine, get_db_session as original_get_db_session
from app.crud.crud_user import user as crud_user
from app.schemas.user import UserCreate
from app.models.user_models import User


@pytest.fixture(scope="function")
def session_fixture():
    """
    Provides a test database session where tables are created before each test
    and dropped after. Ensures each test runs with a clean database.
    """
    SQLModel.metadata.create_all(app_engine)
    with Session(app_engine) as session:
        yield session
    SQLModel.metadata.drop_all(app_engine)

@pytest.fixture(name="client")
def client_fixture(session_fixture: Session):
    def get_session_override():
        return session_fixture

    app.dependency_overrides[original_get_db_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

@pytest.fixture(name="test_user")
def test_user_fixture(session_fixture: Session):
    user_data = UserCreate(
        email="test@example.com",
        username="testuser",
        password="testpassword123"
    )
    user = crud_user.create(session_fixture, obj_in=user_data)
    return user

@pytest.fixture(name="test_user_token")
def test_user_token_fixture(client: TestClient, test_user: User):
    # The test_user fixture ensures the user "test@example.com" with "testpassword123" is created
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user.email,
            "password": "testpassword123"
        }
    )
    if response.status_code != 200:
        # Provide more context if login fails within the fixture
        raise AssertionError(f"Login failed in test_user_token_fixture: {response.status_code} - {response.text}")
    return response.json()["access_token"]