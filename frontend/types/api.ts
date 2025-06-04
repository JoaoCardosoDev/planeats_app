// User types
export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  id: number;
  email: string;
  username: string;
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Pantry types
export interface PantryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  expiry_date?: string;
  category?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePantryItemRequest {
  name: string;
  quantity: number;
  unit: string;
  expiry_date?: string;
  category?: string;
}

export interface UpdatePantryItemRequest {
  name?: string;
  quantity?: number;
  unit?: string;
  expiry_date?: string;
  category?: string;
}

// Recipe types
export interface RecipeIngredient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  recipe_id: number;
}

export interface Recipe {
  id: number;
  title: string;
  description?: string;
  instructions: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  category: string;
  user_id: number;
  ingredients: RecipeIngredient[];
  created_at: string;
  updated_at: string;
}

export interface CreateRecipeRequest {
  title: string;
  description?: string;
  instructions: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  category: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
}

export interface UpdateRecipeRequest {
  title?: string;
  description?: string;
  instructions?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: string;
  category?: string;
}

export interface RecipeFilters {
  category?: string;
  difficulty?: string;
  max_prep_time?: number;
}

// Gemini AI types
export interface RecipeSuggestionRequest {
  pantry_items: string[];
}

export interface RecipeSuggestion {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  difficulty: string;
  category: string;
}

export interface AnalyzeItemRequest {
  item_name: string;
}

export interface ItemAnalysis {
  category: string;
  storage_tips: string[];
  shelf_life: string;
  nutritional_info: string;
  recipe_suggestions: string[];
}

// API Response wrapper
export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

// Common enums
export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum RecipeCategory {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage'
}

export enum PantryCategory {
  VEGETABLES = 'vegetables',
  FRUITS = 'fruits',
  MEAT = 'meat',
  DAIRY = 'dairy',
  GRAINS = 'grains',
  SPICES = 'spices',
  CONDIMENTS = 'condiments',
  BEVERAGES = 'beverages',
  OTHER = 'other'
}