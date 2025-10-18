'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Spinner } from '@/components/ui/Spinner'
import { ProfileSettings } from '@/components/profile'
import { AuthFlow } from '@/components/auth'

/**
 * Unified Profile Page
 * 
 * Behavior:
 * - If NOT authenticated → Show login/register flow
 * - If authenticated → Show profile/account settings
 * 
 * This replaces the old /account route with a more intuitive flow
 */
export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Check for session expiration message
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionExpired = sessionStorage.getItem('session_expired')
      if (sessionExpired) {
        sessionStorage.removeItem('session_expired')
        // The AuthFlow component will handle showing the expiration message
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
        <Header />
        <main className="flex-grow pt-24 sm:pt-28 flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-full border glass px-6 py-3 text-sm font-medium uppercase tracking-wider" 
               style={{ 
                 color: 'var(--color-text-secondary)',
                 borderColor: 'var(--color-border)'
               }}>
            <Spinner size="sm" />
            Loading...
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      <Header />
      <main className="flex-grow pt-24 sm:pt-28">
        {isAuthenticated && user ? (
          <ProfileSettings />
        ) : (
          <AuthFlow />
        )}
      </main>
      <Footer />
    </div>
  )
}
