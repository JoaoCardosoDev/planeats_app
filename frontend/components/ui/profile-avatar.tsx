"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ProfileAvatarProps {
  src?: string | null
  name?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  fallbackClassName?: string
  showOnlineStatus?: boolean
  isOnline?: boolean
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10", 
  lg: "h-16 w-16",
  xl: "h-24 w-24"
}

const ProfileAvatar = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  ProfileAvatarProps
>(({
  src,
  name,
  size = "md",
  className,
  fallbackClassName,
  showOnlineStatus = false,
  isOnline = false,
  ...props
}, ref) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const fallbackText = name ? getInitials(name) : "U"

  return (
    <div className="relative">
      <Avatar
        ref={ref}
        className={cn(
          sizeClasses[size],
          "border-2 border-green-200",
          className
        )}
        {...props}
      >
        <AvatarImage 
          src={src || "/placeholder-user.jpg"} 
          alt={name ? `Foto de ${name}` : "Foto de perfil"}
          className="object-cover"
        />
        <AvatarFallback 
          className={cn(
            "bg-green-100 text-green-700 font-semibold",
            fallbackClassName
          )}
        >
          {fallbackText}
        </AvatarFallback>
      </Avatar>
      
      {showOnlineStatus && (
        <div className={cn(
          "absolute bottom-0 right-0 rounded-full border-2 border-white",
          size === "sm" && "h-2 w-2",
          size === "md" && "h-3 w-3",
          size === "lg" && "h-4 w-4",
          size === "xl" && "h-5 w-5",
          isOnline ? "bg-green-500" : "bg-gray-400"
        )} />
      )}
    </div>
  )
})

ProfileAvatar.displayName = "ProfileAvatar"

export { ProfileAvatar, type ProfileAvatarProps }
