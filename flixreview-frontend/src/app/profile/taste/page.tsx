'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { recommendationsService } from '@/services/recommendations'
import { useAuth } from '@/contexts/AuthContext'

export default function TasteProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?next=/profile/taste')
    }
  }, [isAuthenticated, authLoading, router])

  const { data: tasteProfile, isLoading, error } = useQuery({
    queryKey: ['taste-profile'],
    queryFn: () => recommendationsService.getTasteProfile(),
    enabled: isAuthenticated,
  })

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flix-bg-primary">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 flix-text-secondary">Loading your taste profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen flix-bg-primary">
        <div className="container mx-auto px-4 py-12">
          <div className="flix-card-error text-center">
            <p>Failed to load your taste profile. Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flix-bg-primary">
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="flix-heading-lg mb-4">Your Taste Profile</h1>
          <p className="flix-text-secondary text-lg">
            Discover your movie preferences based on your ratings
          </p>
        </div>

        {tasteProfile ? (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flix-card p-6 text-center">
                <p className="flix-text-muted text-sm uppercase tracking-wide mb-2">
                  Average Rating
                </p>
                <p className="text-4xl font-bold text-flix-red">
                  {tasteProfile.avg_rating?.toFixed(1) || '0.0'}
                </p>
              </div>
              <div className="flix-card p-6 text-center">
                <p className="flix-text-muted text-sm uppercase tracking-wide mb-2">
                  Total Reviews
                </p>
                <p className="text-4xl font-bold text-flix-red">
                  {tasteProfile.total_reviews || 0}
                </p>
              </div>
              <div className="flix-card p-6 text-center">
                <p className="flix-text-muted text-sm uppercase tracking-wide mb-2">
                  Favorite Genres
                </p>
                <p className="text-4xl font-bold text-flix-red">
                  {tasteProfile.favorite_genres?.length || 0}
                </p>
              </div>
            </div>

            {/* Favorite Genres */}
            {tasteProfile.favorite_genres && tasteProfile.favorite_genres.length > 0 && (
              <div className="flix-card p-8">
                <h2 className="flix-heading-md mb-6">Your Favorite Genres</h2>
                <div className="flex flex-wrap gap-3">
                  {tasteProfile.favorite_genres.map((genre: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 flix-bg-secondary rounded-full flix-text-primary font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Genre Preferences */}
            {tasteProfile.preferences && Object.keys(tasteProfile.preferences).length > 0 && (
              <div className="flix-card p-8">
                <h2 className="flix-heading-md mb-6">Genre Preference Scores</h2>
                <div className="space-y-4">
                  {Object.entries(tasteProfile.preferences)
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .map(([genre, score]) => (
                      <div key={genre}>
                        <div className="flex justify-between mb-2">
                          <span className="flix-text-primary font-medium">{genre}</span>
                          <span className="flix-text-secondary">
                            {((score as number) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-flix-red h-2 rounded-full transition-all"
                            style={{ width: `${(score as number) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flix-card text-center py-12">
            <p className="flix-text-secondary mb-4">
              No taste profile data available yet.
            </p>
            <p className="flix-text-muted">
              Start rating movies to build your personalized taste profile!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
