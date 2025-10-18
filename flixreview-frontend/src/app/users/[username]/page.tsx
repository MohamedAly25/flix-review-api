'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { usersService } from '@/services/users'
import { reviewsService } from '@/services/reviews'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { Spinner } from '@/components/ui/Spinner'
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
      <div className="min-h-screen flex flex-col flix-bg-primary">
        <Header />
        <main className="flex-grow pt-24 sm:pt-28 flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-medium uppercase tracking-[0.22em] text-white/70">
            <Spinner size="sm" />
            Loading profile…
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (userError || !user) {
    return (
      <div className="min-h-screen flex flex-col flix-bg-primary">
        <Header />
        <main className="flex-grow pt-24 sm:pt-28">
          <div className="my-reviews-empty-state">
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
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const displayName = getDisplayName()

  return (
    <div className="min-h-screen flex flex-col flix-bg-primary">
      <Header />
      <main className="flex-grow pt-24 sm:pt-28">
        {/* Profile Hero */}
        <section className="my-reviews-hero">
          <div className="my-reviews-hero-content">
            <div className="flex flex-col items-center mb-6">
              {/* Profile Picture */}
              {user.profile_picture_url ? (
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-flix-accent/50 mb-4">
                  <img
                    src={user.profile_picture_url}
                    alt={`${displayName}'s profile`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-flix-accent/30 to-purple-500/30 flex items-center justify-center ring-4 ring-flix-accent/50 mb-4">
                  <span className="text-4xl font-bold text-white">
                    {getUserInitials(displayName)}
                  </span>
                </div>
              )}

              {/* Name and Username */}
              <h1 className="text-4xl font-bold text-white mb-2">{displayName}</h1>
              {user.first_name && (
                <p className="text-lg text-white/60">@{user.username}</p>
              )}

              {/* Edit Profile Button (if own profile) */}
              {isOwnProfile && (
                <Link
                  href="/account"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-flix-accent/40 bg-flix-accent px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-flix-accent-hover"
                >
                  Edit Profile
                </Link>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-center text-white/80 max-w-2xl mx-auto mb-6">
                {user.bio}
              </p>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {/* Email */}
              {user.email && (
                <div className="flix-card bg-white/5 p-4 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-flix-accent flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white/50 mb-1">Email</p>
                    <p className="text-sm text-white truncate">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Member Since */}
              <div className="flix-card bg-white/5 p-4 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-flix-accent flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/50 mb-1">Reviews</p>
                  <p className="text-sm text-white">{reviews.length} written</p>
                </div>
              </div>

              {/* Reviews Count */}
              <div className="flix-card bg-white/5 p-4 flex items-center gap-3">
                <Star className="w-5 h-5 text-flix-accent flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/50 mb-1">Total Reviews</p>
                  <p className="text-sm text-white">{reviews.length}</p>
                </div>
              </div>
            </div>

            {/* Preferred Genres */}
            {user.preferred_genres && user.preferred_genres.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-white/50 mb-3 text-center">Preferred Genres</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {user.preferred_genres.map((genre) => (
                    <Link
                      key={genre.id}
                      href={`/genres/${genre.slug}`}
                      className="px-4 py-2 rounded-full border border-flix-accent/40 bg-flix-accent/20 text-sm text-white hover:bg-flix-accent/30 transition"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="my-reviews-stats-container mt-6">
              <div className="my-reviews-stat-badge">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </div>
              {averageRating && (
                <div className="my-reviews-stat-badge">
                  {averageRating}/5 average rating
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="container mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
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
                  showComments={true}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
