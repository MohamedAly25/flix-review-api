'use client'

import { useState } from 'react'
import { useMovies } from '@/hooks/useMovies'
import { MovieCard } from '@/components/movies/MovieCard'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Spinner } from '@/components/ui/Spinner'

export default function MoviesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useMovies({ search, page, page_size: 12 })

  return (
    <div className="min-h-screen flex flex-col flix-bg-primary">
      <Header />
      <main className="flex-grow">
        <section className="flix-section">
          <div className="flix-container flix-flex flix-flex-col flix-gap-xl">
            <div className="flix-flex flix-flex-col flix-gap-md">
              <h1 className="flix-h1">Discover Movies</h1>
              <input
                type="search"
                placeholder="Search movies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flix-search"
              />
            </div>

            {isLoading ? (
              <div className="flix-flex flix-justify-center" style={{ padding: '48px 0' }}>
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="flix-text-center" style={{ padding: '48px 0' }}>
                <p className="flix-accent flix-body">Error loading movies. Please try again.</p>
              </div>
            ) : !data || !data.results ? (
              <div className="flix-text-center" style={{ padding: '48px 0' }}>
                <p className="flix-muted">No movies found.</p>
              </div>
            ) : data.results.length === 0 ? (
              <div className="flix-text-center" style={{ padding: '48px 0' }}>
                <p className="flix-muted">No movies found.</p>
              </div>
            ) : (
              <>
                <div className="flix-movie-grid">
                  {data.results.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>

                {data && data.results && data.results.length > 0 && data.count > 12 && (
                  <div className="flex justify-center items-center gap-6 mt-12 pt-8 border-t border-flix-border">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!data.previous}
                      className="flix-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3"
                    >
                      Previous
                    </button>
                    <span className="flix-body px-6 py-3 bg-flix-bg-secondary rounded-lg font-medium">
                      Page {page} of {Math.ceil(data.count / 12)}
                    </span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!data.next}
                      className="flix-btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
