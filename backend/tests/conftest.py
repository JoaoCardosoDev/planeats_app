import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.main import app
from app.db.session import get_db_session
from app.core.config import settings
from app.crud.crud_user import user as crud_user
from app.schemas.user import UserCreate

# Test database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

# Override the database URL for tests
settings.DATABASE_URL = SQLALCHEMY_DATABASE_URL

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_db_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

@pytest.fixture(name="test_user")
def test_user_fixture(session: Session):
    user_data = UserCreate(
        email="test@example.com",
        username="testuser",
        password="testpassword123"
    )
    user = crud_user.create(session, obj_in=user_data)
    return user

@pytest.fixture(name="test_user_token")
def test_user_token_fixture(client: TestClient):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpassword123"
        }
    )
    return response.json()["access_token"] 