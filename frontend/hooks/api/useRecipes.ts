'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { Recipe, CreateRecipeRequest, UpdateRecipeRequest, RecipeFilters } from '@/types/api';

interface UseRecipesReturn {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  createRecipe: (recipe: CreateRecipeRequest) => Promise<boolean>;
  updateRecipe: (id: number, updates: UpdateRecipeRequest) => Promise<boolean>;
  deleteRecipe: (id: number) => Promise<boolean>;
  refetch: () => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const useRecipes = (filters?: RecipeFilters): UseRecipesReturn => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getRecipes(filters);
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      setRecipes(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createRecipe = useCallback(async (recipe: CreateRecipeRequest): Promise<boolean> => {
    try {
      setIsCreating(true);
      setError(null);
      const response = await apiClient.createRecipe(recipe);
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      // Add the new recipe to the local state
      if (response.data) {
        setRecipes(prev => [...prev, response.data]);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recipe');
      return false;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updateRecipe = useCallback(async (id: number, updates: UpdateRecipeRequest): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);
      const response = await apiClient.updateRecipe(id, updates);
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      // Update the recipe in local state
      if (response.data) {
        setRecipes(prev => prev.map(recipe => 
          recipe.id === id ? response.data : recipe
        ));
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update recipe');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const deleteRecipe = useCallback(async (id: number): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);
      const response = await apiClient.deleteRecipe(id);
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      // Remove the recipe from local state
      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchRecipes();
  }, [fetchRecipes]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return {
    recipes,
    loading,
    error,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    refetch,
    isCreating,
    isUpdating,
    isDeleting,
  };
};

interface UseMyRecipesReturn {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createRecipe: (recipe: CreateRecipeRequest) => Promise<boolean>;
  isCreating: boolean;
}

export const useMyRecipes = (): UseMyRecipesReturn => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchMyRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getMyRecipes();
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      setRecipes(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch my recipes');
    } finally {
      setLoading(false);
    }
  }, []);

  const createRecipe = useCallback(async (recipe: CreateRecipeRequest): Promise<boolean> => {
    try {
      setIsCreating(true);
      setError(null);
      const response = await apiClient.createRecipe(recipe);
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      // Add the new recipe to the local state
      if (response.data) {
        setRecipes(prev => [...prev, response.data]);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recipe');
      return false;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchMyRecipes();
  }, [fetchMyRecipes]);

  useEffect(() => {
    fetchMyRecipes();
  }, [fetchMyRecipes]);

  return {
    recipes,
    loading,
    error,
    refetch,
    createRecipe,
    isCreating,
  };
};

interface UseRecipeReturn {
  recipe: Recipe | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRecipe = (recipeId: number): UseRecipeReturn => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipe = useCallback(async () => {
    if (!recipeId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getRecipeById(recipeId);
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      setRecipe(response.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipe');
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  const refetch = useCallback(async () => {
    await fetchRecipe();
  }, [fetchRecipe]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  return {
    recipe,
    loading,
    error,
    refetch,
  };
};

export default useRecipes;