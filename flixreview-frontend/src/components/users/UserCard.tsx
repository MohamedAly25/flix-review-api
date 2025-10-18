import React from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface User {
  id: number
  username: string
  bio?: string | null
  profile_picture_url?: string | null
  reviews_count?: number
}

export interface UserCardProps {
  user: User
  className?: string
}

const getUserInitials = (username: string): string => {
  return username.slice(0, 2).toUpperCase()
}

export const UserCard: React.FC<UserCardProps> = ({ user, className }) => {
  return (
    <Link
      href={`/users/${user.username}`}
      className={cn(
        'glass-heavy rounded-2xl p-6 transition-all duration-300',
        'hover:scale-105 hover:shadow-2xl group border-2 animate-fade-in',
        'bg-[var(--color-surface)] border-[var(--color-border)]',
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        {user.profile_picture_url ? (
          <div
            className="w-24 h-24 rounded-full overflow-hidden transition-all duration-300 mb-4 shadow-lg border-4 border-[var(--color-border)]"
          >
            <img
              src={user.profile_picture_url}
              alt={`${user.username}'s profile`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        ) : (
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 mb-4 shadow-lg glass border-4 bg-[var(--color-accent)] border-[var(--color-border)]"
          >
            <span className="text-2xl font-bold text-[var(--color-text-inverse)]">
              {getUserInitials(user.username)}
            </span>
          </div>
        )}

        {/* Username */}
        <h3 className="text-lg font-semibold mb-1 transition-colors duration-200 text-[var(--color-text-primary)]">
          {user.username}
        </h3>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm mb-3 line-clamp-2 text-[var(--color-text-secondary)]">
            {user.bio}
          </p>
        )}

        {/* Stats */}
        <div
          className="flex items-center justify-center gap-4 text-sm mt-2 px-4 py-2 rounded-lg glass bg-[var(--color-background)] text-[var(--color-text-secondary)]"
        >
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-[var(--color-accent)]" fill="currentColor" />
            <span className="font-semibold">{user.reviews_count || 0} reviews</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
