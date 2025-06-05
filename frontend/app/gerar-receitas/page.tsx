"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, RefreshCw, Clock, ChefHat, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"

export default function GerarReceitas() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedRecipes, setGeneratedRecipes] = useState<any[]>([])
  const { ingredients } = useAppStore()
  const router = useRouter()

  const generateRecipes = () => {
    setIsGenerating(true)

    // Simular geração de receitas baseada nos ingredientes
    setTimeout(() => {
      const mockRecipes = [
        {
          id: "gen-1",
          title: "Omelete Especial",
          description: "Uma omelete deliciosa com os ingredientes do seu frigorífico",
          image: "/placeholder.svg?height=192&width=384",
          time: "15 min",
          difficulty: "Fácil",
          ingredients: ingredients.slice(0, 3).map((ing) => ing.name),
          confidence: 95,
        },
        {
          id: "gen-2",
          title: "Salada Tropical",
          description: "Salada fresca e nutritiva",
          image: "/placeholder.svg?height=192&width=384",
          time: "10 min",
          difficulty: "Fácil",
          ingredients: ingredients.slice(1, 4).map((ing) => ing.name),
          confidence: 88,
        },
        {
          id: "gen-3",
          title: "Refogado Caseiro",
          description: "Prato quente e saboroso",
          image: "/placeholder.svg?height=192&width=384",
          time: "25 min",
          difficulty: "Médio",
          ingredients: ingredients.slice(0, 5).map((ing) => ing.name),
          confidence: 92,
        },
      ]

      setGeneratedRecipes(mockRecipes)
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Gerar Novas Receitas</h1>
            <p className="text-muted-foreground">IA criará receitas baseadas nos seus ingredientes</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Ingredientes Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {ingredients.map((ingredient) => (
                <Badge key={ingredient.id} variant="outline">
                  {ingredient.name}
                </Badge>
              ))}
            </div>
            {ingredients.length === 0 && (
              <p className="text-muted-foreground">
                Nenhum ingrediente cadastrado.
                <Link href="/adicionar-itens" className="text-green-600 hover:underline ml-1">
                  Adicione alguns ingredientes
                </Link>{" "}
                para gerar receitas personalizadas.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={generateRecipes}
            disabled={isGenerating || ingredients.length === 0}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Gerando receitas...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Receitas com IA
              </>
            )}
          </Button>
        </div>

        {generatedRecipes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Receitas Geradas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedRecipes.map((recipe) => (
                <Card key={recipe.id} className="overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image src={recipe.image || "/placeholder.svg"} alt={recipe.title} fill className="object-cover" />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-600">{recipe.confidence}% match</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{recipe.description}</p>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{recipe.time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <ChefHat className="h-4 w-4 text-muted-foreground" />
                        <span>{recipe.difficulty}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Ingredientes usados:</p>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.map((ingredient: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-4 pt-0 space-y-2">
                    <Button className="w-full bg-green-600 hover:bg-green-700">Ver Receita Completa</Button>
                    <Button variant="outline" className="w-full">
                      Salvar nos Favoritos
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
