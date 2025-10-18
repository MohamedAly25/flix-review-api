'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { reviewsService } from '@/services/reviews'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { Spinner } from '@/components/ui/Spinner'

type SortOption = 'created_at' | '-created_at' | 'rating' | '-rating'

export default function AllReviewsPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortOption>('-created_at')
  const [searchQuery, setSearchQuery] = useState('')
  const pageSize = 10

  const { data: reviewsData, isLoading, error } = useQuery({
    queryKey: ['all-reviews', page, sortBy, searchQuery],
    queryFn: () => reviewsService.getReviews({
      page,
      page_size: pageSize,
      ordering: sortBy,
      search: searchQuery || undefined,
    }),
  })

  const reviews = reviewsData?.results || []
  const totalPages = reviewsData ? Math.ceil(reviewsData.count / pageSize) : 1

  const stats = useMemo(() => {
    if (!reviewsData) return { total: 0, avgRating: 0 }
    
    const total = reviewsData.count
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0

    return { total, avgRating }
  }, [reviewsData, reviews])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPage(1) // Reset to first page on search
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      <Header />
      <main className="flex-grow pt-24 sm:pt-28">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 lg:py-20 animate-fade-in">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-2xl glass-heavy shadow-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
                <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                All Reviews
              </h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl max-w-3xl mx-auto mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Explore what the FlixReview community is saying about movies. Discover new perspectives, find hidden gems, and join the conversation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="px-6 py-3 rounded-full glass-heavy shadow-lg flex items-center gap-2" 
                   style={{ 
                     backgroundColor: 'var(--color-surface)',
                     border: '1px solid var(--color-border)'
                   }}>
                <svg className="w-5 h-5" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {stats.total.toLocaleString()} total reviews
                </span>
              </div>
              {reviews.length > 0 && (
                <div className="px-6 py-3 rounded-full glass-heavy shadow-lg flex items-center gap-2"
                     style={{ 
                       backgroundColor: 'var(--color-surface)',
                       border: '1px solid var(--color-border)'
                     }}>
                  <svg className="w-5 h-5" style={{ color: 'var(--color-warning)' }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {stats.avgRating}/5 average
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="container mx-auto px-4 sm:px-6 py-8 animate-slide-up">
          <div className="glass-heavy rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search reviews by movie title or content..."
                    className="w-full px-4 py-3.5 pr-28 rounded-lg border-2 transition-smooth focus-visible"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-md font-semibold text-sm transition-smooth hover:opacity-90 shadow-lg"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-text-inverse)'
                    }}
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Sort */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortOption)
                    setPage(1)
                  }}
                  className="px-4 py-3.5 rounded-lg border-2 transition-smooth focus-visible"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="-created_at">Newest First</option>
                  <option value="created_at">Oldest First</option>
                  <option value="-rating">Highest Rated</option>
                  <option value="rating">Lowest Rated</option>
                </select>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-4 pt-4 flex flex-wrap gap-2" style={{ borderTop: '1px solid var(--color-border)' }}>
              <Link
                href="/reviews/most-liked"
                className="px-4 py-2 rounded-full border-2 text-sm font-medium transition-smooth hover:scale-105 shadow-md"
                style={{
                  borderColor: 'var(--color-accent)',
                  backgroundColor: 'var(--color-accent-light)',
                  color: 'var(--color-accent)'
                }}
              >
                🔥 Most Liked Reviews
              </Link>
              {user && (
                <Link
                  href="/my-reviews"
                  className="px-4 py-2 rounded-full border-2 text-sm font-medium transition-smooth hover:scale-105 shadow-md"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  📝 My Reviews
                </Link>
              )}
            </div>
          </div>

          {/* Reviews List */}
          {error ? (
            <div className="glass-heavy rounded-2xl p-12 text-center shadow-xl animate-fade-in" style={{ backgroundColor: 'var(--color-surface)' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'var(--color-error-light)' }}>
                <svg className="w-8 h-8" style={{ color: 'var(--color-error)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Failed to load reviews
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Please try again later.
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="glass-heavy rounded-2xl p-6 h-48 animate-pulse" 
                     style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="flex gap-4">
                    <div className="w-24 h-32 rounded-lg" style={{ backgroundColor: 'var(--color-border)' }} />
                    <div className="flex-1 space-y-3">
                      <div className="h-6 w-3/4 rounded" style={{ backgroundColor: 'var(--color-border)' }} />
                      <div className="h-4 w-1/2 rounded" style={{ backgroundColor: 'var(--color-border)' }} />
                      <div className="h-4 w-full rounded" style={{ backgroundColor: 'var(--color-border)' }} />
                      <div className="h-4 w-full rounded" style={{ backgroundColor: 'var(--color-border)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="glass-heavy rounded-2xl p-12 text-center shadow-xl animate-fade-in" style={{ backgroundColor: 'var(--color-surface)' }}>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'var(--color-surface-dark)' }}>
                <svg className="w-10 h-10" style={{ color: 'var(--color-text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                No reviews found
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                {searchQuery ? 'Try adjusting your search terms.' : 'Be the first to write a review!'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setPage(1)
                  }}
                  className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-smooth hover:opacity-90 shadow-lg"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-text-inverse)'
                  }}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <ReviewCard 
                    key={review.id} 
                    review={review}
                    currentUsername={user?.username}
                    showComments={true}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg border-2 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 font-medium"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (page <= 3) {
                        pageNum = i + 1
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = page - 2 + i
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className="w-10 h-10 rounded-lg border-2 transition-smooth font-semibold shadow-md"
                          style={{
                            backgroundColor: page === pageNum ? 'var(--color-accent)' : 'var(--color-surface)',
                            borderColor: page === pageNum ? 'var(--color-accent)' : 'var(--color-border)',
                            color: page === pageNum ? 'var(--color-text-inverse)' : 'var(--color-text-primary)'
                          }}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg border-2 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 font-medium"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    Next
                  </button>
                </div>
              )}

              <div className="mt-4 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Showing page {page} of {totalPages} ({stats.total} total reviews)
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
