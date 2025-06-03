"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Ingredient {
  id: string
  name: string
  quantity: string
  category: string
  expiryDate?: string
  addedDate: string
}

export interface Comment {
  id: string
  author: string
  avatar: string
  content: string
  rating: number
  createdAt: string
  replies?: Comment[]
}

export interface Recipe {
  id: string
  title: string
  description: string
  image: string
  time: string
  difficulty: string
  rating: number
  reviews: number
  ingredients: string[]
  instructions: string[]
  category: string
  isFavorite: boolean
  isOwn: boolean
  author: string
  createdAt: string
  comments: Comment[]
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  isLoggedIn: boolean
}

export interface UserComment {
  id: string
  content: string
  rating: number
  createdAt: string
}

interface AppState {
  user: User | null
  ingredients: Ingredient[]
  recipes: Recipe[]
  favoriteRecipes: string[]
  userComments: UserComment[] | null

  // User actions
  login: (email: string, password: string) => boolean
  register: (name: string, email: string, password: string) => boolean
  logout: () => void
  updateUser: (userData: Partial<User>) => void

  // Ingredient actions
  addIngredient: (ingredient: Omit<Ingredient, "id" | "addedDate">) => void
  updateIngredient: (id: string, ingredient: Partial<Ingredient>) => void
  deleteIngredient: (id: string) => void
  getIngredientsByCategory: (category: string) => Ingredient[]

  // Recipe actions
  addRecipe: (recipe: Omit<Recipe, "id" | "createdAt" | "comments" | "rating" | "reviews">) => void
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void
  deleteRecipe: (id: string) => void
  toggleFavorite: (recipeId: string) => void
  addComment: (recipeId: string, comment: Omit<Comment, "id" | "createdAt">) => void
  updateRecipeRating: (recipeId: string, rating: number) => void
  getRecipesByCategory: (category: string) => Recipe[]
  searchRecipes: (query: string) => Recipe[]

  addUserComment: (commentId: string, content: string, rating: number) => void
  updateUserComment: (commentId: string, content: string, rating: number) => void
  deleteUserComment: (commentId: string) => void
}

