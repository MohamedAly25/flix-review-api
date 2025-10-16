'use client'

import { useEffect, useState } from 'react'
import { useGenres } from '@/hooks'
import type { Genre } from '@/services/genres'
import { cn } from '@/utils/helpers'

interface MovieFiltersProps {
  onFilterChange: (filters: FilterState) => void
  currentFilters: FilterState
  className?: string
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

export function MovieFilters({ onFilterChange, currentFilters, className }: MovieFiltersProps) {
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

  const selectBaseClasses = 'w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-flix-accent focus:bg-white/20 focus:ring-0'

  return (
    <div className={cn(
      'flix-card space-y-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_72px_rgba(0,0,0,0.35)] backdrop-blur-lg transition-shadow',
      className,
    )}>
      {/* Search Bar - Enhanced */}
      <div className="movies-search-container">
        <svg
          className="movies-search-icon"
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
          placeholder="Search"
          value={localFilters.search}
          onChange={(e) => handleFilterUpdate('search', e.target.value)}
          className="movies-search-input"
        />
        {localFilters.search && (
          <button
            onClick={() => handleFilterUpdate('search', '')}
            className="movies-search-clear"
            aria-label="Clear search"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
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
              className={cn(selectBaseClasses, 'pr-8')}
            >
              <option value="" style={{ color: '#111827', backgroundColor: '#F9FAFB' }}>All Genres</option>
              {genres?.map((genre: Genre) => (
                <option
                  key={genre.slug}
                  value={genre.slug}
                  style={{ color: '#111827', backgroundColor: '#F9FAFB' }}
                >
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
              className={cn(selectBaseClasses, 'pr-8')}
            >
              <option value="" style={{ color: '#111827', backgroundColor: '#F9FAFB' }}>All Years</option>
              {YEAR_OPTIONS.map((year) => (
                <option
                  key={year}
                  value={year}
                  style={{ color: '#111827', backgroundColor: '#F9FAFB' }}
                >
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
              className={cn(selectBaseClasses, 'pr-8')}
            >
              <option value="" style={{ color: '#111827', backgroundColor: '#F9FAFB' }}>Any Rating</option>
              {RATING_OPTIONS.map((rating) => (
                <option
                  key={rating.value}
                  value={rating.value}
                  style={{ color: '#111827', backgroundColor: '#F9FAFB' }}
                >
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
              className={cn(selectBaseClasses, 'pr-8')}
            >
              {SORT_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  style={{ color: '#111827', backgroundColor: '#F9FAFB' }}
                >
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
              {genres?.find((g: Genre) => g.slug === localFilters.genre)?.name}
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
