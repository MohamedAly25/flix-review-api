'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { TextArea } from '@/components/ui/TextArea'
import { reviewCreateSchema, type ReviewCreateInput } from '@/schemas/review.schema'

interface ReviewFormProps {
  onSubmit: (data: { rating: number; content: string }) => Promise<void>
  onCancel?: () => void
  initialRating?: number
  initialContent?: string
  submitLabel?: string
}

export function ReviewForm({
  onSubmit,
  onCancel,
  initialRating = 5,
  initialContent = '',
  submitLabel = 'Submit Review',
}: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ReviewCreateInput>({
    resolver: zodResolver(reviewCreateSchema),
    defaultValues: {
      rating: initialRating,
      content: initialContent
    }
  })

  const rating = watch('rating')

  useEffect(() => {
    reset({
      rating: initialRating,
      content: initialContent
    })
  }, [initialRating, initialContent, reset])

  const handleSubmit = async (data: ReviewCreateInput) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      reset()
    } catch (err) {
      console.error('Failed to submit review:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleFormSubmit(handleSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Your Rating
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setValue('rating', star)}
              className="focus:outline-none"
            >
              <svg
                className={`w-8 h-8 ${
                  star <= rating ? 'text-imdb-yellow fill-current drop-shadow-sm' : 'text-white/20'
                } hover:text-imdb-yellow transition-colors`}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-red-400 text-sm mt-1">{errors.rating.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-white/80 mb-2">
          Your Review
        </label>
        <textarea
          id="content"
          {...register('content')}
          rows={4}
          placeholder="Share your thoughts about this movie..."
          className="w-full bg-white/5 border border-white/10 text-white placeholder-white/40 focus:ring-red-500 focus:border-red-500 rounded-lg p-3"
        />
        {errors.content && (
          <p className="text-red-400 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
