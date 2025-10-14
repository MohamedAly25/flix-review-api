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

  return (
    <Link href={`/movies/${movie.id}`}>
      <div className="flix-card group cursor-pointer overflow-hidden h-full flex flex-col">
        <div className="relative w-full aspect-[2/3] overflow-hidden">
          <Image
            src={imageSrc}
            alt={`${movie.title} poster`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src = '/placeholder-movie.svg'
            }}
            priority={false}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <h3 className="flix-h2 mb-3 line-clamp-2 group-hover:text-flix-accent transition-colors leading-tight">
            {displayTitle}
          </h3>
          <p className="flix-muted mb-3 text-sm font-medium">
            {movie.genre || 'Unknown genre'}
          </p>
          <p className="flix-body line-clamp-3 mb-4 text-sm leading-relaxed flex-grow">
            {movie.description || 'No description available for this title yet.'}
          </p>
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-flix-border">
            <span className="flix-muted text-xs uppercase tracking-wide">
              {formatDate(movie.release_date)}
            </span>
            <div className="flex items-center flix-gap-sm">
              <div className="flex items-center flix-gap-xs">
                <svg className="w-4 h-4 flix-star" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="flix-body font-medium text-sm">
                  {typeof movie.avg_rating === 'number' && !Number.isNaN(movie.avg_rating)
                    ? movie.avg_rating.toFixed(1)
                    : 'N/A'}
                </span>
              </div>
              <span className="flix-muted text-xs">
                ({movie.review_count || 0})
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
