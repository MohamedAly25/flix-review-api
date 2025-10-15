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

const formatReviewerName = (identifier: string) => {
  if (!identifier) return 'Guest Reviewer'

  const trimmed = identifier.trim()
  const base = trimmed.includes('@') ? trimmed.split('@')[0] : trimmed
  const normalized = base.replace(/[_\.\-]+/g, ' ').replace(/\s+/g, ' ').trim()

  if (!normalized) return trimmed

  return normalized
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const getInitials = (name: string) => {
  const segments = name
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase())

  if (segments.length === 0) return 'U'
  if (segments.length === 1) return segments[0]

  return `${segments[0]}${segments[segments.length - 1]}`.slice(0, 2)
}

export function ReviewCard({ review, canEdit, onEdit, onDelete }: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-imdb-yellow fill-current drop-shadow-sm' : 'text-white/20'
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    )
  }

  const reviewerName = formatReviewerName(review.user)
  const reviewerInitials = getInitials(reviewerName)

  return (
    <Card className="relative overflow-hidden bg-white/5 border border-white/10 backdrop-blur-lg text-white shadow-[0_25px_70px_-35px_rgba(0,0,0,0.9)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />
      <CardBody className="p-6 sm:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-lg font-semibold uppercase text-red-400 ring-1 ring-red-500/40 shadow-inner">
                {reviewerInitials}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-lg font-semibold tracking-wide text-white">{reviewerName}</p>
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40">Verified viewer</span>
                  {review.is_edited && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs uppercase tracking-wide text-white/70">
                      Edited
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/45 mt-1">
                  {formatDateTime(review.created_at)}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                {renderStars(review.rating)}
                <span className="rounded-full border border-imdb-yellow/40 bg-imdb-yellow/20 px-3 py-1 text-sm font-semibold text-imdb-yellow shadow-[0_0_20px_rgba(255,200,0,0.25)]">
                  {review.rating}/5
                </span>
              </div>
              <span className="text-xs uppercase tracking-[0.3em] text-white/35">Overall score</span>
            </div>
          </div>

          <p className="leading-relaxed text-base text-white/85">
            {review.content}
          </p>

          {canEdit && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
              <span className="text-sm text-white/45">Refine or remove your review whenever you like.</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/10 text-white hover:bg-white/20"
                  onClick={() => onEdit?.(review)}
                >
                  Edit Review
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  className="bg-red-600/80 hover:bg-red-600 text-white"
                  onClick={() => onDelete?.(review.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
