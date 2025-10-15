'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { TextArea } from '@/components/ui/TextArea'

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
  const [rating, setRating] = useState(initialRating)
  const [content, setContent] = useState(initialContent)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setRating(initialRating)
    setContent(initialContent)
  }, [initialRating, initialContent])

  const resetForm = () => {
    setRating(initialRating)
    setContent(initialContent)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!content.trim()) {
      setError('Please write a review')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({ rating, content: content.trim() })
      resetForm()
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
        <label className="block text-sm font-medium text-white/80 mb-2">
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
                  star <= rating ? 'text-imdb-yellow fill-current drop-shadow-sm' : 'text-white/20'
                } hover:text-imdb-yellow transition-colors`}
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
        labelClassName="text-white/80"
        errorClassName="text-red-400"
        className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:ring-red-500 focus:border-red-500"
      />

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
