import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { authService } from '../../services/authService'
import { useAuth } from '../../hooks/useAuth'

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setTokens } = useAuth()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (values) => authService.login(values),
    onSuccess: (data) => {
      const tokenPayload = {
        accessToken: data?.access || data?.access_token || data?.tokens?.access,
        refreshToken: data?.refresh || data?.refresh_token || data?.tokens?.refresh,
      }

      if (!tokenPayload.accessToken) {
        toast.error('Login succeeded but tokens were not returned. Contact support.')
        return
      }

      setTokens(tokenPayload)
      toast.success('Welcome back!')
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Invalid credentials. Please try again.'
      toast.error(message)
    },
  })

  const onSubmit = (values) => mutation.mutate(values)

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center">
      <div className="rounded-3xl border border-white/10 bg-black/40 p-10 shadow-card">
        <h1 className="text-3xl font-bold text-white">Log in</h1>
        <p className="mt-2 text-sm text-white/60">Access your personalised movie recommendations.</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Email</label>
            <input
              type="email"
              {...form.register('email')}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@email.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Password</label>
            <input
              type="password"
              {...form.register('password')}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/60">
          New to FlixReview?{' '}
          <Link to="/register" className="font-semibold text-primary hover:text-accent">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
