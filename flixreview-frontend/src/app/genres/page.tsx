'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { genresService, Genre } from '@/services/genres'

export default function GenresPage() {
  const { data: genres, isLoading, error } = useQuery<Genre[]>({
    queryKey: ['genres'],
    queryFn: () => genresService.getGenres(),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flix-bg-primary">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 flix-text-secondary">Loading genres...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flix-bg-primary">
        <div className="container mx-auto px-4 py-12">
          <div className="flix-card-error text-center">
            <p>Failed to load genres. Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flix-bg-primary">
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="flix-heading-lg mb-4">Browse by Genre</h1>
          <p className="flix-text-secondary text-lg">
            Explore movies by category and discover your next favorite film
          </p>
        </div>

        {/* Genres Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {genres?.map((genre) => (
            <Link
              key={genre.id}
              href={`/genres/${genre.slug}`}
              className="group flix-card flix-card-hover p-8 text-center transition-all"
            >
              <div className="space-y-3">
                <h2 className="flix-heading-md group-hover:text-flix-red transition-colors">
                  {genre.name}
                </h2>
                {genre.description && (
                  <p className="flix-text-secondary text-sm line-clamp-2">
                    {genre.description}
                  </p>
                )}
                {genre.movie_count !== undefined && (
                  <p className="flix-text-muted text-sm">
                    {genre.movie_count} {genre.movie_count === 1 ? 'movie' : 'movies'}
                  </p>
                )}
              </div>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="flix-link inline-flex items-center gap-2">
                  View Movies
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {genres?.length === 0 && (
          <div className="flix-card text-center py-12">
            <p className="flix-text-secondary">No genres found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
