"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAppStore } from "@/lib/store"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function RecipeDetail({ params }: { params: { id: string } }) {
  const { recipes, toggleFavorite, addComment, updateRecipeRating, user, ingredients } = useAppStore()
  const [newComment, setNewComment] = useState("")
  const [newRating, setNewRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isCooking, setIsCooking] = useState(false)
  const router = useRouter()

  const recipe = recipes.find((r) => r.id === params.id)

  if (!recipe) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Receita não encontrada</h1>
          <Button asChild>
            <Link href="/receitas-sugeridas">Voltar para receitas</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleToggleFavorite = () => {
    toggleFavorite(recipe.id)
    toast.success(recipe.isFavorite ? "Receita removida dos favoritos" : "Receita adicionada aos favoritos")
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) {
      toast.error("Por favor, escreva um comentário")
      return
    }

    if (!user) {
      toast.error("Você precisa estar logado para comentar")
      return
    }

    addComment(recipe.id, {
      author: user.name,
      avatar: user.avatar,
      content: newComment,
      rating: newRating,
    })

    if (newRating > 0) {
      updateRecipeRating(recipe.id, newRating)
    }

    setNewComment("")
    setNewRating(0)
    toast.success("Comentário adicionado com sucesso!")
  }

  const handleShare = async () => {
    try {
      if (navigator.share && navigator.canShare) {
        await navigator.share({
          title: recipe.title,
          text: recipe.description,
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
    // Verificar quais ingredientes da receita não estão no frigorífico
    const missingIngredients = recipe.ingredients.filter((ingredient) => {
      return !ingredients.some((fridgeItem) =>
        fridgeItem.name.toLowerCase().includes(ingredient.toLowerCase().split(" ").slice(-1)[0]),
      )
    })

    if (missingIngredients.length === 0) {
      toast.success("Você já tem todos os ingredientes!")
    } else {
      toast.success(`${missingIngredients.length} ingredientes adicionados à lista de compras`)
    }
  }

  const handlePrintRecipe = () => {
    window.print()
    toast.success("Receita enviada para impressão!")
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{recipe.title}</h1>
            <p className="text-muted-foreground">{recipe.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Imagem da receita */}
            <Card className="overflow-hidden">
              <div className="relative h-64 md:h-80">
                <Image src={recipe.image || "/placeholder.svg"} alt={recipe.title} fill className="object-cover" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-10 w-10 rounded-full bg-white/80 ${
                      recipe.isFavorite ? "text-rose-500" : "text-gray-500"
                    }`}
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={`h-5 w-5 ${recipe.isFavorite ? "fill-current" : ""}`} />
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
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-600" />
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Modo de preparo */}
            <Card>
              <CardHeader>
                <CardTitle>Modo de Preparo</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <p className="flex-1 pt-1">{instruction}</p>
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
                  Comentários ({recipe.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Adicionar comentário */}
                {user && (
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
                )}

                <Separator />

                {/* Lista de comentários */}
                <div className="space-y-4">
                  {recipe.comments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Seja o primeiro a comentar esta receita!</p>
                  ) : (
                    recipe.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={comment.avatar || "/placeholder.svg"} alt={comment.author} />
                          <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{comment.author}</h4>
                            {comment.rating > 0 && (
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= comment.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
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
                    <p className="text-sm text-muted-foreground">{recipe.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ChefHat className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Dificuldade</p>
                    <p className="text-sm text-muted-foreground">{recipe.difficulty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Avaliação</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{recipe.rating.toFixed(1)}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.floor(recipe.rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">({recipe.reviews})</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Criado por</p>
                    <p className="text-sm text-muted-foreground">{recipe.author}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-sm">
                  {recipe.category}
                </Badge>
              </CardContent>
            </Card>

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
