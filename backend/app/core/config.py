from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    # App Configuration
    app_name: str = "PlanEats API"
    app_version: str = "1.0.0"
    debug: bool = Field(default=False)
    
    # Database Configuration
    database_url: str = Field(..., env="DATABASE_URL")
    
    # Security Configuration
    secret_key: str = Field(..., env="SECRET_KEY")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # PostgreSQL Configuration
    postgres_user: str = Field(..., env="POSTGRES_USER")
    postgres_password: str = Field(..., env="POSTGRES_PASSWORD")
    postgres_db: str = Field(..., env="POSTGRES_DB")
    
    # CORS Configuration
    allowed_hosts: List[str] = ["*"]
    
    # Gemini AI Configuration (for future use)
    gemini_api_key: str = Field(default="", env="GEMINI_API_KEY")
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()