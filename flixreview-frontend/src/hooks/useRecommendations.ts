import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { recommendationsService } from '@/services/recommendations'
import { useAuth } from '@/contexts/AuthContext'
import type { 
  PersonalizedRecommendations, 
  ShowcaseResult, 
  UserTasteProfile 
} from '@/types/recommendations'
import type { Movie } from '@/types/movie'

/**
 * Hook to get top rated movies
 */
export function useTopRated(limit = 10): UseQueryResult<Movie[], Error> {
  return useQuery({
    queryKey: ['recommendations', 'top-rated', limit],
    queryFn: () => recommendationsService.getTopRated(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get trending movies
 */
export function useTrending(limit = 10): UseQueryResult<Movie[], Error> {
  return useQuery({
    queryKey: ['recommendations', 'trending', limit],
    queryFn: () => recommendationsService.getTrending(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get most reviewed movies
 */
export function useMostReviewed(limit = 10): UseQueryResult<Movie[], Error> {
  return useQuery({
    queryKey: ['recommendations', 'most-reviewed', limit],
    queryFn: () => recommendationsService.getMostReviewed(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get recent movies
 */
export function useRecent(limit = 10): UseQueryResult<Movie[], Error> {
  return useQuery({
    queryKey: ['recommendations', 'recent', limit],
    queryFn: () => recommendationsService.getRecent(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get personalized recommendations
 * Only fetches if user is authenticated
 */
export function usePersonalizedRecommendations(
  limit = 10,
  algorithm: 'hybrid' | 'collaborative' | 'content' = 'hybrid'
): UseQueryResult<PersonalizedRecommendations, Error> {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['recommendations', 'for-you', limit, algorithm],
    queryFn: () => recommendationsService.getPersonalizedRecommendations(limit, algorithm),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes (recommendations are cached server-side)
  })
}

/**
 * Hook to get similar movies
 */
export function useSimilarMovies(
  movieId: number | null,
  limit = 5
): UseQueryResult<Movie[], Error> {
  return useQuery({
    queryKey: ['recommendations', 'similar', movieId, limit],
    queryFn: () => recommendationsService.getSimilarMovies(movieId!, limit),
    enabled: movieId !== null,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to get user taste profile
 * Only fetches if user is authenticated
 */
export function useTasteProfile(): UseQueryResult<UserTasteProfile, Error> {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['recommendations', 'taste-profile'],
    queryFn: () => recommendationsService.getTasteProfile(),
    enabled: isAuthenticated,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Hook to get showcase movies (personalized or top-rated as fallback)
 * Automatically handles authentication and genre preferences
 */
export function useShowcaseMovies(
  limit = 5,
  options?: { forceGenreBased?: boolean }
): UseQueryResult<ShowcaseResult, Error> {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['recommendations', 'showcase', limit, isAuthenticated, options?.forceGenreBased],
    queryFn: () =>
      recommendationsService.getShowcaseMovies({
        limit,
        personalized: isAuthenticated,
        forceGenreBased: options?.forceGenreBased,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get recommendations dashboard
 */
export function useRecommendationsDashboard(): UseQueryResult<{
  top_rated: Movie[]
  trending: Movie[]
  most_reviewed: Movie[]
  recent: Movie[]
  personalized?: Movie[]
}, Error> {
  return useQuery({
    queryKey: ['recommendations', 'dashboard'],
    queryFn: () => recommendationsService.getDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
