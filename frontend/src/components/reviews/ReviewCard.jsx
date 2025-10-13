import { Star } from 'lucide-react'
import dayjs from 'dayjs'

export const ReviewCard = ({ review }) => {
  const { id, content, rating, user, created_at: createdAt } = review || {}

  return (
    <article
      key={id}
      className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur transition hover:border-white/20"
    >
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{user?.username || user?.email || 'Anonymous'}</p>
          <p className="text-xs text-white/50">{dayjs(createdAt).format('MMM D, YYYY')}</p>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <Star className="h-4 w-4 fill-current" />
          <span className="text-sm font-semibold">{rating}/5</span>
        </div>
      </header>
      <p className="mt-4 text-sm leading-relaxed text-white/80">{content}</p>
    </article>
  )
}
