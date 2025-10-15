'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { recommendationsService } from '@/services/recommendations'
import { MovieCard } from '@/components/movies/MovieCard'
import { Movie } from '@/types/movie'

type TabType = 'top-rated' | 'trending' | 'most-reviewed' | 'recent' | 'for-you'

export default function RecommendationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('top-rated')

  const { data: topRated, isLoading: loadingTopRated } = useQuery({
    queryKey: ['recommendations', 'top-rated'],
    queryFn: () => recommendationsService.getTopRated(12),
  })

  const { data: trending, isLoading: loadingTrending } = useQuery({
    queryKey: ['recommendations', 'trending'],
    queryFn: () => recommendationsService.getTrending(12),
  })

  const { data: mostReviewed, isLoading: loadingMostReviewed } = useQuery({
    queryKey: ['recommendations', 'most-reviewed'],
    queryFn: () => recommendationsService.getMostReviewed(12),
  })

  const { data: recent, isLoading: loadingRecent } = useQuery({
    queryKey: ['recommendations', 'recent'],
    queryFn: () => recommendationsService.getRecent(12),
  })

  const { data: personalizedData, isLoading: loadingPersonalized } = useQuery({
    queryKey: ['recommendations', 'for-you'],
    queryFn: () => recommendationsService.getPersonalizedRecommendations(12),
  })

  const tabs = [
    { id: 'top-rated' as TabType, label: 'Top Rated', data: topRated, loading: loadingTopRated },
    { id: 'trending' as TabType, label: 'Trending', data: trending, loading: loadingTrending },
    {
      id: 'most-reviewed' as TabType,
      label: 'Most Reviewed',
      data: mostReviewed,
      loading: loadingMostReviewed,
    },
    { id: 'recent' as TabType, label: 'Recently Added', data: recent, loading: loadingRecent },
    {
      id: 'for-you' as TabType,
      label: 'For You',
      data: personalizedData?.movies,
      loading: loadingPersonalized,
    },
  ]

  const currentTab = tabs.find((tab) => tab.id === activeTab)
  const movies = currentTab?.data as Movie[] | undefined
  const isLoading = currentTab?.loading || false

  return (
    <div className="min-h-screen flix-bg-primary">
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="flix-heading-lg mb-4">Discover Movies</h1>
          <p className="flix-text-secondary text-lg">
            Explore curated collections and personalized recommendations
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 border-b border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'border-b-2 border-flix-red text-flix-red'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 flix-text-secondary">Loading movies...</p>
          </div>
        ) : movies && movies.length > 0 ? (
          <div>
            {personalizedData?.algorithm && activeTab === 'for-you' && (
              <p className="flix-text-muted text-sm mb-4">
                Recommendations powered by {personalizedData.algorithm}
              </p>
            )}
            <div className="flix-movies-grid">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flix-card text-center py-12">
            <p className="flix-text-secondary">No movies found in this category.</p>
            {activeTab === 'for-you' && (
              <p className="flix-text-muted mt-2">
                Rate some movies to get personalized recommendations!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
