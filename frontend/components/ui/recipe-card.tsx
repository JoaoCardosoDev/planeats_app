"use client"

import * as React from "react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ChefHat, Heart, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RecipeCardProps {
  id: string | number
  title: string
  description?: string
  image?: string
  prepTime?: number
  cookTime?: number
  difficulty?: "Fácil" | "Médio" | "Difícil"
  rating?: number
  calories?: number
  isFavorite?: boolean
  tags?: string[]
  onClick?: () => void
  onFavoriteToggle?: (id: string | number) => void
  className?: string
  variant?: "default" | "compact" | "detailed"
}

const difficultyColors = {
  "Fácil": "bg-green-100 text-green-800",
  "Médio": "bg-yellow-100 text-yellow-800", 
  "Difícil": "bg-red-100 text-red-800"
}

const RecipeCard = React.forwardRef<
  HTMLDivElement,
  RecipeCardProps
>(({
  id,
  title,
  description,
  image,
  prepTime,
  cookTime,
  difficulty,
  rating,
  calories,
  isFavorite = false,
  tags = [],
  onClick,
  onFavoriteToggle,
  className,
  variant = "default",
  ...props
}, ref) => {
  const totalTime = (prepTime || 0) + (cookTime || 0)
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFavoriteToggle?.(id)
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
        <div className="flex">
          <div className="relative w-24 h-24 flex-shrink-0">
            <OptimizedImage
              src={image || "/placeholder.svg"}
              alt={title}
              fill
              aspectRatio="square"
              className="object-cover"
            />
          </div>
          <CardContent className="flex-1 p-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-green-700 truncate">{title}</h3>
                {description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {totalTime > 0 && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Clock className="h-3 w-3" />
                      <span>{totalTime} min</span>
                    </div>
                  )}
                  {difficulty && (
                    <Badge variant="outline" className={cn("text-xs", difficultyColors[difficulty])}>
                      {difficulty}
                    </Badge>
                  )}
                </div>
              </div>
              {onFavoriteToggle && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-2"
                  onClick={handleFavoriteClick}
                >
                  <Heart className={cn("h-3 w-3", isFavorite && "fill-rose-500 text-rose-500")} />
                </Button>
              )}
            </div>
          </CardContent>
        </div>
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
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <OptimizedImage
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            aspectRatio="landscape"
            className="object-cover"
          />
          
          {/* Badges overlay */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {difficulty && (
              <Badge className={cn("text-xs", difficultyColors[difficulty])}>
                {difficulty}
              </Badge>
            )}
            {tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Favorite button */}
          {onFavoriteToggle && (
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm",
                  isFavorite ? "text-rose-500" : "text-gray-500"
                )}
                onClick={handleFavoriteClick}
              >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-green-700 line-clamp-1">{title}</h3>
          
          {description && (
            <p className="text-sm text-green-600 line-clamp-2">{description}</p>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              {totalTime > 0 && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Clock className="h-4 w-4" />
                  <span>{totalTime} min</span>
                </div>
              )}
              
              {variant === "detailed" && calories && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <ChefHat className="h-4 w-4" />
                  <span>{calories} cal</span>
                </div>
              )}
            </div>

            {rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

RecipeCard.displayName = "RecipeCard"

export { RecipeCard, type RecipeCardProps }
