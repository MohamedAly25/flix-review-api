'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { SearchOverlay } from '@/components/search/SearchOverlay'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Add global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <header className="flix-header fixed top-0 left-0 right-0 z-40">
        <nav className="flix-container">
          <div className="flix-flex flix-justify-between flix-items-center" style={{ height: '64px' }}>
            <div className="flix-flex flix-items-center flix-gap-lg">
              <Link href="/" className="flix-flex flix-items-center">
                <span className="flix-title flix-accent" style={{ fontSize: '24px', marginBottom: 0 }}>
                  FlixReview
                </span>
              </Link>
              <div className="flix-hidden sm:flex flix-gap-sm">
                <Link
                  href="/movies"
                  className="flix-body flix-btn-secondary flix-btn-sm flix-transition-fast"
                >
                  Movies
                </Link>
                <Link
                  href="/genres"
                  className="flix-body flix-btn-secondary flix-btn-sm flix-transition-fast"
                >
                  Genres
                </Link>
                <Link
                  href="/recommendations"
                  className="flix-body flix-btn-secondary flix-btn-sm flix-transition-fast"
                >
                  Discover
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      href="/my-reviews"
                      className="flix-body flix-btn-secondary flix-btn-sm flix-transition-fast"
                    >
                      My Reviews
                    </Link>
                    <Link
                      href="/profile"
                      className="flix-body flix-btn-secondary flix-btn-sm flix-transition-fast"
                    >
                      Profile
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="flix-flex flix-items-center flix-gap-sm">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flix-btn flix-btn-secondary flix-btn-sm flix-flex flix-items-center flix-gap-xs"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="flix-hidden md:inline">Search</span>
                <kbd className="flix-hidden lg:inline-flex flix-items-center flix-gap-1 px-2 py-1 text-xs flix-bg-primary flix-rounded-sm border border-gray-600">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>

              {isAuthenticated ? (
                <>
                  <div className="flix-flex flix-items-center flix-gap-sm">
                    <Link href="/account" className="flix-flex flix-items-center">
                      {user?.profile_picture_url ? (
                        <Image
                          src={user.profile_picture_url}
                          alt="Profile picture"
                          width={32}
                          height={32}
                          className="flix-rounded-full flix-transition-fast flix-hover-lift flix-cursor-pointer"
                          style={{ 
                            objectFit: 'cover',
                            border: '2px solid var(--flix-border)'
                          }}
                        />
                      ) : (
                        <div 
                          className="flix-rounded-full flix-bg-secondary flix-flex flix-items-center flix-justify-center flix-cursor-pointer"
                          style={{ 
                            width: '32px', 
                            height: '32px',
                            border: '2px solid var(--flix-border)'
                          }}
                        >
                          <svg className="flix-text-muted" style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </Link>
                    <span className="flix-body flix-hidden md:inline-block">
                      <span className="flix-text-muted">Welcome, </span>
                      <span className="flix-font-semibold">{user?.username}</span>
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flix-btn flix-btn-secondary flix-btn-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <button className="flix-btn flix-btn-secondary flix-btn-sm">
                      Login
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="flix-btn flix-btn-primary flix-btn-sm">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
