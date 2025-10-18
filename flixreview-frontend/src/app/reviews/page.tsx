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
    <div className="min-h-screen flex flex-col flix-bg-primary">
      <Header />
      <main className="flex-grow pt-24 sm:pt-28">
        {/* Hero Section */}
        <section className="my-reviews-hero">
          <div className="my-reviews-hero-content">
            <h1 className="my-reviews-hero-title">All Reviews</h1>
            <p className="my-reviews-hero-description">
              Explore what the FlixReview community is saying about movies. Discover new perspectives, find hidden gems, and join the conversation.
            </p>
            <div className="my-reviews-stats-container">
              <div className="my-reviews-stat-badge">
                {stats.total.toLocaleString()} total reviews
              </div>
              {reviews.length > 0 && (
                <div className="my-reviews-stat-badge">
                  Average rating {stats.avgRating}/5
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flix-card bg-white/5 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search reviews by movie title or content..."
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-flix-accent focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-md bg-flix-accent hover:bg-flix-accent-hover text-white text-sm font-semibold transition"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Sort */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-white/70 whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortOption)
                    setPage(1)
                  }}
                  className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-flix-accent focus:border-transparent"
                >
                  <option value="-created_at">Newest First</option>
                  <option value="created_at">Oldest First</option>
                  <option value="-rating">Highest Rated</option>
                  <option value="rating">Lowest Rated</option>
                </select>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
              <Link
                href="/reviews/most-liked"
                className="px-4 py-2 rounded-full border border-flix-accent/40 bg-flix-accent/20 text-sm text-white hover:bg-flix-accent/30 transition"
              >
                🔥 Most Liked Reviews
              </Link>
              {user && (
                <Link
                  href="/my-reviews"
                  className="px-4 py-2 rounded-full border border-white/20 bg-white/10 text-sm text-white hover:bg-white/20 transition"
                >
                  📝 My Reviews
                </Link>
              )}
            </div>
          </div>

          {/* Reviews List */}
          {error ? (
            <div className="my-reviews-empty-state">
              <svg className="recommendations-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="my-reviews-empty-title">Failed to load reviews</p>
                <p className="my-reviews-empty-description">Please try again later.</p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="skeleton-card h-48" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="my-reviews-empty-state">
              <svg className="recommendations-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div>
                <h2 className="my-reviews-empty-title">No reviews found</h2>
                <p className="my-reviews-empty-description">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Be the first to write a review!'}
                </p>
              </div>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setPage(1)
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
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
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
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
                          className={`w-10 h-10 rounded-lg border transition ${
                            page === pageNum
                              ? 'border-flix-accent bg-flix-accent text-white font-semibold'
                              : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition"
                  >
                    Next
                  </button>
                </div>
              )}

              <div className="mt-4 text-center text-sm text-white/50">
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
