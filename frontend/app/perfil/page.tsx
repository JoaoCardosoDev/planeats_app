"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Camera, Edit, Heart, Clock, ChefHat, Award, Star, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { 
  getCurrentUser, 
  getUserPreferences, 
  updateUserPreferences, 
  getPreferenceOptions,
  UserProfile, 
  UserPreferences, 
  PreferenceOptions 
} from "@/lib/api/auth"
import { getRecipes } from "@/lib/api/recipes"

export default function Perfil() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // State for user data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)
  const [preferenceOptions, setPreferenceOptions] = useState<PreferenceOptions | null>(null)
  const [recipes, setRecipes] = useState<any[]>([])
  
  // Loading states
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  // Form states
  const [activeTab, setActiveTab] = useState("informacoes")
  const [isEditingPreferences, setIsEditingPreferences] = useState(false)
  const [editedPreferences, setEditedPreferences] = useState<Partial<UserPreferences>>({})
  const [newDietaryRestriction, setNewDietaryRestriction] = useState("")
  const [newCuisine, setNewCuisine] = useState("")
  const [newDislikedIngredient, setNewDislikedIngredient] = useState("")

  // Label mappings for better UX
  const dietaryRestrictionLabels: { [key: string]: string } = {
    "vegetarian": "Vegetariano",
    "vegan": "Vegano",
    "gluten_free": "Sem Glúten",
    "lactose_free": "Sem Lactose",
    "keto": "Keto",
    "paleo": "Paleo",
    "mediterranean": "Mediterrânica"
  }

  const cuisineTypeLabels: { [key: string]: string } = {
    "portuguese": "Portuguesa",
    "italian": "Italiana",
    "asian": "Asiática",
    "mexican": "Mexicana",
    "healthy": "Saudável",
    "comfort_food": "Comfort Food",
    "mediterranean": "Mediterrânica",
    "indian": "Indiana",
    "french": "Francesa",
    "american": "Americana"
  }

  const difficultyLabels: { [key: string]: string } = {
    "easy": "Fácil",
    "medium": "Médio",
    "hard": "Difícil"
  }

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      if (status === "loading") return
      
      if (!session) {
        router.push("/login")
        return
      }

      try {
        setLoading(true)
        
        // Load user profile, preferences, and recipes in parallel
        const [profileData, preferencesData, optionsData, recipesData] = await Promise.all([
          getCurrentUser(),
          getUserPreferences(),
          getPreferenceOptions(),
          getRecipes()
        ])
        
        setUserProfile(profileData)
        setUserPreferences(preferencesData)
        setPreferenceOptions(optionsData)
        setRecipes(recipesData?.recipes || [])
        
        if (preferencesData) {
          setEditedPreferences(preferencesData)
        }
        
      } catch (error) {
        console.error("Error loading user data:", error)
        toast.error("Erro ao carregar dados do perfil")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [session, status, router])

  const handleEditProfile = () => {
    setActiveTab("informacoes")
  }

  const handleSavePreferences = async () => {
    if (!editedPreferences) return
    
    try {
      setUpdating(true)
      const updated = await updateUserPreferences(editedPreferences)
      
      if (updated) {
        setUserPreferences(updated)
        setIsEditingPreferences(false)
        toast.success("Preferências atualizadas com sucesso!")
      } else {
        toast.error("Erro ao atualizar preferências")
      }
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast.error("Erro ao atualizar preferências")
    } finally {
      setUpdating(false)
    }
  }

  const addDietaryRestriction = () => {
    if (!newDietaryRestriction || !editedPreferences.dietary_restrictions) return
    
    if (!editedPreferences.dietary_restrictions.includes(newDietaryRestriction)) {
      setEditedPreferences({
        ...editedPreferences,
        dietary_restrictions: [...editedPreferences.dietary_restrictions, newDietaryRestriction]
      })
      setNewDietaryRestriction("")
    }
  }

  const removeDietaryRestriction = (restriction: string) => {
    if (!editedPreferences.dietary_restrictions) return
    
    setEditedPreferences({
      ...editedPreferences,
      dietary_restrictions: editedPreferences.dietary_restrictions.filter(r => r !== restriction)
    })
  }

  const addCuisine = () => {
    if (!newCuisine || !editedPreferences.preferred_cuisines) return
    
    if (!editedPreferences.preferred_cuisines.includes(newCuisine)) {
      setEditedPreferences({
        ...editedPreferences,
        preferred_cuisines: [...editedPreferences.preferred_cuisines, newCuisine]
      })
      setNewCuisine("")
    }
  }

  const removeCuisine = (cuisine: string) => {
    if (!editedPreferences.preferred_cuisines) return
    
    setEditedPreferences({
      ...editedPreferences,
      preferred_cuisines: editedPreferences.preferred_cuisines.filter(c => c !== cuisine)
    })
  }

  if (status === "loading" || loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Carregando perfil...</span>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Profile Card */}
          <Card className="w-full md:w-80">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={session.user?.image || "/placeholder.svg"} alt="Foto de perfil" />
                    <AvatarFallback>
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {userProfile?.username || session.user?.name || "Usuário"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {userProfile?.email || session.user?.email}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Receitas Disponíveis</span>
                  <Badge variant="secondary">{recipes.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Preferências Alimentares</span>
                  <Badge variant="secondary">
                    {userPreferences?.dietary_restrictions?.length || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Cozinhas Preferidas</span>
                  <Badge variant="secondary">
                    {userPreferences?.preferred_cuisines?.length || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={handleEditProfile}>
                <Edit className="mr-2 h-4 w-4" />
                Editar Perfil
              </Button>
            </CardFooter>
          </Card>

          {/* Main Content */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="informacoes">Informações</TabsTrigger>
                <TabsTrigger value="preferencias">Preferências</TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="informacoes">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>Informações da sua conta</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome de Usuário</Label>
                        <Input value={userProfile?.username || ""} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={userProfile?.email || ""} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Status da Conta</Label>
                        <Badge variant={userProfile?.is_active ? "default" : "destructive"}>
                          {userProfile?.is_active ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Label>Membro desde</Label>
                        <Input 
                          value={userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('pt-BR') : ""} 
                          disabled 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferencias">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferências Alimentares</CardTitle>
                    <CardDescription>Configure suas preferências para receber recomendações personalizadas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Dietary Restrictions */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-base font-medium">Restrições Alimentares</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingPreferences(!isEditingPreferences)}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          {isEditingPreferences ? "Cancelar" : "Editar"}
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {(isEditingPreferences ? editedPreferences.dietary_restrictions : userPreferences?.dietary_restrictions)?.map((restriction, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {dietaryRestrictionLabels[restriction] || restriction}
                            {isEditingPreferences && (
                              <button 
                                onClick={() => removeDietaryRestriction(restriction)} 
                                className="ml-1 text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>

                      {isEditingPreferences && (
                        <div className="flex gap-2">
                          <select
                            value={newDietaryRestriction}
                            onChange={(e) => setNewDietaryRestriction(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Selecione uma restrição</option>
                            {preferenceOptions?.dietary_restrictions?.map((option) => (
                              <option key={option} value={option}>
                                {dietaryRestrictionLabels[option] || option}
                              </option>
                            ))}
                          </select>
                          <Button size="sm" onClick={addDietaryRestriction}>
                            Adicionar
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Preferred Cuisines */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Cozinhas Preferidas</Label>
                      
                      <div className="flex flex-wrap gap-2">
                        {(isEditingPreferences ? editedPreferences.preferred_cuisines : userPreferences?.preferred_cuisines)?.map((cuisine, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {cuisineTypeLabels[cuisine] || cuisine}
                            {isEditingPreferences && (
                              <button 
                                onClick={() => removeCuisine(cuisine)} 
                                className="ml-1 text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>

                      {isEditingPreferences && (
                        <div className="flex gap-2">
                          <select
                            value={newCuisine}
                            onChange={(e) => setNewCuisine(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Selecione uma cozinha</option>
                            {preferenceOptions?.cuisine_types?.map((option) => (
                              <option key={option} value={option}>
                                {cuisineTypeLabels[option] || option}
                              </option>
                            ))}
                          </select>
                          <Button size="sm" onClick={addCuisine}>
                            Adicionar
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Other Preferences */}
                    {isEditingPreferences && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Dificuldade Preferida</Label>
                            <select
                              value={editedPreferences.preferred_difficulty || ""}
                              onChange={(e) => setEditedPreferences({
                                ...editedPreferences,
                                preferred_difficulty: e.target.value || null
                              })}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">Qualquer dificuldade</option>
                              {preferenceOptions?.difficulty_levels?.map((option) => (
                                <option key={option} value={option}>
                                  {difficultyLabels[option] || option}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Meta de Calorias Diárias</Label>
                            <Input
                              type="number"
                              value={editedPreferences.daily_calorie_goal || ""}
                              onChange={(e) => setEditedPreferences({
                                ...editedPreferences,
                                daily_calorie_goal: e.target.value ? parseInt(e.target.value) : null
                              })}
                              placeholder="Ex: 2000"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Tempo Máximo de Preparo (min)</Label>
                            <Input
                              type="number"
                              value={editedPreferences.max_prep_time_preference || ""}
                              onChange={(e) => setEditedPreferences({
                                ...editedPreferences,
                                max_prep_time_preference: e.target.value ? parseInt(e.target.value) : null
                              })}
                              placeholder="Ex: 30"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Máximo de Calorias por Receita</Label>
                            <Input
                              type="number"
                              value={editedPreferences.max_calories_preference || ""}
                              onChange={(e) => setEditedPreferences({
                                ...editedPreferences,
                                max_calories_preference: e.target.value ? parseInt(e.target.value) : null
                              })}
                              placeholder="Ex: 500"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                  
                  {isEditingPreferences && (
                    <CardFooter className="flex gap-2">
                      <Button 
                        onClick={handleSavePreferences} 
                        disabled={updating}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          "Salvar Preferências"
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditingPreferences(false)
                          setEditedPreferences(userPreferences || {})
                        }}
                      >
                        Cancelar
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
