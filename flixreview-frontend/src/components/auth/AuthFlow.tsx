'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '@/lib/validations/schemas'
import { Spinner } from '@/components/ui/Spinner'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

type AuthMode = 'login' | 'register'

/**
 * Unified Authentication Flow
 * Handles both login and registration with form validation
 */
export function AuthFlow() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, register: authRegister, isLoading } = useAuth()
  
  // Check for session expiration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionExpired = sessionStorage.getItem('session_expired')
      if (sessionExpired) {
        setErrorMessage('Your session has expired. Please log in again.')
        sessionStorage.removeItem('session_expired')
      }
    }
  }, [])
  
  // Login form
  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })
  
  // Register form
  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  })
  
  const handleLogin = async (data: LoginInput) => {
    try {
      setErrorMessage(null)
      await login(data.email, data.password)
      
      const nextUrl = searchParams.get('next') || '/profile'
      router.push(nextUrl)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Login failed. Please check your credentials.')
      }
    }
  }
  
  const handleRegister = async (data: RegisterInput) => {
    try {
      setErrorMessage(null)
      await authRegister(data)
      
      setSuccessMessage('Account created successfully! Redirecting...')
      setTimeout(() => {
        const nextUrl = searchParams.get('next') || '/profile'
        router.push(nextUrl)
      }, 1500)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Registration failed. Please try again.')
      }
    }
  }
  
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setErrorMessage(null)
    setSuccessMessage(null)
    loginForm.reset()
    registerForm.reset()
  }
  
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 
            className="text-4xl font-bold mb-3 text-gradient"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {mode === 'login' ? 'Welcome Back' : 'Join FlixReview'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {mode === 'login' 
              ? 'Sign in to continue your cinematic journey' 
              : 'Create an account to start reviewing movies'}
          </p>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div 
            className="glass rounded-lg p-4 mb-6 flex items-start gap-3 animate-slide-up"
            style={{ 
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              borderColor: 'var(--color-success)'
            }}
            role="alert"
            aria-live="polite"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
            <p style={{ color: 'var(--color-success)' }}>{successMessage}</p>
          </div>
        )}
        
        {/* Error Message */}
        {errorMessage && (
          <div 
            className="glass rounded-lg p-4 mb-6 flex items-start gap-3 animate-slide-up"
            style={{ 
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              borderColor: 'var(--color-error)'
            }}
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-error)' }} />
            <p style={{ color: 'var(--color-error)' }}>{errorMessage}</p>
          </div>
        )}
        
        {/* Form Card */}
        <div className="glass-heavy rounded-xl p-8 shadow-2xl animate-scale-in">
          {mode === 'login' ? (
            <form 
              onSubmit={loginForm.handleSubmit(handleLogin)}
              className="space-y-6"
              noValidate
            >
              {/* Email Field */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Email Address *
                </label>
                <input
                  {...loginForm.register('email')}
                  type="email"
                  id="email"
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-lg border transition-smooth focus-visible"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: loginForm.formState.errors.email ? 'var(--color-error)' : 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                  placeholder="you@example.com"
                  aria-invalid={!!loginForm.formState.errors.email}
                  aria-describedby={loginForm.formState.errors.email ? 'email-error' : undefined}
                />
                {loginForm.formState.errors.email && (
                  <p 
                    id="email-error"
                    className="mt-2 text-sm"
                    style={{ color: 'var(--color-error)' }}
                    role="alert"
                  >
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              
              {/* Password Field */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Password *
                </label>
                <div className="relative">
                  <input
                    {...loginForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pr-12 rounded-lg border transition-smooth focus-visible"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: loginForm.formState.errors.password ? 'var(--color-error)' : 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    placeholder="••••••••"
                    aria-invalid={!!loginForm.formState.errors.password}
                    aria-describedby={loginForm.formState.errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-smooth hover:opacity-70"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                    ) : (
                      <Eye className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                    )}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p 
                    id="password-error"
                    className="mt-2 text-sm"
                    style={{ color: 'var(--color-error)' }}
                    role="alert"
                  >
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm transition-smooth hover:underline focus-visible inline-flex items-center gap-1"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !!successMessage}
                className="w-full py-3 px-6 rounded-lg font-semibold transition-smooth focus-visible disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-text-inverse)',
                }}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          ) : (
            <form 
              onSubmit={registerForm.handleSubmit(handleRegister)}
              className="space-y-6"
              noValidate
            >
              {/* Email Field */}
              <div>
                <label 
                  htmlFor="email-register" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Email Address *
                </label>
                <input
                  {...registerForm.register('email')}
                  type="email"
                  id="email-register"
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-lg border transition-smooth focus-visible"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: registerForm.formState.errors.email ? 'var(--color-error)' : 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                  placeholder="you@example.com"
                  aria-invalid={!!registerForm.formState.errors.email}
                  aria-describedby={registerForm.formState.errors.email ? 'email-register-error' : undefined}
                />
                {registerForm.formState.errors.email && (
                  <p 
                    id="email-register-error"
                    className="mt-2 text-sm"
                    style={{ color: 'var(--color-error)' }}
                    role="alert"
                  >
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              
              {/* Username Field */}
              <div>
                <label 
                  htmlFor="username" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Username *
                </label>
                <input
                  {...registerForm.register('username')}
                  type="text"
                  id="username"
                  autoComplete="username"
                  className="w-full px-4 py-3 rounded-lg border transition-smooth focus-visible"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: registerForm.formState.errors.username ? 'var(--color-error)' : 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                  placeholder="johndoe"
                  aria-invalid={!!registerForm.formState.errors.username}
                  aria-describedby={registerForm.formState.errors.username ? 'username-error' : undefined}
                />
                {registerForm.formState.errors.username && (
                  <p 
                    id="username-error"
                    className="mt-2 text-sm"
                    style={{ color: 'var(--color-error)' }}
                    role="alert"
                  >
                    {registerForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              
              {/* Password Field */}
              <div>
                <label 
                  htmlFor="password-register" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Password *
                </label>
                <div className="relative">
                  <input
                    {...registerForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password-register"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 rounded-lg border transition-smooth focus-visible"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: registerForm.formState.errors.password ? 'var(--color-error)' : 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    placeholder="••••••••"
                    aria-invalid={!!registerForm.formState.errors.password}
                    aria-describedby={registerForm.formState.errors.password ? 'password-register-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-smooth hover:opacity-70"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                    ) : (
                      <Eye className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                    )}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p 
                    id="password-register-error"
                    className="mt-2 text-sm"
                    style={{ color: 'var(--color-error)' }}
                    role="alert"
                  >
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              
              {/* Password Confirm Field */}
              <div>
                <label 
                  htmlFor="password_confirm" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    {...registerForm.register('password_confirm')}
                    type={showPasswordConfirm ? 'text' : 'password'}
                    id="password_confirm"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 rounded-lg border transition-smooth focus-visible"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: registerForm.formState.errors.password_confirm ? 'var(--color-error)' : 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    placeholder="••••••••"
                    aria-invalid={!!registerForm.formState.errors.password_confirm}
                    aria-describedby={registerForm.formState.errors.password_confirm ? 'password-confirm-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-smooth hover:opacity-70"
                    aria-label={showPasswordConfirm ? 'Hide password confirmation' : 'Show password confirmation'}
                  >
                    {showPasswordConfirm ? (
                      <EyeOff className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                    ) : (
                      <Eye className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                    )}
                  </button>
                </div>
                {registerForm.formState.errors.password_confirm && (
                  <p 
                    id="password-confirm-error"
                    className="mt-2 text-sm"
                    style={{ color: 'var(--color-error)' }}
                    role="alert"
                  >
                    {registerForm.formState.errors.password_confirm.message}
                  </p>
                )}
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !!successMessage}
                className="w-full py-3 px-6 rounded-lg font-semibold transition-smooth focus-visible disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-text-inverse)',
                }}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          )}
          
          {/* Mode Toggle */}
          <div className="mt-6 text-center">
            <p style={{ color: 'var(--color-text-secondary)' }}>
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-semibold transition-smooth hover:underline focus-visible"
                style={{ color: 'var(--color-accent)' }}
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
          
          {/* Back to Home */}
          {mode === 'login' && (
            <div className="mt-4 text-center">
              <Link
                href="/"
                className="text-sm transition-smooth hover:underline focus-visible inline-flex items-center gap-1"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                ← Back to Home
              </Link>
            </div>
          )}
        </div>
        
        {/* Additional Info */}
        <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          By continuing, you agree to FlixReview's{' '}
          <Link href="/terms-of-use" className="underline hover:opacity-70">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:opacity-70">
            Privacy Policy
          </Link>
        </p>
      </div>
    </section>
  )
}
