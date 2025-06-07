"use client"

import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Filter, SortAsc, SortDesc, Clock, X } from "lucide-react"
import { PantryFilters as PantryFiltersType } from "@/lib/api/pantry"

interface PantryFiltersProps {
  filters: PantryFiltersType
  onFiltersChange: (filters: PantryFiltersType) => void
  itemCount?: number
}

export function PantryFilters({ filters, onFiltersChange, itemCount }: PantryFiltersProps) {
  const handleFilterChange = (key: keyof PantryFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.keys(filters).length > 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4" />
          Filtros e Ordenação
          {itemCount !== undefined && (
            <Badge variant="outline" className="ml-auto">
              {itemCount} {itemCount === 1 ? 'item' : 'itens'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Expiring Soon Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Filtrar por Validade</label>
          <Select 
            value={filters.expiring_soon?.toString() || "all"} 
            onValueChange={(value) => 
              handleFilterChange('expiring_soon', value === "all" ? undefined : value === "true")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar filtro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os itens</SelectItem>
              <SelectItem value="true">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  A expirar em breve (7 dias)
                </div>
              </SelectItem>
              <SelectItem value="false">Não expiram em breve</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Sort By */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Ordenar por</label>
          <Select 
            value={filters.sort_by || "added_at"} 
            onValueChange={(value) => handleFilterChange('sort_by', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar campo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="added_at">Data de adição</SelectItem>
              <SelectItem value="item_name">Nome do item</SelectItem>
              <SelectItem value="expiration_date">Data de validade</SelectItem>
              <SelectItem value="quantity">Quantidade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Ordem</label>
          <Select 
            value={filters.sort_order || "desc"} 
            onValueChange={(value) => handleFilterChange('sort_order', value as 'asc' | 'desc')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar ordem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">
                <div className="flex items-center gap-2">
                  <SortAsc className="h-4 w-4" />
                  Crescente (A-Z, mais antigo)
                </div>
              </SelectItem>
              <SelectItem value="desc">
                <div className="flex items-center gap-2">
                  <SortDesc className="h-4 w-4" />
                  Decrescente (Z-A, mais recente)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <>
            <Separator />
            <Button 
              variant="outline" 
              onClick={clearFilters} 
              className="w-full"
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="font-medium">Filtros ativos:</div>
            {filters.expiring_soon !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {filters.expiring_soon ? "A expirar em breve" : "Não expira em breve"}
              </Badge>
            )}
            {filters.sort_by && (
              <Badge variant="outline" className="text-xs ml-1">
                Ordenar: {getSortFieldLabel(filters.sort_by)} ({filters.sort_order === 'asc' ? '↑' : '↓'})
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getSortFieldLabel(field: string): string {
  const labels = {
    'item_name': 'Nome',
    'expiration_date': 'Validade',
    'added_at': 'Data adição',
    'quantity': 'Quantidade'
  }
  return labels[field as keyof typeof labels] || field
}
