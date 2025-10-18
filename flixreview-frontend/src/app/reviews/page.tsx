'use client'

import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { reviewsService } from '@/services/reviews'
import { useAuth } from '@/contexts/AuthContext'
import { PageLayout, PageHero, PageSection } from '@/components/layout'
import { ReviewList } from '@/components/reviews/ReviewList'
import { ReviewFilters } from '@/components/reviews/ReviewFilters'
import { SearchBar } from '@/components/ui/SearchBar'
import { Pagination, PaginationInfo } from '@/components/ui/Pagination'
import { Badge } from '@/components/ui/Badge'
import { useSearch, usePagination } from '@/hooks'
import { Star, FileText } from 'lucide-react'

type SortOption = 'created_at' | '-created_at' | 'rating' | '-rating'

export default function AllReviewsPage() {
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState<SortOption>('-created_at')
  const { searchQuery, debouncedSearchQuery, setSearchQuery, clearSearch } = useSearch()
  const pageSize = 10

  // Fetch reviews with debounced search
  const { data: reviewsData, isLoading, error } = useQuery({
    queryKey: ['all-reviews', debouncedSearchQuery, sortBy],
    queryFn: () =>
      reviewsService.getReviews({
        page: 1,
        page_size: 200, // Get more results for client-side pagination
        ordering: sortBy,
        search: debouncedSearchQuery || undefined,
      }),
  })

  const reviews = reviewsData?.results || []
  const totalItems = reviews.length

  // Client-side pagination
  const { currentPage, totalPages, goToPage } = usePagination({
    pageSize,
    totalItems,
  })

  // Reset to first page when search or sort changes
  useEffect(() => {
    goToPage(1)
  }, [debouncedSearchQuery, sortBy, goToPage])

  // Paginate reviews client-side
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Calculate stats
  const stats = useMemo(() => {
    if (!reviewsData || reviews.length === 0) return { total: 0, avgRating: '0' }

    const total = reviewsData.count
    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
      1
    )

    return { total, avgRating }
  }, [reviewsData, reviews])

  const handleClearSearch = () => {
    clearSearch()
    goToPage(1)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption)
    goToPage(1)
  }

  return (
    <PageLayout>
      <PageHero
        icon={<FileText className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: 'var(--color-accent)' }} />}
        title="All Reviews"
        description="Explore what the FlixReview community is saying about movies. Discover new perspectives, find hidden gems, and join the conversation."
        stats={
          totalItems > 0 ? (
            <>
              <Badge variant="glass" size="lg" icon={<FileText className="w-5 h-5" />}>
                {stats.total.toLocaleString()} total reviews
              </Badge>
              {reviews.length > 0 && (
                <Badge variant="glass" size="lg" icon={<Star className="w-5 h-5 fill-current" />}>
                  {stats.avgRating}/5 average
                </Badge>
              )}
            </>
          ) : undefined
        }
      />

      <PageSection variant="glass" containerClassName="space-y-6">
        <div className="glass-heavy rounded-2xl p-6 shadow-xl bg-[var(--color-surface)] space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={handleClearSearch}
                placeholder="Search reviews by movie title or content..."
                isLoading={isLoading}
              />
            </div>
            <ReviewFilters sortBy={sortBy} onSortChange={handleSortChange} />
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
            <Link
              href="/reviews/most-liked"
              className="inline-flex items-center gap-2 rounded-full border border-flix-accent/50 bg-flix-accent/15 px-4 py-2 text-sm font-medium text-flix-accent transition hover:bg-flix-accent/25"
            >
              🔥 Most Liked Reviews
            </Link>
            {user && (
              <Link
                href="/my-reviews"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
              >
                📝 My Reviews
              </Link>
            )}
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="space-y-6">
          <ReviewList
            reviews={paginatedReviews}
            isLoading={isLoading}
            isError={!!error}
            searchQuery={searchQuery}
            onClearSearch={handleClearSearch}
            currentUsername={user?.username}
            showComments
          />

          {!isLoading && !error && paginatedReviews.length > 0 && totalPages > 1 && (
            <div className="space-y-4">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
              <PaginationInfo currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} />
            </div>
          )}
        </div>
      </PageSection>
    </PageLayout>
  )
}
