"use client"

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
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function AdicionarItens() {
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
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome-ingrediente">Nome do Ingrediente *</Label>
                  <Input id="nome-ingrediente" placeholder="Ex: Tomate, Frango, Arroz..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select>
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
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input id="quantidade" placeholder="Ex: 500g, 2 unidades, 1L..." />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data-validade">Data de Validade</Label>
                  <DatePickerDemo />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline">Cancelar</Button>
                  <Button className="bg-green-600 hover:bg-green-700">Adicionar Ingrediente</Button>
                </div>
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
                  <IngredientBadge name="Tomate" />
                  <IngredientBadge name="Cebola" />
                  <IngredientBadge name="Alho" />
                  <IngredientBadge name="Batata" />
                  <IngredientBadge name="Cenoura" />
                  <IngredientBadge name="Frango" />
                  <IngredientBadge name="Carne Moída" />
                  <IngredientBadge name="Arroz" />
                  <IngredientBadge name="Feijão" />
                  <IngredientBadge name="Leite" />
                  <IngredientBadge name="Queijo" />
                  <IngredientBadge name="Ovos" />
                  <IngredientBadge name="Pão" />
                  <IngredientBadge name="Maçã" />
                  <IngredientBadge name="Banana" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dica</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Adicionar detalhes como categoria e data de validade ajuda a organizar melhor seu frigorífico e evitar
                  desperdícios.
                </p>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground">
                  Você pode adicionar vários ingredientes de uma vez usando os ingredientes comuns.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ingredientes Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                      <span>Tomate (5 unidades)</span>
                      <Badge variant="outline">Vegetal</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                      <span>Frango (500g)</span>
                      <Badge variant="outline">Proteína</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                      <span>Arroz (1kg)</span>
                      <Badge variant="outline">Grãos</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                      <span>Leite (1L)</span>
                      <Badge variant="outline">Laticínio</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                      <span>Alho (1 cabeça)</span>
                      <Badge variant="outline">Tempero</Badge>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function IngredientBadge({ name }: { name: string }) {
  return (
    <Badge variant="outline" className="cursor-pointer hover:bg-green-50 py-2 px-3">
      {name}
    </Badge>
  )
}

function DatePickerDemo() {
  const [date, setDate] = useState<Date>()

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
