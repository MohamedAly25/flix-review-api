import { Movie } from '@/types/movie'
import { MovieCardPoster } from './MovieCardPoster'
import { MovieCardContent } from './MovieCardContent'

const PLACEHOLDER_MOVIE: Movie = {
  id: -1,
  title: 'Loading title',
  description: 'Loading description',
  genre: '',
  genres: [],
  release_date: '1970-01-01',
  avg_rating: 0,
  review_count: 0,
  poster_url: '',
  created_at: '1970-01-01T00:00:00Z',
  updated_at: '1970-01-01T00:00:00Z',
}

export function MovieCardSkeleton() {
  return (
    <article
      className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
      aria-hidden="true"
    >
      <MovieCardPoster movie={PLACEHOLDER_MOVIE} isLoading />
      <MovieCardContent movie={PLACEHOLDER_MOVIE} isLoading />
    </article>
  )
}
