import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { ProtectedRoute } from '../components/common/ProtectedRoute'
import { HomePage } from '../pages/HomePage'
import { MoviesPage } from '../pages/MoviesPage'
import { MovieDetailPage } from '../pages/MovieDetailPage'
import { ProfilePage } from '../pages/ProfilePage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const AppRouter = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<HomePage />} />
      <Route path="movies" element={<MoviesPage />} />
      <Route path="movies/:id" element={<MovieDetailPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Route>

    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
)
