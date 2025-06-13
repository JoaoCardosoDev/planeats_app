"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, ChefHat, Search, AlertCircle, Globe, Download, Play, ExternalLink, Dice1 } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useMealDBSearch, useMealDBImport, MealDBMeal, getCategoryIcon, getAreaFlag } from "@/lib/api/mealdb"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

export default function Explorar() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Explorar Receitas</h1>
            <p className="text-muted-foreground">Descubra novas receitas e inspirações culinárias do MealDB</p>
          </div>
        </div>

        <MealDBExplorer />
      </div>
    </div>
  )
}

// Component for exploring MealDB recipes
function MealDBExplorer() {
  const { data: session } = useSession()
  const [mealDbRecipes, setMealDbRecipes] = useState<MealDBMeal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedArea, setSelectedArea] = useState<string>("")
  const [categories, setCategories] = useState<any[]>([])
  const [areas, setAreas] = useState<any[]>([])

  const { 
    searchByName, 
    filterByCategory, 
    filterByArea, 
    getRandomMeal, 
    getCategories, 
    getAreas,
    filterByIngredient 
  } = useMealDBSearch()

  const mealDBImport = session ? useMealDBImport() : null

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      
      // Load categories and areas with error handling
      let categoriesData: any = { categories: [] }
      let areasData: any = { areas: [] }
      
      try {
        categoriesData = await getCategories()
      } catch (err) {
        console.warn('Failed to load categories:', err)
      }
      
      try {
        areasData = await getAreas()
      } catch (err) {
        console.warn('Failed to load areas:', err)
      }
      
      setCategories(categoriesData.categories)
      setAreas(areasData.areas)
      
      // Load some random recipes with individual error handling
      const randomRecipePromises: Promise<MealDBMeal | null>[] = []
      for (let i = 0; i < 6; i++) {
        randomRecipePromises.push(
          getRandomMeal().catch(err => {
            console.warn(`Failed to get random meal ${i + 1}:`, err)
            return null
          })
        )
      }
      
      const randomRecipes = await Promise.all(randomRecipePromises)
      const validRecipes = randomRecipes.filter((recipe): recipe is MealDBMeal => recipe !== null)
      
      if (validRecipes.length === 0) {
        // Try to search for some popular recipes as fallback
        try {
          const fallbackResults = await searchByName('chicken')
          setMealDbRecipes(fallbackResults.meals.slice(0, 6))
        } catch (fallbackErr) {
          console.warn('Fallback search also failed:', fallbackErr)
          setError('MealDB API não está disponível no momento. Tente novamente mais tarde.')
        }
      } else {
        setMealDbRecipes(validRecipes)
      }
      
    } catch (err) {
      setError('Erro ao carregar receitas do MealDB')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    
    try {
      setIsLoading(true)
      setError(null)
      const results = await searchByName(searchTerm)
      setMealDbRecipes(results.meals)
    } catch (err) {
      setError('Erro ao buscar receitas')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryFilter = async (category: string) => {
    try {
      setIsLoading(true)
      setError(null)
      setSelectedCategory(category)
      const results = await filterByCategory(category)
      setMealDbRecipes(results.meals)
    } catch (err) {
      setError('Erro ao filtrar por categoria')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAreaFilter = async (area: string) => {
    try {
      setIsLoading(true)
      setError(null)
      setSelectedArea(area)
      const results = await filterByArea(area)
      setMealDbRecipes(results.meals)
    } catch (err) {
      setError('Erro ao filtrar por culinária')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetRandomRecipes = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const randomRecipes = await Promise.all([
        getRandomMeal().catch(() => null),
        getRandomMeal().catch(() => null),
        getRandomMeal().catch(() => null),
        getRandomMeal().catch(() => null),
        getRandomMeal().catch(() => null),
        getRandomMeal().catch(() => null)
      ])
      const validRecipes = randomRecipes.filter((recipe): recipe is MealDBMeal => recipe !== null)
      setMealDbRecipes(validRecipes)
      setSelectedCategory("")
      setSelectedArea("")
      setSearchTerm("")
    } catch (err) {
      setError('Erro ao buscar receitas aleatórias')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportRecipe = async (mealId: string, mealName: string) => {
    if (!mealDBImport) {
      toast.error('Faça login para importar receitas')
      return
    }

    try {
      const result = await mealDBImport.importMeal(mealId)
      toast.success(`Receita "${mealName}" importada com sucesso!`, {
        description: `${result.recipe.estimated_calories || 'N/A'} cal • ${result.recipe.estimated_prep_time || 'N/A'} min`,
        action: {
          label: "Ver Minhas Receitas",
          onClick: () => window.location.href = '/minhas-receitas'
        },
        actionButtonStyle: {
          backgroundColor: "#16A34A", // Tailwind green-600
          color: "white"
        }
      })
    } catch (err: any) {
      toast.error('Erro ao importar receita', {
        description: err.message
      })
    }
  }

  const clearFilters = () => {
    setSelectedCategory("")
    setSelectedArea("")
    setSearchTerm("")
    loadInitialData()
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar receitas no MealDB..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={!searchTerm.trim() || isLoading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleGetRandomRecipes} variant="outline" disabled={isLoading}>
            <Dice1 className="h-4 w-4 mr-2" />
            Receitas Aleatórias
          </Button>
        </div>
      </div>

      {/* Category and Area Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {getCategoryIcon(category.name)} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedArea} onValueChange={handleAreaFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por culinária" />
          </SelectTrigger>
          <SelectContent>
            {areas.map((area) => (
              <SelectItem key={area.name} value={area.name}>
                {getAreaFlag(area.name)} {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(selectedCategory || selectedArea || searchTerm) && (
          <Button variant="outline" onClick={clearFilters}>
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {(selectedCategory || selectedArea || searchTerm) && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Filtros Ativos:</h3>
          <div className="flex flex-wrap gap-2 text-sm">
            {searchTerm && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                Busca: "{searchTerm}"
              </span>
            )}
            {selectedCategory && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                Categoria: {selectedCategory}
              </span>
            )}
            {selectedArea && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                Culinária: {selectedArea}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={loadInitialData}
            >
              Tentar Novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-48 mb-4"></div>
              <div className="bg-muted rounded h-4 w-3/4 mb-2"></div>
              <div className="bg-muted rounded h-4 w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            {mealDbRecipes.length === 0 ? 'Nenhuma receita encontrada' : 
             mealDbRecipes.length === 1 ? '1 receita encontrada' : 
             `${mealDbRecipes.length} receitas encontradas`}
          </div>

          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealDbRecipes.map((meal) => (
              <MealDBRecipeCard 
                key={meal.id}
                meal={meal}
                onImport={handleImportRecipe}
                canImport={!!session}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Component for displaying MealDB recipe cards
interface MealDBRecipeCardProps {
  meal: MealDBMeal
  onImport: (mealId: string, mealName: string) => void
  canImport: boolean
}

function MealDBRecipeCard({ meal, onImport, canImport }: MealDBRecipeCardProps) {
  const [isImporting, setIsImporting] = useState(false)

  const handleImport = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canImport || isImporting) return

    setIsImporting(true)
    try {
      await onImport(meal.id, meal.name)
    } finally {
      setIsImporting(false)
    }
  }

  const formatInstructions = (instructions: string) => {
    return instructions.length > 120 ? instructions.substring(0, 120) + "..." : instructions
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image 
            src={meal.image_url || "/placeholder.svg"} 
            alt={meal.name} 
            fill 
            className="object-cover" 
          />
          <div className="absolute top-2 left-2 flex gap-1">
            {meal.category && (
              <span className="px-2 py-1 bg-white/90 text-xs font-medium rounded">
                {getCategoryIcon(meal.category)} {meal.category}
              </span>
            )}
            {meal.area && (
              <span className="px-2 py-1 bg-white/90 text-xs font-medium rounded">
                {getAreaFlag(meal.area)} {meal.area}
              </span>
            )}
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
            {meal.youtube_url && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/80 text-red-600"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(meal.youtube_url, '_blank')
                }}
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            {meal.source_url && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/80 text-blue-600"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(meal.source_url, '_blank')
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold line-clamp-2">{meal.name}</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded shrink-0">
              MealDB
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{formatInstructions(meal.instructions)}</p>
          
          {meal.ingredients && meal.ingredients.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {meal.ingredients.slice(0, 4).map((ingredient, index) => (
                <span 
                  key={index}
                  className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded"
                >
                  {ingredient.name}
                </span>
              ))}
              {meal.ingredients.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{meal.ingredients.length - 4} mais
                </span>
              )}
            </div>
          )}

          {meal.tags && (
            <div className="flex flex-wrap gap-1 mt-1">
              {meal.tags.split(',').slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.open(`https://www.themealdb.com/meal/${meal.id}`, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver Original
        </Button>
        <Button
          className="flex-1 bg-green-600 hover:bg-green-700"
          onClick={handleImport}
          disabled={!canImport || isImporting}
        >
          <Download className="h-4 w-4 mr-2" />
          {isImporting ? 'Importando...' : 'Importar'}
        </Button>
      </CardFooter>
    </Card>
  )
}
