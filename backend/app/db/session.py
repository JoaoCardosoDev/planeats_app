from sqlmodel import SQLModel, Session, create_engine
from app.core.config import settings
from typing import Generator
import logging
import time
from sqlalchemy.exc import OperationalError


# Create the database engine
engine = create_engine(
    settings.database_url,
    echo=settings.debug,  # Log SQL queries in debug mode
    pool_pre_ping=True,   # Verify connections before use
)


def create_db_and_tables():
    """Create database tables with retry logic"""
    max_retries = 10
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            logging.info(f"Attempting to create database tables (attempt {attempt + 1}/{max_retries})")
            SQLModel.metadata.create_all(engine)
            logging.info("Database tables created successfully")
            return
        except OperationalError as e:
            if attempt < max_retries - 1:
                logging.warning(f"Database connection failed, retrying in {retry_delay} seconds... Error: {e}")
                time.sleep(retry_delay)
            else:
                logging.error(f"Failed to connect to database after {max_retries} attempts: {e}")
                raise
        except Exception as e:
            logging.error(f"Unexpected error creating database tables: {e}")
            raise


def get_session() -> Generator[Session, None, None]:
    """Database session dependency for FastAPI"""
    with Session(engine) as session:
        yield session