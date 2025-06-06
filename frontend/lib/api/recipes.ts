// API service for recipe-related operations

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
  max_calories?: number;
  max_prep_time?: number;
  ingredients?: string[];
  skip?: number;
  limit?: number;
}

export interface Recipe {
  id: number;
  title: string;
  description?: string;
  instructions: string;
  prep_time_minutes?: number;
  calories?: number;
  image_url?: string;
  created_by_user_id: number;
  created_at: string;
  ingredients: RecipeIngredient[];
}

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  name: string;
  quantity?: number;
  unit?: string;
}

export interface RecipeListResponse {
  recipes: Recipe[];
  total: number;
  skip: number;
  limit: number;
}

class RecipeAPI {
  private async getAuthHeaders(): Promise<HeadersInit> {
    // TODO: Integrate with NextAuth.js to get the JWT token
    // For now, return empty headers - this will be implemented when integrating auth
    return {
      'Content-Type': 'application/json',
    };
  }

  async getRecipes(filters?: RecipeFilter): Promise<RecipeListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.user_created_only !== undefined) {
      params.append('user_created_only', filters.user_created_only.toString());
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
}

export const recipeAPI = new RecipeAPI();
