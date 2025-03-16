import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isChecking, setIsChecking] = useState(true)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    // Beri waktu sebentar untuk memastikan state auth sudah diload
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        window.location.href = '/login'
      }
      setIsChecking(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [isAuthenticated])

  if (isChecking) {
    return null // atau loading spinner
  }

  return isAuthenticated ? <>{children}</> : null
} 