import { InfoPage } from '@/components/info/InfoPage'

const paragraphs = [
  'FlixReview is built for respectful discussion—be mindful when publishing reviews, ratings, or community posts.',
  'Unauthorized scraping, automated voting, or abusive language can result in account suspension.',
  'By continuing to use the platform you agree to our community-first approach to film discovery.',
]

export default function TermsOfUsePage() {
  return (
    <InfoPage
      title="Terms of Use"
      tagline="The rules that shape a fair and inspiring home for movie lovers."
      paragraphs={paragraphs}
    />
  )
}
