"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, X, Upload } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAppStore, type Recipe } from "@/lib/store"
import { toast } from "sonner"

export default function EditarReceita() {
  const { id } = useParams()
  const { recipes, updateRecipe } = useAppStore()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    time: "",
    difficulty: "",
    category: "",
    image: "",
  })
  const [ingredients, setIngredients] = useState<Array<{name: string, quantity: string, unit: string}>>([])
  const [newIngredient, setNewIngredient] = useState("")
  const [instructions, setInstructions] = useState<string[]>([])
  const [newInstruction, setNewInstruction] = useState("")

  useEffect(() => {
    // Buscar a receita pelo ID
    const foundRecipe = recipes.find(r => r.id === id)
    if (foundRecipe) {
      setRecipe(foundRecipe)
      setFormData({
        title: foundRecipe.name,
        description: foundRecipe.description,
        time: foundRecipe.prepTime.toString(),
        difficulty: foundRecipe.difficulty,
        category: foundRecipe.category,
        image: foundRecipe.image || "",
      })
      setIngredients([...foundRecipe.ingredients])
      setInstructions([...foundRecipe.instructions])
    } else {
      toast.error("Receita não encontrada")
      router.push("/minhas-receitas")
    }
  }, [id, recipes, router])

  const addIngredient = () => {
    if (newIngredient.trim()) {
      // Parse o ingrediente para extrair quantidade, unidade e nome
      const parts = newIngredient.trim().split(' ')
      const quantity = parts[0] || '1'
      const unit = parts[1] || 'unidade'
      const name = parts.slice(2).join(' ') || newIngredient.trim()
      
      setIngredients([...ingredients, { name, quantity, unit }])
      setNewIngredient("")
    }
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const addInstruction = () => {
    if (newInstruction.trim()) {
      setInstructions([...instructions, newInstruction.trim()])
      setNewInstruction("")
    }
  }

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Simular upload de imagem
      const imageUrl = URL.createObjectURL(file)
      setFormData({ ...formData, image: imageUrl })
      toast.success("Imagem carregada com sucesso!")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || ingredients.length === 0 || instructions.length === 0) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
      return
    }

    setIsLoading(true)

    try {
      updateRecipe(id as string, {
        name: formData.title,
        description: formData.description,
        image: formData.image,
        prepTime: parseInt(formData.time) || 0,
        cookTime: 0,
        servings: 1,
        difficulty: formData.difficulty as 'Fácil' | 'Médio' | 'Difícil',
        category: formData.category,
        ingredients,
        instructions,
        tags: [],
        createdAt: new Date().toISOString(),
        isFavorite: false,
      })

      toast.success("Receita atualizada com sucesso!")
      router.push("/minhas-receitas")
    } catch {
      toast.error("Erro ao atualizar receita")
    } finally {
      setIsLoading(false)
    }
  }

  if (!recipe) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <p>Carregando receita...</p>
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
          <div>
            <h1 className="text-3xl font-bold">Editar Receita</h1>
            <p className="text-muted-foreground">Atualize sua receita</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Informações básicas */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Nome da Receita *</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Arroz de Frango"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      placeholder="Breve descrição da receita"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="time">Tempo de Preparo</Label>
                      <Input
                        id="time"
                        placeholder="Ex: 40 min"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Dificuldade</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fácil">Fácil</SelectItem>
                          <SelectItem value="Médio">Médio</SelectItem>
                          <SelectItem value="Difícil">Difícil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Café da Manhã">Café da Manhã</SelectItem>
                          <SelectItem value="Almoço">Almoço</SelectItem>
                          <SelectItem value="Jantar">Jantar</SelectItem>
                          <SelectItem value="Sobremesa">Sobremesa</SelectItem>
                          <SelectItem value="Lanche">Lanche</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ingredientes */}
              <Card>
                <CardHeader>
                  <CardTitle>Ingredientes *</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ex: 2 xícaras de arroz"
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
                    />
                    <Button type="button" onClick={addIngredient}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span>{ingredient.quantity} {ingredient.unit} de {ingredient.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeIngredient(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Modo de preparo */}
              <Card>
                <CardHeader>
                  <CardTitle>Modo de Preparo *</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Descreva um passo do preparo"
                      value={newInstruction}
                      onChange={(e) => setNewInstruction(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button type="button" onClick={addInstruction} className="self-start">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-3 p-3 bg-muted rounded">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 font-semibold text-sm shrink-0">
                          {index + 1}
                        </div>
                        <span className="flex-1">{instruction}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeInstruction(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upload de imagem */}
              <Card>
                <CardHeader>
                  <CardTitle>Imagem da Receita</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {formData.image && (
                      <div className="relative h-32 w-full rounded-lg overflow-hidden">
                        <Image
                          src={formData.image || "/placeholder.svg"}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Clique para enviar</span>
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG ou JPEG</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dicas */}
              <Card>
                <CardHeader>
                  <CardTitle>Dicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>• Seja específico nas quantidades dos ingredientes</p>
                  <p>• Descreva cada passo de forma clara e objetiva</p>
                  <p>• Adicione uma foto atrativa da receita pronta</p>
                  <p>• Inclua dicas especiais ou variações da receita</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}