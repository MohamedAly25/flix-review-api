import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Spinner } from '@/components/ui/Spinner'
import { authService } from '@/services/auth'

interface PasswordChangeCardProps {
  onSuccess?: () => void
}

export function PasswordChangeCard({ onSuccess }: PasswordChangeCardProps) {
  const { logout } = useAuth()
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirm: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => authService.changePassword(data),
    onSuccess: () => {
      // Clear form and logout user (force re-login with new password)
      setFormData({
        current_password: '',
        new_password: '',
        new_password_confirm: '',
      })
      setErrors({})
      logout()
      onSuccess?.()
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { errors?: Record<string, string[] | string>; message?: string } } }
      if (axiosError.response?.data?.errors) {
        const errorObj: Record<string, string> = {}
        Object.entries(axiosError.response.data.errors).forEach(([key, value]) => {
          errorObj[key] = Array.isArray(value) ? value[0] : value
        })
        setErrors(errorObj)
      } else if (axiosError.response?.data?.message) {
        setErrors({ general: axiosError.response.data.message })
      } else {
        setErrors({ general: 'Failed to change password. Please try again.' })
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (formData.new_password !== formData.new_password_confirm) {
      setErrors({ new_password_confirm: 'New passwords do not match.' })
      return
    }

    mutation.mutate(formData)
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="password-form-group">
            <label className="password-form-label text-sm font-medium text-[var(--flix-text-secondary)] block mb-2">
              Current Password
            </label>
            <PasswordInput
              value={formData.current_password}
              onChange={handleInputChange('current_password')}
              placeholder="Enter your current password"
              error={errors.current_password}
              required
            />
          </div>

          <div className="password-form-group">
            <label className="password-form-label text-sm font-medium text-[var(--flix-text-secondary)] block mb-2">
              New Password
            </label>
            <PasswordInput
              value={formData.new_password}
              onChange={handleInputChange('new_password')}
              placeholder="Enter your new password"
              error={errors.new_password}
              required
            />
          </div>

          <div className="password-form-group">
            <label className="password-form-label text-sm font-medium text-[var(--flix-text-secondary)] block mb-2">
              Confirm New Password
            </label>
            <PasswordInput
              value={formData.new_password_confirm}
              onChange={handleInputChange('new_password_confirm')}
              placeholder="Confirm your new password"
              error={errors.new_password_confirm}
              required
            />
          </div>

          {errors.general && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {errors.general}
            </div>
          )}

          <div className="password-change-actions flex justify-end pt-2">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={mutation.isPending}
              className="min-w-[120px]"
            >
              {mutation.isPending ? <Spinner size="sm" /> : 'Change Password'}
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