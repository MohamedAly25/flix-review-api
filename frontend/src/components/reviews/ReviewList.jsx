import { ReviewCard } from './ReviewCard'
import { EmptyState } from '../common/EmptyState'

export const ReviewList = ({ reviews = [] }) => {
  if (!reviews.length) {
    return <EmptyState title="No reviews yet." description="Be the first to share your thoughts on this title." />
  }

  return (
    <div className="grid gap-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  )
}
