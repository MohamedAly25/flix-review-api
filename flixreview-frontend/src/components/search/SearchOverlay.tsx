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
      {/* Overlay Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/90 z-50 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Search Panel */}
      <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Search Input with modern glass effect */}
            <div className="relative mb-6">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
                <svg className="w-7 h-7 text-flix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What are you looking for?"
                className="w-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl text-white text-2xl pl-16 pr-16 py-6 rounded-2xl border-2 border-white/20 focus:border-flix-red focus:outline-none transition-all shadow-2xl placeholder:text-white/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search Results */}
            {searchQuery.length >= 2 && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 max-h-[70vh] overflow-y-auto shadow-2xl">
                {isSearching ? (
                  <div className="p-16 text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-flix-red border-r-transparent"></div>
                    <p className="mt-6 text-white/80 text-lg">Searching the collection...</p>
                  </div>
                ) : hasResults ? (
                  <div className="divide-y divide-white/10">
                    {/* Movie Results */}
                    {movieResults?.results && movieResults.results.length > 0 && (
                      <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 rounded-lg bg-flix-red/20">
                            <svg className="w-6 h-6 text-flix-red" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-white">
                            Movies
                            <span className="ml-2 text-sm font-normal text-white/60">
                              ({movieResults.results.length} found)
                            </span>
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {movieResults.results.slice(0, 5).map((movie: Movie) => (
                            <Link
                              key={movie.id}
                              href={`/movies/${movie.id}`}
                              onClick={onClose}
                              className="flex items-center gap-5 p-4 rounded-xl hover:bg-white/10 transition-all group border border-transparent hover:border-white/20"
                            >
                              {movie.poster_url ? (
                                <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                                  <Image
                                    src={movie.poster_url}
                                    alt={movie.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              ) : (
                                <div className="w-20 h-28 flex-shrink-0 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                                  <svg className="w-10 h-10 text-white/30" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                  </svg>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white text-lg font-semibold group-hover:text-flix-red transition-colors truncate">
                                  {movie.title}
                                </h4>
                                <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                                  {movie.release_date && (
                                    <span className="flex items-center gap-1">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                      </svg>
                                      {new Date(movie.release_date).getFullYear()}
                                    </span>
                                  )}
                                  {movie.avg_rating > 0 && (
                                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-imdb-yellow/20 text-imdb-yellow">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                      {movie.avg_rating.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <svg className="w-6 h-6 text-white/30 group-hover:text-flix-red transition-colors flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </Link>
                          ))}
                        </div>
                        {movieResults.results.length > 5 && (
                          <button
                            onClick={() => handleSearch(searchQuery)}
                            className="mt-6 px-6 py-3 rounded-xl bg-flix-red hover:bg-flix-red/90 text-white font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                          >
                            View all {movieResults.count} movies
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Review Results */}
                    {reviewResults?.results && reviewResults.results.length > 0 && (
                      <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 rounded-lg bg-imdb-yellow/20">
                            <svg className="w-6 h-6 text-imdb-yellow" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-white">
                            Reviews
                            <span className="ml-2 text-sm font-normal text-white/60">
                              ({reviewResults.results.length} found)
                            </span>
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {reviewResults.results.slice(0, 3).map((review: Review) => (
                            <Link
                              key={review.id}
                              href={`/movies/${review.movie.id}`}
                              onClick={onClose}
                              className="block p-5 rounded-xl hover:bg-white/10 transition-all group border border-transparent hover:border-white/20"
                            >
                              <div className="flex items-center justify-between gap-3 mb-3">
                                <span className="text-white text-lg font-semibold group-hover:text-flix-red transition-colors">
                                  {review.movie.title}
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-imdb-yellow/20 text-imdb-yellow text-sm font-medium flex-shrink-0">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  {review.rating}/5
                                </span>
                              </div>
                              <p className="text-white/70 line-clamp-2 text-sm leading-relaxed mb-3">{review.content}</p>
                              <div className="flex items-center gap-2 text-xs text-white/50">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                <span>by {typeof review.user === 'string' ? review.user : review.user.username}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-20 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                      <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-white/80 text-xl font-semibold mb-2">No results found</p>
                    <p className="text-white/50">Try searching with different keywords</p>
                  </div>
                )}
              </div>
            )}

            {/* Recent Searches */}
            {!searchQuery && recentSearches.length > 0 && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Recent Searches</h3>
                  </div>
                  <button
                    onClick={clearRecentSearches}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm font-medium transition-all"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearch(search)}
                      className="flex items-center gap-4 w-full p-4 rounded-xl hover:bg-white/10 transition-all group text-left border border-transparent hover:border-white/20"
                    >
                      <div className="p-2 rounded-lg bg-white/5 group-hover:bg-flix-red/20 transition-colors">
                        <svg className="w-5 h-5 text-white/50 group-hover:text-flix-red flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <span className="flex-1 text-white/80 group-hover:text-white text-lg transition-colors">{search}</span>
                      <svg className="w-5 h-5 text-white/30 group-hover:text-flix-red transition-colors" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Tips */}
            {!searchQuery && recentSearches.length === 0 && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Search Tips</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="p-2 rounded-lg bg-flix-red/20 flex-shrink-0">
                      <svg className="w-5 h-5 text-flix-red" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Find Movies</p>
                      <p className="text-white/60 text-sm">Search by title, year, or genre</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="p-2 rounded-lg bg-imdb-yellow/20 flex-shrink-0">
                      <svg className="w-5 h-5 text-imdb-yellow" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Browse Reviews</p>
                      <p className="text-white/60 text-sm">Discover what others are saying</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="p-2 rounded-lg bg-green-500/20 flex-shrink-0">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Quick Access</p>
                      <p className="text-white/60 text-sm">Press Enter to view all results</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="p-2 rounded-lg bg-purple-500/20 flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Keyboard Shortcuts</p>
                      <p className="text-white/60 text-sm">ESC to close this search</p>
                    </div>
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
