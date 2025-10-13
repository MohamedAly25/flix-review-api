import { Outlet } from 'react-router-dom'
import { MainNav } from '../navigation/MainNav'

export const AppLayout = () => (
  <div className="min-h-full bg-surface text-white">
    <MainNav />
    <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <Outlet />
    </main>
  </div>
)
