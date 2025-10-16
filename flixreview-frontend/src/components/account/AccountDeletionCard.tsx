import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Spinner } from '@/components/ui/Spinner'
import { authService } from '@/services/auth'
import { deleteAccountSchema, type DeleteAccountFormData } from '@/lib/validations/auth'

interface AccountDeletionCardProps {
  onSuccess?: () => void
}

export function AccountDeletionCard({ onSuccess }: AccountDeletionCardProps) {
  const { logout } = useAuth()
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
  })

  const confirmText = watch('confirmText', '')

  const mutation = useMutation({
    mutationFn: (data: DeleteAccountFormData) => authService.deleteAccount(data.password),
    onSuccess: () => {
      logout()
      onSuccess?.()
      router.push('/')
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { errors?: Record<string, string[] | string>; message?: string } } }
      const errorData = axiosError.response?.data
      if (errorData?.errors?.password) {
        setServerError('Password is incorrect.')
      } else if (errorData?.message) {
        setServerError(errorData.message)
      } else {
        setServerError('Failed to delete account. Please try again.')
      }
    },
  })

  const onSubmit = (data: DeleteAccountFormData) => {
    setServerError(null)
    mutation.mutate(data)
  }

  if (!showConfirm) {
    return (
      <div className="account-deletion-card-container bg-[var(--flix-bg-hover)] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-[var(--shadow-md)] flex flex-col overflow-hidden">
        {/* Card Header Section */}
        <div className="account-deletion-card-header flix-p-lg border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center flix-gap-sm">
            <div className="account-deletion-card-icon flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/20">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="account-deletion-card-title text-lg font-semibold text-[var(--flix-text-primary)]">Delete Account</h3>
          </div>
        </div>

        {/* Card Content Section */}
        <div className="account-deletion-card-content flix-p-lg">
          <div className="account-deletion-warning mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-red-300 mb-1">Danger Zone</h4>
                <p className="text-sm text-red-200">
                  Deleting your account is permanent and cannot be undone. All your reviews, preferences, and profile data will be permanently removed.
                </p>
              </div>
            </div>
          </div>

          <div className="account-deletion-actions flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(true)}
              className="text-red-400 border-red-400/40 hover:bg-red-500/10 hover:border-red-400"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="account-deletion-card-container bg-[var(--flix-bg-hover)] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-[var(--shadow-md)] flex flex-col overflow-hidden">
      {/* Card Header Section */}
      <div className="account-deletion-card-header flix-p-lg border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center flix-gap-sm">
          <div className="account-deletion-card-icon flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/20">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="account-deletion-card-title text-lg font-semibold text-[var(--flix-text-primary)]">Confirm Account Deletion</h3>
        </div>
      </div>

      {/* Card Content Section */}
      <div className="account-deletion-card-content flix-p-lg">
        <div className="account-deletion-confirm-warning mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-red-300 mb-2">This action cannot be undone</h4>
              <p className="text-sm text-red-200 mb-2">
                Once you delete your account, all your data including reviews, preferences, and profile information will be permanently removed from our servers.
              </p>
              <p className="text-sm text-red-200">
                To confirm deletion, please enter your password and type &quot;delete my account&quot; below.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="password-form-group">
            <label className="password-form-label text-sm font-medium text-[var(--flix-text-secondary)] block mb-2">
              Confirm Password
            </label>
            <PasswordInput
              {...register('password')}
              placeholder="Enter your password to confirm"
              error={errors.password?.message}
            />
          </div>

          <div className="confirm-text-form-group">
            <label className="confirm-text-form-label text-sm font-medium text-[var(--flix-text-secondary)] block mb-2">
              Type &quot;delete my account&quot; to confirm
            </label>
            <input
              {...register('confirmText')}
              type="text"
              placeholder='Type &quot;delete my account&quot;'
              className="confirm-text-input w-full px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
            />
            {errors.confirmText && (
              <p className="text-sm text-red-400 mt-1">{errors.confirmText.message}</p>
            )}
          </div>

          {serverError && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {serverError}
            </div>
          )}

          <div className="account-deletion-actions flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(false)}
              disabled={isSubmitting || mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isSubmitting || mutation.isPending || confirmText.toLowerCase() !== 'delete my account'}
              className="min-w-[120px] text-red-400 border-red-400/40 hover:bg-red-500/10 hover:border-red-400"
            >
              {isSubmitting || mutation.isPending ? <Spinner size="sm" /> : 'Delete Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}