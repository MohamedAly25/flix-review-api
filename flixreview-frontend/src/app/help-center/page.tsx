import { InfoPage } from '@/components/info/InfoPage'

const paragraphs = [
  'Browse guided walkthroughs for signing in, connecting your watchlist, and importing ratings from other services.',
  'Our support crew covers everything from password resets to troubleshooting streaming integrations.',
  'Still stuck? Open a ticket directly from this page and a FlixReview specialist will reach out.',
]

export default function HelpCenterPage() {
  return (
    <InfoPage
      title="Help Center"
      tagline="Step-by-step support to keep your cinematic journey running smoothly."
      paragraphs={paragraphs}
    />
  )
}
