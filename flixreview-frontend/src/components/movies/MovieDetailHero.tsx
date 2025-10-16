import Image from 'next/image'
import { Movie } from '@/types/movie'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/utils/helpers'

interface MovieDetailHeroProps {
  movie: Movie
  reviewButtonLabel: string
  onReviewClick: () => void
  onShare: () => void
  isAuthenticated: boolean
  userHasReviewed: boolean
  actionMessage: string | null
}

export function MovieDetailHero({
  movie,
  reviewButtonLabel,
  onReviewClick,
  onShare,
  isAuthenticated,
  userHasReviewed,
  actionMessage,
}: MovieDetailHeroProps) {
  return (
    <div className="relative w-full min-h-[70vh] flex items-end overflow-hidden">
      {/* Backdrop Image */}
      {movie.backdrop_url ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={movie.backdrop_url}
            alt={`${movie.title} backdrop`}
            fill
            className="object-cover"
            priority
            quality={90}
          />
          {/* Gradient Overlays - Multiple layers for rich effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-flix-black via-flix-black/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-flix-black/90 via-transparent to-flix-black/50"></div>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-flix-black to-black"></div>
      )}

      {/* Floating Movie Info */}
      <div className="relative z-10 w-full flix-container flix-pb-xl flix-pt-2xl">
        <div className="flex flex-col lg:flex-row flix-gap-xl items-end flix-px-sm sm:flix-px-md lg:flix-px-lg xl:flix-px-xl">
          {/* Poster */}
          {movie.poster_url && (
            <div className="flex-shrink-0">
              <div className="relative w-64 h-96 rounded-lg overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <Image
                  src={movie.poster_url}
                  alt={`${movie.title} poster`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {/* Movie Info */}
          <div className="flex-grow pb-4">
            <h1 className="text-5xl md:text-6xl font-bold text-white flix-mb-md drop-shadow-lg">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center flix-gap-md flix-mb-lg">
              {/* Rating Badge - IMDb Style */}
              <div className="flex items-center gap-2 bg-imdb-yellow text-black px-4 py-2 rounded font-bold">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-lg">{movie.avg_rating.toFixed(1)}/10</span>
              </div>

              {/* Genre Badge */}
              <span className="px-4 py-2 bg-flix-red/90 text-white rounded font-semibold backdrop-blur-sm">
                {movie.genre}
              </span>

              {/* Release Year */}
              <span className="px-4 py-2 bg-white/10 text-white rounded backdrop-blur-sm">
                {formatDate(movie.release_date)}
              </span>

              {/* Runtime */}
              {movie.runtime && (
                <span className="px-4 py-2 bg-white/10 text-white rounded backdrop-blur-sm">
                  {movie.runtime} min
                </span>
              )}

              {/* Review Count */}
              <span className="px-4 py-2 bg-white/10 text-white rounded backdrop-blur-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                {movie.review_count} reviews
              </span>
            </div>

            {/* Description */}
            <p className="text-white/90 text-lg leading-relaxed max-w-3xl flix-mb-lg drop-shadow-md">
              {movie.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center flix-gap-md">
              <Button
                size="lg"
                onClick={onReviewClick}
                className="bg-flix-red hover:bg-flix-red/80 text-white px-8 py-4 text-lg font-semibold shadow-xl"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                {reviewButtonLabel}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={onShare}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 text-lg font-semibold shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </Button>
            </div>

            {isAuthenticated && userHasReviewed && (
              <p className="flix-mt-sm text-sm text-white/70">
                You can edit or delete your original review below. One review per member keeps things fair.
              </p>
            )}

            {actionMessage && (
              <div className="flix-mt-md px-4 py-3 bg-flix-red/90 text-white rounded backdrop-blur-sm inline-block">
                {actionMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}