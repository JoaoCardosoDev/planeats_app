'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { PantryItem, CreatePantryItemRequest, UpdatePantryItemRequest } from '@/types/api';

interface UsePantryReturn {
  items: PantryItem[];
  loading: boolean;
  error: string | null;
  addItem: (item: CreatePantryItemRequest) => Promise<boolean>;
  updateItem: (id: number, updates: UpdatePantryItemRequest) => Promise<boolean>;
  deleteItem: (id: number) => Promise<boolean>;
  refetch: () => Promise<void>;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const usePantry = (): UsePantryReturn => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getPantryItems();
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      setItems(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pantry items');
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (item: CreatePantryItemRequest): Promise<boolean> => {
    try {
      setIsAdding(true);
      setError(null);
      const response = await apiClient.addPantryItem(item);
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      // Add the new item to the local state
      if (response.data) {
        setItems(prev => [...prev, response.data]);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add pantry item');
      return false;
    } finally {
      setIsAdding(false);
    }
  }, []);

  const updateItem = useCallback(async (id: number, updates: UpdatePantryItemRequest): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);
      const response = await apiClient.updatePantryItem(id, updates);
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      // Update the item in local state
      if (response.data) {
        setItems(prev => prev.map(item => 
          item.id === id ? response.data : item
        ));
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update pantry item');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const deleteItem = useCallback(async (id: number): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);
      const response = await apiClient.deletePantryItem(id);
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      // Remove the item from local state
      setItems(prev => prev.filter(item => item.id !== id));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete pantry item');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
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
  };
};

export default usePantry;