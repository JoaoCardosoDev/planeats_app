from typing import List, Optional
from sqlalchemy.orm import Session, selectinload
from sqlmodel import select, and_, or_
from app.crud.base import CRUDBase
from app.models.recipe_models import Recipe, RecipeCreate, RecipeUpdate, RecipeIngredient, RecipeIngredientCreate

class CRUDRecipe(CRUDBase[Recipe, RecipeCreate, RecipeUpdate]):
    def get_multi_by_user(
        self, db: Session, *, user_id: Optional[int] = None, skip: int = 0, limit: int = 100
    ) -> List[Recipe]:
        """Get recipes created by user or system recipes (created_by_user_id is None)"""
        query = select(Recipe).options(selectinload(Recipe.ingredients))
        
        if user_id is not None:
            # Get user's recipes + system recipes
            query = query.where(
                (Recipe.created_by_user_id == user_id) | 
                (Recipe.created_by_user_id.is_(None))
            )
        else:
            # Get only system recipes
            query = query.where(Recipe.created_by_user_id.is_(None))
            
        return db.exec(query.offset(skip).limit(limit)).all()
    
    def get_with_ingredients(self, db: Session, *, id: int) -> Optional[Recipe]:
        """Get recipe by ID with ingredients loaded"""
        return db.exec(
            select(Recipe)
            .options(selectinload(Recipe.ingredients))
            .where(Recipe.id == id)
        ).first()
    
    def create_with_user(
        self, db: Session, *, obj_in: RecipeCreate, user_id: Optional[int] = None
    ) -> Recipe:
        """Create recipe with ingredients for a user (or as system recipe if user_id is None)"""
        # Extract ingredients from the input
        ingredients_data = obj_in.ingredients
        recipe_data = obj_in.dict(exclude={"ingredients"})
        
        # Create the recipe
        db_recipe = Recipe(
            **recipe_data,
            created_by_user_id=user_id
        )
        db.add(db_recipe)
        db.commit()
        db.refresh(db_recipe)
        
        # Create ingredients
        for ingredient_data in ingredients_data:
            db_ingredient = RecipeIngredient(
                **ingredient_data.dict(),
                recipe_id=db_recipe.id
            )
            db.add(db_ingredient)
        
        db.commit()
        db.refresh(db_recipe)
        return self.get_with_ingredients(db, id=db_recipe.id)
    
    def update_with_ingredients(
        self, db: Session, *, db_obj: Recipe, obj_in: RecipeUpdate
    ) -> Recipe:
        """Update recipe and its ingredients"""
        # Update recipe fields
        update_data = obj_in.dict(exclude_unset=True, exclude={"ingredients"})
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        # Update ingredients if provided
        if obj_in.ingredients is not None:
            # Delete existing ingredients
            existing_ingredients = db.exec(
                select(RecipeIngredient).where(RecipeIngredient.recipe_id == db_obj.id)
            ).all()
            for ingredient in existing_ingredients:
                db.delete(ingredient)
            
            # Create new ingredients
            for ingredient_data in obj_in.ingredients:
                db_ingredient = RecipeIngredient(
                    **ingredient_data.dict(),
                    recipe_id=db_obj.id
                )
                db.add(db_ingredient)
        
        db.commit()
        db.refresh(db_obj)
        return self.get_with_ingredients(db, id=db_obj.id)
    
    def get_multi_with_filters(
        self,
        db: Session,
        *,
        user_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
        user_created_only: Optional[bool] = None,
        imported_only: Optional[bool] = None,
        search: Optional[str] = None,
        max_calories: Optional[int] = None,
        max_prep_time: Optional[int] = None,
        ingredients: Optional[List[str]] = None
    ) -> List[Recipe]:
        """
        Get recipes with filtering support for US3.2
        
        Filters:
        - user_created_only: Show only recipes created by current user
        - imported_only: Show only recipes imported by the user (not system recipes)
        - max_calories: Maximum calories per recipe
        - max_prep_time: Maximum preparation time in minutes
        - ingredients: List of ingredients that recipes must contain
        """
        # Start with base query
        query = select(Recipe).options(selectinload(Recipe.ingredients))
        
        # Base access control
        if user_id is not None:
            if user_created_only:
                # Only recipes created by the user
                query = query.where(Recipe.created_by_user_id == user_id)
            elif imported_only:
                # Only recipes imported by the user (created_by_user_id is user_id, but not system)
                # This assumes imported recipes are assigned to the user
                query = query.where(Recipe.created_by_user_id == user_id)
            else:
                # User's recipes (created + imported)
                # This ensures "Todas" in "Minhas Receitas" only shows user's items
                query = query.where(Recipe.created_by_user_id == user_id)
        else:
            # No user context - only system recipes (e.g., for a public explore page if we had one)
            # For "Minhas Receitas", user_id should always be present due to AuthGuard.
            # If somehow user_id is None here for "Minhas Receitas", it should return nothing.
            # However, to be safe and align with current behavior for unauthenticated recipe browsing,
            # we can keep showing system recipes if no user_id is provided.
            # The AuthGuard on the frontend should prevent unauthenticated access to "Minhas Receitas".
            query = query.where(Recipe.created_by_user_id.is_(None))
        
        # AC3.2.1: Filter by search term
        if search:
            search_term = f"%{search.lower()}%"
            query = query.where(
                or_(
                    Recipe.recipe_name.ilike(search_term),
                    Recipe.instructions.ilike(search_term)
                )
            )
        
        # AC3.2.2: Filter by maximum calories
        if max_calories is not None:
            query = query.where(
                and_(
                    Recipe.estimated_calories.is_not(None),
                    Recipe.estimated_calories <= max_calories
                )
            )
        
        # AC3.2.3: Filter by maximum preparation time
        if max_prep_time is not None:
            query = query.where(
                and_(
                    Recipe.preparation_time_minutes.is_not(None),
                    Recipe.preparation_time_minutes <= max_prep_time
                )
            )
        
        # AC3.2.4: Filter by ingredients (complex - requires join with RecipeIngredients)
        if ingredients and len(ingredients) > 0:
            # Create subquery to find recipes that contain ALL specified ingredients
            for ingredient_name in ingredients:
                ingredient_subquery = select(RecipeIngredient.recipe_id).where(
                    RecipeIngredient.ingredient_name.ilike(f"%{ingredient_name}%")
                )
                query = query.where(Recipe.id.in_(ingredient_subquery))
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        return db.exec(query).all()
    
    def count_with_filters(
        self,
        db: Session,
        *,
        user_id: Optional[int] = None,
        user_created_only: Optional[bool] = None,
        imported_only: Optional[bool] = None,
        search: Optional[str] = None,
        max_calories: Optional[int] = None,
        max_prep_time: Optional[int] = None,
        ingredients: Optional[List[str]] = None
    ) -> int:
        """
        Count recipes with filtering support for pagination
        """
        from sqlmodel import func
        
        # Start with base query for counting
        query = select(func.count(Recipe.id))
        
        # Apply same filters as get_multi_with_filters
        if user_id is not None:
            if user_created_only:
                query = query.where(Recipe.created_by_user_id == user_id)
            elif imported_only:
                query = query.where(Recipe.created_by_user_id == user_id) # Assuming imported recipes are assigned to user
            else:
                # User's recipes (created + imported)
                query = query.where(Recipe.created_by_user_id == user_id)
        else:
            # No user context - only system recipes
            query = query.where(Recipe.created_by_user_id.is_(None))

        if search:
            search_term = f"%{search.lower()}%"
            query = query.where(
                or_(
                    Recipe.recipe_name.ilike(search_term),
                    Recipe.instructions.ilike(search_term)
                )
            )
            
        if max_calories is not None:
            query = query.where(
                and_(
                    Recipe.estimated_calories.is_not(None),
                    Recipe.estimated_calories <= max_calories
                )
            )
        
        if max_prep_time is not None:
            query = query.where(
                and_(
                    Recipe.preparation_time_minutes.is_not(None),
                    Recipe.preparation_time_minutes <= max_prep_time
                )
            )
        
        if ingredients and len(ingredients) > 0:
            for ingredient_name in ingredients:
                ingredient_subquery = select(RecipeIngredient.recipe_id).where(
                    RecipeIngredient.ingredient_name.ilike(f"%{ingredient_name}%")
                )
                query = query.where(Recipe.id.in_(ingredient_subquery))
        
        return db.exec(query).one()

recipe = CRUDRecipe(Recipe)
