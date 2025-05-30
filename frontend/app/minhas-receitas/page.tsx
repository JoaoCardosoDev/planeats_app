"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, ChefHat, Search, Plus, Edit, Trash2, Heart, Share, BookmarkPlus } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

export default function MinhasReceitas() {
  const [showAddRecipeDialog, setShowAddRecipeDialog] = useState(false)

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Minhas Receitas</h1>
            <p className="text-muted-foreground">Gerencie suas receitas favoritas e criações próprias</p>
          </div>
          <Button onClick={() => setShowAddRecipeDialog(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Nova Receita
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar receitas..." className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="todas">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Receitas</SelectItem>
                <SelectItem value="favoritas">Favoritas</SelectItem>
                <SelectItem value="criadas">Criadas por Mim</SelectItem>
                <SelectItem value="rapidas">Rápidas (até 30min)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="favoritas">Favoritas</TabsTrigger>
            <TabsTrigger value="criadas">Criadas por Mim</TabsTrigger>
            <TabsTrigger value="salvas">Salvas</TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Receita 1 */}
              <RecipeCard
                title="Arroz de Frango"
                description="Um prato completo de arroz com frango e legumes."
                image="/placeholder.svg?height=192&width=384"
                time="40 min"
                difficulty="Médio"
                isFavorite={true}
                isOwn={true}
              />

              {/* Receita 2 */}
              <RecipeCard
                title="Salada de Tomate com Queijo"
                description="Uma salada fresca e rápida de preparar."
                image="/placeholder.svg?height=192&width=384"
                time="10 min"
                difficulty="Fácil"
                isFavorite={true}
                isOwn={false}
              />

              {/* Receita 3 */}
              <RecipeCard
                title="Omelete de Tomate e Cebola"
                description="Um omelete simples e delicioso com tomate e cebola."
                image="/placeholder.svg?height=192&width=384"
                time="15 min"
                difficulty="Fácil"
                isFavorite={false}
                isOwn={true}
              />

              {/* Receita 4 */}
              <RecipeCard
                title="Sopa de Legumes"
                description="Uma sopa nutritiva com os legumes da sua geladeira."
                image="/placeholder.svg?height=192&width=384"
                time="30 min"
                difficulty="Fácil"
                isFavorite={false}
                isOwn={false}
              />

              {/* Receita 5 */}
              <RecipeCard
                title="Macarrão ao Molho Branco"
                description="Um macarrão cremoso com molho branco e queijo."
                image="/placeholder.svg?height=192&width=384"
                time="25 min"
                difficulty="Médio"
                isFavorite={true}
                isOwn={false}
              />

              {/* Receita 6 */}
              <RecipeCard
                title="Bolo de Cenoura"
                description="Um bolo fofinho de cenoura com cobertura de chocolate."
                image="/placeholder.svg?height=192&width=384"
                time="50 min"
                difficulty="Médio"
                isFavorite={false}
                isOwn={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="favoritas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Receita 1 */}
              <RecipeCard
                title="Arroz de Frango"
                description="Um prato completo de arroz com frango e legumes."
                image="/placeholder.svg?height=192&width=384"
                time="40 min"
                difficulty="Médio"
                isFavorite={true}
                isOwn={true}
              />

              {/* Receita 2 */}
              <RecipeCard
                title="Salada de Tomate com Queijo"
                description="Uma salada fresca e rápida de preparar."
                image="/placeholder.svg?height=192&width=384"
                time="10 min"
                difficulty="Fácil"
                isFavorite={true}
                isOwn={false}
              />

              {/* Receita 5 */}
              <RecipeCard
                title="Macarrão ao Molho Branco"
                description="Um macarrão cremoso com molho branco e queijo."
                image="/placeholder.svg?height=192&width=384"
                time="25 min"
                difficulty="Médio"
                isFavorite={true}
                isOwn={false}
              />
            </div>
          </TabsContent>

          <TabsContent value="criadas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Receita 1 */}
              <RecipeCard
                title="Arroz de Frango"
                description="Um prato completo de arroz com frango e legumes."
                image="/placeholder.svg?height=192&width=384"
                time="40 min"
                difficulty="Médio"
                isFavorite={true}
                isOwn={true}
              />

              {/* Receita 3 */}
              <RecipeCard
                title="Omelete de Tomate e Cebola"
                description="Um omelete simples e delicioso com tomate e cebola."
                image="/placeholder.svg?height=192&width=384"
                time="15 min"
                difficulty="Fácil"
                isFavorite={false}
                isOwn={true}
              />

              {/* Receita 6 */}
              <RecipeCard
                title="Bolo de Cenoura"
                description="Um bolo fofinho de cenoura com cobertura de chocolate."
                image="/placeholder.svg?height=192&width=384"
                time="50 min"
                difficulty="Médio"
                isFavorite={false}
                isOwn={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="salvas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Receita 2 */}
              <RecipeCard
                title="Salada de Tomate com Queijo"
                description="Uma salada fresca e rápida de preparar."
                image="/placeholder.svg?height=192&width=384"
                time="10 min"
                difficulty="Fácil"
                isFavorite={true}
                isOwn={false}
              />

              {/* Receita 4 */}
              <RecipeCard
                title="Sopa de Legumes"
                description="Uma sopa nutritiva com os legumes da sua geladeira."
                image="/placeholder.svg?height=192&width=384"
                time="30 min"
                difficulty="Fácil"
                isFavorite={false}
                isOwn={false}
              />

              {/* Receita 5 */}
              <RecipeCard
                title="Macarrão ao Molho Branco"
                description="Um macarrão cremoso com molho branco e queijo."
                image="/placeholder.svg?height=192&width=384"
                time="25 min"
                difficulty="Médio"
                isFavorite={true}
                isOwn={false}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAddRecipeDialog} onOpenChange={setShowAddRecipeDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Receita</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da sua receita. Você poderá editá-la posteriormente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipe-name">Nome da Receita</Label>
              <Input id="recipe-name" placeholder="Ex: Arroz de Frango" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prep-time">Tempo de Preparo</Label>
                <Input id="prep-time" placeholder="Ex: 40 minutos" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Dificuldade</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facil">Fácil</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="dificil">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" placeholder="Breve descrição da receita" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredientes</Label>
              <Textarea
                id="ingredients"
                placeholder="Liste os ingredientes, um por linha. Ex:
2 xícaras de arroz
500g de frango
1 cebola picada"
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions">Modo de Preparo</Label>
              <Textarea id="instructions" placeholder="Descreva o passo a passo do preparo" className="min-h-[150px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipe-image">Imagem da Receita</Label>
              <Input id="recipe-image" type="file" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRecipeDialog(false)}>
              Cancelar
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowAddRecipeDialog(false)}>
              Salvar Receita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface RecipeCardProps {
  title: string
  description: string
  image: string
  time: string
  difficulty: string
  isFavorite: boolean
  isOwn: boolean
}

function RecipeCard({ title, description, image, time, difficulty, isFavorite, isOwn }: RecipeCardProps) {
  const [favorite, setFavorite] = useState(isFavorite)

  return (
    <Card className="overflow-hidden">
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
              <Share className="h-4 w-4" />
            </Button>
            {!isOwn && (
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/80 text-gray-500">
                <BookmarkPlus className="h-4 w-4" />
              </Button>
            )}
          </div>
          {isOwn && <Badge className="absolute bottom-2 left-2 bg-green-600 hover:bg-green-700">Minha Receita</Badge>}
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
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button className="bg-green-600 hover:bg-green-700">Ver Receita</Button>
        {isOwn && (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-red-500">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
