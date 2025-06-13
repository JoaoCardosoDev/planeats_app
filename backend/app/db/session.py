from sqlmodel import create_engine, Session
from sqlmodel.pool import StaticPool  # Import StaticPool
from app.core.config import settings

# The database URL should be valid, otherwise create_engine will fail.
# Example: "postgresql://user:password@host:port/database"

if settings.DATABASE_URL is None:
    raise ValueError("DATABASE_URL not set in environment variables")

engine_args = {"echo": True}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}
    engine_args["poolclass"] = StaticPool

engine = create_engine(settings.DATABASE_URL, **engine_args)

def get_db_session():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    # This function is generally not used with Alembic,
    # as Alembic handles table creation and migrations.
    # However, it can be useful for initial setup or testing without Alembic.
    from app.models import User  # Import User model
    from app.models import PantryItem, Recipe, RecipeIngredient, UserPreference # Import other models
    from sqlmodel import SQLModel # Import SQLModel
    SQLModel.metadata.create_all(engine)
    print("Database and tables created via SQLModel.metadata.create_all(engine).")
# To be called by Alembic's env.py to get the engine
def get_engine():
    return engine
