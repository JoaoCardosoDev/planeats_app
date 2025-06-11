"use client"

import * as React from "react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "full" | "icon"
  className?: string
  showText?: boolean
  textClassName?: string
}

const sizeClasses = {
  sm: { image: "h-6 w-6", text: "text-lg" },
  md: { image: "h-8 w-8", text: "text-xl" },
  lg: { image: "h-12 w-12", text: "text-2xl" },
  xl: { image: "h-16 w-16", text: "text-3xl" }
}

const Logo = React.forwardRef<
  HTMLDivElement,
  LogoProps
>(({
  size = "md",
  variant = "full",
  className,
  showText = true,
  textClassName,
  ...props
}, ref) => {
  const { image: imageSize, text: textSize } = sizeClasses[size]

  if (variant === "icon") {
    return (      <div 
        ref={ref}
        className={cn("flex items-center", className)}
        {...props}
      >
        <OptimizedImage
          src="/images/Logo.png"
          alt="PlanEats Logo"
          width={parseInt(imageSize.split('-')[1]) * 4}
          height={parseInt(imageSize.split('-')[1]) * 4}
          className={cn("rounded-full", imageSize)}
          fallbackSrc="/placeholder-logo.svg"
          priority
        />
      </div>
    )
  }

  return (    <div 
      ref={ref}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      <OptimizedImage
        src="/images/Logo.png"
        alt="PlanEats Logo"
        width={parseInt(imageSize.split('-')[1]) * 4}
        height={parseInt(imageSize.split('-')[1]) * 4}
        className={cn("rounded-full", imageSize)}
        fallbackSrc="/placeholder-logo.svg"
        priority
      />
      {showText && (
        <span className={cn(
          "font-bold text-green-700",
          textSize,
          textClassName
        )}>
          Plan<span className="text-amber-500">Eats</span>
        </span>
      )}
    </div>
  )
})

Logo.displayName = "Logo"

export { Logo, type LogoProps }
