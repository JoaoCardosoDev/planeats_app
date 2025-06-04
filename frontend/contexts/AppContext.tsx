'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PantryItem, Recipe, User } from '@/types/api';

interface AppState {
  user: User | null;
  pantryItems: PantryItem[];
  recipes: Recipe[];
  suggestedRecipes: Recipe[];
  loading: {
    pantry: boolean;
    recipes: boolean;
    suggestions: boolean;
  };
  error: {
    pantry: string | null;
    recipes: string | null;
    suggestions: string | null;
  };
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PANTRY_ITEMS'; payload: PantryItem[] }
  | { type: 'ADD_PANTRY_ITEM'; payload: PantryItem }
  | { type: 'UPDATE_PANTRY_ITEM'; payload: { id: number; item: PantryItem } }
  | { type: 'REMOVE_PANTRY_ITEM'; payload: number }
  | { type: 'SET_RECIPES'; payload: Recipe[] }
  | { type: 'ADD_RECIPE'; payload: Recipe }
  | { type: 'UPDATE_RECIPE'; payload: { id: number; recipe: Recipe } }
  | { type: 'REMOVE_RECIPE'; payload: number }
  | { type: 'SET_SUGGESTED_RECIPES'; payload: Recipe[] }
  | { type: 'SET_LOADING'; payload: { key: keyof AppState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof AppState['error']; value: string | null } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'RESET_STATE' };

const initialState: AppState = {
  user: null,
  pantryItems: [],
  recipes: [],
  suggestedRecipes: [],
  loading: {
    pantry: false,
    recipes: false,
    suggestions: false,
  },
  error: {
    pantry: null,
    recipes: null,
    suggestions: null,
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'SET_PANTRY_ITEMS':
      return { ...state, pantryItems: action.payload };

    case 'ADD_PANTRY_ITEM':
      return {
        ...state,
        pantryItems: [...state.pantryItems, action.payload],
      };

    case 'UPDATE_PANTRY_ITEM':
      return {
        ...state,
        pantryItems: state.pantryItems.map(item =>
          item.id === action.payload.id ? action.payload.item : item
        ),
      };

    case 'REMOVE_PANTRY_ITEM':
      return {
        ...state,
        pantryItems: state.pantryItems.filter(item => item.id !== action.payload),
      };

    case 'SET_RECIPES':
      return { ...state, recipes: action.payload };

    case 'ADD_RECIPE':
      return {
        ...state,
        recipes: [...state.recipes, action.payload],
      };

    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.map(recipe =>
          recipe.id === action.payload.id ? action.payload.recipe : recipe
        ),
      };

    case 'REMOVE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.filter(recipe => recipe.id !== action.payload),
      };

    case 'SET_SUGGESTED_RECIPES':
      return { ...state, suggestedRecipes: action.payload };

    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: { ...state.error, [action.payload.key]: action.payload.value },
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: { pantry: null, recipes: null, suggestions: null },
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  addPantryItem: (item: PantryItem) => void;
  updatePantryItem: (id: number, item: PantryItem) => void;
  removePantryItem: (id: number) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: number, recipe: Recipe) => void;
  removeRecipe: (id: number) => void;
  setLoading: (key: keyof AppState['loading'], value: boolean) => void;
  setError: (key: keyof AppState['error'], value: string | null) => void;
  clearErrors: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { data: session } = useSession();

  // Reset state when user logs out
  useEffect(() => {
    if (!session) {
      dispatch({ type: 'RESET_STATE' });
    }
  }, [session]);

  // Helper functions
  const addPantryItem = (item: PantryItem) => {
    dispatch({ type: 'ADD_PANTRY_ITEM', payload: item });
  };

  const updatePantryItem = (id: number, item: PantryItem) => {
    dispatch({ type: 'UPDATE_PANTRY_ITEM', payload: { id, item } });
  };

  const removePantryItem = (id: number) => {
    dispatch({ type: 'REMOVE_PANTRY_ITEM', payload: id });
  };

  const addRecipe = (recipe: Recipe) => {
    dispatch({ type: 'ADD_RECIPE', payload: recipe });
  };

  const updateRecipe = (id: number, recipe: Recipe) => {
    dispatch({ type: 'UPDATE_RECIPE', payload: { id, recipe } });
  };

  const removeRecipe = (id: number) => {
    dispatch({ type: 'REMOVE_RECIPE', payload: id });
  };

  const setLoading = (key: keyof AppState['loading'], value: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { key, value } });
  };

  const setError = (key: keyof AppState['error'], value: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: { key, value } });
  };

  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  const value: AppContextType = {
    state,
    dispatch,
    addPantryItem,
    updatePantryItem,
    removePantryItem,
    addRecipe,
    updateRecipe,
    removeRecipe,
    setLoading,
    setError,
    clearErrors,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export default AppContext;