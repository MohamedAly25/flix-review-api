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
import { Heart } from 'lucide-react'

export default function MostLikedReviewsPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data: reviewsData, isLoading, error } = useQuery({
    queryKey: ['most-liked-reviews', page],
    queryFn: () => reviewsService.getMostLikedReviews({
      page,
      page_size: pageSize,
    }),
  })

  const reviews = reviewsData?.results || []
  const totalPages = reviewsData ? Math.ceil(reviewsData.count / pageSize) : 1

  const stats = useMemo(() => {
    if (!reviewsData) return { total: 0, totalLikes: 0, avgLikes: 0 }
    
    const total = reviewsData.count
    const totalLikes = reviews.reduce((sum, r) => sum + (r.likes_count || 0), 0)
    const avgLikes = reviews.length > 0 
      ? Math.round(totalLikes / reviews.length)
      : 0

    return { total, totalLikes, avgLikes }
  }, [reviewsData, reviews])

  return (
    <div className="min-h-screen flex flex-col flix-bg-primary">
      <Header />
      <main className="flex-grow pt-24 sm:pt-28">
        {/* Hero Section */}
        <section className="my-reviews-hero">
          <div className="my-reviews-hero-content">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-10 h-10 text-red-500 fill-current animate-pulse" />
              <h1 className="my-reviews-hero-title">Most Liked Reviews</h1>
            </div>
            <p className="my-reviews-hero-description">
              Discover the most popular reviews in the FlixReview community. These reviews have resonated with our members and sparked the most engagement.
            </p>
            <div className="my-reviews-stats-container">
              <div className="my-reviews-stat-badge">
                {stats.total.toLocaleString()} popular reviews
              </div>
              {stats.totalLikes > 0 && (
                <div className="my-reviews-stat-badge">
                  {stats.totalLikes.toLocaleString()} total likes
                </div>
              )}
              {stats.avgLikes > 0 && (
                <div className="my-reviews-stat-badge">
                  {stats.avgLikes} avg likes per review
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 sm:px-6 py-8">
          {/* Info Banner */}
          <div className="flix-card bg-gradient-to-r from-red-500/20 via-pink-500/20 to-purple-500/20 border border-red-500/30 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/30 flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-400 fill-current" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Community Favorites</h3>
                <p className="text-sm text-white/70">
                  These reviews have been liked the most by our community members. They offer insightful perspectives, 
                  entertaining commentary, and valuable opinions that have resonated with fellow movie lovers.
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
              <Link
                href="/reviews"
                className="px-4 py-2 rounded-full border border-white/20 bg-white/10 text-sm text-white hover:bg-white/20 transition"
              >
                📚 All Reviews
              </Link>
              {user && (
                <Link
                  href="/my-reviews"
                  className="px-4 py-2 rounded-full border border-white/20 bg-white/10 text-sm text-white hover:bg-white/20 transition"
                >
                  📝 My Reviews
                </Link>
              )}
              <Link
                href="/movies"
                className="px-4 py-2 rounded-full border border-flix-accent/40 bg-flix-accent/20 text-sm text-white hover:bg-flix-accent/30 transition"
              >
                🎬 Browse Movies
              </Link>
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
              <Heart className="w-16 h-16 mx-auto mb-4 text-white/30" />
              <div>
                <h2 className="my-reviews-empty-title">No liked reviews yet</h2>
                <p className="my-reviews-empty-description">
                  Be the first to like a review and show your appreciation for great movie commentary!
                </p>
              </div>
              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 rounded-full border border-flix-accent/40 bg-flix-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-flix-accent-hover"
              >
                Browse All Reviews
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            <>
              {/* Leaderboard Style */}
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <div key={review.id} className="relative">
                    {/* Rank Badge */}
                    {index < 3 && (
                      <div className="absolute -left-4 -top-4 z-10">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg ${
                          index === 0 
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900' 
                            : index === 1
                            ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900'
                            : 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-900'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                      </div>
                    )}
                    
                    {/* Rank Number for others */}
                    {index >= 3 && (
                      <div className="absolute -left-3 top-4 z-10">
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sm font-bold text-white/70">
                          #{(page - 1) * pageSize + index + 1}
                        </div>
                      </div>
                    )}
                    
                    <div className={index < 3 ? 'ml-6' : 'ml-8'}>
                      <ReviewCard 
                        review={review}
                        currentUsername={user?.username}
                        showComments={true}
                      />
                    </div>
                  </div>
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
                Showing page {page} of {totalPages} ({stats.total} popular reviews)
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
