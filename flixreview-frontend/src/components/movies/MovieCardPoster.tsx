import Image from 'next/image'
import { Movie } from '@/types/movie'
import { truncateWords } from '@/utils/text'

interface MovieCardPosterProps {
  movie: Movie
  isLoading?: boolean
}

export function MovieCardPoster({ movie, isLoading = false }: MovieCardPosterProps) {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-3xl">
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <div className="absolute inset-0 animate-pulse bg-white/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute left-5 top-5 h-8 w-16 rounded-full bg-white/10" />
          <div className="absolute right-5 top-5 h-8 w-12 rounded-full bg-white/10" />
          <div className="absolute inset-x-5 bottom-5 space-y-3">
            <div className="h-5 w-3/4 rounded bg-white/10" />
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-full bg-white/10" />
              <div className="h-6 w-16 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const imageSrc = movie.poster_url && movie.poster_url.trim() !== '' ? movie.poster_url : '/placeholder-movie.svg'
  const displayTitle = truncateWords(movie.title, 8)
  const primaryGenre = movie.genres?.[0]?.name ?? (movie.genre?.trim() || 'Unknown genre')
  const secondaryGenre = movie.genres?.[1]?.name ?? null
  const releaseDateObject = movie.release_date ? new Date(movie.release_date) : null
  const hasValidReleaseDate = !!(releaseDateObject && !Number.isNaN(releaseDateObject.getTime()))
  const releaseYear = hasValidReleaseDate ? releaseDateObject.getFullYear().toString() : 'TBD'
  const ratingValue =
    typeof movie.avg_rating === 'number' && !Number.isNaN(movie.avg_rating) ? movie.avg_rating.toFixed(1) : 'N/A'

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={imageSrc}
          alt={`${movie.title} poster`}
          fill
          className="object-cover transition duration-700 ease-out group-hover:scale-105 group-focus-visible:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = '/placeholder-movie.svg'
          }}
          priority={false}
        />
  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
        <div className="absolute inset-x-5 bottom-5 space-y-2 text-white">
          <h3
            className="text-lg font-semibold leading-snug tracking-tight transition-colors duration-300 group-hover:text-flix-accent group-focus-visible:text-flix-accent"
            title={movie.title}
          >
            {displayTitle}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/60">
            <span className="rounded-full border border-white/20 px-3 py-1 backdrop-blur transition-all duration-300 group-hover:border-white/40 group-hover:bg-white/10 group-focus-visible:border-white/40 group-focus-visible:bg-white/10">
              {primaryGenre}
            </span>
            {secondaryGenre && (
              <span className="rounded-full border border-white/10 px-3 py-1 text-white/50 backdrop-blur transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/5 group-hover:text-white/70 group-focus-visible:border-white/30 group-focus-visible:bg-white/5 group-focus-visible:text-white/70">
                {secondaryGenre}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm transition-all duration-300 group-hover:bg-black/80 group-hover:text-white group-focus-visible:bg-black/80 group-focus-visible:text-white">
        <svg className="h-4 w-4 text-[#f5c518] transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110" viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
          <path d="M10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545L10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0z" />
        </svg>
        <span aria-label={`Average rating ${ratingValue}`}>{ratingValue}</span>
      </div>

      <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20 group-hover:border-white/20 group-focus-visible:bg-white/20 group-focus-visible:border-white/20">
        <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v2m8-2v2M4 9h16M6 7h12a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2zm0 4h.01M10 11h4" />
        </svg>
        <span aria-label={`Release year ${releaseYear}`}>{releaseYear}</span>
      </div>
    </div>
  )
}