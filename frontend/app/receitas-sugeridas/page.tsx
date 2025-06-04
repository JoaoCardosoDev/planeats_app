'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSuggestedRecipes, useGenerateRecipeSuggestions, usePantryItems } from '@/hooks/useApi';
import { Recipe, PantryItem } from '@/types/api';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Clock, ChefHat, Sparkles, Search, Utensils, Users, Star, BookOpen, Zap } from 'lucide-react';
import Link from 'next/link';

export default function ReceitasSugeridasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const {
    data: suggestedRecipes,
    loading: loadingRecipes,
    error: recipesError,
    refetch: refetchRecipes,
  } = useSuggestedRecipes();

  const {
    data: pantryItems,
    loading: _loadingPantry,
  } = usePantryItems();

  const {
    mutate: generateSuggestions,
    loading: generatingRecipes,
  } = useGenerateRecipeSuggestions();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxPrepTime, setMaxPrepTime] = useState<string>('all');
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
  }, [session, status, router]);

  const handleGenerateRecipes = async () => {
    if (!pantryItems || pantryItems.length === 0) {
      toast({
        title: 'Frigorífico vazio',
        description: 'Adicione alguns ingredientes ao seu frigorífico primeiro.',
        variant: 'destructive',
      });
      return;
    }

    const itemNames = pantryItems.map((item: PantryItem) => item.name);
    const result = await generateSuggestions(apiClient.generateRecipeSuggestions, itemNames);

    if (result.success) {
      toast({
        title: 'Receitas geradas!',
        description: 'Novas receitas foram geradas com base nos seus ingredientes.',
      });
      setIsGenerateDialogOpen(false);
      refetchRecipes();
    } else {
      toast({
        title: 'Erro',
        description: 'Falha ao gerar receitas. Tente novamente.',
        variant: 'destructive',
      });
    }
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

  const filteredRecipes = suggestedRecipes?.filter((recipe: Recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || recipe.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    const matchesPrepTime = maxPrepTime === 'all' || recipe.prep_time <= parseInt(maxPrepTime);
    
    return matchesSearch && matchesDifficulty && matchesCategory && matchesPrepTime;
  }) || [];

  const quickRecipes = filteredRecipes.filter((recipe: Recipe) => recipe.prep_time <= 20);
  const healthyRecipes = filteredRecipes.filter((recipe: Recipe) => 
    recipe.category === 'salad' || recipe.description?.toLowerCase().includes('saudável')
  );

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
            <h1 className="text-3xl font-bold">Receitas Sugeridas</h1>
            <p className="text-muted-foreground">
              Receitas baseadas nos ingredientes do seu frigorífico
            </p>
          </div>
          
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <Sparkles className="h-4 w-4" />
                Gerar Novas Receitas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gerar Receitas com IA</DialogTitle>
                <DialogDescription>
                  Gere receitas personalizadas com base nos ingredientes do seu frigorífico usando inteligência artificial.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Ingredientes disponíveis: {pantryItems?.length || 0} itens
                </p>
                {pantryItems && pantryItems.length > 0 ? (
                  <div className="space-y-2">
                    <p className="font-medium">Seus ingredientes:</p>
                    <div className="flex flex-wrap gap-2">
                      {pantryItems.slice(0, 10).map((item: PantryItem) => (
                        <Badge key={item.id} variant="secondary">
                          {item.name}
                        </Badge>
                      ))}
                      {pantryItems.length > 10 && (
                        <Badge variant="outline">+{pantryItems.length - 10} mais</Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      Nenhum ingrediente encontrado no frigorífico.
                    </p>
                    <Button asChild variant="outline" className="mt-2">
                      <Link href="/meu-frigorifico">
                        Adicionar Ingredientes
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={handleGenerateRecipes}
                  disabled={generatingRecipes || !pantryItems || pantryItems.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {generatingRecipes ? 'Gerando...' : 'Gerar Receitas'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar receitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Dificuldade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as dificuldades</SelectItem>
              <SelectItem value="easy">Fácil</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="hard">Difícil</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="breakfast">Café da manhã</SelectItem>
              <SelectItem value="lunch">Almoço</SelectItem>
              <SelectItem value="dinner">Jantar</SelectItem>
              <SelectItem value="snack">Lanche</SelectItem>
              <SelectItem value="dessert">Sobremesa</SelectItem>
            </SelectContent>
          </Select>

          <Select value={maxPrepTime} onValueChange={setMaxPrepTime}>
            <SelectTrigger>
              <SelectValue placeholder="Tempo de preparo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer tempo</SelectItem>
              <SelectItem value="15">Até 15 min</SelectItem>
              <SelectItem value="30">Até 30 min</SelectItem>
              <SelectItem value="60">Até 1 hora</SelectItem>
              <SelectItem value="120">Até 2 horas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {loadingRecipes ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : recipesError ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{recipesError}</p>
            <Button onClick={refetchRecipes}>Tentar Novamente</Button>
          </div>
        ) : (
          <Tabs defaultValue="todas" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="todas" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Todas ({filteredRecipes.length})
              </TabsTrigger>
              <TabsTrigger value="rapidas" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Rápidas ({quickRecipes.length})
              </TabsTrigger>
              <TabsTrigger value="saudaveis" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Saudáveis ({healthyRecipes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="todas">
              {filteredRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma receita encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Tente gerar receitas com base nos seus ingredientes ou ajustar os filtros.
                  </p>
                  <Button onClick={() => setIsGenerateDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Receitas
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map((recipe: Recipe) => (
                    <Card key={recipe.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => openRecipeDialog(recipe)}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg line-clamp-2">{recipe.title}</CardTitle>
                          <Badge className={getDifficultyColor(recipe.difficulty)}>
                            {getDifficultyLabel(recipe.difficulty)}
                          </Badge>
                        </div>
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
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {recipe.servings} porções
                          </div>
                          <Badge variant="outline">
                            {getCategoryLabel(recipe.category)}
                          </Badge>
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
              )}
            </TabsContent>

            <TabsContent value="rapidas">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickRecipes.map((recipe: Recipe) => (
                  <Card key={recipe.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => openRecipeDialog(recipe)}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2">{recipe.title}</CardTitle>
                        <Badge className="bg-green-100 text-green-800">
                          <Zap className="h-3 w-3 mr-1" />
                          Rápida
                        </Badge>
                      </div>
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
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {recipe.servings} porções
                        </div>
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

            <TabsContent value="saudaveis">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {healthyRecipes.map((recipe: Recipe) => (
                  <Card key={recipe.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => openRecipeDialog(recipe)}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2">{recipe.title}</CardTitle>
                        <Badge className="bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          Saudável
                        </Badge>
                      </div>
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
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {recipe.servings} porções
                        </div>
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