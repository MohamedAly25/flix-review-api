import Link from 'next/link'
import Image from 'next/image'
import { Movie } from '@/types/movie'
import { formatDate } from '@/utils/helpers'

interface MovieHeroProps {
  movie: Movie
  badgeLabel?: string
}

function truncateText(value: string | undefined, maxWords: number) {
  if (!value) {
    return ''
  }

  const words = value.trim().split(/\s+/)
  return words.length <= maxWords ? value : `${words.slice(0, maxWords).join(' ')}…`
}

export function MovieHero({ movie, badgeLabel = 'Featured Pick' }: MovieHeroProps) {
  const backdropSrc = movie.backdrop_url && movie.backdrop_url.trim() !== ''
    ? movie.backdrop_url
    : movie.poster_url && movie.poster_url.trim() !== ''
      ? movie.poster_url
      : '/placeholder-movie.svg'

  const posterSrc = movie.poster_url && movie.poster_url.trim() !== ''
    ? movie.poster_url
    : '/placeholder-movie.svg'

  const releaseDateLabel = movie.release_date ? formatDate(movie.release_date) : 'Coming soon'
  const ratingLabel = typeof movie.avg_rating === 'number' ? movie.avg_rating.toFixed(1) : 'N/A'
  const genres = movie.genres?.length ? movie.genres.map((genre) => genre.name) : movie.genre ? [movie.genre] : []
  const synopsis = truncateText(movie.description, 45)

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-black via-neutral-950 to-[var(--flix-bg-secondary)] shadow-[0_20px_80px_rgba(0,0,0,0.65)]">
      <div className="absolute inset-0">
        <Image
          src={backdropSrc}
          alt={`${movie.title} backdrop`}
          fill
          priority
          className="object-cover opacity-60"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(229,9,20,0.45),_transparent_55%)]" />
      </div>

      <div className="relative z-10 grid gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[360px_1fr] lg:items-center lg:px-14">
        <div className="relative mx-auto h-[420px] w-[280px] overflow-hidden rounded-3xl shadow-[0_35px_60px_rgba(0,0,0,0.75)] transition-transform duration-500 hover:scale-[1.02]">
            <Image
              src={posterSrc}
              alt={`${movie.title} poster`}
              fill
              className="object-cover"
              sizes="280px"
            />
            <span className="absolute left-4 top-4 rounded-full bg-black/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur">
              {badgeLabel}
            </span>
        </div>

        <div className="space-y-6 text-white">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold text-white/80 backdrop-blur">
              <svg className="h-4 w-4 text-[#f5c518]" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545L10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0z" />
              </svg>
              IMDb {ratingLabel}
            </div>
            <h2 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl sm:leading-tight">
              {movie.title}
            </h2>
          </div>

          {synopsis && (
            <p className="max-w-2xl text-base text-white/80 sm:text-lg">
              {synopsis}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
            <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-12a.75.75 0 00-1.5 0v4c0 .414.336.75.75.75H13a.75.75 0 000-1.5h-2.25V6z" />
              </svg>
              {releaseDateLabel}
            </span>
            {movie.runtime ? (
              <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {movie.runtime} min
              </span>
            ) : null}
            <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {movie.review_count} {movie.review_count === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-white/70">
              {genres.slice(0, 4).map((genre) => (
                <span key={genre} className="rounded-full border border-white/15 px-3 py-1">
                  {genre}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={`/movies/${movie.id}`}
              className="flix-btn flix-btn-primary flix-btn-lg !bg-flix-accent !px-8 !py-3 text-lg shadow-[0_18px_45px_rgba(229,9,20,0.45)] transition-transform hover:scale-[1.03]"
            >
              View details
            </Link>
            <Link
              href={`/movies/${movie.id}#reviews`}
              className="flix-btn flix-btn-secondary flix-btn-lg !border-white/30 !bg-white/10 !px-8 !py-3 text-lg text-white/80 transition-transform hover:scale-[1.03] hover:text-white"
            >
              Read reviews
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