const initialRecipes: Recipe[] = [
  {
    id: "1",
    title: "Arroz de Frango",
    description: "Um prato completo de arroz com frango e legumes.",
    image: "/images/recipes/arroz-frango.jpg",
    time: "40 min",
    difficulty: "Médio",
    rating: 4.8,
    reviews: 124,
    ingredients: ["2 xícaras de arroz", "500g de frango", "1 cebola", "2 tomates", "Temperos a gosto"],
    instructions: [
      "Tempere o frango e deixe marinar por 30 minutos",
      "Refogue a cebola e o alho em uma panela",
      "Adicione o frango e deixe dourar",
      "Acrescente o arroz e misture bem",
      "Adicione água quente e deixe cozinhar por 20 minutos",
    ],
    category: "Almoço",
    isFavorite: false,
    isOwn: true,
    author: "Maria Silva",
    createdAt: "2024-01-15",
    comments: [],
  },
  {
    id: "2",
    title: "Salada de Tomate com Queijo",
    description: "Uma salada fresca e rápida de preparar.",
    image: "/images/recipes/salada-tomate.jpg",
    time: "10 min",
    difficulty: "Fácil",
    rating: 4.5,
    reviews: 87,
    ingredients: ["3 tomates grandes", "200g de queijo mussarela", "Manjericão fresco", "Azeite", "Sal e pimenta"],
    instructions: [
      "Corte os tomates em fatias grossas",
      "Corte o queijo em fatias",
      "Intercale tomate e queijo no prato",
      "Tempere com sal, pimenta e azeite",
      "Finalize com manjericão fresco",
    ],
    category: "Salada",
    isFavorite: false,
    isOwn: false,
    author: "João Santos",
    createdAt: "2024-01-10",
    comments: [],
  },
]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      ingredients: [],
      recipes: initialRecipes,
      favoriteRecipes: [],
      userComments: null,

      // User actions
      login: (email: string, password: string) => {
        const user: User = {
          id: "1",
          name: "Maria Silva",
          email: email,
          avatar: "/images/users/avatar1.jpg",
          isLoggedIn: true,
        }
        set({ user })
        return true
      },

      register: (name: string, email: string, password: string) => {
        const user: User = {
          id: Date.now().toString(),
          name: name,
          email: email,
          avatar: "/images/users/default-avatar.jpg",
          isLoggedIn: true,
        }
        set({ user })
        return true
      },

      logout: () => {
        set({ user: null })
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...userData } })
        }
      },

      // Ingredient actions
      addIngredient: (ingredient: Omit<Ingredient, "id" | "addedDate">) => {
        const newIngredient: Ingredient = {
          ...ingredient,
          id: Date.now().toString(),
          addedDate: new Date().toISOString(),
        }
        set((state) => ({
          ingredients: [...state.ingredients, newIngredient],
        }))
      },

      updateIngredient: (id: string, ingredient: Partial<Ingredient>) => {
        set((state) => ({
          ingredients: state.ingredients.map((item) => (item.id === id ? { ...item, ...ingredient } : item)),
        }))
      },

      deleteIngredient: (id: string) => {
        set((state) => ({
          ingredients: state.ingredients.filter((item) => item.id !== id),
        }))
      },

      getIngredientsByCategory: (category: string) => {
        const { ingredients } = get()
        if (category === "todos" || category === "todas") return ingredients
        return ingredients.filter((item) => item.category === category)
      },

      // Recipe actions
      addRecipe: (recipe: Omit<Recipe, "id" | "createdAt" | "comments" | "rating" | "reviews">) => {
        const newRecipe: Recipe = {
          ...recipe,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          comments: [],
          rating: 0,
          reviews: 0,
        }
        set((state) => ({
          recipes: [...state.recipes, newRecipe],
        }))
      },

      updateRecipe: (id: string, recipe: Partial<Recipe>) => {
        set((state) => ({
          recipes: state.recipes.map((item) => (item.id === id ? { ...item, ...recipe } : item)),
        }))
      },

      deleteRecipe: (id: string) => {
        set((state) => ({
          recipes: state.recipes.filter((item) => item.id !== id),
          favoriteRecipes: state.favoriteRecipes.filter((fav) => fav !== id),
        }))
      },

      toggleFavorite: (recipeId: string) => {
        set((state) => {
          const isFavorite = state.favoriteRecipes.includes(recipeId)
          const newFavorites = isFavorite
            ? state.favoriteRecipes.filter((id) => id !== recipeId)
            : [...state.favoriteRecipes, recipeId]

          const updatedRecipes = state.recipes.map((recipe) =>
            recipe.id === recipeId ? { ...recipe, isFavorite: !isFavorite } : recipe,
          )

          return {
            favoriteRecipes: newFavorites,
            recipes: updatedRecipes,
          }
        })
      },

      addComment: (recipeId: string, comment: Omit<Comment, "id" | "createdAt">) => {
        const newComment: Comment = {
          ...comment,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === recipeId ? { ...recipe, comments: [...recipe.comments, newComment] } : recipe,
          ),
        }))
      },

      updateRecipeRating: (recipeId: string, rating: number) => {
        set((state) => ({
          recipes: state.recipes.map((recipe) => {
            if (recipe.id === recipeId) {
              const newReviews = recipe.reviews + 1
              const newRating = (recipe.rating * recipe.reviews + rating) / newReviews
              return { ...recipe, rating: newRating, reviews: newReviews }
            }
            return recipe
          }),
        }))
      },

      addUserComment: (commentId: string, content: string, rating: number) => {
        set((state) => {
          const userComments = state.userComments || []
          const newComment: UserComment = {
            id: commentId,
            content,
            rating,
            createdAt: new Date().toISOString(),
          }

          return {
            ...state,
            userComments: [...userComments, newComment],
          }
        })
      },

      updateUserComment: (commentId: string, content: string, rating: number) => {
        set((state) => {
          const userComments = state.userComments || []
          const updatedComments = userComments.map((comment) =>
            comment.id === commentId ? { ...comment, content, rating } : comment,
          )

          return {
            ...state,
            userComments: updatedComments,
          }
        })
      },

      deleteUserComment: (commentId: string) => {
        set((state) => {
          const userComments = state.userComments || []
          return {
            ...state,
            userComments: userComments.filter((comment) => comment.id !== commentId),
          }
        })
      },

      getRecipesByCategory: (category: string) => {
        const { recipes } = get()
        if (category === "todas" || category === "todos") return recipes
        return recipes.filter((recipe) => recipe.category === category)
      },

      searchRecipes: (query: string) => {
        const { recipes } = get()
        return recipes.filter(
          (recipe) =>
            recipe.title.toLowerCase().includes(query.toLowerCase()) ||
            recipe.description.toLowerCase().includes(query.toLowerCase()) ||
            recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(query.toLowerCase())),
        )
      },
    }),
    {
      name: "planeats-storage",
    },
  ),
)
