import { InfoPage } from '@/components/info/InfoPage'

const paragraphs = [
  'We only store the data required to personalize recommendations and keep your account secure.',
  'Your reviews and ratings are visible to the community, but your streaming activity is never sold or shared.',
  'Adjust your privacy preferences anytime inside Account Settings to tailor what others can see.',
]

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy Notice"
      tagline="Transparency on how FlixReview collects, stores, and protects your data."
      paragraphs={paragraphs}
    />
  )
}
