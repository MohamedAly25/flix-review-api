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
  const displayTitle = truncateWords(movie.title, 6)
  const genre = movie.genre?.trim() ? movie.genre : 'Unknown genre'
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
    <Link href={`/movies/${movie.id}`} className="block h-full">
      <article className="flix-card group relative flex h-full cursor-pointer flex-col overflow-hidden bg-[#111111] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
        <div className="relative w-full overflow-hidden">
          <div className="relative aspect-[2/3] w-full">
            <Image
              src={imageSrc}
              alt={`${movie.title} poster`}
              fill
              className="object-cover transition duration-500 ease-out group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(event) => {
                event.currentTarget.onerror = null
                event.currentTarget.src = '/placeholder-movie.svg'
              }}
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
          </div>

          <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
            <svg className="h-4 w-4 text-[#f5c518]" viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
              <path d="M10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545L10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0z" />
            </svg>
            <span>{ratingValue}</span>
          </div>

          <div className="absolute top-4 right-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
            {releaseYear}
          </div>

          <div className="absolute inset-x-4 bottom-4 space-y-2 text-white">
            <h3 className="text-lg font-semibold leading-snug transition-colors duration-300 group-hover:text-flix-accent">
              {displayTitle}
            </h3>
            <p className="text-xs font-medium uppercase tracking-wide text-white/70">
              {genre}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <p className="line-clamp-3 text-sm leading-relaxed text-white/75">
            {description}
          </p>
          <div className="flex items-center justify-between text-xs text-white/60">
            <span className="rounded-full bg-white/5 px-3 py-1 font-semibold text-white/70">
              {reviewLabel}
            </span>
            <span className="font-medium text-white/70">
              {formattedReleaseDate}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
