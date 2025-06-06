"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Clock, ChefHat, Search, Filter, Heart, BookmarkPlus, Star } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
import { useRouter } from "next/navigation"

export default function Explorar() {
  const [showFilters, setShowFilters] = useState(false)
  const [displayedRecipes, setDisplayedRecipes] = useState(9)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const recipes = [
    {
      id: "1",
      title: "Arroz de Frango",
      description: "Um prato completo de arroz com frango e legumes.",
      image: "/placeholder.svg?height=192&width=384",
      time: "40 min",
      difficulty: "Médio",
      rating: 4.8,
      reviews: 124,
    },
    {
      id: "2",
      title: "Salada de Tomate com Queijo",
      description: "Uma salada fresca e rápida de preparar.",
      image: "/placeholder.svg?height=192&width=384",
      time: "10 min",
      difficulty: "Fácil",
      rating: 4.5,
      reviews: 87,
    },
    {
      id: "3",
      title: "Omelete de Tomate e Cebola",
      description: "Um omelete simples e delicioso com tomate e cebola.",
      image: "/placeholder.svg?height=192&width=384",
      time: "15 min",
      difficulty: "Fácil",
      rating: 4.7,
      reviews: 156,
    },
    {
      id: "4",
      title: "Sopa de Legumes",
      description: "Uma sopa nutritiva com os legumes da sua geladeira.",
      image: "/placeholder.svg?height=192&width=384",
      time: "30 min",
      difficulty: "Fácil",
      rating: 4.3,
      reviews: 92,
    },
    {
      id: "5",
      title: "Macarrão ao Molho Branco",
      description: "Um macarrão cremoso com molho branco e queijo.",
      image: "/placeholder.svg?height=192&width=384",
      time: "25 min",
      difficulty: "Médio",
      rating: 4.6,
      reviews: 108,
    },
    {
      id: "6",
      title: "Bolo de Cenoura",
      description: "Um bolo fofinho de cenoura com cobertura de chocolate.",
      image: "/placeholder.svg?height=192&width=384",
      time: "50 min",
      difficulty: "Médio",
      rating: 4.9,
      reviews: 203,
    },
    {
      id: "7",
      title: "Risoto de Cogumelos",
      description: "Um risoto cremoso com cogumelos frescos.",
      image: "/placeholder.svg?height=192&width=384",
      time: "45 min",
      difficulty: "Médio",
      rating: 4.7,
      reviews: 132,
    },
    {
      id: "8",
      title: "Panquecas de Banana",
      description: "Panquecas fofas e saudáveis com banana.",
      image: "/placeholder.svg?height=192&width=384",
      time: "20 min",
      difficulty: "Fácil",
      rating: 4.4,
      reviews: 76,
    },
    {
      id: "9",
      title: "Frango Assado com Batatas",
      description: "Frango assado suculento com batatas douradas.",
      image: "/placeholder.svg?height=192&width=384",
      time: "60 min",
      difficulty: "Médio",
      rating: 4.8,
      reviews: 167,
    },
    {
      id: "10",
      title: "Frango a parmegiana",
      description: "Frango ao molho de tomate e queijo.",
      image: "/placeholder.svg?height=192&width=384",
      time: "60 min",
      difficulty: "Médio",
      rating: 4.8,
      reviews: 167,
    },
    {
      id: "11",
      title: "Pudim de leite condensado",
      description: "Pudinzinho cremoso.",
      image: "/placeholder.svg?height=192&width=384",
      time: "60 min",
      difficulty: "Médio",
      rating: 4.8,
      reviews: 167,
    },
    {
      id: "12",
      title: "Mousse de maracujá",
      description: "Mousse gostosinho.",
      image: "/placeholder.svg?height=192&width=384",
      time: "60 min",
      difficulty: "Médio",
      rating: 4.8,
      reviews: 167,
    },
  ]

  const loadMoreRecipes = () => {
    setIsLoading(true)
    setTimeout(() => {
      setDisplayedRecipes((prev) => prev + 6)
      setIsLoading(false)
    }, 1000)
  }

  const handleRecipeClick = (recipeId: string) => {
    router.push(`/receita/${recipeId}`)
  }

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
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                  <SheetDescription>Refine sua busca por receitas</SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Tempo de Preparo</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-xs">Rápido</span>
                        <span className="text-xs">Demorado</span>
                      </div>
                      <Slider defaultValue={[50]} max={120} step={5} />
                      <div className="text-center text-xs text-muted-foreground">Até 60 minutos</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Dificuldade</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="difficulty-easy" />
                        <Label htmlFor="difficulty-easy">Fácil</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="difficulty-medium" />
                        <Label htmlFor="difficulty-medium">Médio</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="difficulty-hard" />
                        <Label htmlFor="difficulty-hard">Difícil</Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Categorias</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="category-breakfast" />
                        <Label htmlFor="category-breakfast">Café da Manhã</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="category-lunch" />
                        <Label htmlFor="category-lunch">Almoço</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="category-dinner" />
                        <Label htmlFor="category-dinner">Jantar</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="category-dessert" />
                        <Label htmlFor="category-dessert">Sobremesa</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="category-snack" />
                        <Label htmlFor="category-snack">Lanche</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="category-vegetarian" />
                        <Label htmlFor="category-vegetarian">Vegetariano</Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Ingredientes</h3>
                    <div className="space-y-2">
                      <Input placeholder="Adicionar ingrediente" />
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Frango
                          <button className="ml-1 h-3 w-3 rounded-full bg-muted-foreground/30 text-muted-foreground">
                            ×
                          </button>
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Arroz
                          <button className="ml-1 h-3 w-3 rounded-full bg-muted-foreground/30 text-muted-foreground">
                            ×
                          </button>
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Tomate
                          <button className="ml-1 h-3 w-3 rounded-full bg-muted-foreground/30 text-muted-foreground">
                            ×
                          </button>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="outline">Limpar Filtros</Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button className="bg-green-600 hover:bg-green-700">Aplicar Filtros</Button>
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

        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="populares">Populares</TabsTrigger>
            <TabsTrigger value="saudaveis">Saudáveis</TabsTrigger>
            <TabsTrigger value="rapidas">Rápidas</TabsTrigger>
            <TabsTrigger value="sobremesas">Sobremesas</TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.slice(0, displayedRecipes).map((recipe) => (
                <ExploreRecipeCard key={recipe.id} {...recipe} onClick={() => handleRecipeClick(recipe.id)} />
              ))}
            </div>

            {displayedRecipes < recipes.length && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" size="lg" onClick={loadMoreRecipes} disabled={isLoading}>
                  {isLoading ? "Carregando..." : "Carregar Mais Receitas"}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Outros conteúdos de abas aqui */}
          <TabsContent value="populares" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Receita 6 */}
              <ExploreRecipeCard
                id="6"
                title="Bolo de Cenoura"
                description="Um bolo fofinho de cenoura com cobertura de chocolate."
                image="/placeholder.svg?height=192&width=384"
                time="50 min"
                difficulty="Médio"
                rating={4.9}
                reviews={203}
                onClick={() => handleRecipeClick("6")}
              />

              {/* Receita 1 */}
              <ExploreRecipeCard
                id="1"
                title="Arroz de Frango"
                description="Um prato completo de arroz com frango e legumes."
                image="/placeholder.svg?height=192&width=384"
                time="40 min"
                difficulty="Médio"
                rating={4.8}
                reviews={124}
                onClick={() => handleRecipeClick("1")}
              />

              {/* Receita 9 */}
              <ExploreRecipeCard
                id="9"
                title="Frango Assado com Batatas"
                description="Frango assado suculento com batatas douradas."
                image="/placeholder.svg?height=192&width=384"
                time="60 min"
                difficulty="Médio"
                rating={4.8}
                reviews={167}
                onClick={() => handleRecipeClick("9")}
              />
            </div>
          </TabsContent>
        </Tabs>
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
  rating: number
  reviews: number
  onClick?: () => void
}

function ExploreRecipeCard({
  id,
  title,
  description,
  image,
  time,
  difficulty,
  rating,
  reviews,
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
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.floor(rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-xs text-muted-foreground">({reviews})</span>
          </div>
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
