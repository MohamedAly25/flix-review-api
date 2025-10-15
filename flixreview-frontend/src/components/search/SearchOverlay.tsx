'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { moviesService } from '@/services/movies'
import { reviewsService } from '@/services/reviews'
import Image from 'next/image'
import type { Movie } from '@/types/movie'
import type { Review } from '@/types/review'

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Mark component as mounted
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load recent searches from localStorage only after mount
  useEffect(() => {
    if (isMounted) {
      const stored = localStorage.getItem('recentSearches')
      if (stored) {
        setRecentSearches(JSON.parse(stored))
      }
    }
  }, [isMounted])

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Search movies
  const { data: movieResults, isLoading: moviesLoading } = useQuery({
    queryKey: ['search-movies', searchQuery],
    queryFn: () => moviesService.getMovies({ search: searchQuery, page: 1 }),
    enabled: searchQuery.length >= 2,
  })

  // Search reviews
  const { data: reviewResults, isLoading: reviewsLoading } = useQuery({
    queryKey: ['search-reviews', searchQuery],
    queryFn: () => reviewsService.searchReviews(searchQuery),
    enabled: searchQuery.length >= 2,
  })

  const handleSearch = (query: string) => {
    if (!query.trim()) return

    // Add to recent searches
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
    setRecentSearches(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('recentSearches', JSON.stringify(updated))
    }

    // Navigate to search results page
    router.push(`/movies?search=${encodeURIComponent(query)}`)
    onClose()
  }

  const handleRecentSearch = (query: string) => {
    setSearchQuery(query)
    handleSearch(query)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recentSearches')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSearch(searchQuery)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  const hasResults = movieResults?.results?.length || reviewResults?.results?.length
  const isSearching = moviesLoading || reviewsLoading

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/95 z-50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Search Panel */}
      <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {/* Search Input */}
            <div className="relative mb-8">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search movies, reviews, or keywords..."
                className="w-full bg-gray-900 text-white text-xl pl-14 pr-14 py-5 rounded-lg border-2 border-gray-700 focus:border-flix-red focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search Results */}
            {searchQuery.length >= 2 && (
              <div className="bg-gray-900 rounded-lg border border-gray-700 max-h-[70vh] overflow-y-auto">
                {isSearching ? (
                  <div className="p-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-flix-red"></div>
                    <p className="mt-4 text-gray-400">Searching...</p>
                  </div>
                ) : hasResults ? (
                  <div className="divide-y divide-gray-800">
                    {/* Movie Results */}
                    {movieResults?.results && movieResults.results.length > 0 && (
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-flix-red" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                          Movies ({movieResults.results.length})
                        </h3>
                        <div className="space-y-3">
                          {movieResults.results.slice(0, 5).map((movie: Movie) => (
                            <Link
                              key={movie.id}
                              href={`/movies/${movie.id}`}
                              onClick={onClose}
                              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800 transition-colors group"
                            >
                              {movie.poster_url ? (
                                <div className="relative w-16 h-24 flex-shrink-0 rounded overflow-hidden">
                                  <Image
                                    src={movie.poster_url}
                                    alt={movie.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-24 flex-shrink-0 bg-gray-800 rounded flex items-center justify-center">
                                  <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                  </svg>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium group-hover:text-flix-red transition-colors truncate">
                                  {movie.title}
                                </h4>
                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                                  {movie.release_date && (
                                    <span>{new Date(movie.release_date).getFullYear()}</span>
                                  )}
                                  {movie.avg_rating > 0 && (
                                    <span className="flex items-center gap-1">
                                      <svg className="w-4 h-4 text-imdb-yellow" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                      {movie.avg_rating.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <svg className="w-5 h-5 text-gray-600 group-hover:text-flix-red transition-colors flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </Link>
                          ))}
                        </div>
                        {movieResults.results.length > 5 && (
                          <button
                            onClick={() => handleSearch(searchQuery)}
                            className="mt-4 text-flix-red hover:text-flix-red/80 text-sm font-medium flex items-center gap-1"
                          >
                            View all {movieResults.count} results
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Review Results */}
                    {reviewResults?.results && reviewResults.results.length > 0 && (
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-imdb-yellow" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                          Reviews ({reviewResults.results.length})
                        </h3>
                        <div className="space-y-3">
                          {reviewResults.results.slice(0, 3).map((review: Review) => (
                            <Link
                              key={review.id}
                              href={`/movies/${review.movie.id}`}
                              onClick={onClose}
                              className="block p-3 rounded-lg hover:bg-gray-800 transition-colors group"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-white font-medium group-hover:text-flix-red transition-colors">
                                  {review.movie.title}
                                </span>
                                <span className="flex items-center gap-1 text-sm">
                                  <svg className="w-4 h-4 text-imdb-yellow" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  {review.rating}/10
                                </span>
                              </div>
                              <p className="text-sm text-gray-400 line-clamp-2">{review.content}</p>
                              <p className="text-xs text-gray-500 mt-2">by {review.user}</p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-400 mb-2">No results found</p>
                    <p className="text-sm text-gray-500">Try searching for something else</p>
                  </div>
                )}
              </div>
            )}

            {/* Recent Searches */}
            {!searchQuery && recentSearches.length > 0 && (
              <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Searches</h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearch(search)}
                      className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800 transition-colors group text-left"
                    >
                      <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="flex-1 text-gray-300 group-hover:text-white transition-colors">{search}</span>
                      <svg className="w-5 h-5 text-gray-600 group-hover:text-flix-red transition-colors" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Tips */}
            {!searchQuery && recentSearches.length === 0 && (
              <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Search Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-flix-red flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Search by movie title or keywords</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-flix-red flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Find reviews by content</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-flix-red flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Press Enter to see all results</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-flix-red flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Press Escape to close</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  )
}
