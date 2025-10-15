'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { genresService } from '@/services/genres'
import { moviesService } from '@/services/movies'
import { MovieCard } from '@/components/movies/MovieCard'

export default function GenreDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const { data: genre, isLoading: genreLoading } = useQuery({
    queryKey: ['genre', slug],
    queryFn: () => genresService.getGenre(slug),
  })

  const { data: moviesData, isLoading: moviesLoading } = useQuery({
    queryKey: ['movies', 'genre', slug],
    queryFn: () => moviesService.getMovies({ genre: slug, page_size: 20 }),
  })

  const isLoading = genreLoading || moviesLoading

  if (isLoading) {
    return (
      <div className="min-h-screen flix-bg-primary">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 flix-text-secondary">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!genre) {
    return (
      <div className="min-h-screen flix-bg-primary">
        <div className="container mx-auto px-4 py-12">
          <div className="flix-card-error text-center">
            <p>Genre not found.</p>
            <Link href="/genres" className="flix-button-secondary mt-4 inline-block">
              Back to Genres
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flix-bg-primary">
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm flix-text-secondary">
            <li>
              <Link href="/genres" className="flix-link">
                Genres
              </Link>
            </li>
            <li>/</li>
            <li className="flix-text-primary">{genre.name}</li>
          </ol>
        </nav>

        {/* Genre Header */}
        <div className="mb-12">
          <h1 className="flix-heading-lg mb-4">{genre.name}</h1>
          {genre.description && (
            <p className="flix-text-secondary text-lg max-w-3xl">{genre.description}</p>
          )}
          {genre.movie_count !== undefined && (
            <p className="flix-text-muted mt-2">
              {genre.movie_count} {genre.movie_count === 1 ? 'movie' : 'movies'} in this genre
            </p>
          )}
        </div>

        {/* Movies Grid */}
        {moviesData && moviesData.results.length > 0 ? (
          <div className="flix-movies-grid">
            {moviesData.results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="flix-card text-center py-12">
            <p className="flix-text-secondary">No movies found in this genre.</p>
          </div>
        )}

        {/* Pagination Info */}
        {moviesData && moviesData.count > moviesData.results.length && (
          <div className="mt-8 text-center">
            <p className="flix-text-muted">
              Showing {moviesData.results.length} of {moviesData.count} movies
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
