import logging
from typing import List, Dict, Any, Optional
from datetime import date, datetime
from sqlmodel import Session, select
from app.models.pantry_models import PantryItem
from app.models.recipe_models import Recipe, RecipeIngredient
from app.schemas.recommendations import (
    RecommendedRecipe, 
    MatchingIngredient, 
    MissingIngredient, 
    ExpiringIngredient,
    RecipeRecommendationsResponse
)

logger = logging.getLogger(__name__)

class RecommendationService:
    def __init__(self):
        self.minimum_match_score = 0.1  # Minimum score to include a recipe
        self.max_recommendations = 10  # Maximum number of recommendations to return

    def get_recommendations(self, db: Session, user_id: int) -> RecipeRecommendationsResponse:
        """
        Get recipe recommendations based on user's pantry items
        """
        logger.info(f"Getting recipe recommendations for user {user_id}")
        
        # Get user's pantry items
        pantry_items = db.exec(
            select(PantryItem).where(PantryItem.user_id == user_id)
        ).all()
        
        if not pantry_items:
            logger.info(f"No pantry items found for user {user_id}")
            return RecipeRecommendationsResponse(
                recommendations=[],
                total_pantry_items=0,
                total_recipes_analyzed=0,
                message="Sua despensa está vazia. Adicione alguns itens para receber recomendações de receitas!"
            )
        
        # Get all available recipes with ingredients
        recipes = db.exec(
            select(Recipe).where(
                (Recipe.created_by_user_id == user_id) | 
                (Recipe.created_by_user_id.is_(None))  # System recipes
            )
        ).all()
        
        if not recipes:
            logger.info("No recipes found in the system")
            return RecipeRecommendationsResponse(
                recommendations=[],
                total_pantry_items=len(pantry_items),
                total_recipes_analyzed=0,
                message="Nenhuma receita disponível no momento. Tente novamente mais tarde!"
            )
        
        logger.info(f"Analyzing {len(recipes)} recipes against {len(pantry_items)} pantry items")
        
        # Analyze each recipe and calculate match scores
        recommendations = []
        
        for recipe in recipes:
            # Get recipe ingredients
            recipe_ingredients = db.exec(
                select(RecipeIngredient).where(RecipeIngredient.recipe_id == recipe.id)
            ).all()
            
            if not recipe_ingredients:
                continue  # Skip recipes without ingredients
            
            recommendation = self._analyze_recipe_match(
                recipe=recipe,
                recipe_ingredients=recipe_ingredients,
                pantry_items=pantry_items
            )
            
            if recommendation and recommendation.match_score >= self.minimum_match_score:
                recommendations.append(recommendation)
        
        # Sort by match score (highest first), then by expiring ingredients
        recommendations.sort(key=lambda x: (
            x.match_score,
            len(x.expiring_ingredients_used),
            -x.preparation_time_minutes if x.preparation_time_minutes else 0
        ), reverse=True)
        
        # Limit to max recommendations
        recommendations = recommendations[:self.max_recommendations]
        
        message = None
        if not recommendations:
            message = "Não encontramos receitas que correspondam aos seus itens da despensa. Considere adicionar mais ingredientes!"
        
        logger.info(f"Generated {len(recommendations)} recommendations for user {user_id}")
        
        return RecipeRecommendationsResponse(
            recommendations=recommendations,
            total_pantry_items=len(pantry_items),
            total_recipes_analyzed=len(recipes),
            message=message
        )

    def _analyze_recipe_match(
        self, 
        recipe: Recipe, 
        recipe_ingredients: List[RecipeIngredient], 
        pantry_items: List[PantryItem]
    ) -> Optional[RecommendedRecipe]:
        """
        Analyze how well a recipe matches the available pantry items
        """
        matching_ingredients = []
        missing_ingredients = []
        expiring_ingredients_used = []
        
        # Create a lookup for pantry items by name (case-insensitive)
        pantry_lookup = {
            item.item_name.lower().strip(): item 
            for item in pantry_items
        }
        
        total_recipe_ingredients = len(recipe_ingredients)
        matched_ingredients_count = 0
        
        for recipe_ingredient in recipe_ingredients:
            ingredient_name_lower = recipe_ingredient.ingredient_name.lower().strip()
            
            # Try to find matching pantry item
            pantry_item = self._find_matching_pantry_item(ingredient_name_lower, pantry_lookup)
            
            if pantry_item:
                matched_ingredients_count += 1
                
                # Check if ingredient is expiring soon
                expiring_ingredient = None
                if pantry_item.expiration_date:
                    days_until_expiration = (pantry_item.expiration_date - date.today()).days
                    if days_until_expiration <= 7:  # Expiring within a week
                        expiring_ingredient = ExpiringIngredient(
                            pantry_item_id=pantry_item.id,
                            pantry_item_name=pantry_item.item_name,
                            expiration_date=pantry_item.expiration_date.isoformat(),
                            days_until_expiration=days_until_expiration
                        )
                        expiring_ingredients_used.append(expiring_ingredient)
                
                matching_ingredient = MatchingIngredient(
                    pantry_item_id=pantry_item.id,
                    pantry_item_name=pantry_item.item_name,
                    recipe_ingredient_name=recipe_ingredient.ingredient_name,
                    pantry_quantity=pantry_item.quantity,
                    pantry_unit=pantry_item.unit,
                    required_quantity=recipe_ingredient.required_quantity,
                    required_unit=recipe_ingredient.required_unit
                )
                matching_ingredients.append(matching_ingredient)
            else:
                missing_ingredient = MissingIngredient(
                    ingredient_name=recipe_ingredient.ingredient_name,
                    required_quantity=recipe_ingredient.required_quantity,
                    required_unit=recipe_ingredient.required_unit
                )
                missing_ingredients.append(missing_ingredient)
        
        # Calculate match score
        if total_recipe_ingredients == 0:
            match_score = 0.0
        else:
            base_score = matched_ingredients_count / total_recipe_ingredients
            
            # Bonus for using expiring ingredients
            expiring_bonus = min(0.2, len(expiring_ingredients_used) * 0.1)
            
            # Bonus for having all ingredients
            complete_bonus = 0.1 if len(missing_ingredients) == 0 else 0
            
            match_score = min(1.0, base_score + expiring_bonus + complete_bonus)
        
        return RecommendedRecipe(
            recipe_id=recipe.id,
            recipe_name=recipe.recipe_name,
            estimated_calories=recipe.estimated_calories,
            preparation_time_minutes=recipe.preparation_time_minutes,
            image_url=recipe.image_url,
            instructions=recipe.instructions,
            matching_ingredients=matching_ingredients,
            missing_ingredients=missing_ingredients,
            match_score=round(match_score, 3),
            expiring_ingredients_used=expiring_ingredients_used
        )

    def _find_matching_pantry_item(
        self, 
        ingredient_name: str, 
        pantry_lookup: Dict[str, PantryItem]
    ) -> Optional[PantryItem]:
        """
        Find a matching pantry item for an ingredient name
        Uses fuzzy matching to handle variations in naming
        """
        # Direct match
        if ingredient_name in pantry_lookup:
            return pantry_lookup[ingredient_name]
        
        # Partial matching - check if any pantry item contains the ingredient name
        for pantry_name, pantry_item in pantry_lookup.items():
            if (ingredient_name in pantry_name or 
                pantry_name in ingredient_name or
                self._are_similar_ingredients(ingredient_name, pantry_name)):
                return pantry_item
        
        return None

    def _are_similar_ingredients(self, ingredient1: str, ingredient2: str) -> bool:
        """
        Check if two ingredient names are similar
        Simple heuristic-based matching
        """
        # Common ingredient variations
        variations = {
            'chicken': ['chicken breast', 'chicken thigh', 'frango'],
            'tomato': ['tomatoes', 'tomate'],
            'onion': ['onions', 'cebola'],
            'rice': ['arroz'],
            'pasta': ['macarrão', 'spaghetti', 'penne'],
            'cheese': ['queijo', 'mozzarella', 'cheddar'],
            'milk': ['leite'],
            'egg': ['eggs', 'ovo', 'ovos'],
            'oil': ['olive oil', 'óleo'],
            'salt': ['sal'],
            'pepper': ['pimenta'],
            'garlic': ['alho'],
            'butter': ['manteiga']
        }
        
        for base_name, variant_list in variations.items():
            if ((ingredient1 == base_name or ingredient1 in variant_list) and
                (ingredient2 == base_name or ingredient2 in variant_list)):
                return True
        
        # Simple similarity check - if one name contains the other (minimum 3 chars)
        if len(ingredient1) >= 3 and len(ingredient2) >= 3:
            if ingredient1 in ingredient2 or ingredient2 in ingredient1:
                return True
        
        return False


# Create service instance
recommendation_service = RecommendationService()

def get_recipe_recommendations(db: Session, user_id: int) -> RecipeRecommendationsResponse:
    """Service function for the API endpoint"""
    return recommendation_service.get_recommendations(db=db, user_id=user_id)
