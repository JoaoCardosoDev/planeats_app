from fastapi import APIRouter, HTTPException
import logging

from app.services import gemini_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/test-gemini", summary="Test Gemini API Connection")
async def test_gemini_api_connection():
    """
    Tests the connection to the Gemini API by attempting to list available models.
    This is an internal test endpoint.
    """
    logger.info("Received request for /test-gemini endpoint.")
    try:
        result = await gemini_service.test_gemini_connection()
        if result.get("status") == "error":
            raise HTTPException(status_code=500, detail=result.get("message"))
        return result
    except Exception as e:
        logger.error(f"Unhandled exception in /test-gemini endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
