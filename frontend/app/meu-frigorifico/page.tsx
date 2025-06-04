'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { usePantry } from '@/hooks/api/usePantry';
import { CreatePantryItemRequest, UpdatePantryItemRequest, PantryItem, PantryCategory } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Package, Calendar, Scale, Tag } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function MeuFrigorificoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refetch,
    isAdding,
    isUpdating,
    isDeleting,
  } = usePantry();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form states
  const [formData, setFormData] = useState<CreatePantryItemRequest>({
    name: '',
    quantity: 1,
    unit: '',
    expiry_date: '',
    category: '',
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
  }, [session, status, router]);

  const resetFormData = () => {
    setFormData({
      name: '',
      quantity: 1,
      unit: '',
      expiry_date: '',
      category: '',
    });
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.unit.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome e unidade são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const success = await addItem(formData);
    
    if (success) {
      toast({
        title: 'Item adicionado',
        description: 'O item foi adicionado ao seu frigorífico com sucesso.',
      });
      setIsAddDialogOpen(false);
      resetFormData();
    } else {
      toast({
        title: 'Erro',
        description: 'Falha ao adicionar o item. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem) return;

    const updates: UpdatePantryItemRequest = {
      name: formData.name || editingItem.name,
      quantity: formData.quantity || editingItem.quantity,
      unit: formData.unit || editingItem.unit,
      expiry_date: formData.expiry_date || editingItem.expiry_date,
      category: formData.category || editingItem.category,
    };

    const success = await updateItem(editingItem.id, updates);
    
    if (success) {
      toast({
        title: 'Item atualizado',
        description: 'O item foi atualizado com sucesso.',
      });
      setIsEditDialogOpen(false);
      setEditingItem(null);
      resetFormData();
    } else {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar o item. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async (item: PantryItem) => {
    const success = await deleteItem(item.id);
    
    if (success) {
      toast({
        title: 'Item removido',
        description: `${item.name} foi removido do seu frigorífico.`,
      });
    } else {
      toast({
        title: 'Erro',
        description: 'Falha ao remover o item. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (item: PantryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      expiry_date: item.expiry_date || '',
      category: item.category || '',
    });
    setIsEditDialogOpen(true);
  };

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;
    
    const expiry = parseISO(expiryDate);
    const today = new Date();
    const daysUntilExpiry = differenceInDays(expiry, today);
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', text: 'Expirado', variant: 'destructive' as const };
    } else if (daysUntilExpiry <= 3) {
      return { status: 'expiring', text: `Expira em ${daysUntilExpiry} dias`, variant: 'destructive' as const };
    } else if (daysUntilExpiry <= 7) {
      return { status: 'warning', text: `Expira em ${daysUntilExpiry} dias`, variant: 'outline' as const };
    }
    return null;
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Object.values(PantryCategory);

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
            <h1 className="text-3xl font-bold">Meu Frigorífico</h1>
            <p className="text-muted-foreground">
              Gerencie os ingredientes do seu frigorífico e despensa
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleAddItem}>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Item</DialogTitle>
                  <DialogDescription>
                    Adicione um novo item ao seu frigorífico ou despensa.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nome
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="col-span-3"
                      placeholder="Ex: Leite, Ovos, Tomate..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">
                      Quantidade
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 1 })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit" className="text-right">
                      Unidade
                    </Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="col-span-3"
                      placeholder="Ex: kg, litros, unidades..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Categoria
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expiry_date" className="text-right">
                      Data de Validade
                    </Label>
                    <Input
                      id="expiry_date"
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isAdding}>
                    {isAdding ? 'Adicionando...' : 'Adicionar Item'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Pesquisar itens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={refetch}>Tentar Novamente</Button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {items.length === 0 ? 'Nenhum item no frigorífico' : 'Nenhum item encontrado'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {items.length === 0 
                ? 'Comece adicionando alguns ingredientes ao seu frigorífico.'
                : 'Tente ajustar os filtros de pesquisa.'}
            </p>
            {items.length === 0 && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Item
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const expiryStatus = getExpiryStatus(item.expiry_date);
              
              return (
                <Card key={item.id} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(item)}
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
                              <AlertDialogTitle>Remover Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover &quot;{item.name}&quot; do seu frigorífico?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteItem(item)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Scale className="h-4 w-4" />
                        {item.quantity} {item.unit}
                      </div>
                      
                      {item.category && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Tag className="h-4 w-4" />
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </div>
                      )}
                      
                      {item.expiry_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(parseISO(item.expiry_date), 'dd/MM/yyyy', { locale: pt })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  {expiryStatus && (
                    <CardFooter className="pt-2">
                      <Badge variant={expiryStatus.variant} className="w-full justify-center">
                        {expiryStatus.text}
                      </Badge>
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleEditItem}>
              <DialogHeader>
                <DialogTitle>Editar Item</DialogTitle>
                <DialogDescription>
                  Edite as informações do item selecionado.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-quantity" className="text-right">
                    Quantidade
                  </Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 1 })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-unit" className="text-right">
                    Unidade
                  </Label>
                  <Input
                    id="edit-unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">
                    Categoria
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-expiry" className="text-right">
                    Data de Validade
                  </Label>
                  <Input
                    id="edit-expiry"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Atualizando...' : 'Atualizar Item'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}