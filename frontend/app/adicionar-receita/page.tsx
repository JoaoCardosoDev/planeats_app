"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, X, Upload } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { recipeAPI, CreateRecipeRequest, CreateRecipeIngredient } from "@/lib/api/recipes"

interface IngredientInput {
  name: string
  quantity: string
  unit: string
}

export default function AdicionarReceita() {
  const [formData, setFormData] = useState({
    recipe_name: "",
    instructions: "",
    estimated_calories: "",
    preparation_time_minutes: "",
    image_url: "",
    cuisine_type: "",
    difficulty_level: "",
    serving_size: "",
  })
  const [ingredients, setIngredients] = useState<IngredientInput[]>([])
  const [newIngredient, setNewIngredient] = useState<IngredientInput>({
    name: "",
    quantity: "",
    unit: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const addIngredient = () => {
    if (newIngredient.name.trim() && newIngredient.quantity.trim() && newIngredient.unit.trim()) {
      setIngredients([...ingredients, { ...newIngredient }])
      setNewIngredient({ name: "", quantity: "", unit: "" })
    } else {
      toast.error("Por favor, preencha nome, quantidade e unidade do ingrediente")
    }
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Simular upload de imagem - em produção seria feito upload para um servidor
      const imageUrl = URL.createObjectURL(file)
      setFormData({ ...formData, image_url: imageUrl })
      toast.success("Imagem carregada com sucesso!")
    }
  }

  const parseTimeInput = (timeStr: string): number | undefined => {
    if (!timeStr.trim()) return undefined
    
    // Parse various time formats: "30", "30 min", "1h 30min", "1.5h", etc.
    const timeRegex = /(\d+(?:\.\d+)?)\s*(h|hora|horas|m|min|minuto|minutos)?/gi
    const matches = [...timeStr.matchAll(timeRegex)]
    
    let totalMinutes = 0
    for (const match of matches) {
      const value = parseFloat(match[1])
      const unit = match[2]?.toLowerCase()
      
      if (unit && (unit.startsWith('h') || unit === 'hora' || unit === 'horas')) {
        totalMinutes += value * 60
      } else {
        totalMinutes += value
      }
    }
    
    return totalMinutes > 0 ? Math.round(totalMinutes) : undefined
  }

  const parseQuantity = (quantityStr: string): number => {
    // Parse quantity: "2", "1.5", "1/2", etc.
    if (quantityStr.includes('/')) {
      const [num, den] = quantityStr.split('/')
      return parseFloat(num) / parseFloat(den)
    }
    return parseFloat(quantityStr) || 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.recipe_name.trim() || !formData.instructions.trim() || ingredients.length === 0) {
      toast.error("Por favor, preencha nome da receita, instruções e adicione pelo menos um ingrediente")
      return
    }

    setIsLoading(true)

    try {
      // Convert ingredients to API format
      const apiIngredients: CreateRecipeIngredient[] = ingredients.map(ing => ({
        ingredient_name: ing.name,
        required_quantity: parseQuantity(ing.quantity),
        required_unit: ing.unit
      }))

      // Prepare recipe data for API
      const recipeData: CreateRecipeRequest = {
        recipe_name: formData.recipe_name,
        instructions: formData.instructions,
        ingredients: apiIngredients,
        estimated_calories: formData.estimated_calories ? parseInt(formData.estimated_calories) : undefined,
        preparation_time_minutes: parseTimeInput(formData.preparation_time_minutes),
        image_url: formData.image_url || undefined,
        cuisine_type: formData.cuisine_type || undefined,
        difficulty_level: formData.difficulty_level || undefined,
        serving_size: formData.serving_size ? parseInt(formData.serving_size) : undefined,
      }

      console.log('Creating recipe with data:', recipeData)

      const newRecipe = await recipeAPI.createRecipe(recipeData)
      
      toast.success("Receita criada com sucesso!")
      router.push(`/receita/${newRecipe.id}`)
    } catch (error) {
      console.error('Error creating recipe:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar receita'
      toast.error('Erro ao criar receita', {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Adicionar Nova Receita</h1>
            <p className="text-muted-foreground">Compartilhe sua receita com a comunidade</p>
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
                    <Label htmlFor="recipe_name">Nome da Receita *</Label>
                    <Input
                      id="recipe_name"
                      placeholder="Ex: Arroz de Frango"
                      value={formData.recipe_name}
                      onChange={(e) => setFormData({ ...formData, recipe_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instruções *</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Descreva o modo de preparo da receita, passo a passo..."
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preparation_time_minutes">Tempo de Preparo</Label>
                      <Input
                        id="preparation_time_minutes"
                        placeholder="Ex: 40 min, 1h 30min"
                        value={formData.preparation_time_minutes}
                        onChange={(e) => setFormData({ ...formData, preparation_time_minutes: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimated_calories">Calorias</Label>
                      <Input
                        id="estimated_calories"
                        type="number"
                        placeholder="Ex: 350"
                        value={formData.estimated_calories}
                        onChange={(e) => setFormData({ ...formData, estimated_calories: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serving_size">Porções</Label>
                      <Input
                        id="serving_size"
                        type="number"
                        placeholder="Ex: 4"
                        value={formData.serving_size}
                        onChange={(e) => setFormData({ ...formData, serving_size: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty_level">Dificuldade</Label>
                      <Select
                        value={formData.difficulty_level}
                        onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Fácil</SelectItem>
                          <SelectItem value="medium">Médio</SelectItem>
                          <SelectItem value="hard">Difícil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cuisine_type">Tipo de Cozinha</Label>
                    <Select
                      value={formData.cuisine_type}
                      onValueChange={(value) => setFormData({ ...formData, cuisine_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de cozinha" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portuguese">Portuguesa</SelectItem>
                        <SelectItem value="italian">Italiana</SelectItem>
                        <SelectItem value="asian">Asiática</SelectItem>
                        <SelectItem value="mexican">Mexicana</SelectItem>
                        <SelectItem value="indian">Indiana</SelectItem>
                        <SelectItem value="french">Francesa</SelectItem>
                        <SelectItem value="mediterranean">Mediterrânea</SelectItem>
                        <SelectItem value="brazilian">Brasileira</SelectItem>
                        <SelectItem value="international">Internacional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Ingredientes */}
              <Card>
                <CardHeader>
                  <CardTitle>Ingredientes *</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <Input
                      placeholder="Nome do ingrediente"
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                    />
                    <Input
                      placeholder="Quantidade"
                      value={newIngredient.quantity}
                      onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                    />
                    <Input
                      placeholder="Unidade"
                      value={newIngredient.unit}
                      onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                    />
                    <Button type="button" onClick={addIngredient}>
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
                        <span>
                          {ingredient.quantity} {ingredient.unit} de {ingredient.name}
                        </span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeIngredient(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {ingredients.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        Nenhum ingrediente adicionado ainda
                      </p>
                    )}
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
                    {formData.image_url && (
                      <div className="relative h-32 w-full rounded-lg overflow-hidden">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
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
                  <p>• Use unidades padrão: xícaras, colheres, gramas, etc.</p>
                  <p>• Indique o tempo total incluindo preparo e cozimento</p>
                </CardContent>
              </Card>

              {/* Preview dos dados */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Ingredientes:</strong> {ingredients.length}</p>
                  {formData.preparation_time_minutes && (
                    <p><strong>Tempo:</strong> {formData.preparation_time_minutes}</p>
                  )}
                  {formData.estimated_calories && (
                    <p><strong>Calorias:</strong> {formData.estimated_calories} kcal</p>
                  )}
                  {formData.serving_size && (
                    <p><strong>Porções:</strong> {formData.serving_size} pessoas</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Publicar Receita"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
