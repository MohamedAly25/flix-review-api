'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AccountLayout } from '@/components/account'

export default function AccountPage() {
  const { user, isAuthenticated, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editedBio, setEditedBio] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEditClick = () => {
    setEditedBio(user?.bio || '')
    setIsEditing(true)
    setError(null)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedBio('')
    setError(null)
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('bio', editedBio)

      await updateProfile(formData)
      setIsEditing(false)
      setEditedBio('')
    } catch (err) {
      setError('Failed to update profile. Please try again.')
      console.error('Profile update error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-600">Please log in to access your account settings</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center px-6 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">
        <div className="w-full max-w-[1200px]">
          <AccountLayout
            user={user}
            isEditing={isEditing}
            editedBio={editedBio}
            isSaving={isSaving}
            onEditClick={handleEditClick}
            onCancelEdit={handleCancelEdit}
            onSaveProfile={handleSaveProfile}
            onBioChange={setEditedBio}
          />

          {error && (
            <div className="mt-6 p-4 bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.45)] rounded-2xl shadow-[var(--shadow-md)] animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-200">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex rounded-md p-1.5 text-red-300 hover:bg-[rgba(229,9,20,0.2)] hover:text-red-100 focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:ring-offset-2 focus:ring-offset-[var(--flix-bg-secondary)]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
        <Footer />
      </div>
    )
  }
