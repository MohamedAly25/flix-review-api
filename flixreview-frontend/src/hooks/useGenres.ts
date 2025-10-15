import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { genresService, type Genre } from '@/services/genres'

export function useGenres() {
  return useQuery<Genre[]>({
    queryKey: ['genres'],
    queryFn: () => genresService.getGenres(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useGenre(slug: string) {
  return useQuery<Genre>({
    queryKey: ['genre', slug],
    queryFn: () => genresService.getGenre(slug),
    enabled: !!slug,
  })
}

export function useCreateGenre() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => genresService.createGenre(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] })
    },
  })
}

export function useUpdateGenre() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: { name?: string; description?: string } }) =>
      genresService.updateGenre(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ['genres'] })
      queryClient.invalidateQueries({ queryKey: ['genre', slug] })
    },
  })
}

export function useDeleteGenre() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (slug: string) => genresService.deleteGenre(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] })
    },
  })
}
