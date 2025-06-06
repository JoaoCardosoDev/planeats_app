"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, ChefHat, Search, Filter, Heart, BookmarkPlus, Star, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { recipeAPI, Recipe, RecipeFilter } from "@/lib/api/recipes"
import RecipeFilters from "@/components/recipes/RecipeFilters"
import { toast } from "sonner"

export default function Explorar() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentFilters, setCurrentFilters] = useState<RecipeFilter>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [total, setTotal] = useState(0)
  const [skip, setSkip] = useState(0)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const router = useRouter()

  const LIMIT = 12

  // Load recipes on component mount and when filters change
  useEffect(() => {
    loadRecipes(true)
  }, [currentFilters])

  const loadRecipes = async (resetPagination = false) => {
    try {
      if (resetPagination) {
        setSkip(0)
        setIsInitialLoading(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      const newSkip = resetPagination ? 0 : skip
      const filters: RecipeFilter = {
        ...currentFilters,
        skip: newSkip,
        limit: LIMIT
      }

      const response = await recipeAPI.getRecipes(filters)
      
      if (resetPagination) {
        setRecipes(response.recipes)
      } else {
        setRecipes(prev => [...prev, ...response.recipes])
      }
      
      setTotal(response.total)
      setSkip(newSkip + response.recipes.length)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar receitas'
      setError(errorMessage)
      toast.error('Erro ao carregar receitas', {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
      setIsInitialLoading(false)
    }
  }

  const handleFiltersChange = (filters: RecipeFilter) => {
    setCurrentFilters(filters)
  }

  const handleClearFilters = () => {
    setCurrentFilters({})
  }

  const loadMoreRecipes = () => {
    if (skip < total) {
      loadRecipes(false)
    }
  }

  const handleRecipeClick = (recipeId: number) => {
    router.push(`/receita/${recipeId}`)
  }

  const formatTime = (minutes?: number) => {
    if (!minutes) return "Tempo não informado"
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
  }

  const getDifficulty = (minutes?: number) => {
    if (!minutes) return "Não informado"
    if (minutes <= 20) return "Fácil"
    if (minutes <= 45) return "Médio"
    return "Difícil"
  }

  const hasMoreRecipes = skip < total

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Explorar Receitas</h1>
            <p className="text-muted-foreground">Descubra novas receitas e inspirações culinárias</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar receitas..." className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Sheet>
                <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                  {Object.keys(currentFilters).length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                      {Object.keys(currentFilters).length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Filtros de Receitas</SheetTitle>
                  <SheetDescription>
                    Use os filtros abaixo para encontrar receitas específicas
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6">
                  <RecipeFilters 
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={handleClearFilters}
                    isLoading={isLoading}
                  />
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsFilterSheetOpen(false)}
                    >
                      Fechar
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            <Select defaultValue="relevancia">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevancia">Relevância</SelectItem>
                <SelectItem value="recentes">Mais Recentes</SelectItem>
                <SelectItem value="populares">Mais Populares</SelectItem>
                <SelectItem value="rapidas">Mais Rápidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {Object.keys(currentFilters).length > 0 && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Filtros Ativos:</h3>
            <div className="flex flex-wrap gap-2 text-sm">
              {currentFilters.user_created_only && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                  Apenas minhas receitas
                </span>
              )}
              {currentFilters.max_calories && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  Máx. {currentFilters.max_calories} cal
                </span>
              )}
              {currentFilters.max_prep_time && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                  Máx. {currentFilters.max_prep_time} min
                </span>
              )}
              {currentFilters.ingredients && currentFilters.ingredients.length > 0 && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">
                  Ingredientes: {currentFilters.ingredients.join(", ")}
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
                onClick={() => loadRecipes(true)}
              >
                Tentar Novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isInitialLoading ? (
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
              {total === 0 ? 'Nenhuma receita encontrada' : 
               total === 1 ? '1 receita encontrada' : 
               `${total} receitas encontradas`}
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <ExploreRecipeCard 
                  key={recipe.id} 
                  id={recipe.id.toString()}
                  title={recipe.title}
                  description={recipe.description || "Sem descrição disponível"}
                  image={recipe.image_url || "/placeholder.svg?height=192&width=384"}
                  time={formatTime(recipe.prep_time_minutes)}
                  difficulty={getDifficulty(recipe.prep_time_minutes)}
                  calories={recipe.calories}
                  ingredients={recipe.ingredients?.map(ing => ing.name) || []}
                  onClick={() => handleRecipeClick(recipe.id)} 
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreRecipes && (
              <div className="flex justify-center mt-8">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={loadMoreRecipes} 
                  disabled={isLoading}
                  className="min-w-[200px]"
                >
                  {isLoading ? "Carregando..." : `Carregar Mais (${total - skip} restantes)`}
                </Button>
              </div>
            )}

            {/* No More Results */}
            {!hasMoreRecipes && recipes.length > 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                Todas as receitas foram carregadas
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

interface ExploreRecipeCardProps {
  id: string
  title: string
  description: string
  image: string
  time: string
  difficulty: string
  calories?: number
  ingredients?: string[]
  onClick?: () => void
}

function ExploreRecipeCard({
  id,
  title,
  description,
  image,
  time,
  difficulty,
  calories,
  ingredients,
  onClick,
}: ExploreRecipeCardProps) {
  const [favorite, setFavorite] = useState(false)

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full bg-white/80 ${favorite ? "text-rose-500" : "text-gray-500"}`}
              onClick={() => setFavorite(!favorite)}
            >
              <Heart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/80 text-gray-500">
              <BookmarkPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <ChefHat className="h-4 w-4 text-muted-foreground" />
              <span>{difficulty}</span>
            </div>
            {calories && (
              <div className="flex items-center gap-1 text-sm">
                <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                  {calories} cal
                </span>
              </div>
            )}
          </div>
          {ingredients && ingredients.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {ingredients.slice(0, 3).map((ingredient, index) => (
                <span 
                  key={index}
                  className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded"
                >
                  {ingredient}
                </span>
              ))}
              {ingredients.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{ingredients.length - 3} mais
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={(e) => {
            e.stopPropagation()
            onClick?.()
          }}
        >
          Ver Receita
        </Button>
      </CardFooter>
    </Card>
  )
}
