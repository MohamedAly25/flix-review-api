'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { usersService } from '@/services/users'
import { reviewsService } from '@/services/reviews'
import { useAuth } from '@/contexts/AuthContext'
import { PageLayout, PageHero, PageSection } from '@/components/layout'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { User as UserIcon, Mail, Calendar, Star } from 'lucide-react'

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const { user: currentUser } = useAuth()

  // Fetch user profile
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user-profile', username],
    queryFn: () => usersService.getUserByUsername(username),
  })

  // Fetch user's reviews
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['user-reviews', username],
    queryFn: () => reviewsService.getReviews({ user: username }),
    enabled: !!username,
  })

  const reviews = reviewsData?.results || []
  const isOwnProfile = currentUser?.username === username

  const getUserInitials = (displayName: string) => {
    return displayName.slice(0, 2).toUpperCase()
  }

  const getDisplayName = () => {
    if (!user) return username
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ')
    return fullName || user.username
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (userLoading) {
    return (
      <PageLayout mainClassName="flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-medium uppercase tracking-[0.22em] text-white/70">
          <Spinner size="sm" />
          Loading profile…
        </div>
      </PageLayout>
    )
  }

  if (userError || !user) {
    return (
      <PageLayout>
        <PageSection variant="glass" containerClassName="my-reviews-empty-state space-y-0">
          <UserIcon className="w-16 h-16 mx-auto mb-4 text-white/30" />
          <div>
            <h2 className="my-reviews-empty-title">User not found</h2>
            <p className="my-reviews-empty-description">
              The user &quot;{username}&quot; doesn&apos;t exist or has been removed.
            </p>
          </div>
          <Link
            href="/users"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Browse All Users
          </Link>
        </PageSection>
      </PageLayout>
    )
  }

  const displayName = getDisplayName()

  return (
    <PageLayout>
      <PageHero
        title={displayName}
        description={user.bio || undefined}
        align="center"
        highlight={(
          <div className="flex flex-col items-center gap-4">
            {user.profile_picture_url ? (
              <div className="h-32 w-32 overflow-hidden rounded-full ring-4 ring-flix-accent/50">
                <img
                  src={user.profile_picture_url}
                  alt={`${displayName}'s profile`}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-flix-accent/30 to-purple-500/30 text-4xl font-bold text-white ring-4 ring-flix-accent/50">
                {getUserInitials(displayName)}
              </div>
            )}
            <p className="text-sm uppercase tracking-[0.22em] text-white/60">@{user.username}</p>
          </div>
        )}
        stats={(
          <>
            <Badge variant="glass" size="lg" icon={<Star className="h-5 w-5" />}>
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </Badge>
            {averageRating && (
              <Badge variant="glass" size="lg" icon={<Star className="h-5 w-5" />}>
                {averageRating}/5 average rating
              </Badge>
            )}
          </>
        )}
        actions={
          isOwnProfile ? (
            <Link
              href="/account"
              className="inline-flex items-center gap-2 rounded-full border border-flix-accent/40 bg-flix-accent px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-flix-accent-hover"
            >
              Edit Profile
            </Link>
          ) : undefined
        }
      />

      <PageSection variant="glass" containerClassName="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {user.email && (
            <div className="flix-card bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-flix-accent" />
                <div className="min-w-0">
                  <p className="text-xs text-white/50">Email</p>
                  <p className="truncate text-sm text-white">{user.email}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flix-card bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-flix-accent" />
              <div>
                <p className="text-xs text-white/50">Reviews Written</p>
                <p className="text-sm text-white">{reviews.length}</p>
              </div>
            </div>
          </div>
          {averageRating && (
            <div className="flix-card bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-flix-accent" />
                <div>
                  <p className="text-xs text-white/50">Average Rating</p>
                  <p className="text-sm text-white">{averageRating}/5</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {user.preferred_genres && user.preferred_genres.length > 0 && (
          <div className="space-y-3 text-center">
            <p className="text-sm text-white/50">Preferred Genres</p>
            <div className="flex flex-wrap justify-center gap-2">
              {user.preferred_genres.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/genres/${genre.slug}`}
                  className="px-4 py-2 text-sm text-white transition border border-flix-accent/40 rounded-full bg-flix-accent/20 hover:bg-flix-accent/30"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </PageSection>

      <PageSection>
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              {isOwnProfile ? 'Your Reviews' : `${displayName}'s Reviews`}
            </h2>
            <p className="text-white/60">
              {reviews.length === 0
                ? isOwnProfile
                  ? "You haven't written any reviews yet."
                  : "This user hasn't written any reviews yet."
                : `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'} by this user`}
            </p>
          </div>

          {reviewsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="skeleton-card h-48" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="my-reviews-empty-state">
              <Star className="w-16 h-16 mx-auto mb-4 text-white/30" />
              <div>
                <h3 className="my-reviews-empty-title">No reviews yet</h3>
                <p className="my-reviews-empty-description">
                  {isOwnProfile
                    ? 'Start rating movies to build your taste profile and get personalized recommendations.'
                    : 'Check back later to see what this user has to say about movies.'}
                </p>
              </div>
              {isOwnProfile && (
                <Link
                  href="/movies"
                  className="inline-flex items-center gap-2 rounded-full border border-flix-accent/40 bg-flix-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-flix-accent-hover"
                >
                  Browse Movies
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  currentUsername={currentUser?.username}
                  showComments
                />
              ))}
            </div>
          )}
        </div>
      </PageSection>
    </PageLayout>
  )
}
