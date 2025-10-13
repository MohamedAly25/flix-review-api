import { useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { authService } from '../services/authService'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'

export const ProfilePage = () => {
  const { setUser, logout } = useAuth()

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile(),
    staleTime: 1000 * 60 * 5,
  })

  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
    },
  })

  useEffect(() => {
    if (profileQuery.data) {
      const profile = profileQuery.data
      form.reset({
        username: profile.username || '',
        email: profile.email || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
      })
      setUser(profile)
    }
  }, [profileQuery.data, form, setUser])

  const updateMutation = useMutation({
    mutationFn: (values) => authService.updateProfile(values),
    onSuccess: (data) => {
      toast.success(data?.message || 'Profile updated successfully.')
      profileQuery.refetch()
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Unable to update profile.'
      toast.error(message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => authService.deleteAccount(),
    onSuccess: () => {
      toast.success('Account deleted. We hope to see you again!')
      logout()
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Unable to delete account.'
      toast.error(message)
    },
  })

  const onSubmit = (values) => updateMutation.mutate(values)

  if (profileQuery.isLoading) {
    return <LoadingSpinner label="Loading your profile..." />
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-white">Your profile</h1>
        <p className="mt-2 text-sm text-white/60">Manage account details and personalized settings.</p>
      </header>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 rounded-3xl border border-white/10 bg-black/40 p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-white">Username</label>
            <input
              type="text"
              {...form.register('username')}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white">Email</label>
            <input
              type="email"
              {...form.register('email')}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white">First name</label>
            <input
              type="text"
              {...form.register('first_name')}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white">Last name</label>
            <input
              type="text"
              {...form.register('last_name')}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save changes'}
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete your account?')) {
                deleteMutation.mutate()
              }
            }}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center justify-center rounded-full border border-red-500/40 px-5 py-2 text-sm font-semibold text-red-300 transition hover:border-red-500/60 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete account'}
          </button>
        </div>
      </form>
    </div>
  )
}
