import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewService } from '../../services/reviewService'
import { toast } from 'react-toastify'

const schema = yup.object({
  rating: yup.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').required('Rating is required'),
  content: yup.string().min(10, 'Review is too short').required('Review is required'),
})

export const ReviewForm = ({ movieId, onSuccess }) => {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      rating: 3,
      content: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (values) => reviewService.create({ ...values, movie: movieId }),
    onSuccess: (data) => {
      toast.success(data?.message || 'Review submitted!')
      queryClient.invalidateQueries({ queryKey: ['reviews', movieId] })
      reset()
      onSuccess?.()
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to submit review.'
      toast.error(message)
    },
  })

  const onSubmit = (values) => mutation.mutate(values)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-white/10 bg-black/40 p-6">
      <div>
        <label className="block text-sm font-medium text-white">Rating</label>
        <input
          type="number"
          min="1"
          max="5"
          step="1"
          {...register('rating', { valueAsNumber: true })}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.rating ? <p className="mt-1 text-xs text-red-400">{errors.rating.message}</p> : null}
      </div>

      <div>
        <label className="block text-sm font-medium text-white">Review</label>
        <textarea
          rows="4"
          {...register('content')}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Share your thoughts about this movie..."
        />
        {errors.content ? <p className="mt-1 text-xs text-red-400">{errors.content.message}</p> : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || mutation.isPending}
        className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting || mutation.isPending ? 'Submitting...' : 'Submit review'}
      </button>
    </form>
  )
}
