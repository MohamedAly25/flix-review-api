'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PageLayout, PageHero, PageSection } from '@/components/layout'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { ProfileSettings } from '@/components/profile'
import { AuthFlow } from '@/components/auth'
import { User as UserIcon } from 'lucide-react'

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

  // Loading state with improved spinner
  if (isLoading) {
    return (
      <PageLayout mainClassName="flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" variant="accent" />
          <Badge variant="glass" size="md" icon={<UserIcon className="w-4 h-4" />}>
            Loading your profile...
          </Badge>
        </div>
      </PageLayout>
    )
  }

  const heroTitle = isAuthenticated && user
    ? `Welcome back${user.first_name ? `, ${user.first_name}` : ''}`
    : 'Your FlixReview Profile'

  const heroDescription = isAuthenticated && user
    ? 'Manage your account details, fine-tune preferences, and keep your cinematic identity polished.'
    : 'Log in or create an account to personalize your FlixReview experience and track every review you share.'

  return (
    <PageLayout>
      <PageHero
        icon={<UserIcon className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: 'var(--color-accent)' }} />}
        title={heroTitle}
        description={heroDescription}
        align="center"
        actions={
          isAuthenticated && user ? (
            <Badge variant="glass" size="md">{user.email}</Badge>
          ) : undefined
        }
      />

      <PageSection containerClassName="space-y-0 p-0">
        {isAuthenticated && user ? <ProfileSettings /> : <AuthFlow />}
      </PageSection>
    </PageLayout>
  )
}
