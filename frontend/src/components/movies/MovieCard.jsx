import { Link } from 'react-router-dom'
import clsx from 'clsx'

export const MovieCard = ({ movie }) => {
  const { id, title, poster_url: posterUrl, average_rating: averageRating } = movie || {}

  return (
    <Link
      to={`/movies/${id}`}
      className="group relative block overflow-hidden rounded-2xl bg-muted shadow-card transition hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="aspect-[2/3] w-full overflow-hidden">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/40">
            <span className="text-sm text-white/50">No artwork</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        <span className={clsx('text-xs font-medium', averageRating ? 'text-primary' : 'text-white/50')}>
          {averageRating ? Number(averageRating).toFixed(1) : '—'}
        </span>
      </div>
    </Link>
  )
}
