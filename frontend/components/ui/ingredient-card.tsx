"use client"

import * as React from "react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Edit, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface IngredientCardProps {
  id: string | number
  name: string
  category?: string
  quantity?: string
  expiryDate?: string
  image?: string
  isExpiringSoon?: boolean
  isExpired?: boolean
  onClick?: () => void
  onEdit?: (id: string | number) => void
  onDelete?: (id: string | number) => void
  className?: string
  variant?: "default" | "compact" | "list"
  showActions?: boolean
}

const IngredientCard = React.forwardRef<
  HTMLDivElement,
  IngredientCardProps
>(({
  id,
  name,
  category,
  quantity,
  expiryDate,
  image,
  isExpiringSoon = false,
  isExpired = false,
  onClick,
  onEdit,
  onDelete,
  className,
  variant = "default",
  showActions = true,
  ...props
}, ref) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(id)
  }

  const getExpiryBadge = () => {
    if (isExpired) {
      return <Badge variant="destructive" className="text-xs">Vencido</Badge>
    }
    if (isExpiringSoon) {
      return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Vence em breve</Badge>
    }
    return null
  }

  const getImageSrc = () => {
    if (image) return image
    // Tentar encontrar imagem baseada no nome
    const imageName = name.toLowerCase().replace(/\s+/g, '-')
    return `/images/ingredients/${imageName}.jpg`
  }

  if (variant === "list") {
    return (
      <Card 
        ref={ref}
        className={cn(
          "overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
          className
        )}
        onClick={onClick}
        {...props}
      >
        <CardContent className="p-0">
          <div className="flex items-center">
            <div className="relative h-16 w-16 flex-shrink-0">
              <OptimizedImage
                src={getImageSrc()}
                alt={name}
                fill
                aspectRatio="square"
                className="object-cover"
                fallbackSrc="/placeholder.svg"
              />
            </div>
            
            <div className="flex-1 p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-green-700 truncate">{name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {category && (
                      <Badge variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    )}
                    {quantity && (
                      <span className="text-xs text-muted-foreground">{quantity}</span>
                    )}
                  </div>
                  {expiryDate && (
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{expiryDate}</span>
                      {getExpiryBadge()}
                    </div>
                  )}
                </div>
                
                {showActions && (
                  <div className="flex gap-1 ml-2">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleEdit}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-700"
                        onClick={handleDelete}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === "compact") {
    return (
      <Card 
        ref={ref}
        className={cn(
          "overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
          className
        )}
        onClick={onClick}
        {...props}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 flex-shrink-0">
              <OptimizedImage
                src={getImageSrc()}
                alt={name}
                fill
                aspectRatio="square"
                className="object-cover rounded-md"
                fallbackSrc="/placeholder.svg"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-green-700 truncate text-sm">{name}</h3>
              {quantity && (
                <p className="text-xs text-muted-foreground">{quantity}</p>
              )}
              {getExpiryBadge()}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      ref={ref}
      className={cn(
        "overflow-hidden cursor-pointer hover:shadow-lg transition-shadow",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className="relative h-32 w-full">
        <OptimizedImage
          src={getImageSrc()}
          alt={name}
          fill
          aspectRatio="landscape"
          className="object-cover"
          fallbackSrc="/placeholder.svg"
        />
        
        {/* Status badges */}
        <div className="absolute top-2 left-2">
          {getExpiryBadge()}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="absolute top-2 right-2 flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full bg-white/80 backdrop-blur-sm"
                onClick={handleEdit}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full bg-white/80 backdrop-blur-sm text-red-500"
                onClick={handleDelete}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      <CardContent className="p-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-green-700 text-sm truncate">{name}</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {category && (
                <Badge variant="outline" className="text-xs">
                  {category}
                </Badge>
              )}
              {quantity && (
                <span className="text-xs text-muted-foreground">{quantity}</span>
              )}
            </div>
            
            {expiryDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{expiryDate}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

IngredientCard.displayName = "IngredientCard"

export { IngredientCard, type IngredientCardProps }
