import { Review } from '@/types/review'
import { Card, CardBody } from '@/components/ui/Card'
import { formatDateTime } from '@/utils/helpers'
import { Button } from '@/components/ui/Button'
import { ReviewLikeButton } from './ReviewLikeButton'
import { ReviewComments } from './ReviewComments'

interface ReviewCardProps {
  review: Review
  canEdit?: boolean
  onEdit?: (review: Review) => void
  onDelete?: (id: number) => void
  showComments?: boolean
  currentUsername?: string
}

const formatReviewerName = (user: Review['user']) => {
  if (typeof user === 'string') {
    return formatReviewerNameFromString(user)
  }
  return formatReviewerNameFromString(user.username)
}

const formatReviewerNameFromString = (identifier: string) => {
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

const getUserProfilePicture = (user: Review['user']) => {
  if (typeof user === 'string') return null
  return user.profile_picture?.url || null
}

const getUsername = (user: Review['user']) => {
  if (typeof user === 'string') return user
  return user.username
}

const isAdminUser = (user: Review['user']) => {
  const username = getUsername(user)
  const adminUsernames = ['admin', 'administrator', 'superuser', 'staff', 'moderator']
  return adminUsernames.some(adminName => 
    username.toLowerCase().includes(adminName) || 
    username.toLowerCase() === adminName
  )
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

export function ReviewCard({ review, canEdit, onEdit, onDelete, showComments = true, currentUsername }: ReviewCardProps) {
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
  const profilePictureUrl = getUserProfilePicture(review.user)
  const username = getUsername(review.user)

  return (
    <Card className="relative overflow-hidden bg-white/5 border border-white/10 backdrop-blur-lg text-white shadow-[0_25px_70px_-35px_rgba(0,0,0,0.9)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />
      <CardBody className="p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          {/* Movie Title Header */}
          <div className="flix-flex flix-items-center flix-justify-between flix-border-b flix-border-white/10 flix-px-md flix-py-sm">
            <div className="flix-flex flix-flex-col flix-pr-md">
              <h3 className="flix-text-xl flix-font-bold flix-text-white flix-tracking-wide">{review.movie.title}</h3>
              <p className="flix-text-sm flix-text-white/60">
                {review.movie.release_date && `(${new Date(review.movie.release_date).getFullYear()})`}
                {review.movie.genres && review.movie.genres.length > 0 && (
                  <>
                    {review.movie.release_date && ' • '}
                    {review.movie.genres.slice(0, 3).map(genre => genre.name).join(', ')}
                  </>
                )}
              </p>
            </div>
            <div className="flix-flex flix-items-center flix-pl-md">
              <span className="flix-text-xs flix-uppercase flix-tracking-wide flix-text-white/40">Movie</span>
              <svg className="flix-w-5 flix-h-5 flix-text-white/40 flix-ml-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16l13-8L7 4z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between flix-px-md">
            <div className="flex items-start gap-2">
              {profilePictureUrl ? (
                <div className={`relative h-12 w-12 overflow-hidden rounded-full ring-2 flix-mr-sm ${
                  isAdminUser(review.user) 
                    ? 'ring-yellow-400/50' 
                    : 'ring-red-500/40'
                }`}>
                  <img
                    src={profilePictureUrl}
                    alt={`${reviewerName}'s profile picture`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `<div class="flex h-full w-full items-center justify-center rounded-full ${
                          isAdminUser(review.user) 
                            ? 'bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 text-yellow-200' 
                            : 'bg-red-500/20 text-red-400'
                        } text-lg font-semibold uppercase shadow-inner">${reviewerInitials}</div>`
                      }
                    }}
                  />
                </div>
              ) : (
                <div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold uppercase shadow-inner ring-2 flix-mr-sm ${
                  isAdminUser(review.user) 
                    ? 'bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 text-yellow-200 ring-yellow-400/50' 
                    : 'bg-red-500/20 text-red-400 ring-red-500/40'
                }`}>
                  {reviewerInitials}
                </div>
              )}
              <div className="flix-pl-xs">
                <div className="flex flex-wrap items-center gap-3">
                  {isAdminUser(review.user) ? (
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400/30 via-yellow-500/40 to-yellow-600/30 border-2 border-yellow-400/60 text-sm font-bold tracking-wide text-yellow-200 shadow-[0_0_20px_rgba(251,191,36,0.4)] ring-2 ring-yellow-400/30 animate-pulse flix-mx-xs">
                      {reviewerName}
                    </span>
                  ) : (
                    <p className="text-lg font-semibold tracking-wide text-white flix-mr-sm">{reviewerName}</p>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-400/50 text-xs uppercase tracking-wide text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.3)] ring-1 ring-green-400/20 animate-pulse flix-mx-xs">
                    Verified viewer
                  </span>
                  {review.is_edited && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs uppercase tracking-wide text-white/70 flix-ml-xs">
                      Edited
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/45 mt-1 flix-mt-xs">
                  {formatDateTime(review.created_at)}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 flix-pl-md">
              <div className="flex items-center gap-3">
                <div className="flix-mr-sm">
                  {renderStars(review.rating)}
                </div>
                <span className="rounded-full border border-imdb-yellow/40 bg-imdb-yellow/20 px-3 py-1 text-sm font-semibold text-imdb-yellow shadow-[0_0_20px_rgba(255,200,0,0.25)] flix-ml-xs">
                  {review.rating}/5
                </span>
              </div>
              <span className="text-xs uppercase tracking-[0.3em] text-white/35 flix-mt-xs">Overall score</span>
            </div>
          </div>

          <p className="leading-relaxed text-base text-white/85 flix-px-md flix-py-sm">
            {review.content}
          </p>

          {/* Like Button and Comments Section */}
          <div className="border-t border-white/10 pt-4 flix-px-md">
            <div className="flex items-center justify-between mb-4">
              <ReviewLikeButton
                reviewId={review.id}
                initialLikesCount={review.likes_count || 0}
                initialUserHasLiked={review.user_has_liked || false}
                size="md"
              />
              <span className="text-sm text-white/50">
                {review.comments_count || 0} {review.comments_count === 1 ? 'comment' : 'comments'}
              </span>
            </div>

            {showComments && (
              <ReviewComments
                reviewId={review.id}
                initialCommentsCount={review.comments_count}
                currentUsername={currentUsername}
              />
            )}
          </div>

          {canEdit && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 flix-px-md flix-py-sm">
              <span className="text-sm text-white/45 flix-mr-sm">Refine or remove your review whenever you like.</span>
              <div className="flex gap-2 flix-ml-sm">
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
