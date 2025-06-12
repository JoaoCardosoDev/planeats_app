// API functions for authentication and user management
import { getSession } from "next-auth/react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Helper function to get auth headers
async function getAuthHeaders() {
  const session = await getSession()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if ((session as any)?.accessToken) {
    headers.Authorization = `Bearer ${(session as any).accessToken}`
  }
  
  return headers
}

// User profile interfaces
export interface UserProfile {
  id: number
  email: string
  username: string
  is_active: boolean
  created_at: string
}

export interface UserPreferences {
  id: number
  user_id: number
  dietary_restrictions: string[]
  preferred_cuisines: string[]
  preferred_difficulty: string | null
  daily_calorie_goal: number | null
  max_prep_time_preference: number | null
  max_calories_preference: number | null
  created_at: string
  updated_at: string
}

export interface PreferenceOptions {
  dietary_restrictions: string[]
  cuisine_types: string[]
  difficulty_levels: string[]
}

// Get current user profile
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers,
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        return null // User not authenticated
      }
      throw new Error(`Failed to fetch user profile: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

// Get user preferences
export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/v1/user/preferences`, {
      headers,
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        return null // User not authenticated
      }
      throw new Error(`Failed to fetch user preferences: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return null
  }
}

// Update user preferences
export async function updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences | null> {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/v1/user/preferences`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(preferences),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update user preferences: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating user preferences:', error)
    return null
  }
}

// Get preference options (for form dropdowns)
export async function getPreferenceOptions(): Promise<PreferenceOptions | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/user/preferences/options`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch preference options: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching preference options:', error)
    return null
  }
}
