import { useState, useCallback } from 'react'
import { useDebounce } from './useDebounce'

export interface UseSearchReturn {
  searchQuery: string
  debouncedSearchQuery: string
  setSearchQuery: (query: string) => void
  clearSearch: () => void
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  hasSearch: boolean
}

/**
 * Hook for managing search state with debouncing
 * 
 * @param initialQuery - Initial search query value
 * @param debounceDelay - Delay in milliseconds for debouncing (default: 500ms)
 * @returns Search state and helper functions
 */
export function useSearch(
  initialQuery: string = '',
  debounceDelay: number = 500
): UseSearchReturn {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const debouncedSearchQuery = useDebounce(searchQuery, debounceDelay)

  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
    },
    []
  )

  const hasSearch = searchQuery.trim().length > 0

  return {
    searchQuery,
    debouncedSearchQuery,
    setSearchQuery,
    clearSearch,
    handleSearchChange,
    hasSearch,
  }
}
