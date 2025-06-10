from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.pantry import router as pantry_router
from app.api.v1.endpoints.recipes import router as recipes_router
from app.api.v1.endpoints.gemini import router as gemini_router
from app.api.v1.endpoints.recommendations import router as recommendations_router
from app.api.v1.endpoints.user_preferences import router as user_preferences_router
from app.api.v1.endpoints.mealdb import router as mealdb_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(pantry_router, prefix="/pantry", tags=["pantry"])
api_router.include_router(recipes_router, prefix="/recipes", tags=["recipes"])
api_router.include_router(gemini_router, prefix="/gemini", tags=["gemini"])
api_router.include_router(gemini_router, prefix="/ai", tags=["ai"])
api_router.include_router(recommendations_router, prefix="", tags=["recommendations"])
api_router.include_router(user_preferences_router, prefix="/user", tags=["user-preferences"])
api_router.include_router(mealdb_router, prefix="/mealdb", tags=["mealdb"])
