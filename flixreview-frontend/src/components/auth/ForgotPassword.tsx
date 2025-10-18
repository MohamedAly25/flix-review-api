'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { passwordResetRequestSchema, type PasswordResetRequestInput } from '@/lib/validations/schemas'
import { Spinner } from '@/components/ui/Spinner'
import { AlertCircle, CheckCircle, ArrowLeft, Mail } from 'lucide-react'
import api from '@/lib/api/client'

/**
 * Password Reset Request Component
 * Allows users to request a password reset email
 */
export function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  
  const form = useForm<PasswordResetRequestInput>({
    resolver: zodResolver(passwordResetRequestSchema),
    mode: 'onBlur',
  })
  
  const handleSubmit = async (data: PasswordResetRequestInput) => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      setSuccessMessage(null)
      
      await api.post('/accounts/password-reset/', data)
      
      setEmailSent(true)
      setSuccessMessage(`Password reset instructions have been sent to ${data.email}`)
      form.reset()
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Failed to send reset email. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
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
            Reset Password
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {emailSent 
              ? 'Check your email for reset instructions' 
              : 'Enter your email to receive password reset instructions'}
          </p>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div 
            className="glass rounded-lg p-4 mb-6 flex items-start gap-3 animate-slide-up"
            style={{ 
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              borderColor: 'var(--color-success)',
              border: '1px solid'
            }}
            role="alert"
            aria-live="polite"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
            <div>
              <p className="font-semibold mb-1" style={{ color: 'var(--color-success)' }}>Email Sent!</p>
              <p className="text-sm" style={{ color: 'var(--color-success)', opacity: 0.9 }}>{successMessage}</p>
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {errorMessage && (
          <div 
            className="glass rounded-lg p-4 mb-6 flex items-start gap-3 animate-slide-up"
            style={{ 
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              borderColor: 'var(--color-error)',
              border: '1px solid'
            }}
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-error)' }} />
            <p style={{ color: 'var(--color-error)' }}>{errorMessage}</p>
          </div>
        )}
        
        {!emailSent && (
          <div className="glass-heavy rounded-xl p-8 shadow-2xl animate-scale-in">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" noValidate>
              {/* Email Field */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />
                  <input
                    {...form.register('email')}
                    type="email"
                    id="email"
                    autoComplete="email"
                    className="w-full pl-12 pr-4 py-3.5 rounded-lg border-2 transition-smooth focus-visible"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: form.formState.errors.email ? 'var(--color-error)' : 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    placeholder="you@example.com"
                    aria-invalid={!!form.formState.errors.email}
                    aria-describedby={form.formState.errors.email ? 'email-error' : undefined}
                  />
                </div>
                {form.formState.errors.email && (
                  <p 
                    id="email-error"
                    className="mt-2 text-sm flex items-center gap-1"
                    style={{ color: 'var(--color-error)' }}
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-lg font-semibold transition-smooth focus-visible disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-text-inverse)',
                }}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>
            </form>
            
            {/* Info Box */}
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(33, 150, 243, 0.05)', border: '1px solid rgba(33, 150, 243, 0.2)' }}>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <strong>Note:</strong> You will receive an email with instructions to reset your password. 
                The link will expire in 1 hour for security reasons.
              </p>
            </div>
          </div>
        )}
        
        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm transition-smooth hover:underline focus-visible"
            style={{ color: 'var(--color-accent)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
        
        {emailSent && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setEmailSent(false)
                setSuccessMessage(null)
                form.reset()
              }}
              className="text-sm transition-smooth hover:underline focus-visible"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Need to try a different email?
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
