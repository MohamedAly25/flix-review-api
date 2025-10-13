import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { authService } from '../../services/authService'

const schema = yup.object({
  username: yup.string().required('Username is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
})

export const RegisterPage = () => {
  const navigate = useNavigate()

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (values) => authService.register(values),
    onSuccess: (data) => {
      toast.success(data?.message || 'Account created! Please sign in.')
      navigate('/login', { replace: true })
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Unable to register. Please try again.'
      toast.error(message)
    },
  })

  const onSubmit = (values) => mutation.mutate(values)

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center">
      <div className="rounded-3xl border border-white/10 bg-black/40 p-10 shadow-card">
        <h1 className="text-3xl font-bold text-white">Create an account</h1>
        <p className="mt-2 text-sm text-white/60">Join the community and start sharing your reviews.</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Username</label>
            <input
              type="text"
              {...form.register('username')}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="yourusername"
              autoComplete="username"
            />
            {form.formState.errors.username ? (
              <p className="text-xs text-red-400">{form.formState.errors.username.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Email</label>
            <input
              type="email"
              {...form.register('email')}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@email.com"
              autoComplete="email"
            />
            {form.formState.errors.email ? (
              <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Password</label>
            <input
              type="password"
              {...form.register('password')}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {form.formState.errors.password ? (
              <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/60">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-accent">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
