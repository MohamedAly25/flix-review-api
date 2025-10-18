import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ForgotPassword } from '@/components/auth'

export const metadata = {
  title: 'Reset Password | FlixReview',
  description: 'Reset your FlixReview account password',
}

export default function ForgotPasswordPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
        <ForgotPassword />
      </main>
      <Footer />
    </>
  )
}
