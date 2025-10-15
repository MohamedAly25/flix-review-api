'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { AxiosError } from 'axios'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import type { ApiError } from '@/types/api'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password_confirm: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/movies')
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) {
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        password_confirm: formData.password_confirm,
      })
    } catch (err) {
  const axiosError = err as AxiosError<ApiError>
  const data = axiosError.response?.data
  const errors = (data?.errors ?? {}) as Record<string, unknown>

      const extractMessage = (value: unknown): string | undefined => {
        if (!value) return undefined
        if (Array.isArray(value)) {
          return value[0]
        }
        if (typeof value === 'string') {
          return value
        }
        return undefined
      }

      const prioritizedKeys = [
        'email',
        'username',
        'password',
        'password_confirm',
        'non_field_errors',
        'rate_limit',
      ]

      let message = prioritizedKeys
        .map((key) => extractMessage(errors[key]))
        .find((msg) => msg)

      if (!message) {
        for (const value of Object.values(errors)) {
          message = extractMessage(value)
          if (message) break
        }
      }

      if (!message) {
        message = data?.message || data?.detail || 'Registration failed. Please try again.'
      }

      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flix-min-h-screen flix-flex flix-flex-col">
      <Header />
      <main className="flix-flex-1 flix-flex flix-items-center flix-justify-center flix-p-md">
        <div className="flix-fade-in" style={{ maxWidth: '448px', width: '100%' }}>
          <div className="flix-card flix-p-lg">
            <h2 className="flix-title flix-text-center flix-mb-lg">
              Create your account
            </h2>
            
            <form className="flix-flex flix-flex-col flix-gap-md" onSubmit={handleSubmit}>
              {error && (
                <div className="flix-alert flix-alert-error">
                  <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <Input
                  label="Email address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Input
                  label="Username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Input
                  label="Confirm Password"
                  name="password_confirm"
                  type="password"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="flix-w-full" isLoading={isLoading}>
                Sign up
              </Button>

              <p className="flix-small flix-text-center flix-text-muted">
                Already have an account?{' '}
                <Link href="/login" className="flix-accent flix-font-semibold">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
