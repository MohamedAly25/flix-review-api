import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Spinner } from '@/components/ui/Spinner'
import { authService } from '@/services/auth'
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/validations/auth'

interface PasswordChangeCardProps {
  onSuccess?: () => void
}

export function PasswordChangeCard({ onSuccess }: PasswordChangeCardProps) {
  const { logout } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const mutation = useMutation({
    mutationFn: (data: ChangePasswordFormData) => authService.changePassword(data),
    onSuccess: () => {
      reset()
      setServerError(null)
      logout()
      onSuccess?.()
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { errors?: Record<string, string[] | string>; message?: string } } }
      const errorData = axiosError.response?.data
      if (errorData?.errors?.current_password) {
        setServerError('Current password is incorrect.')
      } else if (errorData?.message) {
        setServerError(errorData.message)
      } else {
        setServerError('Failed to change password. Please try again.')
      }
    },
  })

  const onSubmit = (data: ChangePasswordFormData) => {
    setServerError(null)
    mutation.mutate(data)
  }

  return (
    <div className="password-change-card-container bg-[var(--flix-bg-hover)] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-[var(--shadow-md)] flex flex-col overflow-hidden">
      {/* Card Header Section */}
      <div className="password-change-card-header flix-p-lg border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center flix-gap-sm">
          <div className="password-change-card-icon flex items-center justify-center w-10 h-10 rounded-xl" style={{ backgroundColor: 'rgba(229, 9, 20, 0.15)', color: '#ff6b6b' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="password-change-card-title text-lg font-semibold text-[var(--flix-text-primary)]">Change Password</h3>
        </div>
      </div>

      {/* Card Content Section */}
      <div className="password-change-card-content flix-p-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="password-form-group">
            <label className="password-form-label text-sm font-medium text-[var(--flix-text-secondary)] block mb-2">
              Current Password
            </label>
            <PasswordInput
              {...register('current_password')}
              placeholder="Enter your current password"
              error={errors.current_password?.message}
            />
          </div>

          <div className="password-form-group">
            <label className="password-form-label text-sm font-medium text-[var(--flix-text-secondary)] block mb-2">
              New Password
            </label>
            <PasswordInput
              {...register('new_password')}
              placeholder="Enter your new password"
              error={errors.new_password?.message}
            />
          </div>

          <div className="password-form-group">
            <label className="password-form-label text-sm font-medium text-[var(--flix-text-secondary)] block mb-2">
              Confirm New Password
            </label>
            <PasswordInput
              {...register('new_password_confirm')}
              placeholder="Confirm your new password"
              error={errors.new_password_confirm?.message}
            />
          </div>

          {serverError && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {serverError}
            </div>
          )}

          <div className="password-change-actions flex justify-end pt-2">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isSubmitting || mutation.isPending}
              className="min-w-[120px]"
            >
              {isSubmitting || mutation.isPending ? <Spinner size="sm" /> : 'Change Password'}
            </Button>
          </div>
        </form>

        <div className="password-change-notice mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-300">
            <strong>Note:</strong> After changing your password, you&apos;ll be logged out and need to log in again with your new password.
          </p>
        </div>
      </div>
    </div>
  )
}