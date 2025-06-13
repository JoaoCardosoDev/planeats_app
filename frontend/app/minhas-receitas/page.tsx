"use client"

import Link from "next/link"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, ChefHat, Search, Plus, Edit, Trash2, Heart, Share, Filter, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { recipeAPI, Recipe, RecipeFilter } from "@/lib/api/recipes"
import { useSession } from "next-auth/react"
import { AuthGuard } from "@/components/auth/AuthGuard"
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
import RecipeFilters from "@/components/recipes/RecipeFilters"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function MinhasReceitasContent() {
  const { data: session } = useSession()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentFilters, setCurrentFilters] = useState<RecipeFilter>({})
  const [activeTab, setActiveTab] = useState("todas")
  const [total, setTotal] = useState(0)
  const [skip, setSkip] = useState(0)
  const router = useRouter()

  const LIMIT = 12

  useEffect(() => {
    if (session) {
      loadRecipes(true)
    }
  }, [session, currentFilters, activeTab, searchQuery])

  const loadRecipes = async (resetPagination = false) => {
    if (!session) return

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

      // Add search filter
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim()
      }

      // Add tab-specific filters
      switch (activeTab) {
        case "criadas":
          filters.user_created_only = true
          break
        case "importadas":
          filters.imported_only = true
          break
        default:
          // "todas" - no additional filter
          break
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
    setCurrentFilters({ ...filters })
  }

  const handleClearFilters = () => {
    setCurrentFilters({})
  }

  const loadMoreRecipes = () => {
    if (skip < total) {
      loadRecipes(false)
    }
  }

  const handleEdit = (recipeId: number) => {
    router.push(`/editar-receita/${recipeId}`)
  }

  const handleDelete = async (recipeId: number, recipeName: string) => {
    try {
      await recipeAPI.deleteRecipe(recipeId)
      // Refresh the list
      loadRecipes(true)
      toast.success(`Receita "${recipeName}" excluída com sucesso!`)
    } catch (err) {
      toast.error('Erro ao excluir receita')
    }
  }

  const handleShare = async (recipe: Recipe) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: recipe.recipe_name,
          text: recipe.instructions.substring(0, 100) + "...",
          url: `${window.location.origin}/receita/${recipe.id}`,
        })
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/receita/${recipe.id}`)
        toast.success("Link copiado!")
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/receita/${recipe.id}`)
        toast.success("Link copiado!")
      } catch (clipboardError) {
        toast.error("Não foi possível compartilhar")
      }
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
            <h1 className="text-3xl font-bold">Minhas Receitas</h1>
            <p className="text-muted-foreground">Gerencie suas receitas favoritas e criações próprias</p>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/adicionar-receita">
              <Plus className="mr-2 h-4 w-4" />
              Nova Receita
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar receitas..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                    Use os filtros abaixo para encontrar suas receitas específicas
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
                    <Button variant="outline">
                      Fechar
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="todas">Todas ({total})</TabsTrigger>
            <TabsTrigger value="criadas">Criadas por Mim</TabsTrigger>
            <TabsTrigger value="importadas">Importadas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {/* Active Filters Display */}
            {(Object.keys(currentFilters).length > 0 || searchQuery) && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Filtros Ativos:</h3>
                <div className="flex flex-wrap gap-2 text-sm">
                  {searchQuery && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      Busca: "{searchQuery}"
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
            ) : recipes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? `Nenhuma receita encontrada com "${searchQuery}"`
                      : "Nenhuma receita encontrada nesta categoria"}
                  </p>
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link href="/explorar">
                      <Search className="mr-2 h-4 w-4" />
                      Explorar Receitas
                    </Link>
                  </Button>
                </CardContent>
              </Card>
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
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onEdit={() => handleEdit(recipe.id)}
                      onDelete={() => handleDelete(recipe.id, recipe.recipe_name)}
                      onShare={() => handleShare(recipe)}
                      onClick={() => handleRecipeClick(recipe.id)}
                      formatTime={formatTime}
                      getDifficulty={getDifficulty}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface RecipeCardProps {
  recipe: Recipe
  onEdit?: () => void
  onDelete?: () => void
  onShare?: () => void
  onClick?: () => void
  formatTime: (minutes?: number) => string
  getDifficulty: (minutes?: number) => string
}

function RecipeCard({
  recipe,
  onEdit,
  onDelete,
  onShare,
  onClick,
  formatTime,
  getDifficulty,
}: RecipeCardProps) {
  const [favorite, setFavorite] = useState(false)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorite(!favorite)
    toast.success(favorite ? "Receita removida dos favoritos" : "Receita adicionada aos favoritos")
  }

  const isUserCreated = recipe.created_by_user_id !== null && recipe.created_by_user_id !== undefined
  const isImported = !isUserCreated

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <div className="cursor-pointer" onClick={onClick}>
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image 
              src={recipe.image_url || "/placeholder.svg"} 
              alt={recipe.recipe_name} 
              fill 
              className="object-cover" 
            />
            <div className="absolute top-2 right-2 flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full bg-white/80 ${favorite ? "text-rose-500" : "text-gray-500"}`}
                onClick={handleFavoriteClick}
              >
                <Heart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/80 text-gray-500"
                onClick={(e) => {
                  e.stopPropagation()
                  onShare?.()
                }}
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute bottom-2 left-2 flex gap-1">
              {isUserCreated && (
                <Badge className="bg-green-600 hover:bg-green-700">
                  Minha Receita
                </Badge>
              )}
              {isImported && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Importada
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">{recipe.recipe_name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {recipe.instructions.substring(0, 100) + "..."}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTime(recipe.preparation_time_minutes)}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <ChefHat className="h-4 w-4 text-muted-foreground" />
                <span>{getDifficulty(recipe.preparation_time_minutes)}</span>
              </div>
              {recipe.estimated_calories && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                    {recipe.estimated_calories} cal
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </div>
      <CardFooter className="p-4 pt-0 mt-auto flex justify-between">
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={(e) => {
            e.stopPropagation()
            onClick?.()
          }}
        >
          Ver Receita
        </Button>
        {isUserCreated && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.()
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir receita</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir "{recipe.recipe_name}"? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

export default function MinhasReceitas() {
  return (
    <AuthGuard>
      <MinhasReceitasContent />
    </AuthGuard>
  )
}
