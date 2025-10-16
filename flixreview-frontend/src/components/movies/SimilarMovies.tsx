import { MovieCard } from '@/components/movies/MovieCard'
import { Spinner } from '@/components/ui/Spinner'
import { SimilarGenreMovieCardModel } from '@/models/MovieCardModel'

interface SimilarMoviesProps {
  similarGenreModels: SimilarGenreMovieCardModel[]
  similarLoading: boolean
  primaryGenre: string | null
}

export function SimilarMovies({
  similarGenreModels,
  similarLoading,
  primaryGenre,
}: SimilarMoviesProps) {
  return (
    <section className="flix-container flix-section bg-gradient-to-b from-transparent to-flix-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between flix-mb-xl">
          <div>
            <h2 className="flix-heading-lg">More Like This</h2>
            <p className="flix-text-muted flix-mt-sm">
              {primaryGenre ? `${primaryGenre} · handpicked for you` : 'Tailored recommendations'}
            </p>
          </div>
          {similarGenreModels.length > 0 && (
            <span className="flix-badge-secondary">
              Top {similarGenreModels.length} matches
            </span>
          )}
        </div>

        <div className="flix-mt-lg">
          {similarLoading ? (
            <div className="flex justify-center flix-section">
              <Spinner size="lg" />
            </div>
          ) : similarGenreModels.length === 0 ? (
            <div className="flix-card flix-p-2xl text-center">
              <svg className="w-16 h-16 text-gray-700 mx-auto flix-mb-md" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <p className="flix-text-secondary text-lg">
                We could not find closely related titles in this genre yet
              </p>
              <p className="flix-text-muted flix-mt-sm">Check back soon for more picks</p>
            </div>
          ) : (
            <div className="grid flix-gap-lg sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
              {similarGenreModels.map((model) => (
                <MovieCard key={model.id} movie={model.toMovie()} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}