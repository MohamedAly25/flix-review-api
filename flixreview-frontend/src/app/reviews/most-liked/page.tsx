'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { reviewsService } from '@/services/reviews'
import { useAuth } from '@/contexts/AuthContext'
import { PageLayout, PageHero, PageSection } from '@/components/layout'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { Badge } from '@/components/ui/Badge'
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
    <PageLayout>
      <PageHero
        icon={<Heart className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />}
        title="Most Liked Reviews"
        description="Discover the community's most celebrated reviews—insightful takes that sparked the biggest reactions across FlixReview."
        stats={
          <>
            <Badge variant="glass" size="lg" icon={<Heart className="w-5 h-5" />}>
              {stats.total.toLocaleString()} featured reviews
            </Badge>
            {stats.totalLikes > 0 && (
              <Badge variant="glass" size="lg">
                {stats.totalLikes.toLocaleString()} total likes
              </Badge>
            )}
            {stats.avgLikes > 0 && (
              <Badge variant="glass" size="lg">
                {stats.avgLikes} avg likes per review
              </Badge>
            )}
          </>
        }
      />

      <PageSection variant="glass">
        <div className="rounded-3xl border border-red-500/30 bg-gradient-to-r from-red-500/20 via-pink-500/20 to-purple-500/20 p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-500/30">
              <Heart className="h-6 w-6 text-red-400 fill-current" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-white">Community Favorites</h3>
              <p className="text-sm text-white/75">
                These reviews captured the hearts of fellow movie lovers. Dive into passionate perspectives, thoughtful analysis, and cinematic hot takes that the community can't stop liking.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              📚 All Reviews
            </Link>
            {user && (
              <Link
                href="/my-reviews"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                📝 My Reviews
              </Link>
            )}
            <Link
              href="/movies"
              className="inline-flex items-center gap-2 rounded-full border border-flix-accent/40 bg-flix-accent/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-flix-accent/30"
            >
              🎬 Browse Movies
            </Link>
          </div>
        </div>
      </PageSection>

      <PageSection>
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
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div key={review.id} className="relative">
                  {index < 3 && (
                    <div className="absolute -left-4 -top-4 z-10">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold shadow-lg ${
                          index === 0
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900'
                            : index === 1
                            ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900'
                            : 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-900'
                        }`}
                      >
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                    </div>
                  )}

                  {index >= 3 && (
                    <div className="absolute -left-3 top-4 z-10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-bold text-white/70">
                        #{(page - 1) * pageSize + index + 1}
                      </div>
                    </div>
                  )}

                  <div className={index < 3 ? 'ml-6' : 'ml-8'}>
                    <ReviewCard review={review} currentUsername={user?.username} showComments />
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center gap-3 text-white/70">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
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
                          className={`h-10 w-10 rounded-lg border transition ${
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
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

                <div className="text-sm">
                  Showing page {page} of {totalPages} ({stats.total} popular reviews)
                </div>
              </div>
            )}
          </>
        )}
      </PageSection>
    </PageLayout>
  )
}
