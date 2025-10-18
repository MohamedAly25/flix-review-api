'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { usersService } from '@/services/users'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Spinner } from '@/components/ui/Spinner'
import { Users as UsersIcon, Search, AlertCircle } from 'lucide-react'

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const pageSize = 20

  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['users', page, searchQuery],
    queryFn: () => usersService.getUsers({
      page,
      page_size: pageSize,
      search: searchQuery || undefined,
    }),
  })

  const users = usersData?.results || []
  const totalPages = usersData ? Math.ceil(usersData.count / pageSize) : 1

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPage(1)
  }

  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      <Header />
      <main className="flex-grow pt-24 sm:pt-28">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 lg:py-20 animate-fade-in">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-2xl glass-heavy shadow-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
                <UsersIcon className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: 'var(--color-accent)' }} />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Community Members
              </h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl max-w-3xl mx-auto mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Discover fellow movie enthusiasts, explore their tastes, and connect with reviewers who share your passion for cinema.
            </p>
            {usersData && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <div className="px-6 py-3 rounded-full glass-heavy shadow-lg flex items-center gap-2" 
                     style={{ 
                       backgroundColor: 'var(--color-surface)',
                       border: '1px solid var(--color-border)'
                     }}>
                  <UsersIcon className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {usersData.count.toLocaleString()} members
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Search Section */}
        <section className="container mx-auto px-4 sm:px-6 py-8 animate-slide-up">
          <div className="glass-heavy rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by username..."
                  className="w-full pl-12 pr-32 py-3.5 rounded-lg border-2 transition-smooth focus-visible"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 rounded-md font-semibold text-sm transition-smooth hover:opacity-90 shadow-lg"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-text-inverse)'
                  }}
                >
                  Search
                </button>
              </div>
            </form>

            {searchQuery && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  Searching for: <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{searchQuery}</span>
                </span>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setPage(1)
                  }}
                  className="underline transition-smooth hover:opacity-80"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Users Grid */}
          {error ? (
            <div className="glass-heavy rounded-2xl p-12 text-center shadow-xl animate-fade-in" style={{ backgroundColor: 'var(--color-surface)' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'var(--color-error-light)' }}>
                <AlertCircle className="w-8 h-8" style={{ color: 'var(--color-error)' }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Failed to load users
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Please try again later.
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="glass-heavy rounded-2xl p-6 h-64 animate-pulse" 
                     style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full mb-4" style={{ backgroundColor: 'var(--color-border)' }} />
                    <div className="h-4 w-24 rounded mb-2" style={{ backgroundColor: 'var(--color-border)' }} />
                    <div className="h-3 w-32 rounded" style={{ backgroundColor: 'var(--color-border)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="glass-heavy rounded-2xl p-12 text-center shadow-xl animate-fade-in" style={{ backgroundColor: 'var(--color-surface)' }}>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'var(--color-surface-dark)' }}>
                <UsersIcon className="w-10 h-10" style={{ color: 'var(--color-text-tertiary)' }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                No users found
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                {searchQuery ? 'Try adjusting your search terms.' : 'No community members yet.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setPage(1)
                  }}
                  className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-smooth hover:opacity-90 shadow-lg"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-text-inverse)'
                  }}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Users Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/users/${user.username}`}
                    className="glass-heavy rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl group border-2 animate-fade-in"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    {/* Profile Picture or Avatar */}
                    <div className="flex flex-col items-center text-center">
                      {user.profile_picture_url ? (
                        <div className="w-24 h-24 rounded-full overflow-hidden transition-all duration-300 mb-4 shadow-lg border-4"
                             style={{ 
                               borderColor: 'var(--color-border)',
                             }}
                        >
                          <img
                            src={user.profile_picture_url}
                            alt={`${user.username}'s profile`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 mb-4 shadow-lg glass border-4"
                             style={{ 
                               backgroundColor: 'var(--color-accent)',
                               borderColor: 'var(--color-border)',
                             }}
                        >
                          <span className="text-2xl font-bold" style={{ color: 'var(--color-text-inverse)' }}>
                            {getUserInitials(user.username)}
                          </span>
                        </div>
                      )}

                      {/* Username */}
                      <h3 className="text-lg font-semibold mb-1 transition-colors duration-200" 
                          style={{ 
                            color: 'var(--color-text-primary)'
                          }}>
                        {user.username}
                      </h3>

                      {/* Bio (if available) */}
                      {user.bio && (
                        <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                          {user.bio}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-center gap-4 text-sm mt-2 px-4 py-2 rounded-lg glass"
                           style={{ 
                             backgroundColor: 'var(--color-background)',
                             color: 'var(--color-text-secondary)'
                           }}>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span className="font-semibold">{user.reviews_count || 0} reviews</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg border-2 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 font-medium"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (page <= 3) {
                        pageNum = i + 1
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = page - 2 + i
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className="w-10 h-10 rounded-lg border-2 transition-smooth font-semibold shadow-md"
                          style={{
                            backgroundColor: page === pageNum ? 'var(--color-accent)' : 'var(--color-surface)',
                            borderColor: page === pageNum ? 'var(--color-accent)' : 'var(--color-border)',
                            color: page === pageNum ? 'var(--color-text-inverse)' : 'var(--color-text-primary)'
                          }}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg border-2 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 font-medium"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    Next
                  </button>
                </div>
              )}

              <div className="mt-4 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Showing page {page} of {totalPages} ({usersData?.count || 0} total members)
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
