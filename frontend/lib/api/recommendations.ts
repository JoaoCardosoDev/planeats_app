// API service for recommendations-related operations
import { getSession } from 'next-auth/react';

// Use localhost for browser requests (Docker internal URLs don't work from browser)
const API_BASE_URL = typeof window !== 'undefined' 
  ? 'http://localhost:8000'  // Browser: use localhost
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'; // Server: use env var

export interface MatchingIngredient {
  pantry_item_id: number
  pantry_item_name: string
  recipe_ingredient_name: string
  pantry_quantity: number
  pantry_unit: string
  required_quantity: number
  required_unit: string
}

export interface MissingIngredient {
  ingredient_name: string
  required_quantity: number
  required_unit: string
}

export interface ExpiringIngredient {
  pantry_item_id: number
  pantry_item_name: string
  expiration_date: string
  days_until_expiration: number
}

export interface RecommendedRecipe {
  recipe_id: number
  recipe_name: string
  estimated_calories: number | null
  preparation_time_minutes: number | null
  image_url: string | null
  instructions: string
  matching_ingredients: MatchingIngredient[]
  missing_ingredients: MissingIngredient[]
  match_score: number
  expiring_ingredients_used: ExpiringIngredient[]
}

export interface RecommendationFilters {
  max_preparation_time?: number
  max_calories?: number
  max_missing_ingredients?: number
}

export interface RecommendationSort {
  sort_by: 'match_score' | 'preparation_time' | 'calories' | 'expiring_ingredients'
  sort_order: 'asc' | 'desc'
}

export interface RecommendationMetadata {
  total_recipes_analyzed: number
  total_before_filters: number
  total_after_filters: number
  applied_filters: RecommendationFilters
  applied_sort: RecommendationSort
}

export interface RecipeRecommendationsResponse {
  recommendations: RecommendedRecipe[]
  total_pantry_items: number
  metadata: RecommendationMetadata
  message?: string
}

export interface GetRecommendationsParams {
  max_preparation_time?: number
  max_calories?: number
  max_missing_ingredients?: number
  sort_by?: 'match_score' | 'preparation_time' | 'calories' | 'expiring_ingredients'
  sort_order?: 'asc' | 'desc'
  use_preferences?: boolean
}

class RecommendationsAPI {
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

  async getRecommendations(params: GetRecommendationsParams = {}): Promise<RecipeRecommendationsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.max_preparation_time !== undefined) {
      searchParams.append('max_preparation_time', params.max_preparation_time.toString());
    }
    if (params.max_calories !== undefined) {
      searchParams.append('max_calories', params.max_calories.toString());
    }
    if (params.max_missing_ingredients !== undefined) {
      searchParams.append('max_missing_ingredients', params.max_missing_ingredients.toString());
    }
    if (params.sort_by) {
      searchParams.append('sort_by', params.sort_by);
    }
    if (params.sort_order) {
      searchParams.append('sort_order', params.sort_order);
    }
    if (params.use_preferences !== undefined) {
      searchParams.append('use_preferences', params.use_preferences.toString());
    }

    const url = `${API_BASE_URL}/api/v1/recommendations${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    console.log('Making recommendations request to:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Recommendations API Error Response:', errorText);
      throw new Error(`Failed to fetch recommendations: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    console.log('Recommendations API Response:', data);
    return data;
  }
}

export const recommendationsAPI = new RecommendationsAPI();
