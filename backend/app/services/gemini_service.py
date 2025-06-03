import os
import google.generativeai as genai
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure the Gemini API key
try:
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        logger.error("GEMINI_API_KEY environment variable not set.")
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
    genai.configure(api_key=gemini_api_key)
    logger.info("Gemini API key configured successfully.")
except Exception as e:
    logger.error(f"Error configuring Gemini API key: {e}")
    # Potentially re-raise or handle as appropriate for your application startup
    raise

async def test_gemini_connection():
    """
    Tests the connection to the Gemini API by listing available models.
    """
    try:
        logger.info("Attempting to list Gemini models...")
        models = [m for m in genai.list_models()] # Basic list comprehension, can be more sophisticated
        if models:
            logger.info("Successfully connected to Gemini API. Available models:")
            for model in models:
                # Logging only model names for brevity, can log more details
                logger.info(f"- {model.name}")
            return {"status": "success", "message": "Connected to Gemini API and listed models.", "models": [m.name for m in models]}
        else:
            logger.warning("Connected to Gemini API, but no models were listed.")
            return {"status": "warning", "message": "Connected to Gemini API, but no models found."}
    except Exception as e:
        logger.error(f"Error connecting to Gemini API or listing models: {e}")
        return {"status": "error", "message": f"Failed to connect to Gemini API: {str(e)}"}

if __name__ == "__main__":
    # This is for local testing of this module, not for production use
    import asyncio
    async def main():
        result = await test_gemini_connection()
        print(result)

    asyncio.run(main())
