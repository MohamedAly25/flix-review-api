import { MovieCard } from './MovieCard'

export const MovieRow = ({ title, movies = [] }) => (
  <section className="mb-12">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <span className="text-sm text-white/50">{movies.length} titles</span>
    </div>
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
      {movies.map((movie) => (
        <div key={movie.id} className="w-48 shrink-0 snap-start">
          <MovieCard movie={movie} />
        </div>
      ))}
      {!movies.length ? (
        <div className="w-full rounded-xl border border-white/10 bg-white/5 p-6 text-center text-white/60">
          No movies yet.
        </div>
      ) : null}
    </div>
  </section>
)
