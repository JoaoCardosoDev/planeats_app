import { getSession } from 'next-auth/react'

// Use localhost for browser requests (Docker internal URLs don't work from browser)
const API_BASE_URL = typeof window !== 'undefined' 
  ? 'http://localhost:8000'  // Browser: use localhost
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000' // Server: use env var

// TypeScript interfaces for MealDB API responses
export interface MealDBIngredient {
  name: string
  measure: string
}

export interface MealDBMeal {
  id: string
  name: string
  category?: string
  area?: string
  instructions: string
  image_url?: string
  ingredients: MealDBIngredient[]
  youtube_url?: string
  source_url?: string
  tags?: string
}

export interface MealDBCategory {
  id: string
  name: string
  description: string
  image_url: string
}

export interface MealDBArea {
  name: string
}

export interface MealDBIngredientInfo {
  name: string
  description?: string
  type?: string
}

export interface MealDBSearchResponse {
  meals: MealDBMeal[]
  total: number
}

export interface MealDBCategoriesResponse {
  categories: MealDBCategory[]
  total: number
}

export interface MealDBAreasResponse {
  areas: MealDBArea[]
  total: number
}

export interface MealDBIngredientsResponse {
  ingredients: MealDBIngredientInfo[]
  total: number
}

export interface MealDBImportResult {
  success: boolean
  recipe_id?: number
  recipe_name?: string
  mealdb_id?: string
  estimated_calories?: number
  estimated_prep_time?: number
  ingredients_count?: number
  error?: string
}

// API Client for MealDB endpoints
export class MealDBApi {
  private baseUrl: string
  private headers: HeadersInit

  constructor(token?: string) {
    this.baseUrl = `${API_BASE_URL}/api/v1/mealdb`
    this.headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // Search and Browse Methods
  async searchMealsByName(name: string): Promise<MealDBSearchResponse> {
    const response = await fetch(`${this.baseUrl}/search?name=${encodeURIComponent(name)}`)
    
    if (!response.ok) {
      throw new Error(`Failed to search meals by name: ${response.statusText}`)
    }
    
    return response.json()
  }

  async searchMealsByLetter(letter: string): Promise<MealDBSearchResponse> {
    if (letter.length !== 1 || !letter.match(/[a-zA-Z]/)) {
      throw new Error('Letter must be a single alphabetic character')
    }
    
    const response = await fetch(`${this.baseUrl}/search?letter=${letter.toLowerCase()}`)
    
    if (!response.ok) {
      throw new Error(`Failed to search meals by letter: ${response.statusText}`)
    }
    
    return response.json()
  }

  async filterMealsByIngredient(ingredient: string): Promise<MealDBSearchResponse> {
    const response = await fetch(`${this.baseUrl}/search?ingredient=${encodeURIComponent(ingredient)}`)
    
    if (!response.ok) {
      throw new Error(`Failed to filter meals by ingredient: ${response.statusText}`)
    }
    
    return response.json()
  }

  async filterMealsByCategory(category: string): Promise<MealDBSearchResponse> {
    const response = await fetch(`${this.baseUrl}/search?category=${encodeURIComponent(category)}`)
    
    if (!response.ok) {
      throw new Error(`Failed to filter meals by category: ${response.statusText}`)
    }
    
    return response.json()
  }

  async filterMealsByArea(area: string): Promise<MealDBSearchResponse> {
    const response = await fetch(`${this.baseUrl}/search?area=${encodeURIComponent(area)}`)
    
    if (!response.ok) {
      throw new Error(`Failed to filter meals by area: ${response.statusText}`)
    }
    
    return response.json()
  }

  async getMealById(mealId: string): Promise<MealDBMeal> {
    const response = await fetch(`${this.baseUrl}/meal/${mealId}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Meal with ID ${mealId} not found`)
      }
      throw new Error(`Failed to get meal: ${response.statusText}`)
    }
    
    return response.json()
  }

  async getRandomMeal(): Promise<MealDBMeal> {
    const response = await fetch(`${this.baseUrl}/random`)
    
    if (!response.ok) {
      throw new Error(`Failed to get random meal: ${response.statusText}`)
    }
    
    return response.json()
  }

  // Categories, Areas, and Ingredients
  async getCategories(): Promise<MealDBCategoriesResponse> {
    const response = await fetch(`${this.baseUrl}/categories`)
    
    if (!response.ok) {
      throw new Error(`Failed to get categories: ${response.statusText}`)
    }
    
    return response.json()
  }

  async getAreas(): Promise<MealDBAreasResponse> {
    const response = await fetch(`${this.baseUrl}/areas`)
    
    if (!response.ok) {
      throw new Error(`Failed to get areas: ${response.statusText}`)
    }
    
    return response.json()
  }

  async getIngredients(): Promise<MealDBIngredientsResponse> {
    const response = await fetch(`${this.baseUrl}/ingredients`)
    
    if (!response.ok) {
      throw new Error(`Failed to get ingredients: ${response.statusText}`)
    }
    
    return response.json()
  }

  // Import Methods (require authentication)
  async importMeal(mealId: string): Promise<{ message: string; recipe: MealDBImportResult }> {
    const response = await fetch(`${this.baseUrl}/import/${mealId}`, {
      method: 'POST',
      headers: this.headers,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Failed to import meal: ${response.statusText}`)
    }
    
    return response.json()
  }

  async importRandomMeal(): Promise<{ message: string; recipe: MealDBImportResult }> {
    const response = await fetch(`${this.baseUrl}/import-random`, {
      method: 'POST',
      headers: this.headers,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Failed to import random meal: ${response.statusText}`)
    }
    
    return response.json()
  }

  async getSuggestionsByPantry(limit: number = 10): Promise<MealDBSearchResponse> {
    const response = await fetch(`${this.baseUrl}/suggestions-by-pantry?limit=${limit}`, {
      headers: this.headers,
    })
    
    if (!response.ok) {
      throw new Error(`Failed to get pantry suggestions: ${response.statusText}`)
    }
    
    return response.json()
  }

  // Utility Methods
  async testConnection(): Promise<{ status: string; message: string; test_meal?: any }> {
    const response = await fetch(`${this.baseUrl}/test-connection`)
    
    if (!response.ok) {
      throw new Error(`Failed to test connection: ${response.statusText}`)
    }
    
    return response.json()
  }

  getIngredientImageUrl(ingredientName: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    return `${this.baseUrl}/ingredient-image/${encodeURIComponent(ingredientName)}?size=${size}`
  }

  getMealThumbnailUrl(originalUrl: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    return `${this.baseUrl}/meal-thumbnail?image_url=${encodeURIComponent(originalUrl)}&size=${size}`
  }
}

