import logging
from typing import List, Dict, Any, Optional
from datetime import date, datetime
from sqlmodel import Session, select
from app.models.pantry_models import PantryItem
from app.models.recipe_models import Recipe, RecipeIngredient
from app.models.user_preference_models import UserPreference
from app.crud.crud_user_preferences import user_preference as user_preference_crud
from app.schemas.recommendations import (
    RecommendedRecipe, 
    MatchingIngredient, 
    MissingIngredient, 
    ExpiringIngredient,
    RecipeRecommendationsResponse,
    RecommendationFilters,
    RecommendationSort,
    RecommendationMetadata
)

logger = logging.getLogger(__name__)

class RecommendationService:
    def __init__(self):
        self.minimum_match_score = 0.1  # Minimum score to include a recipe
        self.max_recommendations = 50  # Maximum number of recommendations to return

    def get_recommendations(
        self, 
        db: Session, 
        user_id: int,
        filters: Optional[RecommendationFilters] = None,
        sort: Optional[RecommendationSort] = None,
        use_preferences: bool = True
    ) -> RecipeRecommendationsResponse:
        """
        Get recipe recommendations based on user's pantry items with filtering, sorting, and preferences
        """
        logger.info(f"Getting recipe recommendations for user {user_id} (use_preferences={use_preferences})")
        
        # Set defaults
        if filters is None:
            filters = RecommendationFilters()
        if sort is None:
            sort = RecommendationSort()
        
        # Get user preferences if enabled
        user_preferences = None
        if use_preferences:
            user_preferences = user_preference_crud.get_by_user_id(db, user_id=user_id)
            if user_preferences:
                logger.info(f"Using user preferences for recommendations: dietary_restrictions={user_preferences.dietary_restrictions}, preferred_cuisines={user_preferences.preferred_cuisines}")
        
        # Get user's pantry items
        pantry_items = db.exec(
            select(PantryItem).where(PantryItem.user_id == user_id)
        ).all()
        
        if not pantry_items:
            logger.info(f"No pantry items found for user {user_id}")
            return RecipeRecommendationsResponse(
                recommendations=[],
                total_pantry_items=0,
                metadata=RecommendationMetadata(
                    total_recipes_analyzed=0,
                    total_before_filters=0,
                    total_after_filters=0,
                    applied_filters=filters,
                    applied_sort=sort
                ),
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
                metadata=RecommendationMetadata(
                    total_recipes_analyzed=0,
                    total_before_filters=0,
                    total_after_filters=0,
                    applied_filters=filters,
                    applied_sort=sort
                ),
                message="Nenhuma receita disponível no momento. Tente novamente mais tarde!"
            )
        
        logger.info(f"Analyzing {len(recipes)} recipes against {len(pantry_items)} pantry items")
        
        # Filter recipes based on user preferences first
        if user_preferences:
            recipes = self._filter_recipes_by_preferences(recipes, user_preferences)
            logger.info(f"After preference filtering: {len(recipes)} recipes remain")
        
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
                pantry_items=pantry_items,
                user_preferences=user_preferences
            )
            
            if recommendation and recommendation.match_score >= self.minimum_match_score:
                recommendations.append(recommendation)
        
        total_before_filters = len(recommendations)
        
        # Apply additional filters
        filtered_recommendations = self._apply_filters(recommendations, filters)
        
        # Apply sorting
        sorted_recommendations = self._apply_sorting(filtered_recommendations, sort)
        
        # Limit to max recommendations
        final_recommendations = sorted_recommendations[:self.max_recommendations]
        
        message = None
        if not final_recommendations:
            if total_before_filters == 0:
                message = "Não encontramos receitas que correspondam aos seus itens da despensa e preferências. Considere adicionar mais ingredientes ou ajustar suas preferências!"
            else:
                message = "Nenhuma receita corresponde aos filtros aplicados. Tente ajustar os critérios de pesquisa."
        
        logger.info(f"Generated {len(final_recommendations)} recommendations for user {user_id} (filtered from {total_before_filters})")
        
        return RecipeRecommendationsResponse(
            recommendations=final_recommendations,
            total_pantry_items=len(pantry_items),
            metadata=RecommendationMetadata(
                total_recipes_analyzed=len(recipes),
                total_before_filters=total_before_filters,
                total_after_filters=len(final_recommendations),
                applied_filters=filters,
                applied_sort=sort
            ),
            message=message
        )

    def _filter_recipes_by_preferences(
        self, 
        recipes: List[Recipe], 
        user_preferences: UserPreference
    ) -> List[Recipe]:
        """Filter recipes based on user preferences"""
        filtered_recipes = []
        
        for recipe in recipes:
            # Check dietary restrictions
            if user_preferences.dietary_restrictions:
                if recipe.dietary_tags:
                    # Check if recipe satisfies user's dietary restrictions
                    recipe_dietary_tags = set(recipe.dietary_tags)
                    user_restrictions = set(user_preferences.dietary_restrictions)
                    
                    # If user has dietary restrictions, recipe must have matching tags
                    if not user_restrictions.issubset(recipe_dietary_tags):
                        continue
                else:
                    # Recipe has no dietary tags but user has restrictions - skip
                    continue
            
            # Check preferred cuisines
            if user_preferences.preferred_cuisines and recipe.cuisine_type:
                if recipe.cuisine_type not in user_preferences.preferred_cuisines:
                    continue
            
            # Check preferred difficulty
            if user_preferences.preferred_difficulty and recipe.difficulty_level:
                if recipe.difficulty_level != user_preferences.preferred_difficulty:
                    continue
            
            # Check max prep time preference
            if (user_preferences.max_prep_time_preference and 
                recipe.preparation_time_minutes and 
                recipe.preparation_time_minutes > user_preferences.max_prep_time_preference):
                continue
            
            # Check max calories preference
            if (user_preferences.max_calories_preference and 
                recipe.estimated_calories and 
                recipe.estimated_calories > user_preferences.max_calories_preference):
                continue
            
            filtered_recipes.append(recipe)
        
        return filtered_recipes

    def _apply_filters(
        self, 
        recommendations: List[RecommendedRecipe], 
        filters: RecommendationFilters
    ) -> List[RecommendedRecipe]:
        """Apply filters to recommendations"""
        filtered = recommendations.copy()
        
        # Filter by max preparation time
        if filters.max_preparation_time is not None:
            filtered = [
                r for r in filtered 
                if r.preparation_time_minutes is None or r.preparation_time_minutes <= filters.max_preparation_time
            ]
        
        # Filter by max calories
        if filters.max_calories is not None:
            filtered = [
                r for r in filtered 
                if r.estimated_calories is None or r.estimated_calories <= filters.max_calories
            ]
        
        # Filter by max missing ingredients
        if filters.max_missing_ingredients is not None:
            filtered = [
                r for r in filtered 
                if len(r.missing_ingredients) <= filters.max_missing_ingredients
            ]
        
        return filtered

    def _apply_sorting(
        self, 
        recommendations: List[RecommendedRecipe], 
        sort: RecommendationSort
    ) -> List[RecommendedRecipe]:
        """Apply sorting to recommendations"""
        reverse = sort.sort_order == "desc"
        
        if sort.sort_by == "match_score":
            return sorted(recommendations, key=lambda x: x.match_score, reverse=reverse)
        
        elif sort.sort_by == "preparation_time":
            # Handle None values by putting them at the end
            return sorted(
                recommendations, 
                key=lambda x: (x.preparation_time_minutes is None, x.preparation_time_minutes or 0), 
                reverse=reverse
            )
        
        elif sort.sort_by == "calories":
            # Handle None values by putting them at the end
            return sorted(
                recommendations, 
                key=lambda x: (x.estimated_calories is None, x.estimated_calories or 0), 
                reverse=reverse
            )
        
        elif sort.sort_by == "expiring_ingredients":
            # Sort by number of expiring ingredients (more expiring = higher priority)
            return sorted(
                recommendations, 
                key=lambda x: len(x.expiring_ingredients_used), 
                reverse=not reverse  # More expiring ingredients should come first
            )
        
        else:
            # Default to match_score descending
            return sorted(recommendations, key=lambda x: x.match_score, reverse=True)

    def _analyze_recipe_match(
        self, 
        recipe: Recipe, 
        recipe_ingredients: List[RecipeIngredient], 
        pantry_items: List[PantryItem],
        user_preferences: Optional[UserPreference] = None
    ) -> Optional[RecommendedRecipe]:
        """
        Analyze how well a recipe matches the available pantry items and user preferences
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
        
        # Calculate match score with preference bonuses
        if total_recipe_ingredients == 0:
            match_score = 0.0
        else:
            base_score = matched_ingredients_count / total_recipe_ingredients
            
            # Bonus for using expiring ingredients
            expiring_bonus = min(0.2, len(expiring_ingredients_used) * 0.1)
            
            # Bonus for having all ingredients
            complete_bonus = 0.1 if len(missing_ingredients) == 0 else 0
            
            # Preference-based bonuses
            preference_bonus = 0.0
            if user_preferences:
                # Bonus for preferred cuisine
                if (user_preferences.preferred_cuisines and 
                    recipe.cuisine_type and 
                    recipe.cuisine_type in user_preferences.preferred_cuisines):
                    preference_bonus += 0.15
                
                # Bonus for preferred difficulty
                if (user_preferences.preferred_difficulty and 
                    recipe.difficulty_level and 
                    recipe.difficulty_level == user_preferences.preferred_difficulty):
                    preference_bonus += 0.1
                
                # Bonus for dietary compliance
                if (user_preferences.dietary_restrictions and 
                    recipe.dietary_tags and 
                    set(user_preferences.dietary_restrictions).issubset(set(recipe.dietary_tags))):
                    preference_bonus += 0.2
                
                # Bonus for prioritizing expiring ingredients
                if user_preferences.prioritize_expiring_ingredients and expiring_ingredients_used:
                    preference_bonus += 0.1
            
            match_score = min(1.0, base_score + expiring_bonus + complete_bonus + preference_bonus)
        
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

def get_recipe_recommendations(
    db: Session, 
    user_id: int,
    filters: Optional[RecommendationFilters] = None,
    sort: Optional[RecommendationSort] = None,
    use_preferences: bool = True
) -> RecipeRecommendationsResponse:
    """Service function for the API endpoint"""
    return recommendation_service.get_recommendations(
        db=db, 
        user_id=user_id, 
        filters=filters, 
        sort=sort,
        use_preferences=use_preferences
    )
