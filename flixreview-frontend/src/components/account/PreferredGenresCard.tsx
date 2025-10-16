import { useMemo } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'

interface GenreOption {
  id: number
  name: string
  slug: string
}

interface PreferredGenresCardProps {
  isLoading: boolean
  isSaving: boolean
  genres: GenreOption[]
  selectedGenreIds: number[]
  onToggleGenre: (genreId: number) => void
  onSave: () => void
  onReset: () => void
  hasChanges: boolean
  cooldownActive: boolean
  daysUntilNextUpdate: number
  lastUpdated?: string | null
  nextUpdateAvailableAt?: string | null
  message?: string | null
  error?: string | null
  selectionLimit?: number
  disableSubmit?: boolean
}

export function PreferredGenresCard({
  isLoading,
  isSaving,
  genres,
  selectedGenreIds,
  onToggleGenre,
  onSave,
  onReset,
  hasChanges,
  cooldownActive,
  daysUntilNextUpdate,
  lastUpdated,
  nextUpdateAvailableAt,
  message,
  error,
  selectionLimit = 3,
  disableSubmit = false,
}: PreferredGenresCardProps) {
  const selectedGenres = useMemo(() => {
    const ids = new Set(selectedGenreIds)
    return genres.filter((genre) => ids.has(genre.id))
  }, [genres, selectedGenreIds])

  const remainingSlots = selectionLimit - selectedGenreIds.length

  const cooldownCopy = useMemo(() => {
    if (!cooldownActive) return null

    if (nextUpdateAvailableAt) {
      try {
        const distance = formatDistanceToNow(parseISO(nextUpdateAvailableAt), { addSuffix: true })
        return `You can adjust your picks ${distance}.`
      } catch (error) {
        console.warn('Failed to parse cooldown timestamp', error)
      }
    }

    if (daysUntilNextUpdate > 0) {
      return `You can update preferences again in ${daysUntilNextUpdate} day${daysUntilNextUpdate === 1 ? '' : 's'}.`
    }

    return 'Updates will be available soon.'
  }, [cooldownActive, daysUntilNextUpdate, nextUpdateAvailableAt])

  return (
    <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-[0_40px_120px_-45px_rgba(0,0,0,0.8)]">
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">Preferred Genres</h3>
              <p className="mt-2 text-sm text-white/60">
                Choose up to {selectionLimit} genres to influence your recommendations immediately.
              </p>
            </div>
            <span className="rounded-full border border-flix-red/30 bg-flix-red/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-flix-red/90">
              Beta
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl bg-white/5">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-flix-red" />
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-white/45">Your picks</p>
              {selectedGenres.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedGenres.map((genre) => (
                    <span
                      key={genre.id}
                      className="inline-flex items-center gap-2 rounded-full border border-flix-red/40 bg-flix-red/15 px-4 py-2 text-sm font-medium text-flix-red/90 shadow-[0_8px_24px_rgba(229,9,20,0.25)]"
                    >
                      {genre.name}
                      <button
                        type="button"
                        onClick={() => onToggleGenre(genre.id)}
                        className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white"
                      >
                        Remove
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-white/55">No manual picks yet. Select up to {selectionLimit} genres below.</p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">Available genres</p>
                <span className="text-xs font-medium text-white/70">
                  {remainingSlots >= 0 ? `${remainingSlots} slot${remainingSlots === 1 ? '' : 's'} left` : 'Limit reached'}
                </span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {genres.map((genre) => {
                  const isSelected = selectedGenreIds.includes(genre.id)
                  const disabled = !isSelected && selectedGenreIds.length >= selectionLimit

                  return (
                    <button
                      type="button"
                      key={genre.id}
                      onClick={() => (!disabled ? onToggleGenre(genre.id) : undefined)}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all duration-200 ${
                        isSelected
                          ? 'border-flix-red/60 bg-flix-red/25 text-white shadow-[0_14px_40px_-18px_rgba(229,9,20,0.65)]'
                          : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10'
                      } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
                      aria-pressed={isSelected}
                    >
                      <span className="font-medium tracking-wide">{genre.name}</span>
                      <svg
                        className={`h-5 w-5 transition-colors ${isSelected ? 'text-flix-red/80' : 'text-white/25'}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                      >
                        {isSelected ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                        )}
                      </svg>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {cooldownCopy && (
          <div className="rounded-2xl border border-amber-400/40 bg-amber-500/15 p-4 text-sm text-amber-100">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium uppercase tracking-[0.2em] text-amber-200">Cooldown active</p>
                <p className="mt-1 text-amber-100/90">{cooldownCopy}</p>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p>{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-100">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="flex flex-col text-xs uppercase tracking-[0.2em] text-white/45">
            {lastUpdated ? (
              (() => {
                try {
                  return <span>Last updated {formatDistanceToNow(parseISO(lastUpdated), { addSuffix: true })}</span>
                } catch (error) {
                  console.warn('Failed to format last updated timestamp', error)
                  return <span>Last updated recently</span>
                }
              })()
            ) : (
              <span>No updates yet</span>
            )}
            <span>Manual picks override automatic taste profile</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onReset}
              className="rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors hover:bg-white/20"
              disabled={isSaving || selectedGenreIds.length === 0}
            >
              Clear picks
            </button>
            <button
              type="button"
              onClick={onSave}
              className="rounded-full border border-flix-red/60 bg-flix-red px-6 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white transition-all disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
              disabled={isSaving || !hasChanges || disableSubmit}
            >
              {isSaving ? 'Saving…' : hasChanges ? 'Save preferences' : 'Up to date'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
