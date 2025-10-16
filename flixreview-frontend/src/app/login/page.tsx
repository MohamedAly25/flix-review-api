'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/movies')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } }
      setError(error.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flix-min-h-screen flix-flex flix-flex-col flix-bg-primary">
      <Header />
      <main className="flix-flex-1 flix-flex flix-items-center flix-justify-center flix-p-md flix-bg-primary">
        <div className="flix-fade-in auth-container">
          <div className="flix-card flix-p-xl auth-card">
            <div className="auth-header">
              <h2 className="flix-title flix-text-center flix-mb-lg auth-title">
                Sign in to FlixReview
              </h2>
              <p className="flix-body flix-text-center flix-text-secondary auth-subtitle">
                Welcome back! Sign in to continue exploring movies
              </p>
            </div>
            
            <form className="flix-flex flix-flex-col flix-gap-lg auth-form" onSubmit={handleSubmit}>
              {error && (
                <div className="flix-alert flix-alert-error auth-alert" role="alert" aria-live="assertive">
                  <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="auth-error-text">{error}</span>
                </div>
              )}

              <div className="auth-form-group relative">
                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="auth-input"
                />
              </div>

              <div className="auth-form-group">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="auth-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 bottom-3 flex items-center text-white/50 transition-colors hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.859-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.066 7.5a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a2.625 2.625 0 10-3.712-3.712" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .637C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <circle cx="12" cy="12" r="2.25" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="auth-button-container">
                <Button
                  type="submit"
                  className="flix-w-full auth-button"
                  isLoading={isLoading}
                  disabled={isLoading || !email || !password}
                >
                  Sign in
                </Button>
              </div>

              <div className="auth-footer">
                <p className="flix-small flix-text-center flix-text-muted auth-footer-text">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="flix-accent flix-font-semibold auth-link">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
