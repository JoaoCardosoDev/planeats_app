from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import create_engine, Session, select
from sqlalchemy.exc import OperationalError
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in .env file")

engine = create_engine(DATABASE_URL)

app = FastAPI(title="PlanEats API", version="0.1.0")

def get_session():
    with Session(engine) as session:
        yield session

@app.get("/")
async def root():
    return {"message": "PlanEats Backend is running!"}

@app.get("/health/db", tags=["Health Check"])
async def db_health_check(session: Session = Depends(get_session)):
    try:
        # Try to execute a simple query
        session.exec(select(1)).first()
        return {"status": "success", "message": "Database connection is healthy."}
    except OperationalError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Database connection error: {e}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred with the database connection: {e}",
        )

# Further routers and application logic will be added here.
