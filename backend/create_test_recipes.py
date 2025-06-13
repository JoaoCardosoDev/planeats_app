#!/usr/bin/env python3
"""
Script to create test recipe data
"""
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlmodel import Session, select
from app.db.session import engine
from app.models.recipe_models import Recipe, RecipeIngredient

def create_test_recipes():
    """Create test recipes for development"""
    
    print("🔍 Checking for existing test recipes...")
    
    # Test recipes data - only using fields that exist in current database schema
    test_recipes = [
        {
            "recipe_name": "Arroz de Frango",
            "instructions": "Tempere o frango com sal e pimenta. Refogue a cebola e o alho no azeite. Adicione o frango e deixe dourar. Acrescente o arroz, mexendo bem. Adicione água quente e deixe cozinhar por 20 minutos. Finalize com salsinha picada.",
            "estimated_calories": 350,
            "preparation_time_minutes": 45,
            "created_by_user_id": None,  # System recipe
            "ingredients": [
                {"ingredient_name": "arroz", "required_quantity": 2, "required_unit": "xícaras"},
                {"ingredient_name": "frango", "required_quantity": 500, "required_unit": "gramas"},
                {"ingredient_name": "cebola", "required_quantity": 1, "required_unit": "unidade"},
                {"ingredient_name": "alho", "required_quantity": 3, "required_unit": "dentes"},
                {"ingredient_name": "azeite", "required_quantity": 3, "required_unit": "colheres de sopa"},
                {"ingredient_name": "salsinha", "required_quantity": 1, "required_unit": "molho"},
            ]
        },
        {
            "recipe_name": "Espaguete à Carbonara",
            "instructions": "Cozinhe o espaguete em água salgada. Em uma tigela, misture os ovos, queijo parmesão e pimenta. Frite o bacon até ficar crocante. Escorra a massa e misture rapidamente com os ovos e o bacon. Sirva imediatamente.",
            "estimated_calories": 520,
            "preparation_time_minutes": 25,
            "created_by_user_id": None,  # System recipe
            "ingredients": [
                {"ingredient_name": "espaguete", "required_quantity": 200, "required_unit": "gramas"},
                {"ingredient_name": "ovos", "required_quantity": 2, "required_unit": "unidades"},
                {"ingredient_name": "bacon", "required_quantity": 100, "required_unit": "gramas"},
                {"ingredient_name": "queijo parmesão", "required_quantity": 50, "required_unit": "gramas"},
                {"ingredient_name": "pimenta preta", "required_quantity": 1, "required_unit": "pitada"},
            ]
        },
        {
            "recipe_name": "Salada Caesar",
            "instructions": "Lave e corte a alface. Prepare o molho misturando maionese, mostarda, alho, anchovas e queijo parmesão. Misture a alface com o molho e finalize com croutons e mais queijo parmesão.",
            "estimated_calories": 180,
            "preparation_time_minutes": 15,
            "created_by_user_id": None,  # System recipe
            "ingredients": [
                {"ingredient_name": "alface romana", "required_quantity": 1, "required_unit": "cabeça"},
                {"ingredient_name": "maionese", "required_quantity": 3, "required_unit": "colheres de sopa"},
                {"ingredient_name": "mostarda", "required_quantity": 1, "required_unit": "colher de chá"},
                {"ingredient_name": "alho", "required_quantity": 1, "required_unit": "dente"},
                {"ingredient_name": "anchovas", "required_quantity": 3, "required_unit": "filés"},
                {"ingredient_name": "queijo parmesão", "required_quantity": 30, "required_unit": "gramas"},
                {"ingredient_name": "croutons", "required_quantity": 1, "required_unit": "xícara"},
            ]
        },
        {
            "recipe_name": "Smoothie de Frutas",
            "instructions": "Coloque todas as frutas no liquidificador. Adicione o iogurte e o mel. Bata até ficar homogêneo. Adicione gelo se desejar mais gelado. Sirva imediatamente.",
            "estimated_calories": 150,
            "preparation_time_minutes": 5,
            "created_by_user_id": None,  # System recipe
            "ingredients": [
                {"ingredient_name": "banana", "required_quantity": 1, "required_unit": "unidade"},
                {"ingredient_name": "morango", "required_quantity": 100, "required_unit": "gramas"},
                {"ingredient_name": "iogurte natural", "required_quantity": 150, "required_unit": "ml"},
                {"ingredient_name": "mel", "required_quantity": 1, "required_unit": "colher de sopa"},
                {"ingredient_name": "gelo", "required_quantity": 5, "required_unit": "cubos"},
            ]
        },
        {
            "recipe_name": "Lasanha de Carne",
            "instructions": "Prepare o molho de carne refogando cebola, alho e carne moída. Adicione molho de tomate e temperos. Prepare o molho branco com manteiga, farinha e leite. Monte a lasanha alternando camadas de massa, molho de carne, molho branco e queijo. Asse por 45 minutos.",
            "estimated_calories": 450,
            "preparation_time_minutes": 90,
            "created_by_user_id": None,  # System recipe
            "ingredients": [
                {"ingredient_name": "massa para lasanha", "required_quantity": 500, "required_unit": "gramas"},
                {"ingredient_name": "carne moída", "required_quantity": 500, "required_unit": "gramas"},
                {"ingredient_name": "molho de tomate", "required_quantity": 400, "required_unit": "ml"},
                {"ingredient_name": "queijo mussarela", "required_quantity": 200, "required_unit": "gramas"},
                {"ingredient_name": "queijo parmesão", "required_quantity": 100, "required_unit": "gramas"},
                {"ingredient_name": "leite", "required_quantity": 500, "required_unit": "ml"},
                {"ingredient_name": "manteiga", "required_quantity": 50, "required_unit": "gramas"},
                {"ingredient_name": "farinha de trigo", "required_quantity": 3, "required_unit": "colheres de sopa"},
            ]
        }
    ]
    
    created_count = 0
    skipped_count = 0
    
    try:
        with Session(engine) as session:
            for recipe_data in test_recipes:
                # Check if recipe already exists
                existing = session.exec(
                    select(Recipe).where(Recipe.recipe_name == recipe_data["recipe_name"])
                ).first()
                if existing:
                    print(f"✅ Recipe '{recipe_data['recipe_name']}' already exists, skipping...")
                    skipped_count += 1
                    continue
                
                # Create recipe without ingredients first
                ingredients_data = recipe_data.pop("ingredients")
                recipe = Recipe(**recipe_data)
                session.add(recipe)
                session.flush()  # Get the recipe ID
                
                # Create ingredients
                for ingredient_data in ingredients_data:
                    ingredient = RecipeIngredient(
                        recipe_id=recipe.id,
                        **ingredient_data
                    )
                    session.add(ingredient)
                
                session.commit()
                print(f"✨ Created recipe: {recipe.recipe_name}")
                created_count += 1
        
        print(f"\n🎉 Test recipes setup complete!")
        print(f"   📝 Created: {created_count} new recipes")
        print(f"   ⏭️  Skipped: {skipped_count} existing recipes")
        
    except Exception as e:
        print(f"\n❌ Error creating test recipes: {e}")
        raise

if __name__ == "__main__":
    create_test_recipes()
