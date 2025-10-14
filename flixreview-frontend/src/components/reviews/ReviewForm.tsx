'use client'

import { useState } from 'react'
import { ReviewCreate } from '@/types/review'
import { Button } from '@/components/ui/Button'
import { TextArea } from '@/components/ui/TextArea'

interface ReviewFormProps {
  movieId: number
  onSubmit: (data: ReviewCreate) => Promise<void>
  onCancel?: () => void
}

export function ReviewForm({ movieId, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!content.trim()) {
      setError('Please write a review')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({ movie_id: movieId, rating, content: content.trim() })
      setContent('')
      setRating(5)
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } }
      setError(error.response?.data?.detail || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <svg
                className={`w-8 h-8 ${
                  star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                } hover:text-yellow-400 transition-colors`}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <TextArea
        label="Your Review"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder="Share your thoughts about this movie..."
        error={error}
      />

      <div className="flex gap-2">
        <Button type="submit" isLoading={isSubmitting}>
          Submit Review
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
