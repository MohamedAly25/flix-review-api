'use client'

import { useState, useEffect } from 'react'
import { User as UserIcon, Mail, Film } from 'lucide-react'
import { usersService } from '@/services/users'
import { User } from '@/types/auth'

interface UserProfileProps {
  username: string
  className?: string
}

export function UserProfile({ username, className = '' }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUser()
  }, [username])

  const loadUser = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const userData = await usersService.getUserByUsername(username)
      setUser(userData)
    } catch (err: any) {
      console.error('Error loading user profile:', err)
      setError(err.response?.data?.detail || 'Failed to load user profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-white/5 border border-white/10 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-20 w-20 bg-white/10 rounded-full"></div>
          <div className="h-4 bg-white/10 rounded w-1/3"></div>
          <div className="h-4 bg-white/10 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className={`bg-red-500/10 border border-red-500/20 rounded-lg p-6 ${className}`}>
        <p className="text-red-400">{error || 'User not found'}</p>
      </div>
    )
  }

  return (
    <div className={`bg-white/5 border border-white/10 rounded-lg p-6 ${className}`}>
      {/* Profile Picture and Username */}
      <div className="flex items-center gap-4 mb-4">
        {user.profile_picture_url ? (
          <img
            src={user.profile_picture_url}
            alt={user.username}
            className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-white">
            {user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.username}
          </h2>
          {user.first_name && user.last_name && (
            <p className="text-gray-400">@{user.username}</p>
          )}
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <div className="mb-4">
          <p className="text-gray-300 leading-relaxed">{user.bio}</p>
        </div>
      )}

      {/* User Info */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <Mail className="w-4 h-4" />
          <span>{user.email}</span>
        </div>

        {user.preferred_genres && user.preferred_genres.length > 0 && (
          <div className="flex items-center gap-2 text-gray-400">
            <Film className="w-4 h-4" />
            <span>Favorite Genres:</span>
            <div className="flex flex-wrap gap-1">
              {user.preferred_genres.map((genre) => (
                <span
                  key={genre.id}
                  className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-xs"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
