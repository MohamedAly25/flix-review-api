import { InfoPage } from '@/components/info/InfoPage'

const paragraphs = [
  'Download official logos, color palettes, and screenshots tailored for editorial coverage.',
  'Review our content usage guidelines to keep FlixReview branding consistent across every mention.',
  'For interview requests or media partnerships, connect with the communications team through our press inbox.',
]

export default function MediaCenterPage() {
  return (
    <InfoPage
      title="Media Center"
      tagline="Press resources and storytelling assets for covering FlixReview."
      paragraphs={paragraphs}
    />
  )
}
