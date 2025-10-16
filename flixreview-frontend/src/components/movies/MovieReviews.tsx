import { useRouter } from 'next/navigation'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Review } from '@/types/review'

interface MovieReviewsProps {
  movieId: number
  reviewsData: { results: Review[] } | undefined
  reviewsLoading: boolean
  isAuthenticated: boolean
  showReviewForm: boolean
  editingReview: Review | null
  userUsername?: string
  onSubmitReview: (data: { rating: number; content: string }) => Promise<void>
  onCancelReview: () => void
  onEditReview: (review: Review) => void
  onDeleteReview: (reviewId: number) => void
}

export function MovieReviews({
  movieId,
  reviewsData,
  reviewsLoading,
  isAuthenticated,
  showReviewForm,
  editingReview,
  userUsername,
  onSubmitReview,
  onCancelReview,
  onEditReview,
  onDeleteReview,
}: MovieReviewsProps) {
  const router = useRouter()

  return (
    <div className="flix-container flix-section" id="reviews">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="flix-heading-lg flix-mb-xl">Reviews</h2>

        {!isAuthenticated && (
          <div className="flix-card flix-p-xl flix-mb-xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="flix-heading-md">Join the conversation</h3>
              <p className="flix-text-muted flix-mt-sm max-w-xl">
                Sign in to publish your take and follow what others are saying about this title.
              </p>
            </div>
            <Button
              onClick={() => router.push(`/login?next=/movies/${movieId}`)}
              className="px-6"
            >
              Sign in to review
            </Button>
          </div>
        )}

        {showReviewForm && (
          <div className="flix-card flix-p-xl flix-mb-xl">
            <h3 className="flix-heading-md flix-mb-lg">
              {editingReview ? 'Edit Your Review' : 'Write Your Review'}
            </h3>
            <ReviewForm
              onSubmit={onSubmitReview}
              onCancel={onCancelReview}
              initialRating={editingReview?.rating ?? 5}
              initialContent={editingReview?.content ?? ''}
              submitLabel={editingReview ? 'Update Review' : 'Submit Review'}
            />
          </div>
        )}

        {reviewsLoading ? (
          <div className="flex justify-center flix-section">
            <Spinner />
          </div>
        ) : reviewsData?.results.length === 0 ? (
          <div className="flix-card flix-p-2xl text-center">
            <svg className="w-16 h-16 text-gray-700 mx-auto flix-mb-md" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <p className="flix-text-secondary text-lg flix-mb-sm">No member reviews yet</p>
            <p className="flix-text-muted">Be the first to break the silence.</p>
          </div>
        ) : (
          <div className="flex flex-col flix-gap-lg">
            {reviewsData?.results.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                canEdit={typeof review.user === 'string' ? review.user === userUsername : review.user.username === userUsername}
                onEdit={onEditReview}
                onDelete={onDeleteReview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}