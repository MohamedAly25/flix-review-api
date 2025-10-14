'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <header className="flix-header">
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
            {isAuthenticated ? (
              <>
                <div className="flix-flex flix-items-center flix-gap-sm">
                  {user?.profile_picture_url ? (
                    <img
                      src={user.profile_picture_url}
                      alt="Profile picture"
                      className="flix-rounded-full flix-transition-fast flix-hover-lift"
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        objectFit: 'cover',
                        border: '2px solid var(--flix-border)'
                      }}
                    />
                  ) : (
                    <div 
                      className="flix-rounded-full flix-bg-secondary flix-flex flix-items-center flix-justify-center"
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
  )
}
