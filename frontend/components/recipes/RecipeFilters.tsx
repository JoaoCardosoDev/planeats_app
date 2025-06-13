"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { RecipeFilter } from "@/lib/api/recipes"

interface RecipeFiltersProps {
  onFiltersChange: (filters: RecipeFilter) => void
  onClearFilters: () => void
  isLoading?: boolean
}

export default function RecipeFilters({ onFiltersChange, onClearFilters, isLoading }: RecipeFiltersProps) {
  const [userCreatedOnly, setUserCreatedOnly] = useState(false)
  const [maxCalories, setMaxCalories] = useState<number[]>([1000])
  const [maxPrepTime, setMaxPrepTime] = useState<number[]>([60])
  const [ingredients, setIngredients] = useState<string[]>([])
  const [newIngredient, setNewIngredient] = useState("")
  const [caloriesEnabled, setCaloriesEnabled] = useState(false)
  const [prepTimeEnabled, setPrepTimeEnabled] = useState(false)

  const handleAddIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      const updatedIngredients = [...ingredients, newIngredient.trim()]
      setIngredients(updatedIngredients)
      setNewIngredient("")
      applyFilters(undefined, undefined, undefined, updatedIngredients)
    }
  }

  const handleRemoveIngredient = (ingredient: string) => {
    const updatedIngredients = ingredients.filter(i => i !== ingredient)
    setIngredients(updatedIngredients)
    applyFilters(undefined, undefined, undefined, updatedIngredients)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddIngredient()
    }
  }

  const applyFilters = (
    userOnly?: boolean,
    calories?: number[],
    prepTime?: number[],
    ingredientList?: string[]
  ) => {
    const filters: RecipeFilter = {}

    const finalUserOnly = userOnly !== undefined ? userOnly : userCreatedOnly
    const finalCalories = calories !== undefined ? calories : maxCalories
    const finalPrepTime = prepTime !== undefined ? prepTime : maxPrepTime
    const finalIngredients = ingredientList !== undefined ? ingredientList : ingredients

    if (finalUserOnly) {
      filters.user_created_only = true
    }

    if (caloriesEnabled && finalCalories[0] < 1000) {
      filters.max_calories = finalCalories[0]
    }

    if (prepTimeEnabled && finalPrepTime[0] < 240) {
      filters.max_prep_time = finalPrepTime[0]
    }

    if (finalIngredients.length > 0) {
      filters.ingredients = finalIngredients
    }

    onFiltersChange(filters)
  }

  const handleUserCreatedOnlyChange = (checked: boolean) => {
    setUserCreatedOnly(checked)
    applyFilters(checked)
  }

  const handleCaloriesChange = (values: number[]) => {
    setMaxCalories(values)
    if (caloriesEnabled) {
      applyFilters(undefined, values)
    }
  }

  const handlePrepTimeChange = (values: number[]) => {
    setMaxPrepTime(values)
    if (prepTimeEnabled) {
      applyFilters(undefined, undefined, values)
    }
  }

  const handleCaloriesEnabledChange = (checked: boolean) => {
    setCaloriesEnabled(checked)
    if (checked) {
      applyFilters(undefined, maxCalories)
    } else {
      applyFilters()
    }
  }

  const handlePrepTimeEnabledChange = (checked: boolean) => {
    setPrepTimeEnabled(checked)
    if (checked) {
      applyFilters(undefined, undefined, maxPrepTime)
    } else {
      applyFilters()
    }
  }

  const clearAllFilters = () => {
    setUserCreatedOnly(false)
    setMaxCalories([1000])
    setMaxPrepTime([60])
    setIngredients([])
    setNewIngredient("")
    setCaloriesEnabled(false)
    setPrepTimeEnabled(false)
    onClearFilters()
  }

  const hasActiveFilters = userCreatedOnly || caloriesEnabled || prepTimeEnabled || ingredients.length > 0

  return (
    <div className="space-y-6">
      {/* User Created Only Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Origem das Receitas</h3>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="user-created-only" 
            checked={userCreatedOnly}
            onCheckedChange={handleUserCreatedOnlyChange}
            disabled={isLoading}
          />
          <Label htmlFor="user-created-only">Apenas minhas receitas</Label>
        </div>
      </div>

      <Separator />

      {/* Calories Filter */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="calories-enabled" 
            checked={caloriesEnabled}
            onCheckedChange={handleCaloriesEnabledChange}
            disabled={isLoading}
          />
          <Label htmlFor="calories-enabled">Filtrar por calorias</Label>
        </div>
        
        {caloriesEnabled && (
          <div className="space-y-2 ml-6">
            <div className="flex justify-between text-xs">
              <span>0 cal</span>
              <span>1000+ cal</span>
            </div>
            <Slider 
              value={maxCalories} 
              onValueChange={handleCaloriesChange}
              max={1000} 
              step={50}
              disabled={isLoading}
            />
            <div className="text-center text-xs text-muted-foreground">
              Máximo: {maxCalories[0] >= 1000 ? "1000+" : maxCalories[0]} calorias
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Prep Time Filter */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="prep-time-enabled" 
            checked={prepTimeEnabled}
            onCheckedChange={handlePrepTimeEnabledChange}
            disabled={isLoading}
          />
          <Label htmlFor="prep-time-enabled">Filtrar por tempo de preparo</Label>
        </div>
        
        {prepTimeEnabled && (
          <div className="space-y-2 ml-6">
            <div className="flex justify-between text-xs">
              <span>0 min</span>
              <span>4+ horas</span>
            </div>
            <Slider 
              value={maxPrepTime} 
              onValueChange={handlePrepTimeChange}
              max={240} 
              step={5}
              disabled={isLoading}
            />
            <div className="text-center text-xs text-muted-foreground">
              Máximo: {maxPrepTime[0] >= 240 ? "4+ horas" : `${maxPrepTime[0]} minutos`}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Ingredients Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Ingredientes Obrigatórios</h3>
        <p className="text-xs text-muted-foreground">
          Receitas que contenham TODOS os ingredientes selecionados
        </p>
        
        <div className="flex gap-2">
          <Input 
            placeholder="Ex: tomate, frango, arroz"
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleAddIngredient}
            disabled={!newIngredient.trim() || isLoading}
            size="sm"
            className="px-3"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {ingredients.map((ingredient) => (
              <Badge key={ingredient} variant="secondary" className="flex items-center gap-1">
                {ingredient}
                <button 
                  onClick={() => handleRemoveIngredient(ingredient)}
                  disabled={isLoading}
                  className="ml-1 h-3 w-3 rounded-full bg-muted-foreground/30 text-muted-foreground hover:bg-muted-foreground/50 flex items-center justify-center"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <>
          <Separator />
          <Button 
            variant="outline" 
            onClick={clearAllFilters}
            disabled={isLoading}
            className="w-full"
          >
            Limpar Todos os Filtros
          </Button>
        </>
      )}
    </div>
  )
}
