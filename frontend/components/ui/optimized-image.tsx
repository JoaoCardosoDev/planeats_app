"use client"

import * as React from "react"
import Image, { ImageProps } from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string
  alt: string
  fallbackSrc?: string
  aspectRatio?: "square" | "video" | "portrait" | "landscape" | "wide"
  containerClassName?: string
  priority?: boolean
  quality?: number
}

const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video", // 16:9
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[21/9]"
}

const OptimizedImage = React.forwardRef<
  HTMLImageElement,
  OptimizedImageProps
>(({
  src,
  alt,
  fallbackSrc = "/placeholder.svg",
  aspectRatio,
  containerClassName,
  className,
  priority = false,
  quality = 75,
  fill = false,
  width,
  height,
  sizes,
  ...props
}, ref) => {
  const [imgSrc, setImgSrc] = React.useState(src)
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)

  // Reset state when src changes
  React.useEffect(() => {
    setImgSrc(src)
    setIsLoading(true)
    setHasError(false)
  }, [src])

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
      setHasError(true)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // Container for fill images with aspect ratio
  if (fill) {
    return (
      <div className={cn(
        "relative overflow-hidden",
        aspectRatio && aspectRatioClasses[aspectRatio],
        containerClassName
      )}>
        <Image
          ref={ref}
          src={imgSrc}
          alt={alt}
          fill
          className={cn(
            "object-cover transition-opacity duration-300",
            isLoading && "opacity-0",
            !isLoading && "opacity-100",
            className
          )}
          priority={priority}
          quality={quality}
          sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
      </div>
    )
  }

  // Standard images with explicit dimensions
  return (
    <div className={cn(
      "relative",
      aspectRatio && aspectRatioClasses[aspectRatio],
      containerClassName
    )}>
      <Image
        ref={ref}
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "transition-opacity duration-300",
          isLoading && "opacity-0",
          !isLoading && "opacity-100",
          aspectRatio && "w-full h-auto object-cover",
          className
        )}
        priority={priority}
        quality={quality}
        sizes={sizes}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
      {isLoading && width && height && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse rounded-md"
          style={{ width, height }}
        />
      )}
    </div>
  )
})

OptimizedImage.displayName = "OptimizedImage"

export { OptimizedImage, type OptimizedImageProps }
