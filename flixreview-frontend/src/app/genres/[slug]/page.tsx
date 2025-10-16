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
    <div className="flix-main-layout">
      <Header />
      <main className="flix-main-content">
        {isLoading ? (
          <div className="flix-loading-panel">
            <Spinner size="lg" />
          </div>
        ) : !genre ? (
          <div className="flix-container flix-section">
            <div className="flix-card flix-p-2xl flix-text-center">
              <svg className="w-16 h-16 flix-text-muted flix-mx-auto flix-mb-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="flix-title flix-mb-sm">Genre not found</h2>
              <p className="flix-body flix-text-muted flix-mb-lg">The genre you&apos;re looking for doesn&apos;t exist.</p>
              <Link href="/genres" className="flix-btn flix-btn-primary flix-btn-lg">
                Browse All Genres
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <section className="flix-hero">
              <div className="flix-hero-background"></div>
              <div className="flix-hero-content flix-fade-in">
                {/* Breadcrumb */}
                <nav className="flix-mb-xl" aria-label="Breadcrumb">
                  <ol className="flix-flex flix-items-center flix-gap-2xs flix-small flix-text-muted">
                    <li>
                      <Link href="/genres" className="flix-transition-fast hover:flix-text-primary">
                        Genres
                      </Link>
                    </li>
                    <li aria-hidden="true">/</li>
                    <li className="flix-font-semibold flix-text-primary">{genre.name}</li>
                  </ol>
                </nav>

                {/* Genre Header */}
                <div className="max-w-4xl">
                  <div className="flix-mb-md flix-inline-flex flix-items-center flix-gap-2xs flix-px-md flix-py-2xs flix-rounded-full flix-bg-accent/20 flix-small flix-font-semibold flix-uppercase flix-tracking-wide flix-accent">
                    {genre.movie_count || 0} {genre.movie_count === 1 ? 'Movie' : 'Movies'}
                  </div>
                  <h1 className="flix-hero-title flix-mb-lg">{genre.name}</h1>
                  {genre.description && (
                    <p className="flix-body-lg flix-text-muted">{genre.description}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Movies Section */}
            <section className="flix-section">
              <div className="flix-container">
                {/* Sort Controls */}
                <div className="flix-flex flix-justify-between flix-items-center flix-mb-xl">
                  <h2 className="flix-subtitle">
                    {moviesData?.results ? `${moviesData.count} Movies` : 'Loading...'}
                  </h2>
                  <div className="flix-flex flix-items-center flix-gap-sm">
                    <label htmlFor="sort-select" className="flix-small flix-text-muted flix-font-medium">
                      Sort by:
                    </label>
                    <select
                      id="sort-select"
                      value={ordering}
                      onChange={(e) => {
                        setOrdering(e.target.value)
                        setPage(1)
                      }}
                      className="flix-input flix-px-md flix-py-2xs flix-bg-secondary flix-border flix-rounded-md flix-transition-fast focus:flix-border-accent"
                    >
                      <option value="-avg_rating">Highest Rated</option>
                      <option value="avg_rating">Lowest Rated</option>
                      <option value="-release_date">Newest First</option>
                      <option value="release_date">Oldest First</option>
                      <option value="title">A to Z</option>
                      <option value="-title">Z to A</option>
                    </select>
                  </div>
                </div>

              {/* Movies Grid */}
              {moviesLoading ? (
                <div className="flix-loading-panel">
                  <Spinner />
                </div>
              ) : !moviesData?.results || moviesData.results.length === 0 ? (
                <div className="flix-card flix-p-2xl flix-text-center">
                  <svg className="w-16 h-16 flix-text-muted flix-mx-auto flix-mb-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  <h3 className="flix-title flix-mb-sm">No movies in this genre yet</h3>
                  <p className="flix-body flix-text-muted">Check back soon for new additions</p>
                </div>
              ) : (
                <>
                  <div className="flix-movie-grid">
                    {moviesData.results.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flix-mt-2xl flix-flex flix-justify-center flix-items-center flix-gap-md">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={!moviesData.previous}
                        className="flix-btn flix-btn-secondary flix-btn-sm flix-flex flix-items-center flix-gap-2xs disabled:flix-opacity-50 disabled:flix-cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>

                      <span className="flix-small flix-text-muted flix-font-medium flix-px-md flix-py-2xs flix-bg-secondary flix-rounded-md">
                        Page {page} of {totalPages}
                      </span>

                      <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!moviesData.next}
                        className="flix-btn flix-btn-secondary flix-btn-sm flix-flex flix-items-center flix-gap-2xs disabled:flix-opacity-50 disabled:flix-cursor-not-allowed"
                      >
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
