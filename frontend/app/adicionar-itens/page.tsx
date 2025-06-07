"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { pantryAPI } from "@/lib/api/pantry"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type CategoryType = 'vegetais' | 'frutas' | 'proteinas' | 'graos' | 'laticinios' | 'temperos' | 'outros'

const commonIngredients = [
  { name: "Tomate", category: "vegetais" as CategoryType },
  { name: "Cebola", category: "vegetais" as CategoryType },
  { name: "Alho", category: "temperos" as CategoryType },
  { name: "Batata", category: "vegetais" as CategoryType },
  { name: "Cenoura", category: "vegetais" as CategoryType },
  { name: "Frango", category: "proteinas" as CategoryType },
  { name: "Carne Moída", category: "proteinas" as CategoryType },
  { name: "Arroz", category: "graos" as CategoryType },
  { name: "Feijão", category: "graos" as CategoryType },
  { name: "Leite", category: "laticinios" as CategoryType },
  { name: "Queijo", category: "laticinios" as CategoryType },
  { name: "Ovos", category: "proteinas" as CategoryType },
  { name: "Pão", category: "graos" as CategoryType },
  { name: "Maçã", category: "frutas" as CategoryType },
  { name: "Banana", category: "frutas" as CategoryType },
]

export default function AdicionarItens() {
  const [name, setName] = useState("")
  const [category, setCategory] = useState<CategoryType | "">("")
  const [quantityValue, setQuantityValue] = useState("")
  const [unit, setUnit] = useState("unidades")
  const [date, setDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(false)
  const [recentIngredients, setRecentIngredients] = useState<any[]>([])

  const router = useRouter()

  // Load recent ingredients on mount
  useEffect(() => {
    loadRecentIngredients()
  }, [])

  const loadRecentIngredients = async () => {
    try {
      const items = await pantryAPI.getPantryItems(0, 5)
      setRecentIngredients(items.reverse()) // Show most recent first
    } catch (error) {
      console.error('Failed to load recent ingredients:', error)
    }
  }

  // Wrapper para setCategory que aceita string
  const handleCategoryChange = (value: string) => {
    setCategory(value as CategoryType | "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !category || !quantityValue) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
      return
    }

    setIsLoading(true)

    try {
      // Parse quantity as number, extract unit if present
      const quantityNum = parseFloat(quantityValue) || 1
      
      await pantryAPI.createPantryItem({
        item_name: name,
        quantity: quantityNum,
        unit: unit,
        expiration_date: date ? date.toISOString().split('T')[0] : undefined, // Format as YYYY-MM-DD
        purchase_date: new Date().toISOString().split('T')[0], // Today's date
      })

      toast.success("Ingrediente adicionado com sucesso!")

      // Reset form
      setName("")
      setCategory("")
      setQuantityValue("")
      setUnit("unidades")
      setDate(undefined)

      // Reload recent ingredients
      loadRecentIngredients()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao adicionar ingrediente"
      toast.error("Erro ao adicionar ingrediente", {
        description: errorMessage
      })
      console.error("Error adding pantry item:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAdd = (ingredient: { name: string; category: string }) => {
    setName(ingredient.name)
    setCategory(ingredient.category as CategoryType)
  }

  // 100 dicas sobre organização de frigorífico e culinária
  const [currentTip, setCurrentTip] = useState(0)

  const tips = [
    "Adicionar detalhes como categoria e data de validade ajuda a organizar melhor seu frigorífico e evitar desperdícios.",
    "Você pode adicionar vários ingredientes de uma vez usando os ingredientes comuns.",
    "Mantenha sempre os ingredientes mais antigos na frente para usar primeiro.",
    "Congele ingredientes que estão próximos do vencimento para usar depois.",
    "Organize por categorias para encontrar ingredientes mais rapidamente.",
    "Verifique regularmente as datas de validade para evitar desperdícios.",
    "Armazene frutas e vegetais em locais apropriados para prolongar sua vida útil.",
    "Use recipientes herméticos para manter alimentos frescos por mais tempo.",
    "Etiquete tudo com datas para facilitar o controle de validade.",
    "Mantenha uma lista de compras baseada no que está acabando.",
    "Lave frutas e vegetais apenas antes de consumir para evitar deterioração.",
    "Separe alimentos que liberam etileno (como bananas) de outros vegetais.",
    "Use a regra 'primeiro que entra, primeiro que sai' para rotacionar estoque.",
    "Congele ervas frescas em cubos de gelo com azeite para preservar sabor.",
    "Armazene batatas em local escuro e seco, longe de cebolas.",
    "Mantenha ovos na geladeira, preferencialmente na embalagem original.",
    "Use recipientes transparentes para visualizar melhor o conteúdo.",
    "Limpe a geladeira regularmente para evitar contaminação cruzada.",
    "Ajuste a temperatura da geladeira entre 1°C e 4°C para conservação ideal.",
    "Não sobrecarregue a geladeira para permitir circulação de ar.",
    "Armazene carnes cruas na parte mais fria da geladeira.",
    "Use sacos perfurados para vegetais que precisam respirar.",
    "Mantenha alimentos cozidos separados dos crus.",
    "Descongele alimentos na geladeira, não em temperatura ambiente.",
    "Use papel toalha para absorver umidade excessiva de vegetais.",
    "Armazene pães em local seco ou congele para uso posterior.",
    "Mantenha temperos secos em recipientes herméticos.",
    "Use a técnica de branqueamento antes de congelar vegetais.",
    "Armazene queijos em papel manteiga, não em plástico.",
    "Mantenha frutas cítricas em temperatura ambiente até amadurecer.",
    "Use recipientes de vidro para armazenar sobras.",
    "Congele caldos em formas de gelo para porções individuais.",
    "Armazene azeite em local escuro para preservar qualidade.",
    "Use sachês de sílica gel para manter alimentos secos crocantes.",
    "Mantenha alimentos fermentados em temperatura constante.",
    "Use filme plástico diretamente sobre alimentos para evitar oxidação.",
    "Armazene nozes e sementes na geladeira para prolongar vida útil.",
    "Mantenha mel em temperatura ambiente, nunca na geladeira.",
    "Use recipientes com divisórias para organizar pequenos itens.",
    "Congele frutas maduras para usar em smoothies depois.",
    "Armazene vinagres em local fresco e escuro.",
    "Use etiquetas coloridas para diferentes categorias de alimentos.",
    "Mantenha um termômetro na geladeira para monitorar temperatura.",
    "Armazene alimentos em porções familiares para facilitar uso.",
    "Use a técnica de vácuo para prolongar vida útil de carnes.",
    "Mantenha especiarias inteiras, moa apenas quando usar.",
    "Armazene farinhas em recipientes herméticos para evitar pragas.",
    "Use papel alumínio para acelerar amadurecimento de frutas.",
    "Mantenha alimentos ácidos longe de recipientes metálicos.",
    "Use bandejas organizadoras para maximizar espaço na geladeira.",
    "Congele sobras em porções individuais para refeições rápidas.",
    "Armazene vegetais de folhas em sacos com papel toalha.",
    "Use recipientes empilháveis para otimizar espaço.",
    "Mantenha um inventário atualizado do que tem em casa.",
    "Armazene alimentos secos em local fresco e seco.",
    "Use a regra dos 2 dias para sobras na geladeira.",
    "Congele pães fatiados para uso individual.",
    "Armazene tomates em temperatura ambiente para melhor sabor.",
    "Use recipientes com tampa hermética para evitar odores.",
    "Mantenha alimentos crus na parte inferior da geladeira.",
    "Use papel pergaminho para separar camadas de alimentos congelados.",
    "Armazene cebolas em local ventilado, longe da luz.",
    "Mantenha um kit de primeiros socorros culinário sempre à mão.",
    "Use técnicas de marinada para prolongar sabor de carnes.",
    "Armazene grãos em recipientes com tampa rosqueável.",
    "Mantenha facas afiadas para cortes mais limpos e seguros.",
    "Use tábuas de corte separadas para carnes e vegetais.",
    "Armazene óleos de cozinha longe do fogão.",
    "Mantenha um estoque básico de temperos essenciais.",
    "Use timer para não esquecer alimentos no fogo.",
    "Armazene utensílios de cozinha em locais de fácil acesso.",
    "Mantenha a cozinha sempre limpa durante o preparo.",
    "Use recipientes medidores para porções exatas.",
    "Armazene panelas e frigideiras em ordem de uso frequente.",
    "Mantenha um caderno de receitas favoritas.",
    "Use técnicas de mise en place antes de cozinhar.",
    "Armazene ingredientes secos em potes transparentes.",
    "Mantenha sempre água filtrada disponível.",
    "Use aventais para proteger roupas durante o cozimento.",
    "Armazene pratos e utensílios em altura adequada.",
    "Mantenha um extintor de incêndio na cozinha.",
    "Use luvas descartáveis ao manusear carnes cruas.",
    "Armazene produtos de limpeza longe de alimentos.",
    "Mantenha sempre um kit básico de temperos.",
    "Use recipientes com medidas para facilitar receitas.",
    "Armazene alimentos em temperatura adequada sempre.",
    "Mantenha a bancada sempre limpa e organizada.",
    "Use técnicas de conservação adequadas para cada alimento.",
    "Armazene utensílios cortantes em local seguro.",
    "Mantenha sempre ingredientes básicos em estoque.",
    "Use etiquetas com datas em todos os alimentos armazenados.",
    "Armazene alimentos congelados em temperatura constante.",
    "Mantenha um planejamento semanal de refeições.",
    "Use recipientes adequados para cada tipo de alimento.",
    "Armazene temperos frescos adequadamente.",
    "Mantenha sempre uma lista de compras atualizada.",
    "Use técnicas de aproveitamento integral dos alimentos.",
    "Armazene sobras de forma segura e identificada.",
    "Mantenha a higiene sempre em primeiro lugar.",
    "Use utensílios adequados para cada preparação.",
    "Armazene alimentos respeitando suas características.",
    "Mantenha sempre água limpa disponível para cozinhar.",
    "Use técnicas de cocção adequadas para cada ingrediente.",
    "Armazene alimentos em recipientes do tamanho certo.",
    "Mantenha sempre um estoque mínimo de emergência.",
    "Use rótulos claros para identificar conteúdos.",
    "Armazene alimentos longe de fontes de calor.",
    "Mantenha sempre utensílios limpos e secos.",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Adicionar Ingredientes</h1>
          <p className="text-muted-foreground">Adicione os ingredientes disponíveis em sua casa</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Novo Ingrediente</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Preencha os detalhes do ingrediente que deseja adicionar
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome-ingrediente">Nome do Ingrediente *</Label>
                    <Input
                      id="nome-ingrediente"
                      placeholder="Ex: Tomate, Frango, Arroz..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria *</Label>
                      <Select value={category} onValueChange={handleCategoryChange} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vegetais">Vegetais</SelectItem>
                          <SelectItem value="frutas">Frutas</SelectItem>
                          <SelectItem value="proteinas">Proteínas</SelectItem>
                          <SelectItem value="graos">Grãos</SelectItem>
                          <SelectItem value="laticinios">Laticínios</SelectItem>
                          <SelectItem value="temperos">Temperos</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantidade">Quantidade *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="quantidade"
                          placeholder="Ex: 500, 2, 1..."
                          value={quantityValue}
                          onChange={(e) => setQuantityValue(e.target.value)}
                          type="number"
                          step="0.1"
                          min="0"
                          required
                          className="flex-1"
                        />
                        <Select value={unit} onValueChange={setUnit}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unidades">unidades</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="L">L</SelectItem>
                            <SelectItem value="mL">mL</SelectItem>
                            <SelectItem value="pacotes">pacotes</SelectItem>
                            <SelectItem value="latas">latas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data-validade">Data de Validade</Label>
                    <DatePickerDemo date={date} setDate={setDate} />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                      {isLoading ? "Adicionando..." : "Adicionar Ingrediente"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ingredientes Comuns</CardTitle>
                <p className="text-sm text-muted-foreground">Clique para adicionar rapidamente</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {commonIngredients.map((ingredient) => (
                    <IngredientBadge
                      key={ingredient.name}
                      name={ingredient.name}
                      onClick={() => handleQuickAdd(ingredient)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Dica Culinária
                  <Badge variant="outline">
                    {currentTip + 1}/{tips.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tips[currentTip]}</p>
                <div className="flex justify-between mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length)}
                  >
                    Anterior
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentTip((prev) => (prev + 1) % tips.length)}>
                    Próxima
                  </Button>
                </div>
              </CardContent>
            </Card>

            {recentIngredients.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ingredientes Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {recentIngredients.map((ingredient) => (
                        <div
                          key={ingredient.id}
                          className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50"
                        >
                          <span>
                            {ingredient.item_name} ({ingredient.quantity} {ingredient.unit})
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {new Date(ingredient.added_at).toLocaleDateString('pt-BR')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function IngredientBadge({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <Badge variant="outline" className="cursor-pointer hover:bg-green-50 py-2 px-3 transition-colors" onClick={onClick}>
      {name}
    </Badge>
  )
}

function DatePickerDemo({ date, setDate }: { date: Date | undefined; setDate: (date: Date | undefined) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={ptBR} />
      </PopoverContent>
    </Popover>
  )
}
