import { InfoPage } from '@/components/info/InfoPage'

const paragraphs = [
  'FlixReview lets you track what you have watched, rate every title, and grow a taste profile that evolves with you.',
  'You can browse curated lists, follow friends, and save films to themed collections that stay in sync across devices.',
  'Need help getting started? Visit the Help Center for setup tutorials and tips on writing standout reviews.',
]

export default function FAQPage() {
  return (
    <InfoPage
      title="Frequently Asked Questions"
      tagline="Your essential guide to getting the most out of FlixReview."
      paragraphs={paragraphs}
    />
  )
}
