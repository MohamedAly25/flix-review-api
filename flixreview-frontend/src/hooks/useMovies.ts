import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { moviesService } from '@/services/movies'
import { MovieCreate, MovieUpdate, MovieFilters } from '@/types/movie'

export function useMovies(params?: MovieFilters) {
  return useQuery({
    queryKey: ['movies', params],
    queryFn: () => moviesService.getMovies(params),
  })
}

export function useMovie(id: number) {
  return useQuery({
    queryKey: ['movies', id],
    queryFn: () => moviesService.getMovie(id),
    enabled: !!id,
  })
}

export function useCreateMovie() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MovieCreate) => moviesService.createMovie(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] })
    },
  })
}

export function useUpdateMovie() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MovieUpdate }) =>
      moviesService.updateMovie(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['movies'] })
      queryClient.invalidateQueries({ queryKey: ['movies', variables.id] })
    },
  })
}

export function useDeleteMovie() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => moviesService.deleteMovie(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] })
    },
  })
}
