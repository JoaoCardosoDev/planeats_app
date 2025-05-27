-- First, create the users table (referenced by other tables)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create PantryItems table
CREATE TABLE PantryItems (
    item_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    expiration_date DATE,
    purchase_date DATE DEFAULT CURRENT_DATE,
    calories_per_unit INTEGER,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Recipes table
CREATE TABLE Recipes (
    recipe_id SERIAL PRIMARY KEY,
    recipe_name VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL,
    estimated_calories INTEGER,
    preparation_time_minutes INTEGER,
    created_by_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    image_url VARCHAR(255)
);

-- Create RecipeIngredients table
CREATE TABLE RecipeIngredients (
    recipe_ingredient_id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES Recipes(recipe_id) ON DELETE CASCADE,
    ingredient_name VARCHAR(255) NOT NULL,
    required_quantity NUMERIC(10, 2) NOT NULL,
    required_unit VARCHAR(50) NOT NULL
);

-- Create UserPreferences table
CREATE TABLE UserPreferences (
    preference_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    daily_calorie_goal INTEGER,
    dietary_restrictions TEXT[],
    other_preferences JSONB
);
