'use client'

import { useEffect, useState } from 'react'
import { useGenres } from '@/hooks/useGenres'

interface MovieFiltersProps {
  onFilterChange: (filters: FilterState) => void
  currentFilters: FilterState
}

export interface FilterState {
  search: string
  genre: string
  ordering: string
  year?: number
  rating?: number
}

const SORT_OPTIONS = [
  { value: '-avg_rating', label: 'Rating: High to Low' },
  { value: 'avg_rating', label: 'Rating: Low to High' },
  { value: '-release_date', label: 'Release Date: Newest First' },
  { value: 'release_date', label: 'Release Date: Oldest First' },
  { value: 'title', label: 'Title: A to Z' },
  { value: '-title', label: 'Title: Z to A' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 50 }, (_, i) => CURRENT_YEAR - i)

const RATING_OPTIONS = [
  { value: 5, label: '5 Stars' },
  { value: 4, label: '4+ Stars' },
  { value: 3, label: '3+ Stars' },
  { value: 2, label: '2+ Stars' },
  { value: 1, label: '1+ Stars' },
]

export function MovieFilters({ onFilterChange, currentFilters }: MovieFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: genres } = useGenres()
  const [localFilters, setLocalFilters] = useState<FilterState>(currentFilters)

  useEffect(() => {
    setLocalFilters(currentFilters)
  }, [currentFilters])

  const handleFilterUpdate = (key: keyof FilterState, value: string | number | undefined) => {
    const updated = { ...localFilters, [key]: value }
    setLocalFilters(updated)
    onFilterChange(updated)
  }

  const handleClearFilters = () => {
    const cleared: FilterState = {
      search: '',
      genre: '',
      ordering: '-avg_rating',
    }
    setLocalFilters(cleared)
    onFilterChange(cleared)
  }

  const hasActiveFilters = localFilters.genre || localFilters.year || localFilters.rating

  return (
    <div className="flix-card p-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="search"
          placeholder="Search movies by title or description..."
          value={localFilters.search}
          onChange={(e) => handleFilterUpdate('search', e.target.value)}
          className="w-full rounded-lg bg-white/5 py-3 pl-12 pr-4 text-white placeholder-white/40 outline-none ring-1 ring-white/10 transition-all focus:bg-white/10 focus:ring-flix-accent"
        />
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-lg bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
      >
        <span className="flex items-center gap-2">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters {hasActiveFilters && <span className="ml-1 rounded-full bg-flix-accent px-2 py-0.5 text-xs">Active</span>}
        </span>
        <svg
          className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Genre Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">Genre</label>
            <select
              value={localFilters.genre}
              onChange={(e) => handleFilterUpdate('genre', e.target.value)}
              className="w-full rounded-lg bg-white/5 px-4 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 transition-all focus:bg-white/10 focus:ring-flix-accent"
            >
              <option value="">All Genres</option>
              {genres?.map((genre) => (
                <option key={genre.slug} value={genre.slug}>
                  {genre.name} {genre.movie_count ? `(${genre.movie_count})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">Release Year</label>
            <select
              value={localFilters.year ?? ''}
              onChange={(e) => handleFilterUpdate('year', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full rounded-lg bg-white/5 px-4 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 transition-all focus:bg-white/10 focus:ring-flix-accent"
            >
              <option value="">All Years</option>
              {YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">Minimum Rating</label>
            <select
              value={localFilters.rating ?? ''}
              onChange={(e) => handleFilterUpdate('rating', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full rounded-lg bg-white/5 px-4 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 transition-all focus:bg-white/10 focus:ring-flix-accent"
            >
              <option value="">Any Rating</option>
              {RATING_OPTIONS.map((rating) => (
                <option key={rating.value} value={rating.value}>
                  {rating.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">Sort By</label>
            <select
              value={localFilters.ordering}
              onChange={(e) => handleFilterUpdate('ordering', e.target.value)}
              className="w-full rounded-lg bg-white/5 px-4 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 transition-all focus:bg-white/10 focus:ring-flix-accent"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filters & Clear */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-medium uppercase tracking-wide text-white/50">Active:</span>
          {localFilters.genre && (
            <span className="inline-flex items-center gap-1 rounded-full bg-flix-accent/20 px-3 py-1 text-xs font-medium text-flix-accent">
              {genres?.find((g) => g.slug === localFilters.genre)?.name}
              <button
                onClick={() => handleFilterUpdate('genre', '')}
                className="ml-1 hover:text-white"
                aria-label="Remove genre filter"
              >
                ×
              </button>
            </span>
          )}
          {localFilters.year && (
            <span className="inline-flex items-center gap-1 rounded-full bg-flix-accent/20 px-3 py-1 text-xs font-medium text-flix-accent">
              {localFilters.year}
              <button
                onClick={() => handleFilterUpdate('year', undefined)}
                className="ml-1 hover:text-white"
                aria-label="Remove year filter"
              >
                ×
              </button>
            </span>
          )}
          {localFilters.rating && (
            <span className="inline-flex items-center gap-1 rounded-full bg-flix-accent/20 px-3 py-1 text-xs font-medium text-flix-accent">
              {localFilters.rating}+ Stars
              <button
                onClick={() => handleFilterUpdate('rating', undefined)}
                className="ml-1 hover:text-white"
                aria-label="Remove rating filter"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={handleClearFilters}
            className="ml-auto text-xs font-medium text-white/60 underline hover:text-white"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}
