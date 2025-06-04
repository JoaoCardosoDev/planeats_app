'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useMyRecipes } from '@/hooks/api/useRecipes';
import { Recipe, CreateRecipeRequest, DifficultyLevel, RecipeCategory } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Clock, ChefHat, Search, Users, Utensils } from 'lucide-react';
import { useUpdateRecipe, useDeleteRecipe } from '@/hooks/useApi';
import { apiClient } from '@/lib/api-client';

interface IngredientInput {
  name: string;
  quantity: number;
  unit: string;
}

export default function MinhasReceitasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const {
    recipes: myRecipes,
    loading: loadingMyRecipes,
    error: myRecipesError,
    refetch: refetchMyRecipes,
    createRecipe,
    isCreating,
  } = useMyRecipes();

  const {
    mutate: updateRecipe,
    loading: isUpdating,
  } = useUpdateRecipe();

  const {
    mutate: deleteRecipe,
    loading: isDeleting,
  } = useDeleteRecipe();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Form states
  const [formData, setFormData] = useState<CreateRecipeRequest>({
    title: '',
    description: '',
    instructions: '',
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    difficulty: 'easy',
    category: 'lunch',
    ingredients: [],
  });

  const [ingredientInputs, setIngredientInputs] = useState<IngredientInput[]>([
    { name: '', quantity: 1, unit: '' }
  ]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
  }, [session, status, router]);

  const resetFormData = () => {
    setFormData({
      title: '',
      description: '',
      instructions: '',
      prep_time: 0,
      cook_time: 0,
      servings: 1,
      difficulty: 'easy',
      category: 'lunch',
      ingredients: [],
    });
    setIngredientInputs([{ name: '', quantity: 1, unit: '' }]);
  };

  const addIngredientInput = () => {
    setIngredientInputs([...ingredientInputs, { name: '', quantity: 1, unit: '' }]);
  };

  const removeIngredientInput = (index: number) => {
    if (ingredientInputs.length > 1) {
      setIngredientInputs(ingredientInputs.filter((_, i) => i !== index));
    }
  };

  const updateIngredientInput = (index: number, field: keyof IngredientInput, value: string | number) => {
    const updated = [...ingredientInputs];
    updated[index] = { ...updated[index], [field]: value };
    setIngredientInputs(updated);
  };

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.instructions.trim()) {
      toast({
        title: 'Erro',
        description: 'Título e instruções são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const validIngredients = ingredientInputs.filter(ing => 
      ing.name.trim() && ing.unit.trim() && ing.quantity > 0
    );

    if (validIngredients.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos um ingrediente válido.',
        variant: 'destructive',
      });
      return;
    }

    const recipeData = {
      ...formData,
      ingredients: validIngredients,
    };

    const result = await createRecipe(recipeData);
    
    if (result) {
      toast({
        title: 'Receita criada',
        description: 'A receita foi criada com sucesso.',
      });
      setIsAddDialogOpen(false);
      resetFormData();
      refetchMyRecipes();
    } else {
      toast({
        title: 'Erro',
        description: 'Falha ao criar a receita. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingRecipe) return;

    const updates = {
      title: formData.title || editingRecipe.title,
      description: formData.description || editingRecipe.description,
      instructions: formData.instructions || editingRecipe.instructions,
      prep_time: formData.prep_time || editingRecipe.prep_time,
      cook_time: formData.cook_time || editingRecipe.cook_time,
      servings: formData.servings || editingRecipe.servings,
      difficulty: formData.difficulty || editingRecipe.difficulty,
      category: formData.category || editingRecipe.category,
    };

    const result = await updateRecipe(
      (params: { recipeId: number; updates: any }) => 
        apiClient.updateRecipe(params.recipeId, params.updates),
      { recipeId: editingRecipe.id, updates }
    );
    
    if (result.success) {
      toast({
        title: 'Receita atualizada',
        description: 'A receita foi atualizada com sucesso.',
      });
      setIsEditDialogOpen(false);
      setEditingRecipe(null);
      resetFormData();
      refetchMyRecipes();
    } else {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar a receita. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRecipe = async (recipe: Recipe) => {
    const result = await deleteRecipe(
      (recipeId: number) => apiClient.deleteRecipe(recipeId),
      recipe.id
    );
    
    if (result.success) {
      toast({
        title: 'Receita removida',
        description: `"${recipe.title}" foi removida com sucesso.`,
      });
      refetchMyRecipes();
    } else {
      toast({
        title: 'Erro',
        description: 'Falha ao remover a receita. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      title: recipe.title,
      description: recipe.description || '',
      instructions: recipe.instructions,
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      category: recipe.category,
      ingredients: recipe.ingredients,
    });
    setIsEditDialogOpen(true);
  };

  const openRecipeDialog = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeDialogOpen(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Médio';
      case 'hard':
        return 'Difícil';
      default:
        return difficulty;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      breakfast: 'Café da manhã',
      lunch: 'Almoço',
      dinner: 'Jantar',
      snack: 'Lanche',
      dessert: 'Sobremesa',
      beverage: 'Bebida',
    };
    return labels[category.toLowerCase()] || category;
  };

  const filteredRecipes = myRecipes?.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'quick' && recipe.prep_time + recipe.cook_time <= 30) ||
                         (selectedFilter === 'easy' && recipe.difficulty === 'easy');
    
    return matchesSearch && matchesFilter;
  }) || [];

  const quickRecipes = myRecipes?.filter(recipe => recipe.prep_time + recipe.cook_time <= 30) || [];
  const easyRecipes = myRecipes?.filter(recipe => recipe.difficulty === 'easy') || [];

  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Minhas Receitas</h1>
            <p className="text-muted-foreground">
              Gerencie suas receitas favoritas e criações próprias
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" />
                Nova Receita
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleCreateRecipe}>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Receita</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes da sua receita.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título da Receita</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Arroz de Frango"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prep_time">Tempo de Preparo (min)</Label>
                      <Input
                        id="prep_time"
                        type="number"
                        min="0"
                        value={formData.prep_time}
                        onChange={(e) => setFormData({ ...formData, prep_time: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cook_time">Tempo de Cozimento (min)</Label>
                      <Input
                        id="cook_time"
                        type="number"
                        min="0"
                        value={formData.cook_time}
                        onChange={(e) => setFormData({ ...formData, cook_time: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="servings">Porções</Label>
                      <Input
                        id="servings"
                        type="number"
                        min="1"
                        value={formData.servings}
                        onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Dificuldade</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) => setFormData({ ...formData, difficulty: value as DifficultyLevel })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Fácil</SelectItem>
                          <SelectItem value="medium">Médio</SelectItem>
                          <SelectItem value="hard">Difícil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value as RecipeCategory })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Café da manhã</SelectItem>
                          <SelectItem value="lunch">Almoço</SelectItem>
                          <SelectItem value="dinner">Jantar</SelectItem>
                          <SelectItem value="snack">Lanche</SelectItem>
                          <SelectItem value="dessert">Sobremesa</SelectItem>
                          <SelectItem value="beverage">Bebida</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Breve descrição da receita"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ingredientes</Label>
                    {ingredientInputs.map((ingredient, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2">
                        <Input
                          placeholder="Nome"
                          value={ingredient.name}
                          onChange={(e) => updateIngredientInput(index, 'name', e.target.value)}
                          className="col-span-5"
                        />
                        <Input
                          placeholder="Qtd"
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredientInput(index, 'quantity', parseFloat(e.target.value) || 1)}
                          className="col-span-3"
                        />
                        <Input
                          placeholder="Unidade"
                          value={ingredient.unit}
                          onChange={(e) => updateIngredientInput(index, 'unit', e.target.value)}
                          className="col-span-3"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeIngredientInput(index)}
                          className="col-span-1"
                          disabled={ingredientInputs.length === 1}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addIngredientInput}
                    >
                      + Adicionar Ingrediente
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Modo de Preparo</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      placeholder="Descreva o passo a passo do preparo"
                      className="min-h-[150px]"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isCreating} className="bg-green-600 hover:bg-green-700">
                    {isCreating ? 'Criando...' : 'Criar Receita'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar receitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 max-w-sm"
            />
          </div>
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as receitas</SelectItem>
              <SelectItem value="quick">Receitas rápidas</SelectItem>
              <SelectItem value="easy">Receitas fáceis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {loadingMyRecipes ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : myRecipesError ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{myRecipesError}</p>
            <Button onClick={refetchMyRecipes}>Tentar Novamente</Button>
          </div>
        ) : (
          <Tabs defaultValue="todas" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="todas">
                Todas ({filteredRecipes.length})
              </TabsTrigger>
              <TabsTrigger value="rapidas">
                Rápidas ({quickRecipes.length})
              </TabsTrigger>
              <TabsTrigger value="faceis">
                Fáceis ({easyRecipes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="todas">
              {filteredRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {myRecipes?.length === 0 ? 'Nenhuma receita criada' : 'Nenhuma receita encontrada'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {myRecipes?.length === 0 
                      ? 'Comece criando sua primeira receita.'
                      : 'Tente ajustar os filtros de pesquisa.'}
                  </p>
                  {myRecipes?.length === 0 && (
                    <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Receita
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map((recipe) => (
                    <Card key={recipe.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg line-clamp-2" onClick={() => openRecipeDialog(recipe)}>
                            {recipe.title}
                          </CardTitle>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(recipe)}
                              disabled={isUpdating}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover Receita</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover &quot;{recipe.title}&quot;?
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteRecipe(recipe)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        {recipe.description && (
                          <CardDescription className="line-clamp-2">
                            {recipe.description}
                          </CardDescription>
                        )}
                        <div className="flex gap-2">
                          <Badge className={getDifficultyColor(recipe.difficulty)}>
                            {getDifficultyLabel(recipe.difficulty)}
                          </Badge>
                          <Badge variant="outline">
                            {getCategoryLabel(recipe.category)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {recipe.prep_time + recipe.cook_time} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {recipe.servings} porções
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => openRecipeDialog(recipe)}
                        >
                          Ver Receita
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rapidas">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickRecipes.map((recipe) => (
                  <Card key={recipe.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => openRecipeDialog(recipe)}>
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{recipe.title}</CardTitle>
                      {recipe.description && (
                        <CardDescription className="line-clamp-2">
                          {recipe.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {recipe.prep_time + recipe.cook_time} min
                        </div>
                        <Badge className="bg-green-100 text-green-800">Rápida</Badge>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Ver Receita
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="faceis">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {easyRecipes.map((recipe) => (
                  <Card key={recipe.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => openRecipeDialog(recipe)}>
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{recipe.title}</CardTitle>
                      {recipe.description && (
                        <CardDescription className="line-clamp-2">
                          {recipe.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {recipe.prep_time + recipe.cook_time} min
                        </div>
                        <Badge className="bg-green-100 text-green-800">Fácil</Badge>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Ver Receita
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleUpdateRecipe}>
              <DialogHeader>
                <DialogTitle>Editar Receita</DialogTitle>
                <DialogDescription>
                  Edite as informações da receita selecionada.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Título da Receita</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-prep">Tempo de Preparo (min)</Label>
                    <Input
                      id="edit-prep"
                      type="number"
                      min="0"
                      value={formData.prep_time}
                      onChange={(e) => setFormData({ ...formData, prep_time: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-cook">Tempo de Cozimento (min)</Label>
                    <Input
                      id="edit-cook"
                      type="number"
                      min="0"
                      value={formData.cook_time}
                      onChange={(e) => setFormData({ ...formData, cook_time: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-instructions">Modo de Preparo</Label>
                  <Textarea
                    id="edit-instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="min-h-[150px]"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isUpdating} className="bg-green-600 hover:bg-green-700">
                  {isUpdating ? 'Atualizando...' : 'Atualizar Receita'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Recipe Detail Dialog */}
        <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedRecipe && (
              <>
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <DialogTitle className="text-2xl">{selectedRecipe.title}</DialogTitle>
                    <Badge className={getDifficultyColor(selectedRecipe.difficulty)}>
                      {getDifficultyLabel(selectedRecipe.difficulty)}
                    </Badge>
                  </div>
                  {selectedRecipe.description && (
                    <DialogDescription className="text-base">
                      {selectedRecipe.description}
                    </DialogDescription>
                  )}
                </DialogHeader>
              
                <div className="space-y-4">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Preparo: {selectedRecipe.prep_time} min
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat className="h-4 w-4" />
                      Cozimento: {selectedRecipe.cook_time} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {selectedRecipe.servings} porções
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Ingredientes:</h4>
                    <ul className="space-y-1">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="text-sm">
                          • {ingredient.quantity} {ingredient.unit} de {ingredient.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Modo de Preparo:</h4>
                    <div className="text-sm whitespace-pre-line">
                      {selectedRecipe.instructions}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}