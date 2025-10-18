'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, Edit2, Trash2, X } from 'lucide-react'
import { reviewsService } from '@/services/reviews'
import { ReviewComment } from '@/types/review'
import { formatDistanceToNow } from 'date-fns'

interface ReviewCommentsProps {
  reviewId: number
  initialCommentsCount?: number
  currentUsername?: string
  className?: string
}

export function ReviewComments({
  reviewId,
  initialCommentsCount = 0,
  currentUsername,
  className = '',
}: ReviewCommentsProps) {
  const [comments, setComments] = useState<ReviewComment[]>([])
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  // Load comments when expanded
  useEffect(() => {
    if (isExpanded && comments.length === 0) {
      loadComments()
    }
  }, [isExpanded])

  const loadComments = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }

      const response = await reviewsService.getReviewComments(reviewId, {
        page: pageNum,
        page_size: 10,
        ordering: '-created_at',
      })

      if (pageNum === 1) {
        setComments(response.results)
      } else {
        setComments((prev) => [...prev, ...response.results])
      }

      setCommentsCount(response.count)
      setPage(pageNum)
      setHasMore(response.next !== null)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      const comment = await reviewsService.createComment(reviewId, {
        content: newComment,
      })

      // Add new comment to the beginning of the list
      setComments((prev) => [comment, ...prev])
      setCommentsCount((prev) => prev + 1)
      setNewComment('')
    } catch (error: any) {
      console.error('Error creating comment:', error)
      alert(error.response?.data?.detail || 'Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditComment = (comment: ReviewComment) => {
    setEditingCommentId(comment.id)
    setEditContent(comment.content)
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditContent('')
  }

  const handleSaveEdit = async (commentId: number) => {
    if (!editContent.trim()) return

    try {
      const updated = await reviewsService.updateComment(commentId, {
        content: editContent,
      })

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updated : c))
      )
      setEditingCommentId(null)
      setEditContent('')
    } catch (error: any) {
      console.error('Error updating comment:', error)
      alert(error.response?.data?.detail || 'Failed to update comment')
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await reviewsService.deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      setCommentsCount((prev) => prev - 1)
    } catch (error: any) {
      console.error('Error deleting comment:', error)
      alert(error.response?.data?.detail || 'Failed to delete comment')
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium">
          {commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}
        </span>
      </button>

      {/* Comments Section */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Add Comment Form */}
          {currentUsername && (
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                rows={3}
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4"
                >
                  {/* Comment Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {comment.user.profile_picture?.url && (
                        <img
                          src={comment.user.profile_picture.url}
                          alt={comment.user.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="text-white font-medium text-sm">
                          {comment.user.username}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatTimestamp(comment.created_at)}
                          {comment.is_edited && (
                            <span className="ml-1">(edited)</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions for own comments */}
                    {currentUsername === comment.user.username && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditComment(comment)}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="Edit comment"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete comment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comment Content */}
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-400 hover:text-white px-3 py-1 text-sm transition-colors"
                        >
                          <X className="w-4 h-4 inline mr-1" />
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(comment.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {comment.content}
                    </p>
                  )}
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <button
                  onClick={() => loadComments(page + 1)}
                  disabled={isLoadingMore}
                  className="w-full text-center text-sm text-gray-400 hover:text-white py-2 transition-colors disabled:opacity-50"
                >
                  {isLoadingMore ? 'Loading...' : 'Load more comments'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
