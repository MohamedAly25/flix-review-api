import { useState, useCallback } from 'react'

export interface UsePaginationOptions {
  initialPage?: number
  pageSize?: number
  totalItems?: number
}

export interface UsePaginationReturn {
  currentPage: number
  pageSize: number
  totalPages: number
  goToPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
  canGoNext: boolean
  canGoPrevious: boolean
}

/**
 * Hook for managing pagination state and actions
 * 
 * @param options - Configuration options for pagination
 * @returns Pagination state and helper functions
 */
export function usePagination({
  initialPage = 1,
  pageSize = 10,
  totalItems = 0,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages))
      setCurrentPage(validPage)
    },
    [totalPages]
  )

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const previousPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  const goToFirstPage = useCallback(() => {
    goToPage(1)
  }, [goToPage])

  const goToLastPage = useCallback(() => {
    goToPage(totalPages)
  }, [goToPage, totalPages])

  const canGoNext = currentPage < totalPages
  const canGoPrevious = currentPage > 1

  return {
    currentPage,
    pageSize,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    canGoNext,
    canGoPrevious,
  }
}
