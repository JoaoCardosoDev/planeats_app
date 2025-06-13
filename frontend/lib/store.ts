import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Ingredient {
  id: string
  name: string
  quantity: string
  category: 'vegetais' | 'frutas' | 'proteinas' | 'graos' | 'laticinios' | 'temperos' | 'outros'
  expiryDate?: string
}

export interface Recipe {
  id: string
  name: string
  description: string
  image?: string
  prepTime: number
  cookTime: number
  servings: number
  difficulty: 'Fácil' | 'Médio' | 'Difícil'
  category: string
  ingredients: Array<{
    name: string
    quantity: string
    unit: string
  }>
  instructions: string[]
  tags: string[]
  nutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  createdAt: string
  isFavorite: boolean
}

export interface ShoppingItem {
  id: string
  name: string
  quantity: string
  category: string
  completed: boolean
  recipeId?: string
}

export interface MealPlan {
  id: string
  date: string
  meals: {
    breakfast?: Recipe
    lunch?: Recipe
    dinner?: Recipe
    snack?: Recipe
  }
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
  preferences: {
    language: string
    theme: 'light' | 'dark' | 'system'
    notifications: {
      email: boolean
      push: boolean
      marketing: boolean
    }
    privacy: {
      publicProfile: boolean
      shareRecipes: boolean
      usageData: boolean
    }
    display: {
      fontSize: 'pequeno' | 'medio' | 'grande'
      metricSystem: boolean
    }
  }
}

interface AppState {
  // User
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  updateUserPreferences: (preferences: Partial<User['preferences']>) => void
  
  // Ingredients
  ingredients: Ingredient[]
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void
  deleteIngredient: (id: string) => void
  getIngredientsByCategory: (category: string) => Ingredient[]
  
  // Recipes
  recipes: Recipe[]
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void
  updateRecipe: (id: string, updates: Partial<Recipe>) => void
  deleteRecipe: (id: string) => void
  toggleFavoriteRecipe: (id: string) => void
  getRecipeById: (id: string) => Recipe | undefined
  getRecipesByCategory: (category: string) => Recipe[]
  getFavoriteRecipes: () => Recipe[]
  
  // Shopping List
  shoppingItems: ShoppingItem[]
  addShoppingItem: (item: Omit<ShoppingItem, 'id'>) => void
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void
  deleteShoppingItem: (id: string) => void
  toggleShoppingItemCompleted: (id: string) => void
  clearCompletedShoppingItems: () => void
  
  // Meal Planning
  mealPlans: MealPlan[]
  addMealPlan: (mealPlan: Omit<MealPlan, 'id'>) => void
  updateMealPlan: (id: string, updates: Partial<MealPlan>) => void
  deleteMealPlan: (id: string) => void
  getMealPlanByDate: (date: string) => MealPlan | undefined
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      ingredients: [],
      recipes: [
        {
          id: '1',
          name: 'Salada Caesar',
          description: 'Uma deliciosa salada caesar com frango grelhado',
          image: '/placeholder.jpg',
          prepTime: 15,
          cookTime: 10,
          servings: 2,
          difficulty: 'Fácil',
          category: 'Saladas',
          ingredients: [
            { name: 'Alface romana', quantity: '1', unit: 'unidade' },
            { name: 'Frango', quantity: '200', unit: 'g' },
            { name: 'Parmesão', quantity: '50', unit: 'g' },
            { name: 'Croutons', quantity: '1/2', unit: 'xícara' }
          ],
          instructions: [
            'Lave e corte a alface',
            'Grelhe o frango e corte em tiras',
            'Monte a salada com todos os ingredientes',
            'Regue com molho caesar'
          ],
          tags: ['saudável', 'proteína', 'rápido'],
          nutrition: {
            calories: 350,
            protein: 25,
            carbs: 15,
            fat: 20
          },
          createdAt: new Date().toISOString(),
          isFavorite: false
        },
        {
          id: '2',
          name: 'Macarrão à Carbonara',
          description: 'Clássico macarrão italiano com molho cremoso',
          image: '/placeholder.jpg',
          prepTime: 10,
          cookTime: 15,
          servings: 4,
          difficulty: 'Médio',
          category: 'Massas',
          ingredients: [
            { name: 'Macarrão', quantity: '400', unit: 'g' },
            { name: 'Bacon', quantity: '150', unit: 'g' },
            { name: 'Ovos', quantity: '3', unit: 'unidades' },
            { name: 'Parmesão', quantity: '100', unit: 'g' }
          ],
          instructions: [
            'Cozinhe o macarrão al dente',
            'Frite o bacon até ficar crocante',
            'Misture ovos e queijo em uma tigela',
            'Combine tudo rapidamente para criar o molho cremoso'
          ],
          tags: ['italiano', 'cremoso', 'clássico'],
          nutrition: {
            calories: 520,
            protein: 22,
            carbs: 45,
            fat: 28
          },
          createdAt: new Date().toISOString(),
          isFavorite: true
        }
      ],
      shoppingItems: [],
      mealPlans: [],

      // Ingredient actions
      addIngredient: (ingredient) =>
        set((state) => ({
          ingredients: [
            ...state.ingredients,
            { ...ingredient, id: crypto.randomUUID() }
          ]
        })),

