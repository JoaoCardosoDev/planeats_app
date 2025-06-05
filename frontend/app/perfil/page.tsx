"use client"

import type React from "react"
import { Plus } from "lucide-react"
import { useSession } from "next-auth/react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Camera, Edit, Heart, Clock, ChefHat, Award, Star } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
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

export default function Perfil() {
  const { data: session } = useSession()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingPreferences, setIsEditingPreferences] = useState(false)
  const [profileData, setProfileData] = useState({
    name: session?.user?.name || "Usuário",
    email: session?.user?.email || "usuario@email.com",
    phone: "(11) 98765-4321",
    birthDate: "1990-01-01",
    bio: "Apaixonada por culinária...",
    avatar: session?.user?.image || "/placeholder.svg?height=96&width=96",
  })
  const [preferences, setPreferences] = useState(["Vegetariano", "Sem Glúten", "Baixo Carboidrato"])
  const [newPreference, setNewPreference] = useState("")
  const [commentsToShow, setCommentsToShow] = useState(2)

  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState("")
  const [editingCommentRating, setEditingCommentRating] = useState(0)
  const [comments, setComments] = useState([
    {
      id: "1",
      recipeName: "Arroz de Frango",
      recipeImage: "/placeholder.svg?height=48&width=48",
      rating: 5,
      content: "Receita incrível! Fiz exatamente como descrito e ficou perfeito. Minha família adorou!",
      date: "há 2 dias",
    },
    {
      id: "2",
      recipeName: "Salada de Tomate",
      recipeImage: "/placeholder.svg?height=48&width=48",
      rating: 4,
      content: "Muito boa! Adicionei um pouco de manjericão e ficou ainda melhor.",
      date: "há 1 semana",
    },
    {
      id: "3",
      recipeName: "Omelete de Cebola",
      recipeImage: "/placeholder.svg?height=48&width=48",
      rating: 5,
      content: "Simples e deliciosa! Perfeita para um café da manhã rápido.",
      date: "há 2 semanas",
    },
    {
      id: "4",
      recipeName: "Sopa de Legumes",
      recipeImage: "/placeholder.svg?height=48&width=48",
      rating: 4,
      content: "Nutritiva e saborosa. Usei os legumes que tinha em casa.",
      date: "há 3 semanas",
    },
    {
      id: "5",
      recipeName: "Bolo de Cenoura",
      recipeImage: "/placeholder.svg?height=48&width=48",
      rating: 5,
      content: "O melhor bolo de cenoura que já fiz! A cobertura ficou perfeita.",
      date: "há 1 mês",
    },
    {
      id: "6",
      recipeName: "Macarrão ao Molho Branco",
      recipeImage: "/placeholder.svg?height=48&width=48",
      rating: 4,
      content: "Cremoso e delicioso! Adicionei um pouco de queijo parmesão.",
      date: "há 1 mês",
    },
  ])

  const handleEditComment = (commentId: string) => {
    const comment = comments.find((c) => c.id === commentId)
    if (comment) {
      setEditingComment(commentId)
      setEditingCommentContent(comment.content)
      setEditingCommentRating(comment.rating)
    }
  }

  const handleSaveComment = (commentId: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, content: editingCommentContent, rating: editingCommentRating }
          : comment,
      ),
    )
    setEditingComment(null)
    setEditingCommentContent("")
    setEditingCommentRating(0)
    toast.success("Comentário atualizado com sucesso!")
  }

  const handleCancelEdit = () => {
    setEditingComment(null)
    setEditingCommentContent("")
    setEditingCommentRating(0)
  }

  const handleDeleteComment = (commentId: string, recipeName: string) => {
    setComments(comments.filter((comment) => comment.id !== commentId))
    toast.success(`Comentário da receita "${recipeName}" excluído com sucesso!`)
  }

  const handleProfileUpdate = () => {
    // updateUser({
    //   name: profileData.name,
    //   email: profileData.email,
    //   avatar: profileData.avatar,
    // })
    setIsEditingProfile(false)
    toast.success("Perfil atualizado com sucesso!")
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setProfileData({ ...profileData, avatar: result })
        // updateUser({ avatar: result })
        toast.success("Foto atualizada com sucesso!")
      }
      reader.readAsDataURL(file)
    }
  }

  const addPreference = () => {
    if (newPreference && !preferences.includes(newPreference)) {
      setPreferences([...preferences, newPreference])
      setNewPreference("")
    }
  }

  const removePreference = (pref: string) => {
    setPreferences(preferences.filter((p) => p !== pref))
  }

  const loadMoreComments = () => {
    setCommentsToShow((prev) => Math.min(prev + 2, comments.length))
    toast.success("Mais comentários carregados!")
  }

  return (
    <ProtectedRoute>
      <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Card className="w-full md:w-80">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt="Foto de perfil" />
                    <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="secondary" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{profileData.name}</h2>
                  <p className="text-sm text-muted-foreground">{profileData.email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Receitas Salvas</span>
                  <Badge variant="secondary">24</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Receitas Criadas</span>
                  <Badge variant="secondary">8</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Ingredientes Cadastrados</span>
                  <Badge variant="secondary">32</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setIsEditingProfile(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar Perfil
              </Button>
            </CardFooter>
          </Card>

          <div className="flex-1">
            <Tabs defaultValue="comentarios" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="informacoes">Informações</TabsTrigger>
                <TabsTrigger value="receitas-salvas">Receitas Salvas</TabsTrigger>
                <TabsTrigger value="receitas-criadas">Receitas Criadas</TabsTrigger>
                <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
                <TabsTrigger value="comentarios">Meus Comentários</TabsTrigger>
              </TabsList>

              <TabsContent value="informacoes">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>Atualize suas informações pessoais</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditingProfile ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="nome">Nome</Label>
                            <Input
                              id="nome"
                              value={profileData.name}
                              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              value={profileData.email}
                              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone</Label>
                            <Input
                              id="telefone"
                              value={profileData.phone}
                              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="data-nascimento">Data de Nascimento</Label>
                            <Input
                              id="data-nascimento"
                              type="date"
                              value={profileData.birthDate}
                              onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bio">Biografia</Label>
                          <textarea
                            id="bio"
                            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={profileData.bio}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Preferências Alimentares</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditingPreferences(!isEditingPreferences)}
                            >
                              <Edit className="mr-1 h-3 w-3" />
                              Editar
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {preferences.map((pref, index) => (
                              <Badge key={index} variant="outline" className="flex items-center gap-1">
                                {pref}
                                {isEditingPreferences && (
                                  <button onClick={() => removePreference(pref)} className="ml-1 text-red-500">
                                    ×
                                  </button>
                                )}
                              </Badge>
                            ))}
                          </div>
                          {isEditingPreferences && (
                            <div className="flex gap-2 mt-2">
                              <Input
                                placeholder="Nova preferência"
                                value={newPreference}
                                onChange={(e) => setNewPreference(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && addPreference()}
                              />
                              <Button size="sm" onClick={addPreference}>
                                Adicionar
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleProfileUpdate} className="bg-green-600 hover:bg-green-700">
                            Salvar
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nome">Nome</Label>
                          <Input id="nome" value={profileData.name} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" value={profileData.email} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefone">Telefone</Label>
                          <Input id="telefone" value={profileData.phone} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="data-nascimento">Data de Nascimento</Label>
                          <Input id="data-nascimento" type="date" value={profileData.birthDate} disabled />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="bio">Biografia</Label>
                          <textarea
                            id="bio"
                            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={profileData.bio}
                            disabled
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <div className="flex justify-between items-center">
                            <Label>Preferências Alimentares</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditingPreferences(!isEditingPreferences)}
                            >
                              <Edit className="mr-1 h-3 w-3" />
                              Editar
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {preferences.map((pref, index) => (
                              <Badge key={index} variant="outline" className="flex items-center gap-1">
                                {pref}
                                {isEditingPreferences && (
                                  <button onClick={() => removePreference(pref)} className="ml-1 text-red-500">
                                    ×
                                  </button>
                                )}
                              </Badge>
                            ))}
                          </div>
                          {isEditingPreferences && (
                            <div className="flex gap-2 mt-2">
                              <Input
                                placeholder="Nova preferência"
                                value={newPreference}
                                onChange={(e) => setNewPreference(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && addPreference()}
                              />
                              <Button size="sm" onClick={addPreference}>
                                Adicionar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    {!isEditingProfile && (
                      <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsEditingProfile(true)}>
                        Editar Informações
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="receitas-salvas">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="overflow-hidden">
                    <CardHeader className="p-0">
                      <div className="relative h-40 w-full">
                        <Image
                          src="/placeholder.svg?height=160&width=320"
                          alt="Arroz de Frango"
                          fill
                          className="object-cover"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 text-rose-500"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-semibold">Arroz de Frango</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>40 min</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <ChefHat className="h-4 w-4 text-muted-foreground" />
                            <span>Médio</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden">
                    <CardHeader className="p-0">
                      <div className="relative h-40 w-full">
                        <Image
                          src="/placeholder.svg?height=160&width=320"
                          alt="Salada de Tomate com Queijo"
                          fill
                          className="object-cover"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 text-rose-500"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-semibold">Salada de Tomate com Queijo</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>10 min</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <ChefHat className="h-4 w-4 text-muted-foreground" />
                            <span>Fácil</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="receitas-criadas">
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Você ainda não criou nenhuma receita</p>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeira Receita
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="conquistas">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="pt-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="rounded-full bg-amber-100 p-3">
                          <Award className="h-8 w-8 text-amber-600" />
                        </div>
                        <h3 className="font-medium">Chef Iniciante</h3>
                        <p className="text-sm text-muted-foreground">Preparou 10 receitas diferentes</p>
                        <Badge className="bg-amber-600 text-white">Conquistado!</Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                          Parabéns! Você já experimentou 10 receitas diferentes. Continue explorando novos sabores!
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="rounded-full bg-green-100 p-3">
                          <Award className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="font-medium">Organizador</h3>
                        <p className="text-sm text-muted-foreground">Cadastrou 30 ingredientes</p>
                        <Badge className="bg-green-600 text-white">Conquistado!</Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                          Excelente organização! Manter o frigorífico atualizado ajuda a evitar desperdícios.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardContent className="pt-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="rounded-full bg-gray-100 p-3">
                          <Award className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="font-medium">Chef Criativo</h3>
                        <p className="text-sm text-muted-foreground">Criou 5 receitas próprias</p>
                        <Badge variant="outline" className="mt-2">
                          Em progresso: 2/5
                        </Badge>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "40%" }}></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Continue criando! Faltam apenas 3 receitas para conquistar este badge.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200">
                    <CardContent className="pt-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="rounded-full bg-blue-100 p-3">
                          <Award className="h-8 w-8 text-blue-400" />
                        </div>
                        <h3 className="font-medium">Avaliador</h3>
                        <p className="text-sm text-muted-foreground">Avaliou 20 receitas</p>
                        <Badge variant="outline" className="mt-2">
                          Em progresso: 8/20
                        </Badge>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "40%" }}></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Suas avaliações ajudam outros usuários! Continue compartilhando sua opinião.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="comentarios">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Comentários Recentes</h3>
                    <Badge variant="secondary">{comments.length} comentários</Badge>
                  </div>

                  <div className="space-y-4">
                    {comments.slice(0, commentsToShow).map((comment) => (
                      <Card key={comment.id}>
                        <CardContent className="pt-4">
                          <div className="flex gap-4">
                            <div className="relative h-12 w-12 shrink-0">
                              <Image
                                src={comment.recipeImage || "/placeholder.svg"}
                                alt="Receita"
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{comment.recipeName}</h4>
                                {editingComment === comment.id ? (
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button key={star} type="button" onClick={() => setEditingCommentRating(star)}>
                                        <Star
                                          className={`h-4 w-4 cursor-pointer ${
                                            star <= editingCommentRating
                                              ? "text-amber-400 fill-amber-400"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${star <= comment.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                                      />
                                    ))}
                                  </div>
                                )}
                                <span className="text-sm text-muted-foreground">{comment.date}</span>
                              </div>

                              {editingComment === comment.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editingCommentContent}
                                    onChange={(e) => setEditingCommentContent(e.target.value)}
                                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleSaveComment(comment.id)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Salvar
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm text-muted-foreground">"{comment.content}"</p>
                                  <div className="flex gap-2 mt-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditComment(comment.id)}>
                                      Editar
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="text-red-500">
                                          Excluir
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Excluir comentário</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tem certeza que deseja excluir este comentário da receita "
                                            {comment.recipeName}"? Esta ação não pode ser desfeita.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteComment(comment.id, comment.recipeName)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Excluir
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {commentsToShow < comments.length && (
                      <div className="text-center">
                        <Button variant="outline" onClick={loadMoreComments}>
                          Carregar Mais Comentários ({comments.length - commentsToShow} restantes)
                        </Button>
                      </div>
                    )}

                    {commentsToShow >= comments.length && comments.length > 2 && (
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Todos os comentários foram carregados</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}
