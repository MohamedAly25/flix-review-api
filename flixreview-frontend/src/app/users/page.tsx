'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usersService } from '@/services/users'
import { PageLayout, PageHero, PageSection } from '@/components/layout'
import { UserGrid, UserSearch } from '@/components/users'
import { Pagination, PaginationInfo } from '@/components/ui/Pagination'
import { Badge } from '@/components/ui/Badge'
import { useSearch, usePagination } from '@/hooks'
import { Users as UsersIcon } from 'lucide-react'

export default function UsersPage() {
  const pageSize = 20
  const { searchQuery, debouncedSearchQuery, setSearchQuery, clearSearch } = useSearch()
  
  // Fetch users with debounced search
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['users', debouncedSearchQuery],
    queryFn: () =>
      usersService.getUsers({
        page: 1, // Start from page 1 when searching
        page_size: 1000, // Get more results for client-side pagination
        search: debouncedSearchQuery || undefined,
      }),
  })

  const users = usersData?.results || []
  const totalItems = users.length

  // Client-side pagination
  const { currentPage, totalPages, goToPage } = usePagination({
    pageSize,
    totalItems,
  })

  // Reset to first page when search changes
  useEffect(() => {
    goToPage(1)
  }, [debouncedSearchQuery, goToPage])

  // Paginate users client-side
  const paginatedUsers = users.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleClearSearch = () => {
    clearSearch()
    goToPage(1)
  }

  return (
    <PageLayout>
      <PageHero
        icon={<UsersIcon className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: 'var(--color-accent)' }} />}
        title="Community Members"
        description="Discover fellow movie enthusiasts, explore their tastes, and connect with reviewers who share your passion for cinema."
        stats={
          totalItems > 0 ? (
            <Badge variant="glass" size="lg" icon={<UsersIcon className="w-5 h-5" />}>
              {totalItems.toLocaleString()} members
            </Badge>
          ) : undefined
        }
      />

      <PageSection containerClassName="space-y-6">
        <UserSearch
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={handleClearSearch}
          isLoading={isLoading}
        />

        <UserGrid
          users={paginatedUsers}
          isLoading={isLoading}
          isError={!!error}
          searchQuery={searchQuery}
          onClearSearch={handleClearSearch}
        />

        {!isLoading && !error && paginatedUsers.length > 0 && totalPages > 1 && (
          <div className="space-y-4">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
            <PaginationInfo currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} />
          </div>
        )}
      </PageSection>
    </PageLayout>
  )
}
