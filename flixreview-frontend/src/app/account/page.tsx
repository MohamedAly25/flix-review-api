import { InfoPage } from '@/components/info/InfoPage'

const paragraphs = [
  'Update your avatar, biography, and favorite genres so other cinephiles can discover your taste.',
  'Manage notification preferences for premiere alerts, critic spotlights, and community replies.',
  'Want to take a break? Deactivate your profile temporarily without losing your reviews or watchlists.',
]

export default function AccountPage() {
  return (
    <InfoPage
      title="Account Settings"
      tagline="Control every aspect of your FlixReview profile in one place."
      paragraphs={paragraphs}
    />
  )
}
