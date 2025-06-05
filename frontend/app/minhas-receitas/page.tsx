"use client"

import Link from "next/link"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, ChefHat, Search, Plus, Edit, Trash2, Heart, Share } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
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

export default function MinhasReceitas() {
  const { recipes, deleteRecipe, toggleFavoriteRecipe, getFavoriteRecipes } = useAppStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("todas")
  const [activeTab, setActiveTab] = useState("todas")
  const router = useRouter()

  // Filtrar receitas baseado na busca e filtros
  const getFilteredRecipes = () => {
    let filtered = recipes

    // Aplicar busca se houver query
    if (searchQuery.trim()) {
      filtered = recipes.filter((recipe) => 
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Aplicar filtros por aba
    switch (activeTab) {
      case "favoritas":
        filtered = filtered.filter((recipe) => recipe.isFavorite)
        break
      case "criadas":
        // Como não temos campo isOwn, vamos considerar receitas criadas como aquelas que têm ID específico
        filtered = filtered.filter((recipe) => recipe.id.startsWith('user-'))
        break
      case "salvas":
        // Receitas salvas são as que não foram criadas pelo usuário
        filtered = filtered.filter((recipe) => !recipe.id.startsWith('user-'))
        break
      default:
        // "todas" - não filtrar
        break
    }

    // Aplicar filtros adicionais
    switch (filterType) {
      case "favoritas":
        filtered = filtered.filter((recipe) => recipe.isFavorite)
        break
      case "criadas":
        filtered = filtered.filter((recipe) => recipe.id.startsWith('user-'))
        break
      case "rapidas":
        filtered = filtered.filter((recipe) => {
          const totalTime = recipe.prepTime + recipe.cookTime
          return totalTime <= 30
        })
        break
      case "faceis":
        filtered = filtered.filter((recipe) => recipe.difficulty === "Fácil")
        break
      case "medias":
        filtered = filtered.filter((recipe) => recipe.difficulty === "Médio")
        break
      case "dificeis":
        filtered = filtered.filter((recipe) => recipe.difficulty === "Difícil")
        break
      default:
        // "todas" - não filtrar
        break
    }

    return filtered
  }

  const filteredRecipes = getFilteredRecipes()

  const handleEdit = (recipeId: string) => {
    router.push(`/editar-receita/${recipeId}`)
  }

  const handleDelete = (recipeId: string, recipeName: string) => {
    deleteRecipe(recipeId)
    toast.success(`Receita "${recipeName}" excluída com sucesso!`)
  }

  const handleShare = async (recipe: any) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: recipe.name,
          text: recipe.description,
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

  const handleRecipeClick = (recipeId: string) => {
    router.push(`/receita/${recipeId}`)
  }

  const getTabCount = (tab: string) => {
    switch (tab) {
      case "favoritas":
        return recipes.filter((recipe) => recipe.isFavorite).length
      case "criadas":
        return recipes.filter((recipe) => recipe.id.startsWith('user-')).length
      case "salvas":
        return recipes.filter((recipe) => !recipe.id.startsWith('user-')).length
      default:
        return recipes.length
    }
  }

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
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Receitas</SelectItem>
                <SelectItem value="favoritas">Favoritas</SelectItem>
                <SelectItem value="criadas">Criadas por Mim</SelectItem>
                <SelectItem value="rapidas">Rápidas (até 30min)</SelectItem>
                <SelectItem value="faceis">Fáceis</SelectItem>
                <SelectItem value="medias">Médias</SelectItem>
                <SelectItem value="dificeis">Difíceis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="todas">Todas ({getTabCount("todas")})</TabsTrigger>
            <TabsTrigger value="favoritas">Favoritas ({getTabCount("favoritas")})</TabsTrigger>
            <TabsTrigger value="criadas">Criadas por Mim ({getTabCount("criadas")})</TabsTrigger>
            <TabsTrigger value="salvas">Salvas ({getTabCount("salvas")})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredRecipes.length === 0 ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id}
                    title={recipe.name}
                    description={recipe.description}
                    image={recipe.image || "/placeholder.svg"}
                    time={`${recipe.prepTime + recipe.cookTime} min`}
                    difficulty={recipe.difficulty}
                    isFavorite={recipe.isFavorite}
                    isOwn={recipe.id.startsWith('user-')}
                    onEdit={() => handleEdit(recipe.id)}
                    onDelete={() => handleDelete(recipe.id, recipe.name)}
                    onShare={() => handleShare(recipe)}
                    onClick={() => handleRecipeClick(recipe.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface RecipeCardProps {
  id: string
  title: string
  description: string
  image: string
  time: string
  difficulty: string
  isFavorite: boolean
  isOwn: boolean
  onEdit?: () => void
  onDelete?: () => void
  onShare?: () => void
  onClick?: () => void
}

function RecipeCard({
  id,
  title,
  description,
  image,
  time,
  difficulty,
  isFavorite,
  isOwn,
  onEdit,
  onDelete,
  onShare,
  onClick,
}: RecipeCardProps) {
  const { toggleFavoriteRecipe } = useAppStore()
  const [favorite, setFavorite] = useState(isFavorite)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavoriteRecipe(id)
    setFavorite(!favorite)
    toast.success(favorite ? "Receita removida dos favoritos" : "Receita adicionada aos favoritos")
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <div className="cursor-pointer" onClick={onClick}>
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
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
            {isOwn && <Badge className="absolute bottom-2 left-2 bg-green-600 hover:bg-green-700">Minha Receita</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{time}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <ChefHat className="h-4 w-4 text-muted-foreground" />
                <span>{difficulty}</span>
              </div>
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
        {isOwn && (
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
                    Tem certeza que deseja excluir "{title}"? Esta ação não pode ser desfeita.
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
