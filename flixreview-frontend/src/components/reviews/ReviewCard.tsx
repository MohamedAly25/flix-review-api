import { Review } from '@/types/review'
import { Card, CardBody } from '@/components/ui/Card'
import { formatDateTime } from '@/utils/helpers'
import { Button } from '@/components/ui/Button'

interface ReviewCardProps {
  review: Review
  canEdit?: boolean
  onEdit?: (review: Review) => void
  onDelete?: (id: number) => void
}

export function ReviewCard({ review, canEdit, onEdit, onDelete }: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-medium text-gray-900">{review.user}</p>
            <p className="text-sm text-gray-500">{formatDateTime(review.created_at)}</p>
          </div>
          {renderStars(review.rating)}
        </div>
        <p className="text-gray-700 mt-3">{review.content}</p>
        {canEdit && (
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" onClick={() => onEdit?.(review)}>
              Edit
            </Button>
            <Button size="sm" variant="danger" onClick={() => onDelete?.(review.id)}>
              Delete
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
