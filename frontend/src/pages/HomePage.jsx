import { useQuery } from '@tanstack/react-query'
import { movieService } from '../services/movieService'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorState } from '../components/common/ErrorState'
import { MovieRow } from '../components/movies/MovieRow'

export const HomePage = () => {
  const moviesQuery = useQuery({
    queryKey: ['movies', 'home'],
    queryFn: () => movieService.list({ page_size: 18 }),
  })

  const trendingQuery = useQuery({
    queryKey: ['movies', 'trending'],
    queryFn: async () => {
      try {
        const data = await movieService.getRecommendations('trending')
        return Array.isArray(data) ? data : data?.results || []
      } catch (error) {
        console.info('Trending endpoint not available yet', error)
        return []
      }
    },
  })

  if (moviesQuery.isLoading) {
    return <LoadingSpinner label="Fetching cinematic gems..." />
  }

  if (moviesQuery.isError) {
    return (
      <ErrorState
        title="Unable to load movies."
        description={moviesQuery.error?.message || 'Please refresh the page to try again.'}
      />
    )
  }

  const latestMovies = moviesQuery.data?.results || []
  const trendingMovies = trendingQuery.data || []

  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-gradient-to-r from-black via-surface to-black p-10 shadow-card">
        <p className="text-sm uppercase tracking-[0.3em] text-primary/80">Stream what you love</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
          Discover, rate, and review movies with a Netflix-inspired experience.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-white/70">
          Sign in to manage your watchlist, share your thoughts, and explore community-driven insights powered by the
          FlixReview API.
        </p>
      </section>

      <MovieRow title="Latest arrivals" movies={latestMovies} />
      <MovieRow title="Trending now" movies={trendingMovies} />
    </div>
  )
}
