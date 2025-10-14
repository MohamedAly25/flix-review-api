import Link from 'next/link'
import Image from 'next/image'
import { Movie } from '@/types/movie'
import { formatDate } from '@/utils/helpers'

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movies/${movie.id}`}>
      <div className="flix-card group cursor-pointer overflow-hidden">
        {movie.poster_url && (
          <div className="relative w-full h-64 overflow-hidden">
            <Image
              src={movie.poster_url}
              alt={`${movie.title} poster`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
          </div>
        )}
        <div className="p-4">
          <h3 className="flix-h2 mb-2 line-clamp-2 group-hover:text-flix-accent transition-colors">
            {movie.title}
          </h3>
          <p className="flix-muted mb-2">{movie.genre}</p>
          <p className="flix-body line-clamp-3 mb-4 text-sm leading-relaxed">
            {movie.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="flix-muted text-sm">{formatDate(movie.release_date)}</span>
            <div className="flex items-center">
              <svg className="w-5 h-5 flix-star mr-1" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <span className="flix-body font-medium">
                {typeof movie.avg_rating === 'number' && !isNaN(movie.avg_rating)
                  ? movie.avg_rating.toFixed(1)
                  : 'N/A'}
              </span>
              <span className="flix-muted ml-1">({movie.review_count || 0})</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
