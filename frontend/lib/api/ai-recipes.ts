// API client for AI recipe generation
import { getSession } from 'next-auth/react';

// Use localhost for browser requests (Docker internal URLs don't work from browser)
const API_BASE_URL = typeof window !== 'undefined' 
  ? 'http://localhost:8000'  // Browser: use localhost
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'; // Server: use env var

interface GeneratedRecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

interface GeneratedRecipe {
  recipe_name: string;
  instructions: string;
  estimated_calories?: number;
  preparation_time_minutes?: number;
  ingredients: GeneratedRecipeIngredient[];
}

interface UsedPantryItem {
  pantry_item_id: number;
  item_name: string;
  quantity_used: number;
  unit: string;
}

interface GenerationMetadata {
  model_used: string;
  generation_time: number;
  prompt_tokens?: number;
  completion_tokens?: number;
}

export interface CustomRecipeRequest {
  pantry_item_ids: number[];
  max_calories?: number;
  preparation_time_limit?: number;
  dietary_restrictions?: string;
  cuisine_preference?: string;
  additional_notes?: string;
}

export interface CustomRecipeResponse {
  generated_recipe: GeneratedRecipe;
  used_pantry_items: UsedPantryItem[];
  generation_metadata: GenerationMetadata;
  generation_id?: string;
}

class AIRecipesAPI {
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

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api/v1${endpoint}`;
    
    console.log(`Making AI API request to: ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(await this.getAuthHeaders()),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error Response:', errorText);
      
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      if (response.status === 401 || response.status === 403) {
        throw new Error('Not authenticated');
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async testGeminiConnection(): Promise<{ status: string; message: string; models?: string[] }> {
    console.log('Testing Gemini connection...');
    return this.fetchWithAuth('/ai/test-gemini');
  }

  async generateCustomRecipe(request: CustomRecipeRequest): Promise<CustomRecipeResponse> {
    console.log('Generating custom recipe with request:', request);
    
    if (!request.pantry_item_ids || request.pantry_item_ids.length === 0) {
      throw new Error('Pelo menos um item da despensa deve ser selecionado');
    }

    return this.fetchWithAuth('/ai/custom-recipes', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const aiRecipesAPI = new AIRecipesAPI();
