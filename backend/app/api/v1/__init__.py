from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.pantry import router as pantry_router
from app.api.v1.endpoints.recipes import router as recipes_router
from app.api.v1.endpoints.gemini import router as gemini_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(pantry_router, prefix="/pantry", tags=["pantry"])
api_router.include_router(recipes_router, prefix="/recipes", tags=["recipes"])
api_router.include_router(gemini_router, prefix="/gemini", tags=["gemini"])
