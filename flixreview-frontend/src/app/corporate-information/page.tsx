import { InfoPage } from '@/components/info/InfoPage'

const paragraphs = [
  'FlixReview is an independent studio of film critics, engineers, and data scientists headquartered in Cairo.',
  'We collaborate with global festivals and streamers to surface hidden gems alongside blockbuster hits.',
  'Interested in partnering with us? Reach out through the Contact page to start the conversation.',
]

export default function CorporateInformationPage() {
  return (
    <InfoPage
      title="Corporate Information"
      tagline="Get to know the team and vision behind FlixReview."
      paragraphs={paragraphs}
    />
  )
}
