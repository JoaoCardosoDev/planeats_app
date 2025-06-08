"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, ChefHat, Sparkles, Target, AlertTriangle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSession } from 'next-auth/react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { recommendationsAPI, type RecipeRecommendationsResponse, type GetRecommendationsParams } from '../../lib/api/recommendations'

export default function ReceitasSugeridas() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<RecipeRecommendationsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("todas")
  const [filters, setFilters] = useState<GetRecommendationsParams>({
    sort_by: 'match_score',
    sort_order: 'desc',
    use_preferences: true
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      setError('Você precisa estar logado para ver recomendações personalizadas')
      setLoading(false)
      return
    }

    fetchRecommendations()
  }, [status, filters])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await recommendationsAPI.getRecommendations(filters)
      setRecommendations(data)
    } catch (err) {
      console.error('Error fetching recommendations:', err)
      setError(err instanceof Error ? err.message : 'Erro ao buscar recomendações')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof GetRecommendationsParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const formatMatchScore = (score: number) => {
    return (score * 100).toFixed(0) + '%'
  }

  const formatTime = (minutes: number | null) => {
    if (!minutes) return 'N/A'
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
  }

  const handleRecipeClick = (recipeId: number) => {
    router.push(`/receita/${recipeId}`)
  }

  const getFilteredRecommendations = () => {
    if (!recommendations?.recommendations) return []
    
    switch (activeTab) {
      case 'rapidas':
        return recommendations.recommendations.filter(r => 
          r.preparation_time_minutes && r.preparation_time_minutes <= 30
        )
      case 'saudaveis':
        return recommendations.recommendations.filter(r => 
          r.estimated_calories && r.estimated_calories <= 400
        )
      case 'economicas':
        return recommendations.recommendations.filter(r => 
          r.missing_ingredients.length <= 2
        )
      case 'favoritas':
        return recommendations.recommendations.filter(r => 
          r.expiring_ingredients_used.length > 0
        )
      default:
        return recommendations.recommendations
    }
  }

  if (status === 'loading') {
    return (
      <div className="container py-8">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container py-8">
        <div className="text-center">
          <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-50 text-green-600" />
          <h3 className="text-lg font-semibold mb-2 text-green-700">Login Necessário</h3>
          <p className="text-green-600 mb-4">Você precisa estar logado para ver recomendações personalizadas baseadas na sua despensa.</p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/login">
              Fazer Login
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const filteredRecommendations = getFilteredRecommendations()

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-green-700">Receitas Sugeridas</h1>
          <p className="text-green-600">Receitas baseadas nos ingredientes do seu frigorífico</p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-green-700">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempo máximo (min)
              </label>
              <input
                type="number"
                value={filters.max_preparation_time || ''}
                onChange={(e) => handleFilterChange('max_preparation_time', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Ex: 60"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calorias máximas
              </label>
              <input
                type="number"
                value={filters.max_calories || ''}
                onChange={(e) => handleFilterChange('max_calories', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Ex: 500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máx. ingredientes em falta
              </label>
              <input
                type="number"
                value={filters.max_missing_ingredients || ''}
                onChange={(e) => handleFilterChange('max_missing_ingredients', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Ex: 3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <Select 
                value={filters.sort_by} 
                onValueChange={(value) => handleFilterChange('sort_by', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match_score">Compatibilidade</SelectItem>
                  <SelectItem value="preparation_time">Tempo de preparo</SelectItem>
                  <SelectItem value="calories">Calorias</SelectItem>
                  <SelectItem value="expiring_ingredients">Ingredientes a expirar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.use_preferences || false}
                onChange={(e) => handleFilterChange('use_preferences', e.target.checked)}
                className="mr-2"
              />
              Usar minhas preferências
            </label>
            
            <Select 
              value={filters.sort_order} 
              onValueChange={(value) => handleFilterChange('sort_order', value as 'asc' | 'desc')}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Decrescente</SelectItem>
                <SelectItem value="asc">Crescente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-2 text-green-600">Buscando recomendações...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : recommendations ? (
          <>
            {/* Metadata */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex flex-wrap gap-4 text-sm text-green-700">
                <span>Itens na despensa: {recommendations.total_pantry_items}</span>
                <span>Receitas analisadas: {recommendations.metadata.total_recipes_analyzed}</span>
                <span>Recomendações: {recommendations.metadata.total_after_filters}</span>
              </div>
            </div>

            {/* Message */}
            {recommendations.message && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
                {recommendations.message}
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4 bg-green-50 border border-green-200">
                <TabsTrigger value="todas" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                  Todas ({recommendations.recommendations.length})
                </TabsTrigger>
                <TabsTrigger value="rapidas" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                  Rápidas ({recommendations.recommendations.filter(r => r.preparation_time_minutes && r.preparation_time_minutes <= 30).length})
                </TabsTrigger>
                <TabsTrigger value="saudaveis" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                  Saudáveis ({recommendations.recommendations.filter(r => r.estimated_calories && r.estimated_calories <= 400).length})
                </TabsTrigger>
                <TabsTrigger value="economicas" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                  Econômicas ({recommendations.recommendations.filter(r => r.missing_ingredients.length <= 2).length})
                </TabsTrigger>
                <TabsTrigger value="favoritas" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                  Prioridade ({recommendations.recommendations.filter(r => r.expiring_ingredients_used.length > 0).length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {filteredRecommendations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecommendations.map((recipe) => (
                      <Card
                        key={recipe.recipe_id}
                        className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-green-100 hover:border-green-300"
                        onClick={() => handleRecipeClick(recipe.recipe_id)}
                      >
                        <CardHeader className="p-0">
                          <div className="relative h-48 w-full">
                            {recipe.image_url ? (
                              <Image
                                src={recipe.image_url}
                                alt={recipe.recipe_name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-green-100 flex items-center justify-center">
                                <ChefHat className="h-16 w-16 text-green-300" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-green-600 text-white">
                                <Target className="h-3 w-3 mr-1" />
                                {formatMatchScore(recipe.match_score)}
                              </Badge>
                            </div>
                            {recipe.expiring_ingredients_used.length > 0 && (
                              <div className="absolute bottom-2 left-2">
                                <Badge className="bg-orange-600 text-white">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Prioridade
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-2">
                            <h3 className="text-xl font-semibold text-green-700">{recipe.recipe_name}</h3>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-sm text-green-600">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(recipe.preparation_time_minutes)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-green-600">
                                <span>{recipe.estimated_calories ? `${recipe.estimated_calories} cal` : 'N/A'}</span>
                              </div>
                            </div>
                            
                            {/* Matching Ingredients */}
                            {recipe.matching_ingredients.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-green-700 mb-1">
                                  Ingredientes que você tem ({recipe.matching_ingredients.length}):
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {recipe.matching_ingredients.slice(0, 3).map((ingredient, idx) => (
                                    <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                      {ingredient.pantry_item_name}
                                    </span>
                                  ))}
                                  {recipe.matching_ingredients.length > 3 && (
                                    <span className="text-xs text-green-600">
                                      +{recipe.matching_ingredients.length - 3} mais
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Missing Ingredients */}
                            {recipe.missing_ingredients.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-red-700 mb-1">
                                  Ingredientes em falta ({recipe.missing_ingredients.length}):
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {recipe.missing_ingredients.slice(0, 3).map((ingredient, idx) => (
                                    <span key={idx} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                      {ingredient.ingredient_name}
                                    </span>
                                  ))}
                                  {recipe.missing_ingredients.length > 3 && (
                                    <span className="text-xs text-red-600">
                                      +{recipe.missing_ingredients.length - 3} mais
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRecipeClick(recipe.recipe_id)
                            }}
                          >
                            Ver Receita
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-50 text-green-600" />
                    <h3 className="text-lg font-semibold mb-2 text-green-700">Nenhuma receita encontrada</h3>
                    <p className="text-green-600 mb-4">
                      {activeTab === 'todas' 
                        ? 'Tente adicionar mais ingredientes à sua despensa ou ajustar os filtros'
                        : `Nenhuma receita ${activeTab} encontrada com os filtros aplicados`
                      }
                    </p>
                    <Button asChild className="bg-green-600 hover:bg-green-700">
                      <Link href="/meu-frigorifico">
                        Gerenciar Despensa
                      </Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </div>
    </div>
  )
}
