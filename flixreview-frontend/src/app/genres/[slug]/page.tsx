'use client'

import { use, useState } from 'react'
import { useGenre } from '@/hooks/useGenres'
import { useMovies } from '@/hooks/useMovies'
import { MovieCard } from '@/components/movies/MovieCard'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Spinner } from '@/components/ui/Spinner'
import Link from 'next/link'

export default function GenreDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [page, setPage] = useState(1)
  const [ordering, setOrdering] = useState('-avg_rating')

  const { data: genre, isLoading: genreLoading } = useGenre(slug)
  const { data: moviesData, isLoading: moviesLoading } = useMovies({
    genres__slug: slug,
    ordering,
    page,
    page_size: 18,
  })

  const isLoading = genreLoading || moviesLoading
  const totalPages = moviesData?.count ? Math.ceil(moviesData.count / 18) : 0

  return (
    <div className="min-h-screen flex flex-col flix-bg-primary">
      <Header />
      <main className="flex-grow">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Spinner size="lg" />
          </div>
        ) : !genre ? (
          <div className="container mx-auto px-6 py-16">
            <div className="flix-card p-12 text-center">
              <svg
                className="mx-auto mb-4 h-16 w-16 text-white/20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg font-medium text-white">Genre not found</p>
              <Link
                href="/genres"
                className="mt-6 inline-block rounded-lg bg-flix-accent px-6 py-3 font-medium text-white transition-colors hover:bg-flix-accent-hover"
              >
                Browse All Genres
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-flix-accent/10 via-transparent to-transparent py-16">
              <div className="container mx-auto px-6">
                {/* Breadcrumb */}
                <nav className="mb-8">
                  <ol className="flex items-center gap-2 text-sm text-white/60">
                    <li>
                      <Link href="/genres" className="transition-colors hover:text-white">
                        Genres
                      </Link>
                    </li>
                    <li>/</li>
                    <li className="font-medium text-white">{genre.name}</li>
                  </ol>
                </nav>

                {/* Genre Header */}
                <div className="max-w-4xl">
                  <div className="mb-4 inline-block rounded-full bg-flix-accent/20 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-flix-accent">
                    {genre.movie_count || 0} {genre.movie_count === 1 ? 'Movie' : 'Movies'}
                  </div>
                  <h1 className="flix-h1 mb-6">{genre.name}</h1>
                  {genre.description && (
                    <p className="text-lg leading-relaxed text-white/80">{genre.description}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Movies Section */}
            <section className="container mx-auto px-6 py-12">
              {/* Sort Controls */}
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {moviesData?.results ? `${moviesData.count} Movies` : 'Loading...'}
                </h2>
                <select
                  value={ordering}
                  onChange={(e) => {
                    setOrdering(e.target.value)
                    setPage(1)
                  }}
                  className="rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium text-white outline-none ring-1 ring-white/10 transition-all hover:bg-white/10 focus:ring-flix-accent"
                >
                  <option value="-avg_rating">Highest Rated</option>
                  <option value="avg_rating">Lowest Rated</option>
                  <option value="-release_date">Newest First</option>
                  <option value="release_date">Oldest First</option>
                  <option value="title">A to Z</option>
                  <option value="-title">Z to A</option>
                </select>
              </div>

              {/* Movies Grid */}
              {moviesLoading ? (
                <div className="flex justify-center py-16">
                  <Spinner />
                </div>
              ) : !moviesData?.results || moviesData.results.length === 0 ? (
                <div className="flix-card p-12 text-center">
                  <svg
                    className="mx-auto mb-4 h-16 w-16 text-white/20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                    />
                  </svg>
                  <p className="text-lg font-medium text-white">No movies in this genre yet</p>
                  <p className="mt-2 text-white/60">Check back soon for new additions</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                    {moviesData.results.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-4">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={!moviesData.previous}
                        className="flex items-center gap-2 rounded-lg bg-white/5 px-6 py-3 font-medium text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>

                      <span className="rounded-lg bg-white/5 px-6 py-3 font-medium text-white">
                        Page {page} of {totalPages}
                      </span>

                      <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!moviesData.next}
                        className="flex items-center gap-2 rounded-lg bg-white/5 px-6 py-3 font-medium text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Next
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
