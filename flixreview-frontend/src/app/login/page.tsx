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
                <div className="flix-alert flix-alert-error auth-alert">
                  <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="auth-error-text">{error}</span>
                </div>
              )}

              <div className="auth-form-group">
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="auth-input"
                />
              </div>

              <div className="auth-button-container">
                <Button type="submit" className="flix-w-full auth-button" isLoading={isLoading}>
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
