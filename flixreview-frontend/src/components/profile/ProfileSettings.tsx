'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { isAxiosError } from 'axios'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { 
  profileUpdateSchema, 
  passwordChangeSchema,
  accountDeletionSchema,
  type ProfileUpdateInput, 
  type PasswordChangeInput,
  type AccountDeletionInput
} from '@/lib/validations/schemas'
import { Spinner } from '@/components/ui/Spinner'
import { 
  AlertCircle, 
  CheckCircle, 
  User, 
  Lock, 
  LogOut, 
  Eye, 
  EyeOff, 
  Upload,
  Trash2,
  AlertTriangle,
  X,
  Camera,
  Mail,
  Shield,
  Film,
  Check
} from 'lucide-react'
import api from '@/lib/api/client'
import { genresService } from '@/services/genres'
import { userPreferencesService } from '@/services/userPreferences'

type SettingsTab = 'profile' | 'security' | 'danger'

const areGenreListsEqual = (a: number[], b: number[]) => {
  if (a.length !== b.length) {
    return false
  }

  const sortedA = [...a].sort((left, right) => left - right)
  const sortedB = [...b].sort((left, right) => left - right)

  return sortedA.every((value, index) => value === sortedB[index])
}

/**
 * Profile Settings Component
 * Allows authenticated users to edit their profile and account settings
 */
