from sqlmodel import create_engine, Session
from app.core.config import settings

# The database URL should be valid, otherwise create_engine will fail.
# Example: "postgresql://user:password@host:port/database"

if settings.DATABASE_URL is None:
    raise ValueError("DATABASE_URL not set in environment variables")

# For SQLite, you might need: connect_args={"check_same_thread": False}
# For PostgreSQL, these connect_args are not typically needed.
engine = create_engine(settings.DATABASE_URL, echo=True) # echo=True for logging SQL queries, good for dev

def get_db_session():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    # This function is generally not used with Alembic,
    # as Alembic handles table creation and migrations.
    # However, it can be useful for initial setup or testing without Alembic.
    # from app.models import user_model # Import your models here
    # SQLModel.metadata.create_all(engine)
    print("Database and tables creation logic (if not using Alembic exclusively) would be here.")
    print("With Alembic, this function might not be necessary for production.")
# To be called by Alembic's env.py to get the engine
def get_engine():
    return engine
