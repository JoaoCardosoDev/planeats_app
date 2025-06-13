"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  fallback = <AuthLoadingFallback />,
  redirectTo = "/login"
}: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (status === "unauthenticated") {
      // Store the current path to redirect back after login
      const currentPath = window.location.pathname + window.location.search
      const loginUrl = `${redirectTo}?callbackUrl=${encodeURIComponent(currentPath)}`
      router.replace(loginUrl)
    }
  }, [status, router, redirectTo])

  // Show loading while checking authentication
  if (status === "loading") {
    return <>{fallback}</>
  }

  // If not authenticated, show nothing (redirect is happening)
  if (status === "unauthenticated") {
    return <>{fallback}</>
  }

  // If authenticated, render the protected content
  return <>{children}</>
}

function AuthLoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
      <p className="text-muted-foreground">Verificando autenticação...</p>
    </div>
  )
}

// Hook for checking if user is authenticated
export function useAuthRequired() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const requireAuth = (redirectTo: string = "/login") => {
    if (status === "loading") return false
    
    if (status === "unauthenticated") {
      const currentPath = window.location.pathname + window.location.search
      const loginUrl = `${redirectTo}?callbackUrl=${encodeURIComponent(currentPath)}`
      router.replace(loginUrl)
      return false
    }
    
    return true
  }

  return {
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    session,
    requireAuth
  }
}
