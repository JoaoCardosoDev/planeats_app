'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { usePantryItems, useSuggestedRecipes, useMyRecipes } from '@/hooks/useApi';
import { PantryItem, Recipe } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  ChefHat, 
  Clock, 
  Users, 
  Calendar,
  AlertTriangle,
  Sparkles,
  Plus,
  ArrowRight,
  Utensils
} from 'lucide-react';
import Link from 'next/link';
import { format, isAfter, differenceInDays, parseISO } from 'date-fns';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast: _toast } = useToast();

  const {
    data: pantryItems,
    loading: loadingPantry,
    error: _pantryError,
  } = usePantryItems();

  const {
    data: suggestedRecipes,
    loading: loadingRecipes,
    error: _recipesError,
  } = useSuggestedRecipes();

  const {
    data: myRecipes,
    loading: loadingMyRecipes,
  } = useMyRecipes();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
  }, [session, status, router]);

  const getExpiringItems = (items: PantryItem[]) => {
    return items.filter(item => {
      if (!item.expiry_date) return false;
      const expiry = parseISO(item.expiry_date);
      const today = new Date();
      const daysUntilExpiry = differenceInDays(expiry, today);
      return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
    });
  };

  const getExpiredItems = (items: PantryItem[]) => {
    return items.filter(item => {
      if (!item.expiry_date) return false;
      const expiry = parseISO(item.expiry_date);
      const today = new Date();
      return isAfter(today, expiry);
    });
  };

  const getCategoryStats = (items: PantryItem[]) => {
    const categories = items.reduce((acc, item) => {
      const category = item.category || 'other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  };

  const getRecentRecipes = (recipes: Recipe[]) => {
    return recipes
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const expiringItems = pantryItems ? getExpiringItems(pantryItems) : [];
  const expiredItems = pantryItems ? getExpiredItems(pantryItems) : [];
  const categoryStats = pantryItems ? getCategoryStats(pantryItems) : [];
  const recentRecipes = myRecipes ? getRecentRecipes(myRecipes) : [];

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Bem-vindo de volta, {session.user?.name || session.user?.email}!
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/receitas-sugeridas">
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Receitas
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/adicionar-itens">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Itens no Frigorífico</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingPantry ? '...' : pantryItems?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {expiringItems.length > 0 && (
                  <span className="text-orange-600">
                    {expiringItems.length} expirando em breve
                  </span>
                )}
                {expiredItems.length > 0 && (
                  <span className="text-red-600">
                    {expiredItems.length} expirados
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Minhas Receitas</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingMyRecipes ? '...' : myRecipes?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Receitas criadas por mim
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas Sugeridas</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingRecipes ? '...' : suggestedRecipes?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Baseadas nos seus ingredientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myRecipes && myRecipes.length > 0
                  ? Math.round(
                      myRecipes.reduce((acc: number, recipe: any) => acc + recipe.prep_time + recipe.cook_time, 0) /
                      myRecipes.length
                    )
                  : 0}m
              </div>
              <p className="text-xs text-muted-foreground">
                Tempo médio de preparo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(expiringItems.length > 0 || expiredItems.length > 0) && (
          <div className="space-y-4">
            {expiredItems.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    Itens Expirados ({expiredItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {expiredItems.slice(0, 3).map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-red-600">
                          Expirou em {item.expiry_date && format(parseISO(item.expiry_date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    ))}
                    {expiredItems.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        +{expiredItems.length - 3} mais itens expirados
                      </p>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href="/meu-frigorifico">
                      Ver Todos os Itens
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {expiringItems.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Calendar className="h-5 w-5" />
                    Expirando em Breve ({expiringItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {expiringItems.slice(0, 3).map(item => {
                      const daysLeft = item.expiry_date 
                        ? differenceInDays(parseISO(item.expiry_date), new Date())
                        : 0;
                      return (
                        <div key={item.id} className="flex justify-between items-center">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm text-orange-600">
                            {daysLeft === 0 ? 'Hoje' : `${daysLeft} dias`}
                          </span>
                        </div>
                      );
                    })}
                    {expiringItems.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        +{expiringItems.length - 3} mais itens expirando
                      </p>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href="/receitas-sugeridas">
                      Gerar Receitas
                      <Sparkles className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Recipes */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Receitas Recentes
                </CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/minhas-receitas">
                    Ver todas
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingMyRecipes ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
              ) : recentRecipes.length === 0 ? (
                <div className="text-center py-8">
                  <Utensils className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhuma receita criada ainda</p>
                  <Button asChild size="sm" className="mt-2">
                    <Link href="/minhas-receitas">
                      Criar primeira receita
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentRecipes.map(recipe => (
                    <div key={recipe.id} className="flex justify-between items-center p-3 rounded-lg border">
                      <div className="flex-1">
                        <h4 className="font-medium">{recipe.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {recipe.prep_time + recipe.cook_time}m
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {recipe.servings}
                          </div>
                          <Badge variant="outline" className={getDifficultyColor(recipe.difficulty)}>
                            {getDifficultyLabel(recipe.difficulty)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pantry Overview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Resumo do Frigorífico
                </CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/meu-frigorifico">
                    Ver detalhes
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPantry ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
              ) : categoryStats.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Frigorífico vazio</p>
                  <Button asChild size="sm" className="mt-2">
                    <Link href="/adicionar-itens">
                      Adicionar itens
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryStats.slice(0, 5).map(({ category, count }) => {
                    const percentage = Math.round((count / (pantryItems?.length || 1)) * 100);
                    const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{categoryLabel}</span>
                          <span className="text-muted-foreground">{count} itens</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Suggested Recipes */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Receitas Sugeridas
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/receitas-sugeridas">
                  Ver todas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            <CardDescription>
              Receitas baseadas nos ingredientes do seu frigorífico
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRecipes ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : !suggestedRecipes || suggestedRecipes.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-4">
                  Nenhuma receita sugerida ainda
                </p>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/receitas-sugeridas">
                    Gerar receitas
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestedRecipes.slice(0, 3).map((recipe: any) => (
                  <div key={recipe.id} className="p-4 rounded-lg border">
                    <div className="space-y-2">
                      <h4 className="font-medium line-clamp-1">{recipe.title}</h4>
                      {recipe.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {recipe.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {recipe.prep_time + recipe.cook_time}m
                        </div>
                        <Badge variant="outline" className={getDifficultyColor(recipe.difficulty)}>
                          {getDifficultyLabel(recipe.difficulty)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}