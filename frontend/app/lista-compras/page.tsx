"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
// Update the import path below if your Button component is located elsewhere
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Checkbox } from "../../components/ui/checkbox"
import { Badge } from "../../components/ui/badge"
import { PlusCircle, Trash2, ShoppingCart, Check } from "lucide-react"

interface ShoppingItem {
  id: string
  name: string
  quantity: string
  category: string
  completed: boolean
  addedDate: string
}

export default function ListaComprasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [newItem, setNewItem] = useState("")
  const [newQuantity, setNewQuantity] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    // Simular carregamento da lista de compras
    const mockItems: ShoppingItem[] = [
      {
        id: "1",
        name: "Leite",
        quantity: "1L",
        category: "laticinios",
        completed: false,
        addedDate: "2024-01-15"
      },
      {
        id: "2",
        name: "Pão",
        quantity: "1 unidade",
        category: "cereais",
        completed: true,
        addedDate: "2024-01-14"
      },
      {
        id: "3",
        name: "Maçãs",
        quantity: "1kg",
        category: "frutas",
        completed: false,
        addedDate: "2024-01-15"
      },
      {
        id: "4",
        name: "Salmão",
        quantity: "400g",
        category: "proteina",
        completed: false,
        addedDate: "2024-01-15"
      },
      {
        id: "5",
        name: "Alface",
        quantity: "1 pé",
        category: "vegetal",
        completed: true,
        addedDate: "2024-01-13"
      }
    ]

    setTimeout(() => {
      setItems(mockItems)
      setLoading(false)
    }, 1000)
  }, [])

  const addItem = () => {
    if (newItem.trim() && newQuantity.trim()) {
      const item: ShoppingItem = {
        id: Date.now().toString(),
        name: newItem,
        quantity: newQuantity,
        category: "outros",
        completed: false,
        addedDate: new Date().toISOString().split('T')[0]
      }
      setItems([...items, item])
      setNewItem("")
      setNewQuantity("")
    }
  }

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const clearCompleted = () => {
    setItems(items.filter(item => !item.completed))
  }

  const categories = [
    { id: "laticinios", name: "Laticínios", color: "bg-blue-100 text-blue-800" },
    { id: "cereais", name: "Cereais", color: "bg-yellow-100 text-yellow-800" },
    { id: "frutas", name: "Frutas", color: "bg-green-100 text-green-800" },
    { id: "proteina", name: "Proteínas", color: "bg-red-100 text-red-800" },
    { id: "vegetal", name: "Vegetais", color: "bg-emerald-100 text-emerald-800" },
    { id: "outros", name: "Outros", color: "bg-gray-100 text-gray-800" }
  ]

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || categories[categories.length - 1]
  }

  const completedItems = items.filter(item => item.completed)
  const pendingItems = items.filter(item => !item.completed)

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando lista de compras...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Lista de Compras</h1>
            <p className="text-muted-foreground">
              Organize suas compras de forma inteligente
            </p>
          </div>
          <Button 
            onClick={() => router.push("/planeamento")}
            variant="outline"
          >
            Gerar do Planeamento
          </Button>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{items.length}</div>
              <div className="text-sm text-muted-foreground">Total de itens</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{pendingItems.length}</div>
              <div className="text-sm text-muted-foreground">Pendentes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{completedItems.length}</div>
              <div className="text-sm text-muted-foreground">Concluídos</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adicionar novo item */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Adicionar Item
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Nome do item"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
            />
            <Input
              placeholder="Quantidade"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
            />
            <Button 
              onClick={addItem} 
              className="w-full"
              disabled={!newItem.trim() || !newQuantity.trim()}
            >
              Adicionar à Lista
            </Button>
          </CardContent>
        </Card>

        {/* Lista de itens pendentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Itens Pendentes ({pendingItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingItems.length > 0 ? (
              <div className="space-y-3">
                {pendingItems.map((item) => {
                  const categoryInfo = getCategoryInfo(item.category)
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          <Badge variant="outline" className={`text-xs ${categoryInfo.color}`}>
                            {categoryInfo.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.quantity}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum item pendente na lista
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de itens concluídos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Concluídos ({completedItems.length})
              </div>
              {completedItems.length > 0 && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={clearCompleted}
                >
                  Limpar
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completedItems.length > 0 ? (
              <div className="space-y-3">
                {completedItems.map((item) => {
                  const categoryInfo = getCategoryInfo(item.category)
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg opacity-60">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium line-through">{item.name}</span>
                          <Badge variant="outline" className={`text-xs ${categoryInfo.color}`}>
                            {categoryInfo.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-through">{item.quantity}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum item concluído ainda
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Button variant="outline">
          📤 Exportar Lista
        </Button>
        <Button variant="outline">
          📱 Compartilhar
        </Button>
        <Button 
          onClick={() => router.push("/meu-frigorifico")}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          🔄 Adicionar ao Frigorífico
        </Button>
      </div>
    </div>
  )
}