// Convenience functions for common operations
export const mealDbApi = {
  // Create API instance without authentication for public endpoints
  public: () => new MealDBApi(),
  
  // Create API instance with authentication for user-specific operations
  authenticated: (token: string) => new MealDBApi(token),
}

// Hook-style functions for easier use in React components
export const useMealDBSearch = () => {
  const api = mealDbApi.public()
  
  return {
    searchByName: (name: string) => api.searchMealsByName(name),
    searchByLetter: (letter: string) => api.searchMealsByLetter(letter),
    filterByIngredient: (ingredient: string) => api.filterMealsByIngredient(ingredient),
    filterByCategory: (category: string) => api.filterMealsByCategory(category),
    filterByArea: (area: string) => api.filterMealsByArea(area),
    getMeal: (id: string) => api.getMealById(id),
    getRandomMeal: () => api.getRandomMeal(),
    getCategories: () => api.getCategories(),
    getAreas: () => api.getAreas(),
    getIngredients: () => api.getIngredients(),
  }
}

export const useMealDBImport = (token?: string) => {
  // For now, we'll handle authentication in the component
  // This function will make authenticated requests using the session
  return {
    importMeal: async (mealId: string) => {
      const session = await getSession()
      if (!session) {
        throw new Error('Authentication required')
      }
      
      const response = await fetch(`${API_BASE_URL}/api/v1/mealdb/import/${mealId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session as any).accessToken || 'dummy_token'}`,
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to import meal: ${response.statusText}`)
      }
      
      return response.json()
    },
    
    importRandomMeal: async () => {
      const session = await getSession()
      if (!session) {
        throw new Error('Authentication required')
      }
      
      const response = await fetch(`${API_BASE_URL}/api/v1/mealdb/import-random`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session as any).accessToken || 'dummy_token'}`,
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to import random meal: ${response.statusText}`)
      }
      
      return response.json()
    },
    
    getSuggestionsByPantry: async (limit?: number) => {
      const session = await getSession()
      if (!session) {
        throw new Error('Authentication required')
      }
      
      const response = await fetch(`${API_BASE_URL}/api/v1/mealdb/suggestions-by-pantry?limit=${limit || 10}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session as any).accessToken || 'dummy_token'}`,
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to get pantry suggestions: ${response.statusText}`)
      }
      
      return response.json()
    },
  }
}

// Helper functions for data processing
export const formatMealForDisplay = (meal: MealDBMeal) => {
  return {
    id: meal.id,
    title: meal.name,
    description: meal.instructions.substring(0, 150) + '...',
    image: meal.image_url,
    category: meal.category,
    cuisine: meal.area,
    ingredients: meal.ingredients.length,
    hasVideo: !!meal.youtube_url,
    hasSource: !!meal.source_url,
  }
}

export const formatIngredientsList = (ingredients: MealDBIngredient[]) => {
  return ingredients.map(ing => `${ing.measure} ${ing.name}`).join(', ')
}

export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'Beef': '🥩',
    'Chicken': '🐔',
    'Dessert': '🍰',
    'Lamb': '🐑',
    'Miscellaneous': '🍽️',
    'Pasta': '🍝',
    'Pork': '🐷',
    'Seafood': '🐟',
    'Side': '🥗',
    'Starter': '🥄',
    'Vegan': '🌱',
    'Vegetarian': '🥬',
    'Breakfast': '🍳',
    'Goat': '🐐',
    'Turkey': '🦃',
  }
  
  return icons[category] || '🍽️'
}

export const getAreaFlag = (area: string): string => {
  const flags: Record<string, string> = {
    'Italian': '🇮🇹',
    'Chinese': '🇨🇳',
    'Mexican': '🇲🇽',
    'Indian': '🇮🇳',
    'Japanese': '🇯🇵',
    'French': '🇫🇷',
    'British': '🇬🇧',
    'American': '🇺🇸',
    'Thai': '🇹🇭',
    'Spanish': '🇪🇸',
    'Greek': '🇬🇷',
    'Turkish': '🇹🇷',
    'Vietnamese': '🇻🇳',
    'Moroccan': '🇲🇦',
    'Russian': '🇷🇺',
    'Polish': '🇵🇱',
    'Portuguese': '🇵🇹',
    'Jamaican': '🇯🇲',
    'Malaysian': '🇲🇾',
    'Tunisian': '🇹🇳',
    'Croatian': '🇭🇷',
    'Dutch': '🇳🇱',
    'Egyptian': '🇪🇬',
    'Canadian': '🇨🇦',
    'Irish': '🇮🇪',
    'Syrian': '🇸🇾',
    'Kenyan': '🇰🇪',
    'Ukrainian': '🇺🇦',
    'Filipino': '🇵🇭',
  }
  
  return flags[area] || '🌍'
}
