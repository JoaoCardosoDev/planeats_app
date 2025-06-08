"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Clock,
  ChefHat,
  Heart,
  Share,
  BookmarkPlus,
  Star,
  ArrowLeft,
  Users,
  MessageCircle,
  Send,
  ShoppingCart,
  Printer,
  Play,
  AlertCircle,
} from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { recipeAPI, Recipe } from "@/lib/api/recipes"

export default function RecipeDetail({ params }: { params: { id: string } }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")
  const [newRating, setNewRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isCooking, setIsCooking] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadRecipe()
  }, [params.id])

  const loadRecipe = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const recipeData = await recipeAPI.getRecipeById(parseInt(params.id))
      setRecipe(recipeData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar receita'
      setError(errorMessage)
      toast.error('Erro ao carregar receita', {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? "Receita removida dos favoritos" : "Receita adicionada aos favoritos")
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) {
      toast.error("Por favor, escreva um comentário")
      return
    }

    // TODO: Implement comment API when available
    setNewComment("")
    setNewRating(0)
    toast.success("Comentário adicionado com sucesso!")
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: recipe?.recipe_name,
          text: recipe?.instructions.substring(0, 200),
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Link copiado para a área de transferência!")
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Link copiado para a área de transferência!")
      } catch (clipboardError) {
        toast.error("Não foi possível compartilhar. Copie o link manualmente: " + window.location.href)
      }
    }
  }

  const handleStartCooking = () => {
    setIsCooking(true)
    toast.success("Modo de cozinha ativado! Boa sorte com sua receita!")
  }

  const handleAddToShoppingList = () => {
    // TODO: Implement shopping list integration
    toast.success(`Ingredientes adicionados à lista de compras`)
  }

  const handlePrintRecipe = () => {
    window.print()
    toast.success("Receita enviada para impressão!")
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

  const formatInstructions = (instructions: string) => {
    // Split instructions by periods or numbered steps
    return instructions.split(/\.\s+|\d+\.\s*/).filter(step => step.trim().length > 0)
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Receita não encontrada"}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={loadRecipe}
            >
              Tentar Novamente
            </Button>
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <span onClick={() => router.back()}>Voltar</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{recipe.recipe_name}</h1>
            <p className="text-muted-foreground">{recipe.instructions.substring(0, 200)}...</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Imagem da receita */}
            <Card className="overflow-hidden">
              <div className="relative h-64 md:h-80">
                <Image 
                  src={recipe.image_url || "/placeholder.svg"} 
                  alt={recipe.recipe_name} 
                  fill 
                  className="object-cover" 
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-10 w-10 rounded-full bg-white/80 ${
                      isFavorite ? "text-rose-500" : "text-gray-500"
                    }`}
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/80 text-gray-500"
                    onClick={handleShare}
                  >
                    <Share className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-white/80 text-gray-500">
                    <BookmarkPlus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Ingredientes */}
            <Card>
              <CardHeader>
                <CardTitle>Ingredientes</CardTitle>
              </CardHeader>
              <CardContent>
                {recipe.ingredients.length > 0 ? (
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-600" />
                        <span>
                          {ingredient.required_quantity} {ingredient.required_unit} de {ingredient.ingredient_name}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Nenhum ingrediente especificado</p>
                )}
              </CardContent>
            </Card>

            {/* Modo de preparo */}
            <Card>
              <CardHeader>
                <CardTitle>Modo de Preparo</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {formatInstructions(recipe.instructions).map((instruction, index) => (
                    <li key={index} className="flex gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <p className="flex-1 pt-1">{instruction.trim()}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Comentários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Comentários (0)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Adicionar comentário */}
                <form onSubmit={handleAddComment} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sua avaliação</Label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="p-1"
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => setNewRating(star)}
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= (hoveredRating || newRating) ? "text-amber-400 fill-amber-400" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment">Seu comentário</Label>
                    <Textarea
                      id="comment"
                      placeholder="Compartilhe sua experiência com esta receita..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Comentário
                  </Button>
                </form>

                <Separator />

                {/* Lista de comentários */}
                <div className="space-y-4">
                  <p className="text-muted-foreground text-center py-8">Seja o primeiro a comentar esta receita!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações da receita */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Tempo de preparo</p>
                    <p className="text-sm text-muted-foreground">{formatTime(recipe.preparation_time_minutes)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ChefHat className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Dificuldade</p>
                    <p className="text-sm text-muted-foreground">{getDifficulty(recipe.preparation_time_minutes)}</p>
                  </div>
                </div>
                {recipe.estimated_calories && (
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-xs text-orange-700 font-medium">cal</span>
                    </div>
                    <div>
                      <p className="font-medium">Calorias</p>
                      <p className="text-sm text-muted-foreground">{recipe.estimated_calories} kcal</p>
                    </div>
                  </div>
                )}
                {recipe.serving_size && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Porções</p>
                      <p className="text-sm text-muted-foreground">{recipe.serving_size} pessoas</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Criado por</p>
                    <p className="text-sm text-muted-foreground">
                      {recipe.created_by_user_id ? "Usuário" : "Sistema"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags/Categorias */}
            {(recipe.dietary_tags || recipe.cuisine_type || recipe.difficulty_level) && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recipe.cuisine_type && (
                    <Badge variant="outline" className="text-sm">
                      {recipe.cuisine_type}
                    </Badge>
                  )}
                  {recipe.difficulty_level && (
                    <Badge variant="outline" className="text-sm">
                      {recipe.difficulty_level}
                    </Badge>
                  )}
                  {recipe.dietary_tags?.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-sm mr-1">
                      {tag}
                    </Badge>
                  ))}
                  {recipe.is_healthy && (
                    <Badge variant="outline" className="text-sm bg-green-50 text-green-700">
                      Saudável
                    </Badge>
                  )}
                  {recipe.is_comfort_food && (
                    <Badge variant="outline" className="text-sm bg-amber-50 text-amber-700">
                      Comfort Food
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Ações */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className={`w-full ${isCooking ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"}`}
                  onClick={handleStartCooking}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isCooking ? "Cozinhando..." : "Começar a Cozinhar"}
                </Button>
                <Button variant="outline" className="w-full" onClick={handleAddToShoppingList}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Adicionar à Lista de Compras
                </Button>
                <Button variant="outline" className="w-full" onClick={handlePrintRecipe}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir Receita
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
