import { Movie } from '@/types/movie'
import { formatDate } from '@/utils/helpers'
import { truncateText, formatCompactNumber } from '@/utils/text'

interface MovieCardContentProps {
  movie: Movie
  isLoading?: boolean
}

export function MovieCardContent({ movie, isLoading = false }: MovieCardContentProps) {
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col justify-between gap-4 p-6">
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-white/10" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-2/5 animate-pulse rounded bg-white/10" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-7 w-24 animate-pulse rounded-full bg-white/10" />
          <div className="h-7 w-32 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
    )
  }

  const description = movie.description?.trim() ? movie.description : 'No description available for this title yet.'
  const truncatedDescription = truncateText(description, 180)
  const releaseDateObject = movie.release_date ? new Date(movie.release_date) : null
  const hasValidReleaseDate = !!(releaseDateObject && !Number.isNaN(releaseDateObject.getTime()))
  const formattedReleaseDate = hasValidReleaseDate ? formatDate(movie.release_date) : 'Release date to be announced'
  const reviewCount = movie.review_count || 0
  const reviewLabel = `${formatCompactNumber(reviewCount)} ${reviewCount === 1 ? 'Review' : 'Reviews'}`

  return (
    <div className="flex flex-1 flex-col justify-between gap-4 p-6 text-white/80 transition-colors duration-300 group-hover:text-white/90 group-focus-visible:text-white/90">
      <p
        className="line-clamp-3 text-sm leading-relaxed text-white/75 transition-colors duration-300 group-hover:text-white/85 group-focus-visible:text-white/85"
        title={description.length > truncatedDescription.length ? description : undefined}
      >
        {truncatedDescription}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/65">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-semibold text-white/75 transition-all duration-300 group-hover:border-white/25 group-hover:bg-white/10 group-hover:text-white/85 group-focus-visible:border-white/25 group-focus-visible:bg-white/10 group-focus-visible:text-white/85">
          <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v9.586a1 1 0 01-1.707.707L12.586 13H4a2 2 0 01-2-2V5z" />
          </svg>
          <span aria-label={`${reviewCount} user reviews`}>{reviewLabel}</span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-medium text-white/70 transition-all duration-300 group-hover:border-white/25 group-hover:bg-white/10 group-hover:text-white/80 group-focus-visible:border-white/25 group-focus-visible:bg-white/10 group-focus-visible:text-white/80">
          <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-8 8h8m-6 4h4M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span aria-label={`Release date ${formattedReleaseDate}`}>{formattedReleaseDate}</span>
        </span>
      </div>
    </div>
  )
}