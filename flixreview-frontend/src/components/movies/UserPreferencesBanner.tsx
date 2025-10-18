import React from 'react'
import Link from 'next/link'

interface UserPreferencesBannerProps {
  preferredGenres: Array<{ id: number; name: string }>
}

export function UserPreferencesBanner({ preferredGenres }: UserPreferencesBannerProps) {
  if (preferredGenres.length === 0) {
    return null
  }

  return (
    <div className="user-preferences-banner">
      <div className="user-preferences-content">
        <div className="user-preferences-actions">
          <div>
            <p className="user-preferences-label">Manual taste boost</p>
            <p className="user-preferences-description">
              These genres are currently boosting your browse results. Adjust them from your account whenever your mood changes.
            </p>
          </div>
          <Link
            href="/profile"
            className="user-preferences-link"
          >
            Update picks
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="user-preferences-genres">
          {preferredGenres.map((genre) => (
            <span
              key={genre.id}
              className="user-preferences-genre-tag"
            >
              {genre.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}