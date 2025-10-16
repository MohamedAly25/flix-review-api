'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { AxiosError } from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AccountLayout, PreferredGenresCard } from '@/components/account'
import { genresService } from '@/services/genres'
import { userPreferencesService } from '@/services/userPreferences'
import type { ApiError } from '@/types/api'
import { Spinner } from '@/components/ui/Spinner'

const SELECTION_LIMIT = 3

export default function AccountPage() {
  const { user, isAuthenticated, updateProfile, refreshUser, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editedBio, setEditedBio] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([])
  const [preferencesMessage, setPreferencesMessage] = useState<string | null>(null)
  const [preferencesError, setPreferencesError] = useState<string | null>(null)

  const {
    data: preferencesData,
    isLoading: preferencesLoading,
    error: preferencesQueryError,
  } = useQuery({
    queryKey: ['users', 'preferred-genres'],
    queryFn: () => userPreferencesService.getPreferredGenres(),
    enabled: isAuthenticated,
    retry: false,
  })

  const {
    data: genresData,
    isLoading: genresLoading,
    error: genresError,
  } = useQuery({
    queryKey: ['genres', 'all'],
    queryFn: () => genresService.getGenres(),
    enabled: isAuthenticated,
  })

  useEffect(() => {
    if (preferencesData) {
      setSelectedGenreIds(preferencesData.preferred_genre_ids ?? [])
      setPreferencesError(null)
    }
  }, [preferencesData])

  const sortedGenres = useMemo(() => {
    if (!genresData) return [] as Array<{ id: number; name: string; slug: string }>
    return [...genresData]
      .map(({ id, name, slug }) => ({ id, name, slug }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [genresData])

  const hasChanges = useMemo(() => {
    const initialGenreIds = preferencesData?.preferred_genre_ids ?? []

    if (selectedGenreIds.length !== initialGenreIds.length) return true
    const current = new Set(initialGenreIds)
    return selectedGenreIds.some((id) => !current.has(id))
  }, [preferencesData?.preferred_genre_ids, selectedGenreIds])

  const disablePreferenceSubmit = Boolean(preferencesData?.cooldown_active && hasChanges)

  const extractErrorMessage = (err: unknown): string => {
    const axiosError = err as AxiosError<ApiError>
    const data = axiosError?.response?.data
    if (data?.detail) return data.detail
    if (data?.message) return data.message
    const entries = data?.errors ? Object.values(data.errors) : []
    for (const entry of entries) {
      if (Array.isArray(entry) && entry.length > 0) {
        const candidate = entry[0]
        if (typeof candidate === 'string') return candidate
      }
      if (typeof entry === 'string') {
        return entry
      }
    }
    return 'We could not update your preferred genres. Please try again later.'
  }

  const mutation = useMutation({
    mutationFn: (genreIds: number[]) => userPreferencesService.updatePreferredGenres(genreIds),
    onSuccess: async (data) => {
      setSelectedGenreIds(data.preferred_genre_ids ?? [])
      setPreferencesError(null)
      setPreferencesMessage('Preferences updated successfully. Your recommendations will refresh shortly.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['recommendations', 'for-you'] }),
        queryClient.invalidateQueries({ queryKey: ['recommendations', 'taste-profile'] }),
        queryClient.invalidateQueries({ queryKey: ['users', 'preferred-genres'] }),
      ])
      await refreshUser()
    },
    onError: (err) => {
      setPreferencesMessage(null)
      setPreferencesError(extractErrorMessage(err))
    },
  })

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

  const handleToggleGenre = (genreId: number) => {
    setPreferencesMessage(null)
    setPreferencesError(null)
    setSelectedGenreIds((prev) => {
      if (prev.includes(genreId)) {
        return prev.filter((id) => id !== genreId)
      }
      if (prev.length >= SELECTION_LIMIT) {
        setPreferencesError(`You can select up to ${SELECTION_LIMIT} genres.`)
        return prev
      }
      return [...prev, genreId]
    })
  }

  const handleSavePreferences = () => {
    if (!hasChanges || disablePreferenceSubmit) return
    mutation.mutate(selectedGenreIds)
  }

  const handleResetPreferences = () => {
    setPreferencesMessage(null)
    setPreferencesError(null)
    setSelectedGenreIds([])
  }

  const preferencesQueryMessage = useMemo(() => {
    if (!preferencesQueryError) return null
    return 'Unable to load your preferred genres right now. Please refresh the page.'
  }, [preferencesQueryError])

  const genresQueryMessage = genresError ? 'Unable to load genres. Please refresh the page.' : null

  const cardError = preferencesError || preferencesQueryMessage || genresQueryMessage

  const preferredGenresCard = isAuthenticated ? (
    <PreferredGenresCard
      isLoading={preferencesLoading || genresLoading}
      isSaving={mutation.isPending}
      genres={sortedGenres}
      selectedGenreIds={selectedGenreIds}
      onToggleGenre={handleToggleGenre}
      onSave={handleSavePreferences}
      onReset={handleResetPreferences}
      hasChanges={hasChanges}
      cooldownActive={Boolean(preferencesData?.cooldown_active)}
      daysUntilNextUpdate={preferencesData?.days_until_next_update ?? 0}
      lastUpdated={preferencesData?.last_genre_update ?? null}
      nextUpdateAvailableAt={preferencesData?.next_update_available_at ?? null}
      message={preferencesMessage}
      error={cardError}
      selectionLimit={SELECTION_LIMIT}
      disableSubmit={disablePreferenceSubmit}
    />
  ) : null

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col flix-bg-primary">
        <Header />
        <main className="flex-grow pt-24 sm:pt-28 flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-medium uppercase tracking-[0.22em] text-white/70">
            <Spinner size="sm" />
            Loading account data…
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col flix-bg-primary">
        <Header />
        <main className="flex-grow pt-24 sm:pt-28 flex items-center justify-center px-6">
          <div className="flix-card w-full max-w-lg space-y-4 bg-white/5 p-10 text-center">
            <h1 className="text-2xl font-semibold text-white">Sign in to manage your profile</h1>
            <p className="text-sm text-white/70">
              Update your bio, avatar, and preferred genres after logging in. You&apos;ll be redirected once signed in.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/login?next=/account"
                className="inline-flex items-center gap-2 rounded-full border border-flix-accent/40 bg-flix-accent px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-flix-accent-hover"
              >
                Go to login
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-white/20"
              >
                Create account
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col account-page-container">
      <Header />
      <main className="flex-grow pt-24 sm:pt-28 pb-16 sm:pb-20 lg:pb-24">
        {/* Hero Section */}
        <div className="account-hero-section">
          <div className="account-content-wrapper">
            <h1 className="account-hero-title">Your Profile</h1>
            <p className="account-hero-subtitle">
              Manage your personal information, preferences, and customize your FlixReview experience.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="account-content-wrapper">
          <div className="relative">
            <AccountLayout
              user={user}
              isEditing={isEditing}
              editedBio={editedBio}
              isSaving={isSaving}
              onEditClick={handleEditClick}
              onCancelEdit={handleCancelEdit}
              onSaveProfile={handleSaveProfile}
              onBioChange={setEditedBio}
              preferredGenresCard={preferredGenresCard}
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
        </div>
      </main>
      <Footer />
    </div>
    )
  }