export function ProfileSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [isGenresLoading, setIsGenresLoading] = useState(false)
  const [staggerDelay, setStaggerDelay] = useState(0)
  
  const router = useRouter()
  const { user, logout } = useAuth()
  
  // Fetch all genres
  const { data: allGenres = [], isLoading: genresLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: () => genresService.getGenres(),
  })
  
  // Fetch user's preferred genres
  const { data: userGenresData, refetch: refetchUserGenres } = useQuery({
    queryKey: ['user-genres'],
    queryFn: () => userPreferencesService.getPreferredGenres(),
    enabled: !!user,
  })

  const originalGenreIds = userGenresData?.preferred_genre_ids ?? []
  const genreCooldownActive = Boolean(userGenresData?.cooldown_active)
  const daysUntilNextGenreUpdate = userGenresData?.days_until_next_update ?? 0
  const nextGenreUpdateInDays = Math.max(1, daysUntilNextGenreUpdate)
  const genreCooldownMessage = genreCooldownActive
    ? `You can update your favorites again in ${nextGenreUpdateInDays} ${nextGenreUpdateInDays === 1 ? 'day' : 'days'}.`
    : ''
  const hasGenreChanges = !areGenreListsEqual(selectedGenres, originalGenreIds)
  const disableGenreSave = isGenresLoading || !hasGenreChanges || (genreCooldownActive && hasGenreChanges)
  
  // Profile form
  const profileForm = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    mode: 'onBlur',
    defaultValues: {
      username: user?.username || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      bio: user?.bio || '',
    },
  })
  
  // Password form
  const passwordForm = useForm<PasswordChangeInput>({
    resolver: zodResolver(passwordChangeSchema),
    mode: 'onBlur',
  })
  
  // Delete account form
  const deleteForm = useForm<AccountDeletionInput>({
    resolver: zodResolver(accountDeletionSchema),
    mode: 'onBlur',
  })
  
  // Reset forms when user data loads
  useEffect(() => {
    if (user) {
      profileForm.reset({
        username: user.username,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
      })
    }
  }, [user, profileForm])
  
  // Initialize selected genres
  useEffect(() => {
    if (userGenresData?.preferred_genre_ids) {
      setSelectedGenres(userGenresData.preferred_genre_ids)
    }
  }, [userGenresData])
  
  // Staggered animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setStaggerDelay(1)
    }, 100)
    return () => clearTimeout(timer)
  }, [])
  
  // Clear messages when switching tabs
  useEffect(() => {
    setErrorMessage(null)
    setSuccessMessage(null)
  }, [activeTab])
  
  const handleProfileUpdate = async (data: ProfileUpdateInput) => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      setSuccessMessage(null)
      
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString())
        }
      })
      
      if (profileImage) {
        formData.append('profile_picture', profileImage)
      }
      
      await api.patch(`/users/profile/`, formData)
      setSuccessMessage('Profile updated successfully!')
      
      // Reload user data
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Failed to update profile. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  const handlePasswordChange = async (data: PasswordChangeInput) => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      setSuccessMessage(null)
      
      await api.post('/users/change-password/', data)
      setSuccessMessage('Password changed successfully! 🎉')
      passwordForm.reset()
      
      // Hide passwords
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    } catch (error: any) {
      if (isAxiosError(error)) {
        const status = error.response?.status
        const data = error.response?.data
        
        if (status === 429) {
          setErrorMessage('⏱️ Too many attempts. Please wait 1 hour before trying again.')
        } else if (status === 400) {
          // Extract specific field errors
          if (data?.errors?.current_password) {
            setErrorMessage('❌ Current password is incorrect.')
          } else if (data?.errors?.new_password_confirm) {
            setErrorMessage('❌ New passwords do not match.')
          } else if (data?.detail) {
            setErrorMessage(`❌ ${data.detail}`)
          } else {
            setErrorMessage('❌ Invalid data. Please check your inputs.')
          }
        } else if (data?.detail) {
          setErrorMessage(`❌ ${data.detail}`)
        } else {
          setErrorMessage('❌ Failed to change password. Please try again.')
        }
      } else if (error instanceof Error) {
        setErrorMessage(`❌ ${error.message}`)
      } else {
        setErrorMessage('❌ Failed to change password. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleAccountDeletion = async (data: AccountDeletionInput) => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      
      await api.post('/users/delete-account/', {
        password: data.password
      })
      
      setSuccessMessage('✅ Account deleted successfully. Redirecting to homepage...')
      setShowDeleteModal(false)
      
      setTimeout(async () => {
        await logout()
        router.push('/')
      }, 2000)
    } catch (error: any) {
      if (isAxiosError(error)) {
        const status = error.response?.status
        const data = error.response?.data
        
        if (status === 429) {
          setErrorMessage('⏱️ Too many deletion attempts. Please wait 1 hour before trying again.')
        } else if (status === 400 || status === 401) {
          if (data?.errors?.password) {
            setErrorMessage('❌ Password is incorrect. Please try again.')
          } else if (data?.detail) {
            setErrorMessage(`❌ ${data.detail}`)
          } else {
            setErrorMessage('❌ Incorrect password. Please try again.')
          }
        } else if (data?.detail) {
          setErrorMessage(`❌ ${data.detail}`)
        } else {
          setErrorMessage('❌ Failed to delete account. Please try again.')
        }
      } else if (error instanceof Error) {
        setErrorMessage(`❌ ${error.message}`)
      } else {
        setErrorMessage('❌ Failed to delete account. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size must be less than 5MB')
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select a valid image file')
        return
      }
      
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setErrorMessage(null)
    }
  }
  
  const removeProfileImage = () => {
    setProfileImage(null)
    setProfileImagePreview(null)
  }
  
  const handleLogout = async () => {
    await logout()
    router.push('/')
  }
  
  const toggleGenre = (genreId: number) => {
    setErrorMessage(null)
    setSuccessMessage(null)

    setSelectedGenres(prev => {
      const isRemoving = prev.includes(genreId)
      if (!isRemoving && prev.length >= 3) {
        setErrorMessage('You can select up to 3 favorite genres.')
        return prev
      }

      const nextSelection = isRemoving
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]

      if (genreCooldownActive && !areGenreListsEqual(nextSelection, originalGenreIds)) {
        setErrorMessage(genreCooldownMessage || 'You can update your favorites again soon.')
        return prev
      }

      return nextSelection
    })
  }
  
  const handleSaveGenres = async () => {
    try {
      setIsGenresLoading(true)
      setErrorMessage(null)
      setSuccessMessage(null)
      
      const updatedPreferences = await userPreferencesService.updatePreferredGenres(selectedGenres)
      const refreshed = await refetchUserGenres()

      const latestPreferred = refreshed.data?.preferred_genre_ids
        ?? updatedPreferences.preferred_genre_ids
        ?? []

      setSelectedGenres(latestPreferred)
      setSuccessMessage('Genre preferences updated successfully!')
    } catch (error) {
      if (isAxiosError(error)) {
        const responseData = error.response?.data as Record<string, unknown> | undefined

        let detailMessage = 'Failed to update genre preferences. Please try again.'

        if (responseData && typeof responseData === 'object') {
          if ('detail' in responseData && typeof (responseData as { detail?: unknown }).detail === 'string') {
            detailMessage = (responseData as { detail: string }).detail
          } else if ('preferred_genre_ids' in responseData) {
            const genreErrors = (responseData as { preferred_genre_ids?: unknown }).preferred_genre_ids
            if (Array.isArray(genreErrors)) {
              const firstGenreError = genreErrors.find(
                (candidate): candidate is string => typeof candidate === 'string'
              )
              if (firstGenreError) {
                detailMessage = firstGenreError
              }
            }
          }
        }

        setErrorMessage(detailMessage)
      } else if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Failed to update genre preferences. Please try again.')
      }
    } finally {
      setIsGenresLoading(false)
    }
  }
  
  if (!user) {
    return null
  }
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16 max-w-4xl">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Account Settings
            </h1>
            <p className="text-base sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              Manage your profile, security, and preferences
            </p>
          </div>
          
          {/* Success Message */}
          {successMessage && (
            <div 
              className="glass-heavy rounded-2xl p-5 mb-6 flex items-start gap-4 animate-slide-up shadow-xl"
              style={{ 
                backgroundColor: 'rgba(76, 175, 80, 0.15)',
                borderColor: 'rgba(76, 175, 80, 0.5)',
                border: '2px solid',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(76, 175, 80, 0.2)'
              }}
              role="alert"
              aria-live="polite"
            >
              <div className="flex-shrink-0 p-2 rounded-lg" style={{ backgroundColor: 'rgba(76, 175, 80, 0.2)' }}>
                <CheckCircle className="w-6 h-6" style={{ color: '#4caf50' }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base leading-relaxed" style={{ color: '#4caf50' }}>
                  {successMessage}
                </p>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-white/10"
                aria-label="Dismiss message"
              >
                <X className="w-5 h-5" style={{ color: '#4caf50' }} />
              </button>
            </div>
          )}
          
          {/* Error Message */}
          {errorMessage && (
            <div 
              className="glass-heavy rounded-2xl p-5 mb-6 flex items-start gap-4 animate-slide-up shadow-xl"
              style={{ 
                backgroundColor: 'rgba(244, 67, 54, 0.15)',
                borderColor: 'rgba(244, 67, 54, 0.5)',
                border: '2px solid',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(244, 67, 54, 0.2)'
              }}
              role="alert"
              aria-live="assertive"
            >
              <div className="flex-shrink-0 p-2 rounded-lg" style={{ backgroundColor: 'rgba(244, 67, 54, 0.2)' }}>
                <AlertCircle className="w-6 h-6" style={{ color: '#f44336' }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base leading-relaxed" style={{ color: '#f44336' }}>
                  {errorMessage}
                </p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-white/10"
                aria-label="Dismiss error"
              >
                <X className="w-5 h-5" style={{ color: '#f44336' }} />
              </button>
            </div>
          )}
          
          {/* Tabs Navigation */}
          <div 
            className="flex flex-wrap gap-1 sm:gap-2 lg:gap-4 mb-6 sm:mb-8 border-b pb-0 cinematic-border"
            style={{ borderColor: 'var(--color-border)' }}
            role="tablist"
            aria-label="Account settings sections"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'profile'}
              aria-controls="profile-panel"
              onClick={() => setActiveTab('profile')}
              className={`pb-3 sm:pb-4 px-2 sm:px-3 lg:px-4 font-semibold text-xs sm:text-sm lg:text-base transition-all duration-300 flex items-center gap-1 sm:gap-2 focus-visible relative overflow-hidden group ${
                staggerDelay ? 'animate-slide-up' : 'opacity-0 translate-y-4'
              }`}
              style={{
                animationDelay: staggerDelay ? '0.1s' : '0s',
                color: activeTab === 'profile' ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                borderBottom: activeTab === 'profile' ? '2px solid var(--color-accent)' : '2px solid transparent',
              }}
            >
              <div className="relative z-10 flex items-center gap-2">
                <User className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 transition-transform duration-300 group-hover:scale-110" />
                <span>Profile</span>
              </div>
              {activeTab === 'profile' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rgba(229, 57, 53, 0.1) to-transparent animate-pulse" />
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'security'}
              aria-controls="security-panel"
              onClick={() => setActiveTab('security')}
              className={`pb-3 sm:pb-4 px-2 sm:px-3 lg:px-4 font-semibold text-xs sm:text-sm lg:text-base transition-all duration-300 flex items-center gap-1 sm:gap-2 focus-visible relative overflow-hidden group ${
                staggerDelay ? 'animate-slide-up' : 'opacity-0 translate-y-4'
              }`}
              style={{
                animationDelay: staggerDelay ? '0.2s' : '0s',
                color: activeTab === 'security' ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                borderBottom: activeTab === 'security' ? '2px solid var(--color-accent)' : '2px solid transparent',
              }}
            >
              <div className="relative z-10 flex items-center gap-2">
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 transition-transform duration-300 group-hover:scale-110" />
                <span>Security</span>
              </div>
              {activeTab === 'security' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rgba(229, 57, 53, 0.1) to-transparent animate-pulse" />
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'danger'}
              aria-controls="danger-panel"
              onClick={() => setActiveTab('danger')}
              className={`pb-3 sm:pb-4 px-2 sm:px-3 lg:px-4 font-semibold text-xs sm:text-sm lg:text-base transition-all duration-300 flex items-center gap-1 sm:gap-2 focus-visible relative overflow-hidden group ${
                staggerDelay ? 'animate-slide-up' : 'opacity-0 translate-y-4'
              }`}
              style={{
                animationDelay: staggerDelay ? '0.3s' : '0s',
                color: activeTab === 'danger' ? 'var(--color-error)' : 'var(--color-text-tertiary)',
                borderBottom: activeTab === 'danger' ? '2px solid var(--color-error)' : '2px solid transparent',
              }}
            >
              <div className="relative z-10 flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 transition-transform duration-300 group-hover:scale-110" />
                <span>Danger Zone</span>
              </div>
              {activeTab === 'danger' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rgba(244, 67, 54, 0.1) to-transparent animate-pulse" />
              )}
            </button>
          </div>
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div 
              id="profile-panel" 
              role="tabpanel" 
              aria-labelledby="profile-tab"
              className={`relative glass-heavy rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl cinematic-border transition-all duration-700 overflow-hidden ${
                staggerDelay ? 'animate-scale-in' : 'opacity-0 scale-95'
              }`}
              style={{ 
                animationDelay: staggerDelay ? '0.4s' : '0s',
                background: 'linear-gradient(145deg, rgba(28, 28, 31, 0.95) 0%, rgba(18, 18, 20, 0.98) 50%, rgba(12, 12, 14, 0.95) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
              }}
            >
              {/* Modern gradient overlay */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'radial-gradient(circle at 20% 20%, rgba(229, 57, 53, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(229, 57, 53, 0.08) 0%, transparent 50%)'
                }}
              />
              
              {/* Content wrapper */}
              <div className="relative z-10">
                <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-10" noValidate>
                {/* Profile Image Section */}
                <div className={`transition-all duration-700 ${staggerDelay ? 'animate-slide-up' : 'opacity-0 translate-y-6'}`} style={{ animationDelay: staggerDelay ? '0.5s' : '0s' }}>
                  <label className="block text-base sm:text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                    Profile Picture
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Image Preview */}
                    <div 
                      className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 group transition-all duration-300 hover:scale-105 cinematic-border"
                      style={{ 
                        borderColor: 'var(--color-border)',
                        backgroundColor: 'var(--color-surface)' 
                      }}
                    >
                      {profileImagePreview || user.profile_picture_url ? (
                        <>
                          <img 
                            src={profileImagePreview || user.profile_picture_url || ''} 
                            alt={user.username}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          {profileImagePreview && (
                            <button
                              type="button"
                              onClick={removeProfileImage}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80"
                              aria-label="Remove image"
                            >
                              <X className="w-8 h-8 text-white transition-transform duration-200 hover:scale-110" />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-12 h-12 sm:w-14 sm:h-14 transition-transform duration-300 group-hover:scale-110" style={{ color: 'var(--color-text-tertiary)' }} />
                        </div>
                      )}
                    </div>
                    
                    {/* Upload Button */}
                    <div className="flex-1">
                      <label 
                        htmlFor="profile_picture"
                        className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg focus-visible cinematic-border group"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          border: '2px solid var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        <Camera className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                        <span>Choose Photo</span>
                      </label>
                      <input
                        id="profile_picture"
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="sr-only"
                        aria-label="Upload profile picture"
                      />
                      <p className="text-xs sm:text-sm mt-2 transition-opacity duration-300" style={{ color: 'var(--color-text-tertiary)' }}>
                        JPG, PNG or GIF. Max size 5MB.
                      </p>
                      {profileImagePreview && (
                        <p className="text-xs sm:text-sm mt-1 animate-fade-in" style={{ color: 'var(--color-success)' }}>
                          ✓ New image selected. Click "Save Changes" to upload.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-8" style={{ backgroundColor: 'var(--color-border)' }} />
                
                {/* Form Fields Grid */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 transition-all duration-700 ${staggerDelay ? 'animate-slide-up' : 'opacity-0 translate-y-6'}`} style={{ animationDelay: staggerDelay ? '0.6s' : '0s' }}>
                  {/* Username */}
                  <div className="sm:col-span-2">
                    <div className="relative group">
                      <label 
                        htmlFor="username" 
                        className={`absolute left-12 transition-all duration-300 pointer-events-none ${
                          profileForm.watch('username') || profileForm.formState.isSubmitted 
                            ? 'top-1 text-xs text-accent font-semibold' 
                            : 'top-1/2 -translate-y-1/2 text-sm text-text-tertiary'
                        }`}
                        style={{ color: profileForm.watch('username') || profileForm.formState.isSubmitted ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }}
                      >
                        Username *
                      </label>
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 group-focus-within:text-accent group-focus-within:scale-110 group-hover:scale-105" style={{ color: 'var(--color-text-tertiary)' }} />
                      <input
                        {...profileForm.register('username')}
                        type="text"
                        id="username"
                        autoComplete="username"
                        className="w-full pl-12 pr-4 pt-6 pb-2 rounded-lg border-2 transition-all duration-300 focus-visible hover:border-accent/50 group-hover:shadow-lg group-focus-within:shadow-xl group-focus-within:ring-2 group-focus-within:ring-accent/20"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: profileForm.formState.errors.username ? 'var(--color-error)' : 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                          boxShadow: profileForm.formState.errors.username ? '0 0 0 3px rgba(244, 67, 54, 0.1)' : 'none'
                        }}
                        placeholder=""
                        aria-invalid={!!profileForm.formState.errors.username}
                        aria-describedby={profileForm.formState.errors.username ? 'username-error' : undefined}
                      />
                    </div>
                    {profileForm.formState.errors.username && (
                      <p id="username-error" className="mt-2 text-sm flex items-center gap-1 animate-slide-up" style={{ color: 'var(--color-error)' }} role="alert">
                        <AlertCircle className="w-4 h-4" />
                        {profileForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  
                  {/* First Name */}
                  <div>
                    <div className="relative group">
                      <label 
                        htmlFor="first_name" 
                        className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                          profileForm.watch('first_name') || profileForm.formState.isSubmitted 
                            ? 'top-1 text-xs text-accent font-semibold' 
                            : 'top-1/2 -translate-y-1/2 text-sm text-text-tertiary'
                        }`}
                        style={{ color: profileForm.watch('first_name') || profileForm.formState.isSubmitted ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }}
                      >
                        First Name
                      </label>
                      <input
                        {...profileForm.register('first_name')}
                        type="text"
                        id="first_name"
                        autoComplete="given-name"
                        className="w-full px-4 pt-6 pb-2 rounded-lg border-2 transition-all duration-300 focus-visible hover:border-accent/50 hover:shadow-lg focus:shadow-xl focus:ring-2 focus:ring-accent/20"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                        placeholder=""
                        aria-describedby="first-name-help"
                      />
                    </div>
                    <p id="first-name-help" className="sr-only">Enter your first name (optional)</p>
                  </div>
                  
                  {/* Last Name */}
                  <div>
                    <div className="relative group">
                      <label 
                        htmlFor="last_name" 
                        className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                          profileForm.watch('last_name') || profileForm.formState.isSubmitted 
                            ? 'top-1 text-xs text-accent font-semibold' 
                            : 'top-1/2 -translate-y-1/2 text-sm text-text-tertiary'
                        }`}
                        style={{ color: profileForm.watch('last_name') || profileForm.formState.isSubmitted ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }}
                      >
                        Last Name
                      </label>
                      <input
                        {...profileForm.register('last_name')}
                        type="text"
                        id="last_name"
                        autoComplete="family-name"
                        className="w-full px-4 pt-6 pb-2 rounded-lg border-2 transition-all duration-300 focus-visible hover:border-accent/50 hover:shadow-lg focus:shadow-xl focus:ring-2 focus:ring-accent/20"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                        placeholder=""
                        aria-describedby="last-name-help"
                      />
                    </div>
                    <p id="last-name-help" className="sr-only">Enter your last name (optional)</p>
                  </div>
                </div>
                
                {/* Bio */}
                <div className={`transition-all duration-700 ${staggerDelay ? 'animate-slide-up' : 'opacity-0 translate-y-6'}`} style={{ animationDelay: staggerDelay ? '0.7s' : '0s' }}>
                  <div className="relative group">
                    <label 
                      htmlFor="bio" 
                      className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                        profileForm.watch('bio') || profileForm.formState.isSubmitted 
                          ? 'top-2 text-xs text-accent font-semibold' 
                          : 'top-4 text-sm text-text-tertiary'
                      }`}
                      style={{ color: profileForm.watch('bio') || profileForm.formState.isSubmitted ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }}
                    >
                      Bio
                    </label>
                    <textarea
                      {...profileForm.register('bio')}
                      id="bio"
                      rows={4}
                      className="w-full px-4 pt-8 pb-2 rounded-lg border-2 transition-all duration-300 focus-visible hover:border-accent/50 resize-none hover:shadow-lg focus:shadow-xl focus:ring-2 focus:ring-accent/20"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: profileForm.formState.errors.bio ? 'var(--color-error)' : 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                        boxShadow: profileForm.formState.errors.bio ? '0 0 0 3px rgba(244, 67, 54, 0.1)' : 'none'
                      }}
                      placeholder=""
                      aria-invalid={!!profileForm.formState.errors.bio}
                      aria-describedby={profileForm.formState.errors.bio ? 'bio-error' : undefined}
                    />
                  </div>
                  {profileForm.formState.errors.bio && (
                    <p id="bio-error" className="mt-2 text-sm flex items-center gap-1 animate-slide-up" style={{ color: 'var(--color-error)' }} role="alert">
                      <AlertCircle className="w-4 h-4" />
                      {profileForm.formState.errors.bio.message}
                    </p>
                  )}
                  <p className="mt-2 text-xs transition-opacity duration-300" style={{ color: 'var(--color-text-tertiary)' }}>
                    {profileForm.watch('bio')?.length || 0} / 500 characters
                  </p>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-8" style={{ backgroundColor: 'var(--color-border)' }} />
                
                {/* Genre Preferences */}
                <div className={`transition-all duration-700 ${staggerDelay ? 'animate-slide-up' : 'opacity-0 translate-y-6'}`} style={{ animationDelay: staggerDelay ? '0.8s' : '0s' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Film className="w-5 h-5 transition-transform duration-300 hover:scale-110" style={{ color: 'var(--color-accent)' }} />
                    <label className="block text-base sm:text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Favorite Genres
                    </label>
                  </div>
                  <p className="text-sm mb-4 transition-opacity duration-300" style={{ color: 'var(--color-text-secondary)' }}>
                    Select your favorite movie genres to personalize your recommendations
                  </p>
                  
                  {genresLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Spinner size="sm" />
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {allGenres.map((genre, index) => {
                          const isSelected = selectedGenres.includes(genre.id)
                          return (
                            <button
                              key={genre.id}
                              type="button"
                              onClick={() => toggleGenre(genre.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  toggleGenre(genre.id)
                                }
                              }}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 focus-visible cinematic-border ${
                                staggerDelay ? 'animate-scale-in' : 'opacity-0 scale-95'
                              }`}
                              style={{
                                animationDelay: staggerDelay ? `${0.9 + index * 0.05}s` : '0s',
                                backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-surface)',
                                border: `2px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                color: isSelected ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                              }}
                              aria-pressed={isSelected}
                              aria-label={`${isSelected ? 'Remove' : 'Add'} ${genre.name} to favorite genres`}
                            >
                              {isSelected && <Check className="w-4 h-4 mr-1" />}
                              <span>{genre.name}</span>
                            </button>
                          )
                        })}
                      </div>

                      <p className="text-xs mb-4 animate-fade-in" style={{ color: 'var(--color-text-tertiary)' }}>
                        You can choose up to 3 favorite genres.
                      </p>

                      {genreCooldownActive && (
                        <div className="mb-4 rounded-lg glass p-4 animate-fade-in" style={{ border: '1px solid var(--color-border)' }}>
                          <p className="text-sm flex items-start gap-2" style={{ color: 'var(--color-warning)' }}>
                            <AlertTriangle className="w-4 h-4 mt-0.5" />
                            You recently updated your favorites. You can make changes again in {nextGenreUpdateInDays} {nextGenreUpdateInDays === 1 ? 'day' : 'days'}.
                          </p>
                        </div>
                      )}
                      
                      {(selectedGenres.length > 0 || originalGenreIds.length > 0) && (
                        <div className="flex items-center justify-between p-4 rounded-lg glass transition-all duration-500 animate-slide-up" style={{ borderColor: 'var(--color-border)', border: '1px solid' }}>
                          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {selectedGenres.length === 0
                              ? 'No genres selected'
                              : `${selectedGenres.length} ${selectedGenres.length === 1 ? 'genre' : 'genres'} selected`}
                          </p>
                          <button
                            type="button"
                            onClick={handleSaveGenres}
                            disabled={disableGenreSave}
                            className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 focus-visible disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 hover:shadow-lg disabled:hover:scale-100"
                            style={{
                              backgroundColor: disableGenreSave ? 'var(--color-surface-dark)' : 'var(--color-accent)',
                              color: disableGenreSave ? 'var(--color-text-tertiary)' : 'var(--color-text-inverse)',
                              border: disableGenreSave ? '2px solid var(--color-border)' : '2px solid var(--color-accent)',
                            }}
                          >
                            {isGenresLoading ? (
                              <>
                                <Spinner size="sm" />
                                <span>Saving...</span>
                              </>
                            ) : (
                              <span>Save Genres</span>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-8" style={{ backgroundColor: 'var(--color-border)' }} />
                
                {/* Email (Read-only) */}
                <div className={`transition-all duration-700 ${staggerDelay ? 'animate-slide-up' : 'opacity-0 translate-y-6'}`} style={{ animationDelay: staggerDelay ? '1.0s' : '0s' }}>
                  <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    <Mail className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 group-hover:scale-105" style={{ color: 'var(--color-text-tertiary)' }} />
                    <input
                      type="email"
                      id="email"
                      value={user.email}
                      disabled
                      className="w-full pl-12 pr-4 py-3.5 rounded-lg border-2 cursor-not-allowed opacity-60 transition-all duration-300"
                      style={{
                        backgroundColor: 'var(--color-surface-dark)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-tertiary)',
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs flex items-center gap-1 transition-opacity duration-300" style={{ color: 'var(--color-text-tertiary)' }}>
                    <Shield className="w-3 h-3" />
                    Email cannot be changed
                  </p>
                </div>
                
                {/* Submit Button */}
                <div className={`flex flex-col sm:flex-row gap-3 pt-4 transition-all duration-700 ${staggerDelay ? 'animate-slide-up' : 'opacity-0 translate-y-6'}`} style={{ animationDelay: staggerDelay ? '1.2s' : '0s' }}>
                  <button
                    type="submit"
                    disabled={isLoading || !profileForm.formState.isDirty}
                    className="flex-1 py-3.5 px-6 rounded-lg font-semibold text-base transition-all duration-300 focus-visible disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 cinematic-border group relative overflow-hidden"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-text-inverse)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    {isLoading ? (
                      <>
                        <Spinner size="sm" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  
                  {profileForm.formState.isDirty && (
                    <button
                      type="button"
                      onClick={() => profileForm.reset()}
                      className="px-6 py-3.5 rounded-lg font-semibold text-base transition-all duration-300 hover:opacity-80 focus-visible hover:scale-105 active:scale-95 hover:shadow-lg focus:shadow-xl focus:ring-2 focus:ring-accent/20"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '2px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              </div>
            </div>
          )}
          
          {/* Security Tab */}
          {activeTab === 'security' && (
            <div 
              id="security-panel" 
              role="tabpanel" 
              aria-labelledby="security-tab"
              className={`relative glass-heavy rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl cinematic-border transition-all duration-700 overflow-hidden ${
                staggerDelay ? 'animate-scale-in' : 'opacity-0 scale-95'
              }`}
              style={{ 
                animationDelay: staggerDelay ? '0.4s' : '0s',
                background: 'linear-gradient(145deg, rgba(28, 28, 31, 0.95) 0%, rgba(18, 18, 20, 0.98) 50%, rgba(12, 12, 14, 0.95) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
              }}
            >
              {/* Modern gradient overlay */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(76, 175, 80, 0.12) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(76, 175, 80, 0.08) 0%, transparent 50%)'
                }}
              />
              
              {/* Content wrapper */}
              <div className="relative z-10 space-y-8">
                {/* Change Password */}
                <div className={`relative glass-heavy rounded-2xl p-6 sm:p-8 shadow-xl transition-all duration-700 overflow-hidden ${
                  staggerDelay ? 'animate-slide-up' : 'opacity-0 translate-y-6'
                }`} 
                style={{ 
                  animationDelay: staggerDelay ? '0.5s' : '0s',
                  background: 'linear-gradient(145deg, rgba(33, 33, 36, 0.9) 0%, rgba(25, 25, 28, 0.95) 100%)',
                  backdropFilter: 'blur(16px) saturate(160%)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  {/* Subtle accent gradient */}
                  <div 
                    className="absolute inset-0 opacity-15 rounded-2xl"
                    style={{
                      background: 'radial-gradient(circle at 25% 25%, rgba(76, 175, 80, 0.2) 0%, transparent 50%)'
                    }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-3 mb-6">
                      <div className="p-3 rounded-xl transition-all duration-300 hover:scale-110" style={{ backgroundColor: 'rgba(76, 175, 80, 0.15)', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
                        <Shield className="w-6 h-6" style={{ color: '#4CAF50' }} />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                          Change Password
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          Update your password to keep your account secure
                        </p>
                      </div>
                    </div>
                
                <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-6" noValidate>
                  {/* Current Password */}
                  <div>
                    <label htmlFor="current_password" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Current Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                      <input
                        {...passwordForm.register('current_password')}
                        type={showCurrentPassword ? 'text' : 'password'}
                        id="current_password"
                        autoComplete="current-password"
                        className="w-full pl-12 pr-12 py-3.5 rounded-lg border-2 transition-smooth focus-visible"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: passwordForm.formState.errors.current_password ? 'var(--color-error)' : 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                        placeholder="Enter current password"
                        aria-invalid={!!passwordForm.formState.errors.current_password}
                        aria-describedby={passwordForm.formState.errors.current_password ? 'current-password-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded transition-smooth hover:opacity-70"
                        aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                        ) : (
                          <Eye className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.current_password && (
                      <p id="current-password-error" className="mt-2 text-sm flex items-center gap-1" style={{ color: 'var(--color-error)' }} role="alert">
                        <AlertCircle className="w-4 h-4" />
                        {passwordForm.formState.errors.current_password.message}
                      </p>
                    )}
                  </div>
                  
                  {/* New Password */}
                  <div>
                    <label htmlFor="new_password" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      New Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                      <input
                        {...passwordForm.register('new_password')}
                        type={showNewPassword ? 'text' : 'password'}
                        id="new_password"
                        autoComplete="new-password"
                        className="w-full pl-12 pr-12 py-3.5 rounded-lg border-2 transition-smooth focus-visible"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: passwordForm.formState.errors.new_password ? 'var(--color-error)' : 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                        placeholder="Enter new password"
                        aria-invalid={!!passwordForm.formState.errors.new_password}
                        aria-describedby={passwordForm.formState.errors.new_password ? 'new-password-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded transition-smooth hover:opacity-70"
                        aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                        ) : (
                          <Eye className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.new_password && (
                      <p id="new-password-error" className="mt-2 text-sm flex items-center gap-1" style={{ color: 'var(--color-error)' }} role="alert">
                        <AlertCircle className="w-4 h-4" />
                        {passwordForm.formState.errors.new_password.message}
                      </p>
                    )}
                    <p className="mt-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      Must be at least 8 characters with uppercase, lowercase, and numbers
                    </p>
                  </div>
                  
                  {/* Confirm New Password */}
                  <div>
                    <label htmlFor="new_password_confirm" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                      <input
                        {...passwordForm.register('new_password_confirm')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="new_password_confirm"
                        autoComplete="new-password"
                        className="w-full pl-12 pr-12 py-3.5 rounded-lg border-2 transition-smooth focus-visible"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: passwordForm.formState.errors.new_password_confirm ? 'var(--color-error)' : 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                        placeholder="Confirm new password"
                        aria-invalid={!!passwordForm.formState.errors.new_password_confirm}
                        aria-describedby={passwordForm.formState.errors.new_password_confirm ? 'confirm-password-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded transition-smooth hover:opacity-70"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                        ) : (
                          <Eye className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.new_password_confirm && (
                      <p id="confirm-password-error" className="mt-2 text-sm flex items-center gap-1" style={{ color: 'var(--color-error)' }} role="alert">
                        <AlertCircle className="w-4 h-4" />
                        {passwordForm.formState.errors.new_password_confirm.message}
                      </p>
                    )}
                  </div>
                  
                  {/* Submit Button */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group w-full py-4 px-6 rounded-xl font-bold text-base transition-all duration-300 focus-visible disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl hover:shadow-[0_20px_60px_rgba(229,57,53,0.4)] hover:scale-105 relative overflow-hidden"
                      style={{
                        backgroundColor: 'var(--color-accent)',
                        color: 'white',
                        border: '2px solid rgba(229, 57, 53, 0.3)',
                      }}
                    >
                      {/* Animated gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      
                      {isLoading ? (
                        <>
                          <Spinner size="sm" />
                          <span className="relative z-10">Changing Password...</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" />
                          <span className="relative z-10">Update Password</span>
                          <CheckCircle className="w-5 h-5 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
                  </div>
                </div>
                
                {/* Sign Out */}
                <div className={`relative glass-heavy rounded-2xl p-6 sm:p-8 shadow-xl transition-all duration-700 overflow-hidden ${
                  staggerDelay ? 'animate-slide-up' : 'opacity-0 translate-y-6'
                }`} 
                style={{ 
                  animationDelay: staggerDelay ? '0.6s' : '0s',
                  background: 'linear-gradient(145deg, rgba(33, 33, 36, 0.9) 0%, rgba(25, 25, 28, 0.95) 100%)',
                  backdropFilter: 'blur(16px) saturate(160%)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  {/* Subtle accent gradient */}
                  <div 
                    className="absolute inset-0 opacity-15 rounded-2xl"
                    style={{
                      background: 'radial-gradient(circle at 25% 25%, rgba(255, 152, 0, 0.2) 0%, transparent 50%)'
                    }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-3 rounded-xl transition-all duration-300 hover:scale-110" style={{ backgroundColor: 'rgba(255, 152, 0, 0.15)', border: '1px solid rgba(255, 152, 0, 0.2)' }}>
                        <LogOut className="w-6 h-6" style={{ color: '#ff9800' }} />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                          Sign Out
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          Sign out of your account on this device
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-3.5 px-6 rounded-lg font-semibold text-base transition-all duration-300 focus-visible disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                      style={{
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        border: '2px solid #ff9800',
                        color: '#ff9800',
                      }}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div 
              id="danger-panel" 
              role="tabpanel" 
              aria-labelledby="danger-tab"
              className={`relative glass-heavy rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl cinematic-border transition-all duration-700 overflow-hidden ${
                staggerDelay ? 'animate-scale-in' : 'opacity-0 scale-95'
              }`}
              style={{ 
                animationDelay: staggerDelay ? '0.4s' : '0s',
                background: 'linear-gradient(145deg, rgba(28, 28, 31, 0.95) 0%, rgba(18, 18, 20, 0.98) 50%, rgba(12, 12, 14, 0.95) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(244, 67, 54, 0.15)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(244, 67, 54, 0.1) inset'
              }}
            >
              {/* Modern gradient overlay */}
              <div 
                className="absolute inset-0 opacity-25"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(244, 67, 54, 0.12) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(244, 67, 54, 0.08) 0%, transparent 50%)'
                }}
              />
              
              {/* Content wrapper */}
              <div className="relative z-10">
                <div className={`relative glass-heavy rounded-2xl p-6 sm:p-8 shadow-xl transition-all duration-700 overflow-hidden ${
                  staggerDelay ? 'animate-slide-up' : 'opacity-0 translate-y-6'
                }`} 
                style={{ 
                  animationDelay: staggerDelay ? '0.5s' : '0s',
                  background: 'linear-gradient(145deg, rgba(33, 33, 36, 0.9) 0%, rgba(25, 25, 28, 0.95) 100%)',
                  backdropFilter: 'blur(16px) saturate(160%)',
                  border: '2px solid rgba(244, 67, 54, 0.2)',
                  boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  {/* Subtle accent gradient */}
                  <div 
                    className="absolute inset-0 opacity-15 rounded-2xl"
                    style={{
                      background: 'radial-gradient(circle at 25% 25%, rgba(244, 67, 54, 0.25) 0%, transparent 50%)'
                    }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-3 mb-6">
                      <div className="p-3 rounded-xl transition-all duration-300 hover:scale-110" style={{ backgroundColor: 'rgba(244, 67, 54, 0.15)', border: '1px solid rgba(244, 67, 54, 0.3)' }}>
                        <AlertTriangle className="w-6 h-6" style={{ color: 'var(--color-error)' }} />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: 'var(--color-error)' }}>
                          Delete Account
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                    </div>
                    
                    <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: 'rgba(244, 67, 54, 0.08)', border: '1px solid rgba(244, 67, 54, 0.2)' }}>
                      <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-error)' }}>
                        <AlertCircle className="w-5 h-5" />
                        Warning: This action cannot be undone
                      </h3>
                      <ul className="space-y-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        <li>• All your reviews and comments will be permanently deleted</li>
                        <li>• Your profile and account data will be removed</li>
                        <li>• You will lose access to all your saved preferences</li>
                        <li>• This action is irreversible</li>
                      </ul>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full py-3.5 px-6 rounded-lg font-semibold text-base transition-all duration-300 focus-visible disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                      style={{
                        backgroundColor: 'var(--color-error)',
                        color: 'white',
                      }}
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Delete My Account</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="glass-heavy rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
          >
            <div className="flex items-start gap-3 mb-6">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
                <AlertTriangle className="w-6 h-6" style={{ color: 'var(--color-error)' }} />
              </div>
              <div className="flex-1">
                <h3 id="delete-modal-title" className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Delete Account
                </h3>
                <p id="delete-modal-description" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  This action is permanent and cannot be reversed
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1 rounded transition-smooth hover:opacity-70"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
              </button>
            </div>
            
            <form onSubmit={deleteForm.handleSubmit(handleAccountDeletion)} className="space-y-6" noValidate>
              {/* Password */}
              <div>
                <label htmlFor="delete_password" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Enter Your Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                  <input
                    {...deleteForm.register('password')}
                    type={showDeletePassword ? 'text' : 'password'}
                    id="delete_password"
                    autoComplete="current-password"
                    className="w-full pl-12 pr-12 py-3.5 rounded-lg border-2 transition-smooth focus-visible"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: deleteForm.formState.errors.password ? 'var(--color-error)' : 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    placeholder="Your password"
                    aria-invalid={!!deleteForm.formState.errors.password}
                    aria-describedby={deleteForm.formState.errors.password ? 'delete-password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded transition-smooth hover:opacity-70"
                    aria-label={showDeletePassword ? 'Hide password' : 'Show password'}
                  >
                    {showDeletePassword ? (
                      <EyeOff className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                    ) : (
                      <Eye className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                    )}
                  </button>
                </div>
                {deleteForm.formState.errors.password && (
                  <p id="delete-password-error" className="mt-2 text-sm flex items-center gap-1" style={{ color: 'var(--color-error)' }} role="alert">
                    <AlertCircle className="w-4 h-4" />
                    {deleteForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              
              {/* Confirmation */}
              <div>
                <label htmlFor="delete_confirmation" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Type <span style={{ color: 'var(--color-error)' }}>DELETE</span> to confirm *
                </label>
                <input
                  {...deleteForm.register('confirmation')}
                  type="text"
                  id="delete_confirmation"
                  className="w-full px-4 py-3.5 rounded-lg border-2 transition-smooth focus-visible font-mono"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: deleteForm.formState.errors.confirmation ? 'var(--color-error)' : 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                  placeholder="DELETE"
                  aria-invalid={!!deleteForm.formState.errors.confirmation}
                  aria-describedby={deleteForm.formState.errors.confirmation ? 'delete-confirmation-error' : undefined}
                />
                {deleteForm.formState.errors.confirmation && (
                  <p id="delete-confirmation-error" className="mt-2 text-sm flex items-center gap-1" style={{ color: 'var(--color-error)' }} role="alert">
                    <AlertCircle className="w-4 h-4" />
                    {deleteForm.formState.errors.confirmation.message}
                  </p>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false)
                    deleteForm.reset()
                  }}
                  className="flex-1 py-3.5 px-6 rounded-lg font-semibold text-base transition-smooth hover:opacity-80 focus-visible"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '2px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3.5 px-6 rounded-lg font-semibold text-base transition-smooth focus-visible disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: 'var(--color-error)',
                    color: 'white',
                  }}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      <span>Delete Forever</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
