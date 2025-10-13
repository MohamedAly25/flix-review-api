import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Movies', to: '/movies' },
]

export const MainNav = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-primary font-bold text-black">
              FR
            </span>
            FlixReview
          </Link>
          <nav className="hidden md:flex md:items-center md:gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx('text-sm font-medium transition-colors', isActive ? 'text-white' : 'text-white/60 hover:text-white')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-white/70 sm:inline">
                {user?.username || user?.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                Log out
              </button>
              <Link
                to="/profile"
                className="hidden rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40 sm:inline"
              >
                Profile
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-white/70 transition hover:text-white"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-accent"
              >
                Join now
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-md p-2 text-white md:hidden"
            aria-label="Toggle navigation"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="md:hidden">
          <div className="space-y-2 border-t border-white/10 bg-surface/95 px-4 pb-6 pt-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  handleLogout()
                  setIsOpen(false)
                }}
                className="block w-full rounded-md bg-white/10 px-3 py-2 text-left text-sm font-medium text-white"
              >
                Log out
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground"
                >
                  Join now
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
