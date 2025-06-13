// API service for recipe-related operations
import { getSession } from 'next-auth/react';

// Use localhost for browser requests (Docker internal URLs don't work from browser)
const API_BASE_URL = typeof window !== 'undefined' 
  ? 'http://localhost:8000'  // Browser: use localhost
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'; // Server: use env var

// Debug logging
console.log('API_BASE_URL:', API_BASE_URL);
console.log('NEXT_PUBLIC_API_URL env var:', process.env.NEXT_PUBLIC_API_URL);
console.log('Running in browser:', typeof window !== 'undefined');

export interface RecipeFilter {
  user_created_only?: boolean;
  imported_only?: boolean;
  search?: string;
  max_calories?: number;
  max_prep_time?: number;
  ingredients?: string[];
  skip?: number;
  limit?: number;
}

export interface Recipe {
  id: number;
  recipe_name: string;
  instructions: string;
  estimated_calories?: number;
  preparation_time_minutes?: number;
  image_url?: string;
  created_by_user_id?: number;
  created_at: string;
  ingredients: RecipeIngredient[];
  // Additional fields from backend
  dietary_tags?: string[];
  cuisine_type?: string;
  difficulty_level?: string;
  is_healthy?: boolean;
  is_comfort_food?: boolean;
  serving_size?: number;
}

export interface RecipeIngredient {
  id: number;
  ingredient_name: string;
  required_quantity: number;
  required_unit: string;
}

export interface RecipeListResponse {
  recipes: Recipe[];
  total: number;
  skip: number;
  limit: number;
}

export interface CreateRecipeIngredient {
  ingredient_name: string;
  required_quantity: number;
  required_unit: string;
}

export interface CreateRecipeRequest {
  recipe_name: string;
  instructions: string;
  estimated_calories?: number;
  preparation_time_minutes?: number;
  image_url?: string;
  ingredients: CreateRecipeIngredient[];
  // Additional optional fields
  dietary_tags?: string[];
  cuisine_type?: string;
  difficulty_level?: string;
  is_healthy?: boolean;
  is_comfort_food?: boolean;
  serving_size?: number;
}

class RecipeAPI {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const session = await getSession();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (session && (session as any).accessToken) {
      (headers as any).Authorization = `Bearer ${(session as any).accessToken}`;
    }
    
    return headers;
  }

  async getRecipes(filters?: RecipeFilter): Promise<RecipeListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.user_created_only !== undefined) {
      params.append('user_created_only', filters.user_created_only.toString());
    }
    
    if (filters?.imported_only !== undefined) {
      params.append('imported_only', filters.imported_only.toString());
    }
    
    if (filters?.search !== undefined) {
      params.append('search', filters.search);
    }
    
    if (filters?.max_calories !== undefined) {
      params.append('max_calories', filters.max_calories.toString());
    }
    
    if (filters?.max_prep_time !== undefined) {
      params.append('max_prep_time', filters.max_prep_time.toString());
    }
    
    if (filters?.ingredients && filters.ingredients.length > 0) {
      filters.ingredients.forEach(ingredient => {
        params.append('ingredients', ingredient);
      });
    }
    
    if (filters?.skip !== undefined) {
      params.append('skip', filters.skip.toString());
    }
    
    if (filters?.limit !== undefined) {
      params.append('limit', filters.limit.toString());
    }

    const url = `${API_BASE_URL}/api/v1/recipes?${params.toString()}`;
    
    console.log('Making request to:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to fetch recipes: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    return data;
  }

  async getRecipeById(id: number): Promise<Recipe> {
    const response = await fetch(`${API_BASE_URL}/api/v1/recipes/${id}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recipe: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  async createRecipe(recipeData: CreateRecipeRequest): Promise<Recipe> {
    const response = await fetch(`${API_BASE_URL}/api/v1/recipes/`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(recipeData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to create recipe: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    return data;
  }

  async deleteRecipe(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/recipes/${id}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to delete recipe: ${response.status} ${response.statusText}. ${errorText}`);
    }
  }
}

export const recipeAPI = new RecipeAPI();

// Export convenience functions
export const getRecipes = (filters?: RecipeFilter) => recipeAPI.getRecipes(filters);
export const getRecipeById = (id: number) => recipeAPI.getRecipeById(id);
export const createRecipe = (recipeData: CreateRecipeRequest) => recipeAPI.createRecipe(recipeData);
export const deleteRecipe = (id: number) => recipeAPI.deleteRecipe(id);
