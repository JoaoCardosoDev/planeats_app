from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv
from typing import Optional

# Load .env file from the project root (backend directory's parent)
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
load_dotenv(dotenv_path=dotenv_path)

class Settings(BaseSettings):
    PROJECT_NAME: str = "PlanEats API"
    APP_VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ALLOWED_HOSTS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    
    # For JWT
    SECRET_KEY: Optional[str] = os.getenv("SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Gemini API Key
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")

    class Config:
        case_sensitive = True

settings = Settings()

if settings.DATABASE_URL is None:
    print("Warning: DATABASE_URL is not set in the environment variables.")
if settings.SECRET_KEY is None:
    print("Warning: SECRET_KEY is not set in the environment variables.")
if settings.GEMINI_API_KEY is None:
    print("Warning: GEMINI_API_KEY is not set in the environment variables.")
