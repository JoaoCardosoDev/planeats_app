import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await getSession();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    return headers;
  }

  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers: customHeaders = {},
      requireAuth = true,
    } = options;

    try {
      const baseHeaders = requireAuth 
        ? await this.getAuthHeaders()
        : { 'Content-Type': 'application/json' };

      const headers = { ...baseHeaders, ...customHeaders };

      const config: RequestInit = {
        method,
        headers,
      };

      if (body && method !== 'GET') {
        config.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, config);

      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        return {
          error: data?.detail || data || `HTTP ${response.status}`,
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      body: { email, password },
      requireAuth: false,
    });
  }

  async register(username: string, email: string, password: string) {
    return this.request('/api/v1/auth/register', {
      method: 'POST',
      body: { username, email, password },
      requireAuth: false,
    });
  }

  async getCurrentUser() {
    return this.request('/api/v1/auth/me');
  }

  // Pantry endpoints
  async getPantryItems() {
    return this.request('/api/v1/pantry/items');
  }

  async addPantryItem(item: {
    name: string;
    quantity: number;
    unit: string;
    expiry_date?: string;
    category?: string;
  }) {
    return this.request('/api/v1/pantry/items', {
      method: 'POST',
      body: item,
    });
  }

  async updatePantryItem(itemId: number, updates: Partial<{
    name: string;
    quantity: number;
    unit: string;
    expiry_date: string;
    category: string;
  }>) {
    return this.request(`/api/v1/pantry/items/${itemId}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deletePantryItem(itemId: number) {
    return this.request(`/api/v1/pantry/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Recipe endpoints
  async getRecipes(filters?: {
    category?: string;
    difficulty?: string;
    max_prep_time?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const endpoint = queryString ? `/api/v1/recipes?${queryString}` : '/api/v1/recipes';
    return this.request(endpoint);
  }

  async getRecipeById(recipeId: number) {
    return this.request(`/api/v1/recipes/${recipeId}`);
  }

  async createRecipe(recipe: {
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
  }) {
    return this.request('/api/v1/recipes', {
      method: 'POST',
      body: recipe,
    });
  }

  async updateRecipe(recipeId: number, updates: Partial<{
    title: string;
    description: string;
    instructions: string;
    prep_time: number;
    cook_time: number;
    servings: number;
    difficulty: string;
    category: string;
  }>) {
    return this.request(`/api/v1/recipes/${recipeId}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteRecipe(recipeId: number) {
    return this.request(`/api/v1/recipes/${recipeId}`, {
      method: 'DELETE',
    });
  }

  async getMyRecipes() {
    return this.request('/api/v1/recipes/my-recipes');
  }

  async getSuggestedRecipes() {
    return this.request('/api/v1/recipes/suggestions');
  }

  // Gemini AI endpoints
  async generateRecipeSuggestions(pantryItems: string[]) {
    return this.request('/api/v1/gemini/recipe-suggestions', {
      method: 'POST',
      body: { pantry_items: pantryItems },
    });
  }

  async analyzePantryItem(itemName: string) {
    return this.request('/api/v1/gemini/analyze-item', {
      method: 'POST',
      body: { item_name: itemName },
    });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export the class for custom instances if needed
export default ApiClient;