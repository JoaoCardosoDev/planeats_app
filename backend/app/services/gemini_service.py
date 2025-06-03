import os
import time
import logging
import json
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from app.core.config import settings
from app.schemas.ai_recipes import GeneratedRecipe, GeneratedRecipeIngredient, GenerationMetadata

# Configure logging
logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if self.api_key:
            genai.configure(api_key=self.api_key)
            logger.info("Gemini API key configured successfully.")
        else:
            logger.error("Gemini API key not found in environment variables.")
            raise ValueError("Gemini API key is required")
        
        # Default model for recipe generation
        self.default_model = "gemini-1.5-flash"

    def test_connection(self) -> Dict[str, Any]:
        """Test connection to Gemini API and return available models"""
        try:
            logger.info("Attempting to list Gemini models...")
            models = genai.list_models()
            model_names = [model.name for model in models]
            
            logger.info("Successfully connected to Gemini API. Available models:")
            for model_name in model_names:
                logger.info(f"- {model_name}")
            
            return {
                "status": "success",
                "message": "Connected to Gemini API and listed models.",
                "models": model_names
            }
        except Exception as e:
            logger.error(f"Failed to connect to Gemini API: {str(e)}")
            return {
                "status": "error",
                "message": f"Failed to connect to Gemini API: {str(e)}"
            }

    def _build_recipe_prompt(
        self, 
        pantry_items: List[Dict[str, Any]], 
        max_calories: Optional[int],
        preparation_time_limit: Optional[int],
        dietary_restrictions: Optional[str],
        cuisine_preference: Optional[str],
        additional_notes: Optional[str]
    ) -> str:
        """Build a detailed prompt for recipe generation"""
        
        # Start with pantry items
        items_text = "Available pantry items:\n"
        for item in pantry_items:
            items_text += f"- {item['item_name']}: {item['quantity']} {item['unit']}"
            if item.get('expiration_date'):
                items_text += f" (expires: {item['expiration_date']})"
            if item.get('calories_per_unit'):
                items_text += f" ({item['calories_per_unit']} cal per {item['unit']})"
            items_text += "\n"

        # Build constraints
        constraints = []
        if max_calories:
            constraints.append(f"Maximum {max_calories} calories total")
        if preparation_time_limit:
            constraints.append(f"Maximum {preparation_time_limit} minutes preparation time")
        if dietary_restrictions:
            constraints.append(f"Dietary restrictions: {dietary_restrictions}")
        if cuisine_preference:
            constraints.append(f"Cuisine preference: {cuisine_preference}")
        
        constraints_text = ""
        if constraints:
            constraints_text = "Constraints:\n" + "\n".join(f"- {constraint}" for constraint in constraints)

        additional_text = ""
        if additional_notes:
            additional_text = f"\nAdditional notes: {additional_notes}"

        prompt = f"""
You are a professional chef AI assistant. Create a detailed recipe using ONLY the available pantry items listed below.

{items_text}

{constraints_text}

{additional_text}

Please respond with a JSON object in exactly this format:
{{
    "recipe_name": "Name of the recipe",
    "instructions": "Step-by-step cooking instructions",
    "estimated_calories": 450,
    "preparation_time_minutes": 30,
    "ingredients": [
        {{
            "name": "ingredient name from pantry",
            "quantity": 2.0,
            "unit": "cups"
        }}
    ]
}}

Requirements:
1. Use ONLY ingredients from the provided pantry items
2. Be specific about quantities and units
3. Provide clear, step-by-step instructions
4. Estimate realistic calories and preparation time
5. Make the recipe practical and delicious
6. Respect all dietary restrictions and preferences
7. Respond ONLY with valid JSON, no additional text
"""
        
        return prompt.strip()

    def generate_custom_recipe(
        self,
        pantry_items: List[Dict[str, Any]],
        max_calories: Optional[int] = None,
        preparation_time_limit: Optional[int] = None,
        dietary_restrictions: Optional[str] = None,
        cuisine_preference: Optional[str] = None,
        additional_notes: Optional[str] = None,
        model_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a custom recipe using Gemini API"""
        
        if not pantry_items:
            raise ValueError("At least one pantry item is required")
        
        model_to_use = model_name or self.default_model
        
        try:
            logger.info(f"Generating recipe using model: {model_to_use}")
            start_time = time.time()
            
            # Build the prompt
            prompt = self._build_recipe_prompt(
                pantry_items=pantry_items,
                max_calories=max_calories,
                preparation_time_limit=preparation_time_limit,
                dietary_restrictions=dietary_restrictions,
                cuisine_preference=cuisine_preference,
                additional_notes=additional_notes
            )
            
            logger.info("Sending request to Gemini API...")
            logger.debug(f"Prompt: {prompt}")
            
            # Initialize the model and generate content
            model = genai.GenerativeModel(model_to_use)
            response = model.generate_content(prompt)
            
            generation_time = time.time() - start_time
            
            logger.info(f"Received response from Gemini API in {generation_time:.2f}s")
            
            # Parse the JSON response
            try:
                # Clean the response text (remove any markdown formatting)
                response_text = response.text.strip()
                if response_text.startswith('```json'):
                    response_text = response_text[7:]
                if response_text.endswith('```'):
                    response_text = response_text[:-3]
                response_text = response_text.strip()
                
                recipe_data = json.loads(response_text)
                logger.info("Successfully parsed recipe JSON")
                
                # Convert to our schema
                ingredients = [
                    GeneratedRecipeIngredient(**ingredient) 
                    for ingredient in recipe_data.get('ingredients', [])
                ]
                
                generated_recipe = GeneratedRecipe(
                    recipe_name=recipe_data['recipe_name'],
                    instructions=recipe_data['instructions'],
                    estimated_calories=recipe_data.get('estimated_calories'),
                    preparation_time_minutes=recipe_data.get('preparation_time_minutes'),
                    ingredients=ingredients
                )
                
                metadata = GenerationMetadata(
                    model_used=model_to_use,
                    generation_time=generation_time,
                    prompt_tokens=getattr(response.usage_metadata, 'prompt_token_count', None) if hasattr(response, 'usage_metadata') else None,
                    completion_tokens=getattr(response.usage_metadata, 'candidates_token_count', None) if hasattr(response, 'usage_metadata') else None
                )
                
                return {
                    "success": True,
                    "recipe": generated_recipe,
                    "metadata": metadata,
                    "raw_response": response_text
                }
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response: {e}")
                logger.error(f"Raw response: {response.text}")
                return {
                    "success": False,
                    "error": "Failed to parse recipe response from AI",
                    "raw_response": response.text
                }
                
        except Exception as e:
            logger.error(f"Error generating recipe: {str(e)}")
            return {
                "success": False,
                "error": f"Recipe generation failed: {str(e)}"
            }

# Create a singleton instance
gemini_service = GeminiService()

def test_gemini_connection() -> Dict[str, Any]:
    """Test function for the API endpoint"""
    return gemini_service.test_connection()

def generate_custom_recipe(
    pantry_items: List[Dict[str, Any]],
    max_calories: Optional[int] = None,
    preparation_time_limit: Optional[int] = None,
    dietary_restrictions: Optional[str] = None,
    cuisine_preference: Optional[str] = None,
    additional_notes: Optional[str] = None
) -> Dict[str, Any]:
    """Service function for recipe generation"""
    return gemini_service.generate_custom_recipe(
        pantry_items=pantry_items,
        max_calories=max_calories,
        preparation_time_limit=preparation_time_limit,
        dietary_restrictions=dietary_restrictions,
        cuisine_preference=cuisine_preference,
        additional_notes=additional_notes
    )
