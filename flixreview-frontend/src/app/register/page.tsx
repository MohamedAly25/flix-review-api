'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import type { ApiError } from '@/types/api'

type PasswordStrength = 'empty' | 'weak' | 'medium' | 'strong'

const strengthCopy: Record<PasswordStrength, { label: string; tone: string }> = {
  empty: { label: 'Enter a password with 8+ characters', tone: 'text-white/50' },
  weak: { label: 'Add more characters and symbols for a stronger password', tone: 'text-red-300' },
  medium: { label: 'Looking good! Add a symbol to make it stronger', tone: 'text-amber-300' },
  strong: { label: 'Strong password ready to go', tone: 'text-emerald-300' },
}

function getPasswordStrength(value: string): PasswordStrength {
  if (!value) return 'empty'

  let score = 0
  if (value.length >= 12) score += 2
  else if (value.length >= 8) score += 1
  if (/[A-Z]/.test(value)) score += 1
  if (/[0-9]/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1

  if (score >= 4) return 'strong'
  if (score >= 2) return 'medium'
  return 'weak'
}

export default function RegisterPage() {
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register: authRegister, isAuthenticated } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      password_confirm: '',
      first_name: '',
      last_name: '',
      bio: '',
    },
  })

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/movies')
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) {
    return null
  }

  const passwordValue = watch('password', '')
  const confirmPasswordValue = watch('password_confirm', '')
  const passwordStrength = getPasswordStrength(passwordValue)
  const passwordsMatch = !confirmPasswordValue || passwordValue === confirmPasswordValue
  const strengthState = strengthCopy[passwordStrength]

  const onSubmit = async (data: RegisterFormData) => {
    setServerError('')

    try {
      await authRegister({
        email: data.email.trim().toLowerCase(),
        username: data.username.trim(),
        password: data.password,
        password_confirm: data.password_confirm,
        first_name: data.first_name?.trim() || undefined,
        last_name: data.last_name?.trim() || undefined,
        bio: data.bio || undefined,
      })
      reset()
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>
      const responseData = axiosError.response?.data
      const errors = (responseData?.errors ?? {}) as Record<string, unknown>

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
        message = responseData?.message || responseData?.detail || 'Registration failed. Please try again.'
      }

      setServerError(message)
    }
  }

  return (
    <div className="auth-page-shell">
      <Header />
      <main className="auth-main-content">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h2 className="auth-title">Create your account</h2>
              <p className="auth-subtitle">
                Join FlixReview and start discovering amazing movies
              </p>
            </div>
            
            <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
              {serverError && (
                <div className="auth-alert" role="alert" aria-live="assertive">
                  <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="auth-error-text">{serverError}</span>
                </div>
              )}

              <div className="auth-form-group">
                <Input
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div className="auth-form-group">
                <Input
                  label="Username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  error={errors.username?.message}
                  {...register('username')}
                />
              </div>

              <div className="auth-form-group">
                <div className="auth-input-wrapper">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    aria-describedby="password-strength-message"
                    className="pr-12"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="auth-password-toggle"
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
                <p
                  id="password-strength-message"
                  data-strength={passwordStrength}
                  className={`auth-password-strength ${strengthState.tone}`}
                >
                  {strengthState.label}
                </p>
              </div>

              <div className="auth-form-group">
                <div className="auth-input-wrapper">
                  <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="pr-12"
                    error={errors.password_confirm?.message || (!passwordsMatch ? 'Passwords must match' : undefined)}
                    {...register('password_confirm')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="auth-password-toggle"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.859-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.066 7.5a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a2.625 2.625 0 10-3.712-3.712" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573-3.007 9.963-7.178.07.207.07.43 0 .637C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <circle cx="12" cy="12" r="2.25" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="auth-button-container">
                <Button
                  type="submit"
                  className="auth-button"
                  isLoading={isSubmitting}
                  disabled={isSubmitting || !passwordsMatch}
                >
                  Sign up
                </Button>
              </div>

              <div className="auth-footer">
                <p className="auth-footer-text">
                  Already have an account?{' '}
                  <Link href="/login" className="auth-link">
                    Sign in
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
