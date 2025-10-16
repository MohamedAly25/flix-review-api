import Link from 'next/link'
import { Movie } from '@/types/movie'
import { MovieCardPoster } from './MovieCardPoster'
import { MovieCardContent } from './MovieCardContent'

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-flix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_32px_80px_rgba(0,0,0,0.55)]">
        <MovieCardPoster movie={movie} />
        <MovieCardContent movie={movie} />
      </article>
    </Link>
  )
}