      updateIngredient: (id, updates) =>
        set((state) => ({
          ingredients: state.ingredients.map((ingredient) =>
            ingredient.id === id ? { ...ingredient, ...updates } : ingredient
          )
        })),

      deleteIngredient: (id) =>
        set((state) => ({
          ingredients: state.ingredients.filter((ingredient) => ingredient.id !== id)
        })),

      getIngredientsByCategory: (category) => {
        const state = get()
        if (category === 'todos') return state.ingredients
        return state.ingredients.filter((ingredient) => ingredient.category === category)
      },

      // Recipe actions
      addRecipe: (recipe) =>
        set((state) => ({
          recipes: [
            ...state.recipes,
            {
              ...recipe,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString()
            }
          ]
        })),

      updateRecipe: (id, updates) =>
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === id ? { ...recipe, ...updates } : recipe
          )
        })),

      deleteRecipe: (id) =>
        set((state) => ({
          recipes: state.recipes.filter((recipe) => recipe.id !== id)
        })),

      toggleFavoriteRecipe: (id) =>
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
          )
        })),

      getRecipeById: (id) => {
        const state = get()
        return state.recipes.find((recipe) => recipe.id === id)
      },

      getRecipesByCategory: (category) => {
        const state = get()
        return state.recipes.filter((recipe) => recipe.category === category)
      },

      getFavoriteRecipes: () => {
        const state = get()
        return state.recipes.filter((recipe) => recipe.isFavorite)
      },

      // Shopping list actions
      addShoppingItem: (item) =>
        set((state) => ({
          shoppingItems: [
            ...state.shoppingItems,
            { ...item, id: crypto.randomUUID() }
          ]
        })),

      updateShoppingItem: (id, updates) =>
        set((state) => ({
          shoppingItems: state.shoppingItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          )
        })),

      deleteShoppingItem: (id) =>
        set((state) => ({
          shoppingItems: state.shoppingItems.filter((item) => item.id !== id)
        })),

      toggleShoppingItemCompleted: (id) =>
        set((state) => ({
          shoppingItems: state.shoppingItems.map((item) =>
            item.id === id ? { ...item, completed: !item.completed } : item
          )
        })),

      clearCompletedShoppingItems: () =>
        set((state) => ({
          shoppingItems: state.shoppingItems.filter((item) => !item.completed)
        })),

      // Meal planning actions
      addMealPlan: (mealPlan) =>
        set((state) => ({
          mealPlans: [
            ...state.mealPlans,
            { ...mealPlan, id: crypto.randomUUID() }
          ]
        })),

      updateMealPlan: (id, updates) =>
        set((state) => ({
          mealPlans: state.mealPlans.map((plan) =>
            plan.id === id ? { ...plan, ...updates } : plan
          )
        })),

      deleteMealPlan: (id) =>
        set((state) => ({
          mealPlans: state.mealPlans.filter((plan) => plan.id !== id)
        })),      getMealPlanByDate: (date) => {
        const state = get()
        return state.mealPlans.find((plan) => plan.date === date)
      },

      // User actions
      login: async (email, password) => {
        // Simulação de login - em produção, isso seria uma chamada para o backend
        try {
          // Simular delay de rede
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Criar usuário simulado
          const user: User = {
            id: crypto.randomUUID(),
            name: 'Usuário Teste',
            email: email,
            avatar: '/placeholder-user.jpg',
            createdAt: new Date().toISOString(),
            preferences: {
              language: 'pt-BR',
              theme: 'system',
              notifications: {
                email: true,
                push: true,
                marketing: false
              },
              privacy: {
                publicProfile: true,
                shareRecipes: true,
                usageData: true
              },
              display: {
                fontSize: 'medio',
                metricSystem: true
              }
            }
          }
          
          set({ user })
          return true
        } catch (error) {
          console.error('Erro no login:', error)
          return false
        }
      },

      register: async (name, email, password) => {
        // Simulação de registro - em produção, isso seria uma chamada para o backend
        try {
          // Simular delay de rede
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Criar novo usuário
          const user: User = {
            id: crypto.randomUUID(),
            name: name,
            email: email,
            avatar: '/placeholder-user.jpg',
            createdAt: new Date().toISOString(),
            preferences: {
              language: 'pt-BR',
              theme: 'system',
              notifications: {
                email: true,
                push: true,
                marketing: false
              },
              privacy: {
                publicProfile: true,
                shareRecipes: true,
                usageData: true
              },
              display: {
                fontSize: 'medio',
                metricSystem: true
              }
            }
          }
          
          set({ user })
          return true
        } catch (error) {
          console.error('Erro no registro:', error)
          return false
        }
      },

      logout: () => {
        set({ user: null })
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        }))
      },

      updateUserPreferences: (preferences) => {
        set((state) => ({
          user: state.user ? {
            ...state.user,
            preferences: { ...state.user.preferences, ...preferences }
          } : null
        }))
      },
    }),    {
      name: 'planeats-storage',
      partialize: (state) => ({
        user: state.user,
        ingredients: state.ingredients,
        recipes: state.recipes,
        shoppingItems: state.shoppingItems,
        mealPlans: state.mealPlans,
      }),
    }
  )
)
