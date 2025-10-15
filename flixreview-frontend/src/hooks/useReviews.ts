import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsService } from '@/services/reviews'
import { ReviewCreate, ReviewUpdate, ReviewFilters } from '@/types/review'

export function useReviewsByMovieTitle(title?: string, filters?: ReviewFilters) {
  return useQuery({
    queryKey: ['reviews', 'by-title', title, filters ?? null],
    queryFn: () => reviewsService.getReviewsByMovieTitle(title!, filters),
    enabled: Boolean(title),
  })
}

export function useUserReviews(username?: string) {
  return useQuery({
    queryKey: ['reviews', 'user', username],
    queryFn: () => reviewsService.getReviews({ user: username }),
    enabled: Boolean(username),
  })
}

export function useReview(id: number) {
  return useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsService.getReview(id),
    enabled: !!id,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ReviewCreate) => reviewsService.createReview(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['movies', data.movie] })
    },
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReviewUpdate }) =>
      reviewsService.updateReview(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['movies', data.movie] })
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => reviewsService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['movies'] })
    },
  })
}
