import { InfoPage } from '@/components/info/InfoPage'

const paragraphs = [
  'Essential cookies keep you signed in and safeguard your account—it is not possible to disable them.',
  'Analytics cookies help us learn which trailers and reviews resonate so we can recommend better films.',
  'Personalization cookies control which themes and genres appear on your homepage. Toggle them anytime.',
]

export default function CookiePreferencesPage() {
  return (
    <InfoPage
      title="Cookie Preferences"
      tagline="Fine-tune how FlixReview uses cookies to personalise your feed."
      paragraphs={paragraphs}
    />
  )
}
