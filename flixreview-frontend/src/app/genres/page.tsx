'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { genresService, Genre } from '@/services/genres'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function GenresPage() {
  const { data: genres, isLoading, error, refetch } = useQuery<Genre[]>({
    queryKey: ['genres'],
    queryFn: () => genresService.getGenres(),
  })

  const skeletonItems = Array.from({ length: 12 })

  if (isLoading) {
    return (
      <div className="flix-main-layout">
        <Header />
        <main className="flix-main-content">
          <section className="flix-hero">
            <div className="flix-hero-background" />
            <div className="flix-hero-content flix-fade-in">
              <div className="h-10 w-64 animate-pulse rounded-full bg-white/10" />
              <div className="flix-mt-sm h-4 w-80 animate-pulse rounded-full bg-white/10" />
            </div>
          </section>

          <section className="flix-section">
            <div className="flix-container">
              <div className="flix-genres-grid">
                {skeletonItems.map((_, index) => (
                  <div
                    key={index}
                    className="flix-genre-card animate-pulse"
                  >
                    <div className="flix-genre-content space-y-4">
                      <div className="h-6 w-40 rounded-full bg-white/10" />
                      <div className="h-4 w-56 rounded-full bg-white/5" />
                      <div className="h-4 w-32 rounded-full bg-white/5" />
                    </div>
                    <div className="flix-genre-arrow opacity-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flix-main-layout">
        <Header />
        <main className="flix-main-content">
          <div className="flix-container flix-section">
            <div className="flix-card flix-p-xl flix-text-center">
              <svg className="w-16 h-16 flix-text-muted flix-mx-auto flix-mb-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h2 className="flix-title flix-mb-sm">Failed to load genres</h2>
              <p className="flix-body flix-text-muted flix-mb-lg">Please try again.</p>
              <div className="flix-flex flix-flex-col flix-gap-sm flix-items-center">
                <button
                  onClick={() => refetch()}
                  className="flix-btn flix-btn-secondary flix-btn-lg"
                >
                  Retry loading genres
                </button>
                <Link href="/" className="flix-btn flix-btn-ghost">
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flix-main-layout">
      <Header />
      <main className="flix-main-content">
        {/* Hero Section */}
        <section className="flix-hero">
          <div className="flix-hero-background"></div>
          <div className="flix-hero-content flix-fade-in">
            <h1 className="flix-hero-title">
              Browse by Genre
            </h1>
            <p className="flix-hero-subtitle">
              Explore movies by category and discover your next favorite film
            </p>
          </div>
        </section>

        {/* Genres Grid */}
        <section className="flix-section">
          <div className="flix-container">
            <div className="flix-genres-grid">
              {genres?.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/genres/${genre.slug}`}
                  className="flix-genre-card flix-fade-in"
                >
                  <div className="flix-genre-content">
                    <h2 className="flix-genre-title">
                      {genre.name}
                    </h2>
                    {genre.description && (
                      <p className="flix-genre-description">
                        {genre.description}
                      </p>
                    )}
                    {genre.movie_count !== undefined && (
                      <p className="flix-genre-count">
                        {genre.movie_count} {genre.movie_count === 1 ? 'movie' : 'movies'}
                      </p>
                    )}
                  </div>
                  <div className="flix-genre-arrow">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>

            {genres?.length === 0 && (
              <div className="flix-card flix-p-2xl flix-text-center">
                <svg className="w-16 h-16 flix-text-muted flix-mx-auto flix-mb-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="flix-body flix-text-secondary">No genres found.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
