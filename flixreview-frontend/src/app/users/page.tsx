'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { usersService } from '@/services/users'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Spinner } from '@/components/ui/Spinner'
import { Users as UsersIcon, Search } from 'lucide-react'

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
    <div className="min-h-screen flex flex-col flix-bg-primary">
      <Header />
      <main className="flex-grow pt-24 sm:pt-28">
        {/* Hero Section */}
        <section className="my-reviews-hero">
          <div className="my-reviews-hero-content">
            <div className="flex items-center justify-center gap-3 mb-4">
              <UsersIcon className="w-10 h-10 text-flix-accent" />
              <h1 className="my-reviews-hero-title">Community Members</h1>
            </div>
            <p className="my-reviews-hero-description">
              Discover fellow movie enthusiasts, explore their tastes, and connect with reviewers who share your passion for cinema.
            </p>
            {usersData && (
              <div className="my-reviews-stats-container">
                <div className="my-reviews-stat-badge">
                  {usersData.count.toLocaleString()} members
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Search Section */}
        <section className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flix-card bg-white/5 p-6 mb-6">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by username..."
                  className="w-full pl-12 pr-32 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-flix-accent focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-1.5 rounded-md bg-flix-accent hover:bg-flix-accent-hover text-white text-sm font-semibold transition"
                >
                  Search
                </button>
              </div>
            </form>

            {searchQuery && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-white/70">
                  Searching for: <span className="font-semibold text-white">{searchQuery}</span>
                </span>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setPage(1)
                  }}
                  className="text-sm text-flix-accent hover:text-flix-accent-hover underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Users Grid */}
          {error ? (
            <div className="my-reviews-empty-state">
              <svg className="recommendations-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="my-reviews-empty-title">Failed to load users</p>
                <p className="my-reviews-empty-description">Please try again later.</p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="skeleton-card h-48" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="my-reviews-empty-state">
              <UsersIcon className="w-16 h-16 mx-auto mb-4 text-white/30" />
              <div>
                <h2 className="my-reviews-empty-title">No users found</h2>
                <p className="my-reviews-empty-description">
                  {searchQuery ? 'Try adjusting your search terms.' : 'No community members yet.'}
                </p>
              </div>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setPage(1)
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
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
                    className="flix-card bg-white/5 border border-white/10 hover:border-flix-accent/50 p-6 transition-all hover:scale-105 hover:shadow-lg hover:shadow-flix-accent/20 group"
                  >
                    {/* Profile Picture or Avatar */}
                    <div className="flex flex-col items-center text-center">
                      {user.profile_picture_url ? (
                        <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/20 group-hover:ring-flix-accent/50 transition mb-4">
                          <img
                            src={user.profile_picture_url}
                            alt={`${user.username}'s profile`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-flix-accent/30 to-purple-500/30 flex items-center justify-center ring-2 ring-white/20 group-hover:ring-flix-accent/50 transition mb-4">
                          <span className="text-2xl font-bold text-white">
                            {getUserInitials(user.username)}
                          </span>
                        </div>
                      )}

                      {/* Username */}
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-flix-accent transition">
                        {user.username}
                      </h3>

                      {/* Bio (if available) */}
                      {user.bio && (
                        <p className="text-xs text-white/50 mb-3 line-clamp-2">{user.bio}</p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-center gap-4 text-sm text-white/70 mt-2">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span>{user.reviews_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
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
                          className={`w-10 h-10 rounded-lg border transition ${
                            page === pageNum
                              ? 'border-flix-accent bg-flix-accent text-white font-semibold'
                              : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition"
                  >
                    Next
                  </button>
                </div>
              )}

              <div className="mt-4 text-center text-sm text-white/50">
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
