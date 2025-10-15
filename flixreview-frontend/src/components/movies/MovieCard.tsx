import Link from 'next/link'
import Image from 'next/image'
import { Movie } from '@/types/movie'
import { formatDate } from '@/utils/helpers'

interface MovieCardProps {
  movie: Movie
}

function truncateWords(value: string, maxWords: number) {
  const words = value.trim().split(/\s+/)
  return words.length <= maxWords ? value : `${words.slice(0, maxWords).join(' ')}...`
}

export function MovieCard({ movie }: MovieCardProps) {
  const imageSrc = movie.poster_url && movie.poster_url.trim() !== '' ? movie.poster_url : '/placeholder-movie.svg'
  const displayTitle = truncateWords(movie.title, 8)
  const primaryGenre = movie.genres?.[0]?.name ?? (movie.genre?.trim() || 'Unknown genre')
  const secondaryGenre = movie.genres?.[1]?.name ?? null
  const description = movie.description?.trim() ? movie.description : 'No description available for this title yet.'
  const releaseDateObject = movie.release_date ? new Date(movie.release_date) : null
  const hasValidReleaseDate = !!(releaseDateObject && !Number.isNaN(releaseDateObject.getTime()))
  const releaseYear = hasValidReleaseDate ? releaseDateObject.getFullYear().toString() : 'TBD'
  const formattedReleaseDate = hasValidReleaseDate ? formatDate(movie.release_date) : 'Release date to be announced'
  const ratingValue =
    typeof movie.avg_rating === 'number' && !Number.isNaN(movie.avg_rating) ? movie.avg_rating.toFixed(1) : 'N/A'
  const reviewCount = movie.review_count || 0
  const reviewLabel = `${reviewCount} ${reviewCount === 1 ? 'Review' : 'Reviews'}`

  return (
    <Link href={`/movies/${movie.id}`} className="group block h-full">
      <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_32px_80px_rgba(0,0,0,0.55)]">
        <div className="relative overflow-hidden">
          <div className="relative aspect-[2/3] w-full">
            <Image
              src={imageSrc}
              alt={`${movie.title} poster`}
              fill
              className="object-cover transition duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(event) => {
                event.currentTarget.onerror = null
                event.currentTarget.src = '/placeholder-movie.svg'
              }}
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute inset-x-5 bottom-5 space-y-2 text-white">
              <h3 className="text-lg font-semibold leading-snug tracking-tight transition-colors duration-300 group-hover:text-flix-accent">
                {displayTitle}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/60">
                <span className="rounded-full border border-white/20 px-3 py-1 backdrop-blur">
                  {primaryGenre}
                </span>
                {secondaryGenre && (
                  <span className="rounded-full border border-white/10 px-3 py-1 text-white/50 backdrop-blur">
                    {secondaryGenre}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
            <svg className="h-4 w-4 text-[#f5c518]" viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
              <path d="M10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545L10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0z" />
            </svg>
            <span>{ratingValue}</span>
          </div>

          <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v2m8-2v2M4 9h16M6 7h12a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2zm0 4h.01M10 11h4" />
            </svg>
            {releaseYear}
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-4 p-6 text-white/80">
          <p className="line-clamp-3 text-sm leading-relaxed text-white/75">
            {description}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/65">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-semibold text-white/75">
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v9.586a1 1 0 01-1.707.707L12.586 13H4a2 2 0 01-2-2V5z" />
              </svg>
              {reviewLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-medium text-white/70">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-8 8h8m-6 4h4M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formattedReleaseDate}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
