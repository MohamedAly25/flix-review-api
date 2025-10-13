import { Link } from 'react-router-dom'

export const NotFoundPage = () => (
  <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
    <h1 className="text-6xl font-bold text-white">404</h1>
    <p className="mt-4 text-lg text-white/70">We could not find the page you were looking for.</p>
    <Link
      to="/"
      className="mt-6 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-accent"
    >
      Go back home
    </Link>
  </div>
)
