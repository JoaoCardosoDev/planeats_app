"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { PlusCircle, Search, Edit, Trash2, Loader2 } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { pantryAPI, type PantryItemRead } from "@/lib/api/pantry"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function MeuFrigorifico() {
  const [pantryItems, setPantryItems] = useState<PantryItemRead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("todos")
  const [editingIngredient, setEditingIngredient] = useState<PantryItemRead | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Load pantry items from API
  useEffect(() => {
    loadPantryItems()
  }, [])

  const loadPantryItems = async () => {
    try {
      setLoading(true)
      const items = await pantryAPI.getPantryItems()
      setPantryItems(items)
    } catch (error) {
      console.error('Failed to load pantry items:', error)
      toast.error('Erro ao carregar itens da despensa')
    } finally {
      setLoading(false)
    }
  }

  // Get category from item name (simple categorization for now)
  const getItemCategory = (itemName: string): string => {
    const name = itemName.toLowerCase()
    if (name.includes('tomate') || name.includes('cebola') || name.includes('alface') || name.includes('cenoura')) return 'vegetais'
    if (name.includes('frango') || name.includes('carne') || name.includes('peixe') || name.includes('ovo')) return 'proteinas'
    if (name.includes('arroz') || name.includes('feijão') || name.includes('macarrão')) return 'graos'
    if (name.includes('leite') || name.includes('queijo') || name.includes('iogurte')) return 'laticinios'
    if (name.includes('sal') || name.includes('pimenta') || name.includes('alho')) return 'temperos'
    if (name.includes('maçã') || name.includes('banana') || name.includes('laranja')) return 'frutas'
    return 'outros'
  }

  // Filter items by category and search
  const getItemsByCategory = (category: string) => {
    if (category === 'todos') return pantryItems
    return pantryItems.filter(item => getItemCategory(item.item_name) === category)
  }

  const filteredIngredients = getItemsByCategory(activeTab).filter((item) =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDelete = async (id: number, name: string) => {
    try {
      await pantryAPI.deletePantryItem(id)
      setPantryItems(items => items.filter(item => item.id !== id))
      toast.success(`${name} removido do frigorífico`)
    } catch (error) {
      console.error('Failed to delete item:', error)
      toast.error('Erro ao remover item')
    }
  }

  const handleEdit = (item: PantryItemRead) => {
    setEditingIngredient({ ...item })
    setIsEditDialogOpen(true)
  }

  const handleUpdateIngredient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingIngredient) return

    try {
      const updatedItem = await pantryAPI.updatePantryItem(editingIngredient.id, {
        item_name: editingIngredient.item_name,
        quantity: editingIngredient.quantity,
        unit: editingIngredient.unit,
        expiration_date: editingIngredient.expiration_date,
        purchase_date: editingIngredient.purchase_date,
        calories_per_unit: editingIngredient.calories_per_unit,
      })
      
      setPantryItems(items => 
        items.map(item => item.id === updatedItem.id ? updatedItem : item)
      )
      
      toast.success("Ingrediente atualizado com sucesso!")
      setIsEditDialogOpen(false)
      setEditingIngredient(null)
    } catch (error) {
      console.error('Failed to update item:', error)
      toast.error('Erro ao atualizar ingrediente')
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      vegetais: "Vegetal",
      frutas: "Fruta",
      proteinas: "Proteína",
      graos: "Grãos",
      laticinios: "Laticínio",
      temperos: "Tempero",
      outros: "Outros",
    }
    return labels[category] || category
  }

  const getCategoryCount = (category: string) => {
    return getItemsByCategory(category).length
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="mt-2 text-muted-foreground">Carregando ingredientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-green-700">Meu Frigorífico</h1>
          <p className="text-green-600">Gerencie os ingredientes disponíveis em sua casa</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
            <Input
              placeholder="Buscar ingredientes..."
              className="pl-9 border-green-200 focus:border-green-400 focus:ring-green-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-green-600 hover:bg-green-700 shadow-md">
              <Link href="/adicionar-itens">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Ingredientes
              </Link>
            </Button>
            <Button variant="outline" asChild className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800">
              <Link href="/receitas-sugeridas">Ver Receitas</Link>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 bg-green-50 border border-green-200">
            <TabsTrigger value="todos" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Todos ({pantryItems.length})</TabsTrigger>
            <TabsTrigger value="vegetais" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Vegetais ({getCategoryCount("vegetais")})</TabsTrigger>
            <TabsTrigger value="proteinas" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Proteínas ({getCategoryCount("proteinas")})</TabsTrigger>
            <TabsTrigger value="graos" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Grãos ({getCategoryCount("graos")})</TabsTrigger>
            <TabsTrigger value="laticinios">Laticínios ({getCategoryCount("laticinios")})</TabsTrigger>
            <TabsTrigger value="temperos">Temperos ({getCategoryCount("temperos")})</TabsTrigger>
            <TabsTrigger value="frutas">Frutas ({getCategoryCount("frutas")})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredIngredients.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? `Nenhum ingrediente encontrado com "${searchQuery}"`
                      : "Nenhum ingrediente cadastrado nesta categoria"}
                  </p>
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link href="/adicionar-itens">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Adicionar Primeiro Ingrediente
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIngredients.map((ingredient) => (
                  <Card key={ingredient.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center">
                        <div className="relative h-24 w-24 shrink-0">
                          <Image
                            src={`/images/ingredients/${ingredient.item_name.toLowerCase()}.jpg`}
                            alt={ingredient.item_name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=96&width=96"
                            }}
                          />
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{ingredient.item_name}</h3>
                              <p className="text-sm text-muted-foreground">{ingredient.quantity} {ingredient.unit}</p>
                              <Badge variant="outline" className="mt-1">
                                {getCategoryLabel(getItemCategory(ingredient.item_name))}
                              </Badge>
                              {ingredient.expiration_date && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Vence: {new Date(ingredient.expiration_date).toLocaleDateString("pt-BR")}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(ingredient)}>
                                <Edit className="h-4 w-4" />
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remover ingrediente</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja remover "{ingredient.item_name}" do seu frigorífico? Esta ação
                                      não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(ingredient.id, ingredient.item_name)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Remover
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Ingrediente</DialogTitle>
              <DialogDescription>Faça alterações no seu ingrediente aqui.</DialogDescription>
            </DialogHeader>
            {editingIngredient && (
              <form onSubmit={handleUpdateIngredient}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nome</Label>
                    <Input
                      id="edit-name"
                      value={editingIngredient.item_name}
                      onChange={(e) =>
                        setEditingIngredient({
                          ...editingIngredient,
                          item_name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-quantity">Quantidade</Label>
                    <Input
                      id="edit-quantity"
                      type="number"
                      value={editingIngredient.quantity}
                      onChange={(e) =>
                        setEditingIngredient({
                          ...editingIngredient,
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-unit">Unidade</Label>
                    <Input
                      id="edit-unit"
                      value={editingIngredient.unit}
                      onChange={(e) =>
                        setEditingIngredient({
                          ...editingIngredient,
                          unit: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-expiry">Data de Validade</Label>
                    <Input
                      id="edit-expiry"
                      type="date"
                      value={editingIngredient.expiration_date ? editingIngredient.expiration_date.split("T")[0] : ""}
                      onChange={(e) =>
                        setEditingIngredient({
                          ...editingIngredient,
                          expiration_date: e.target.value || undefined,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Salvar alterações
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
