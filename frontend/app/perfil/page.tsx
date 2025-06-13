"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Edit, Loader2, PlusCircle } from "lucide-react" // Added PlusCircle
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
// Removed getRecipes as it's not directly used in the profile summary anymore
// import { getRecipes } from "@/lib/api/recipes" 

export default function PerfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)
  const [preferenceOptions, setPreferenceOptions] = useState<PreferenceOptions | null>(null)
  // const [recipesCount, setRecipesCount] = useState<number>(0) // Example if we want to show user's recipe count
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  const [isEditingPreferences, setIsEditingPreferences] = useState(false)
  const [editedPreferences, setEditedPreferences] = useState<Partial<UserPreferences>>({})
  
  const [newDietaryRestriction, setNewDietaryRestriction] = useState("")
  const [newCuisine, setNewCuisine] = useState("")
  const [newDislikedIngredient, setNewDislikedIngredient] = useState("")

  const dietaryRestrictionLabels: { [key: string]: string } = {
    "vegetarian": "Vegetariano", "vegan": "Vegano", "gluten_free": "Sem Glúten",
    "lactose_free": "Sem Lactose", "keto": "Keto", "paleo": "Paleo", "mediterranean": "Mediterrânica"
  }

  const cuisineTypeLabels: { [key: string]: string } = {
    "portuguese": "Portuguesa", "italian": "Italiana", "asian": "Asiática", "mexican": "Mexicana",
    "healthy": "Saudável", "comfort_food": "Comfort Food", "mediterranean": "Mediterrânica",
    "indian": "Indiana", "french": "Francesa", "american": "Americana"
  }

  const difficultyLabels: { [key: string]: string } = {
    "easy": "Fácil", "medium": "Médio", "hard": "Difícil"
  }

  useEffect(() => {
    const loadUserData = async () => {
      if (status === "loading") return
      if (!session) {
        router.push("/login")
        return
      }

      try {
        setLoading(true)
        const [profileData, preferencesData, optionsData] = await Promise.all([
          getCurrentUser(),
          getUserPreferences(),
          getPreferenceOptions(),
          // getRecipes().then(data => data?.recipes?.length || 0) // Example for recipe count
        ])
        
        setUserProfile(profileData)
        setUserPreferences(preferencesData)
        setPreferenceOptions(optionsData)
        // setRecipesCount(recipesCountData)
        
        if (preferencesData) {
          setEditedPreferences({
            ...preferencesData,
            dietary_restrictions: preferencesData.dietary_restrictions || [],
            cuisine_preferences: preferencesData.cuisine_preferences || [],
            disliked_ingredients: preferencesData.disliked_ingredients || [],
          })
        } else {
          setEditedPreferences({
            dietary_restrictions: [],
            cuisine_preferences: [],
            disliked_ingredients: [],
          })
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

  const handleSavePreferences = async () => {
    if (!editedPreferences) return
    
    // Ensure arrays are not null before sending
    const payload: Partial<UserPreferences> = {
      ...editedPreferences,
      dietary_restrictions: editedPreferences.dietary_restrictions || [],
      cuisine_preferences: editedPreferences.cuisine_preferences || [],
      disliked_ingredients: editedPreferences.disliked_ingredients || [],
    };

    try {
      setUpdating(true)
      const updated = await updateUserPreferences(payload)
      
      if (updated) {
        const freshPreferences = await getUserPreferences()
        setUserPreferences(freshPreferences)
        if (freshPreferences) {
          setEditedPreferences({
            ...freshPreferences,
            dietary_restrictions: freshPreferences.dietary_restrictions || [],
            cuisine_preferences: freshPreferences.cuisine_preferences || [],
            disliked_ingredients: freshPreferences.disliked_ingredients || [],
          })
        }
        setIsEditingPreferences(false)
        toast.success("Preferências atualizadas com sucesso!")
      } else {
        toast.error("Erro ao atualizar preferências.")
      }
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast.error("Erro ao atualizar preferências.")
    } finally {
      setUpdating(false)
    }
  }

  const addItemToArrayPreference = (item: string, field: keyof Pick<UserPreferences, "dietary_restrictions" | "cuisine_preferences" | "disliked_ingredients">, setNewItemState: React.Dispatch<React.SetStateAction<string>>) => {
    if (!item) return;
    const currentArray = editedPreferences[field] || [];
    if (!currentArray.includes(item)) {
      setEditedPreferences(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), item]
      }));
      setNewItemState("");
    } else {
      toast.info("Este item já foi adicionado.");
    }
  };
  
  const removeItemFromArrayPreference = (item: string, field: keyof Pick<UserPreferences, "dietary_restrictions" | "cuisine_preferences" | "disliked_ingredients">) => {
    setEditedPreferences(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter(i => i !== item)
    }));
  };

  if (status === "loading" || loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="flex items-center gap-2 text-lg">
          <Loader2 className="h-8 w-8 animate-spin" />
          Carregando perfil...
        </div>
      </div>
    )
  }

  if (!session || !userProfile) {
    return null // Redirects in useEffect
  }

  const renderPreferenceList = (items: string[] | null | undefined, labels: { [key: string]: string }, onRemove?: (item: string) => void) => (
    <div className="flex flex-wrap gap-2">
      {(items && items.length > 0) ? items.map((item, index) => (
        <Badge key={index} variant="outline" className="text-sm py-1 px-3 flex items-center gap-1">
          {labels[item] || item}
          {isEditingPreferences && onRemove && (
            <button onClick={() => onRemove(item)} className="ml-1.5 text-destructive hover:text-red-700 text-xs">
              &times;
            </button>
          )}
        </Badge>
      )) : <span className="text-sm text-muted-foreground">Nenhuma preferência definida.</span>}
    </div>
  );

  const renderPreferenceEditor = (
    currentValue: string, 
    setValue: React.Dispatch<React.SetStateAction<string>>, 
    options: string[] | undefined, 
    onAdd: () => void, 
    placeholder: string,
    labels: { [key: string]: string }
  ) => (
    <div className="flex gap-2 mt-2">
      <select
        value={currentValue}
        onChange={(e) => setValue(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {options?.map((option) => (
          <option key={option} value={option}>
            {labels[option] || option}
          </option>
        ))}
      </select>
      <Button size="sm" onClick={onAdd} variant="secondary">
        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
      </Button>
    </div>
  );
  
  // Editor for disliked ingredients (free text input)
  const renderDislikedIngredientEditor = (
    currentValue: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    onAdd: () => void
  ) => (
    <div className="flex gap-2 mt-2">
      <Input
        type="text"
        value={currentValue}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ex: Coentros"
        className="flex-grow"
      />
      <Button size="sm" onClick={onAdd} variant="secondary">
        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
      </Button>
    </div>
  );


  return (
    <div className="container py-8 space-y-8">
      {/* User Information Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-primary">
              <AvatarImage src={session.user?.image || "/placeholder-user.jpg"} alt="Foto de perfil" />
              <AvatarFallback className="text-3xl">
                {userProfile.username?.charAt(0).toUpperCase() || userProfile.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <CardTitle className="text-3xl font-bold">{userProfile.username || "Utilizador"}</CardTitle>
              <CardDescription className="text-lg">{userProfile.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="font-semibold">Membro desde:</Label>
            <p>{userProfile.created_at ? new Date(userProfile.created_at).toLocaleDateString('pt-BR') : "N/A"}</p>
          </div>
          <div>
            <Label className="font-semibold">Status da Conta:</Label>
            <div>
              <Badge variant={userProfile.is_active ? "default" : "destructive"} className="bg-green-500 text-white">
                {userProfile.is_active ? "Ativa" : "Inativa"}
              </Badge>
            </div>
          </div>
        </CardContent>
        {/* Future edit button for profile info
        <CardFooter>
          <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Editar Informações</Button>
        </CardFooter>
        */}
      </Card>

      {/* Dietary & Culinary Preferences Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-2xl">Preferências Alimentares e Culinárias</CardTitle>
            <CardDescription>Configure para receber recomendações personalizadas.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsEditingPreferences(!isEditingPreferences);
              if (!isEditingPreferences && userPreferences) { // Entering edit mode, load current prefs
                setEditedPreferences({
                  ...userPreferences,
                  dietary_restrictions: userPreferences.dietary_restrictions || [],
                  cuisine_preferences: userPreferences.cuisine_preferences || [],
                  disliked_ingredients: userPreferences.disliked_ingredients || [],
                });
              }
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            {isEditingPreferences ? "Cancelar Edição" : "Editar Preferências"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dietary Restrictions */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Restrições Alimentares</Label>
            {renderPreferenceList(
              isEditingPreferences ? editedPreferences.dietary_restrictions : userPreferences?.dietary_restrictions,
              dietaryRestrictionLabels,
              (item) => removeItemFromArrayPreference(item, "dietary_restrictions")
            )}
            {isEditingPreferences && renderPreferenceEditor(
              newDietaryRestriction, setNewDietaryRestriction, preferenceOptions?.dietary_restrictions,
              () => addItemToArrayPreference(newDietaryRestriction, "dietary_restrictions", setNewDietaryRestriction),
              "Selecione uma restrição", dietaryRestrictionLabels
            )}
          </div>

          {/* Preferred Cuisines */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Cozinhas Preferidas</Label>
            {renderPreferenceList(
              isEditingPreferences ? editedPreferences.cuisine_preferences : userPreferences?.cuisine_preferences,
              cuisineTypeLabels,
              (item) => removeItemFromArrayPreference(item, "cuisine_preferences")
            )}
            {isEditingPreferences && renderPreferenceEditor(
              newCuisine, setNewCuisine, preferenceOptions?.cuisine_types,
              () => addItemToArrayPreference(newCuisine, "cuisine_preferences", setNewCuisine),
              "Selecione uma cozinha", cuisineTypeLabels
            )}
          </div>

          {/* Disliked Ingredients */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Ingredientes Não Apreciados</Label>
            {renderPreferenceList(
              isEditingPreferences ? editedPreferences.disliked_ingredients : userPreferences?.disliked_ingredients,
              {}, // No specific labels for disliked ingredients, show raw value
              (item) => removeItemFromArrayPreference(item, "disliked_ingredients")
            )}
            {isEditingPreferences && renderDislikedIngredientEditor(
              newDislikedIngredient, setNewDislikedIngredient,
              () => addItemToArrayPreference(newDislikedIngredient, "disliked_ingredients", setNewDislikedIngredient)
            )}
          </div>
          
          {/* Other Preferences (Only visible in edit mode or if set) */}
          {(isEditingPreferences || 
            userPreferences?.preferred_difficulty || 
            userPreferences?.daily_calorie_goal ||
            userPreferences?.max_prep_time_preference ||
            userPreferences?.max_calories_preference
          ) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t">
              {/* Preferred Difficulty */}
              <div className="space-y-1">
                <Label className="font-medium">Dificuldade Preferida</Label>
                {isEditingPreferences ? (
                  <select
                    value={editedPreferences.preferred_difficulty || ""}
                    onChange={(e) => setEditedPreferences(prev => ({ ...prev, preferred_difficulty: e.target.value || null }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Qualquer dificuldade</option>
                    {preferenceOptions?.difficulty_levels?.map((option) => (
                      <option key={option} value={option}>{difficultyLabels[option] || option}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm">{difficultyLabels[userPreferences?.preferred_difficulty || ""] || userPreferences?.preferred_difficulty || "N/A"}</p>
                )}
              </div>

              {/* Daily Calorie Goal */}
              <div className="space-y-1">
                <Label className="font-medium">Meta de Calorias Diárias</Label>
                {isEditingPreferences ? (
                  <Input type="number" placeholder="Ex: 2000"
                    value={editedPreferences.daily_calorie_goal || ""}
                    onChange={(e) => setEditedPreferences(prev => ({ ...prev, daily_calorie_goal: e.target.value ? parseInt(e.target.value) : null }))}
                  />
                ) : (
                  <p className="text-sm">{userPreferences?.daily_calorie_goal ? `${userPreferences.daily_calorie_goal} kcal` : "N/A"}</p>
                )}
              </div>

              {/* Max Prep Time */}
              <div className="space-y-1">
                <Label className="font-medium">Tempo Máximo de Preparo</Label>
                {isEditingPreferences ? (
                  <Input type="number" placeholder="Ex: 30 (minutos)"
                    value={editedPreferences.max_prep_time_preference || ""}
                    onChange={(e) => setEditedPreferences(prev => ({ ...prev, max_prep_time_preference: e.target.value ? parseInt(e.target.value) : null }))}
                  />
                ) : (
                  <p className="text-sm">{userPreferences?.max_prep_time_preference ? `${userPreferences.max_prep_time_preference} min` : "N/A"}</p>
                )}
              </div>
              
              {/* Max Calories per Recipe */}
              <div className="space-y-1">
                <Label className="font-medium">Máximo de Calorias por Receita</Label>
                {isEditingPreferences ? (
                  <Input type="number" placeholder="Ex: 600 (kcal)"
                    value={editedPreferences.max_calories_preference || ""}
                    onChange={(e) => setEditedPreferences(prev => ({ ...prev, max_calories_preference: e.target.value ? parseInt(e.target.value) : null }))}
                  />
                ) : (
                  <p className="text-sm">{userPreferences?.max_calories_preference ? `${userPreferences.max_calories_preference} kcal` : "N/A"}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
        
        {isEditingPreferences && (
          <CardFooter className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSavePreferences} disabled={updating} className="bg-green-600 hover:bg-green-700 text-white">
              {updating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Salvar Preferências"}
            </Button>
            <Button variant="outline" onClick={() => {
              setIsEditingPreferences(false)
              if (userPreferences) setEditedPreferences({ // Reset to original on cancel
                ...userPreferences,
                dietary_restrictions: userPreferences.dietary_restrictions || [],
                cuisine_preferences: userPreferences.cuisine_preferences || [],
                disliked_ingredients: userPreferences.disliked_ingredients || [],
              });
            }}>
              Cancelar
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
