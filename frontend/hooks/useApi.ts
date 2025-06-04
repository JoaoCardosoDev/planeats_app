import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/lib/api-client';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const { data: session } = useSession();

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      
      if (response.error) {
        setState({
          data: null,
          loading: false,
          error: response.error,
        });
      } else {
        setState({
          data: response.data || null,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, [apiCall, ...dependencies]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [fetchData, session?.accessToken]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch,
  };
}

export function useApiMutation<T, P = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (
    apiCall: (params: P) => Promise<ApiResponse<T>>,
    params: P
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall(params);
      
      if (response.error) {
        setState({
          data: null,
          loading: false,
          error: response.error,
        });
        return { success: false, error: response.error };
      } else {
        setState({
          data: response.data || null,
          loading: false,
          error: null,
        });
        return { success: true, data: response.data };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

// Specific hooks for common operations
export function usePantryItems() {
  return useApi(() => apiClient.getPantryItems());
}

export function useRecipes(filters?: any) {
  return useApi(() => apiClient.getRecipes(filters), [filters]);
}

export function useRecipe(recipeId: number) {
  return useApi(() => apiClient.getRecipeById(recipeId), [recipeId]);
}

export function useMyRecipes() {
  return useApi(() => apiClient.getMyRecipes());
}

export function useSuggestedRecipes() {
  return useApi(() => apiClient.getSuggestedRecipes());
}

export function useCurrentUser() {
  return useApi(() => apiClient.getCurrentUser());
}

// Mutation hooks
export function useAddPantryItem() {
  return useApiMutation<any, {
    name: string;
    quantity: number;
    unit: string;
    expiry_date?: string;
    category?: string;
  }>();
}

export function useUpdatePantryItem() {
  return useApiMutation<any, {
    itemId: number;
    updates: Partial<{
      name: string;
      quantity: number;
      unit: string;
      expiry_date: string;
      category: string;
    }>;
  }>();
}

export function useDeletePantryItem() {
  return useApiMutation<any, number>();
}

export function useCreateRecipe() {
  return useApiMutation<any, {
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
  }>();
}

export function useUpdateRecipe() {
  return useApiMutation<any, {
    recipeId: number;
    updates: Partial<{
      title: string;
      description: string;
      instructions: string;
      prep_time: number;
      cook_time: number;
      servings: number;
      difficulty: string;
      category: string;
    }>;
  }>();
}

export function useDeleteRecipe() {
  return useApiMutation<any, number>();
}

export function useGenerateRecipeSuggestions() {
  return useApiMutation<any, string[]>();
}

export function useAnalyzePantryItem() {
  return useApiMutation<any, string>();
}