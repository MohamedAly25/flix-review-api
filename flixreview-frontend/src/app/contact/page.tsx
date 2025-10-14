import Link from 'next/link'
import { InfoPage } from '@/components/info/InfoPage'

const paragraphs = [
  'Our support inbox is staffed seven days a week to help with billing, bug reports, and product feedback.',
  'For partnership or distribution opportunities, contact the studio relations team.',
  'Members of the press can reach communications directly through the Media Center.',
]

export default function ContactPage() {
  return (
    <InfoPage
      title="Contact FlixReview"
      tagline="We are here to help—choose the path that matches your request."
      paragraphs={paragraphs}
    >
      <div className="flix-flex flix-justify-center flix-gap-sm" style={{ marginTop: '24px' }}>
        <Link href="mailto:support@flixreview.com" className="flix-btn flix-btn-secondary flix-btn-sm">
          Email Support
        </Link>
        <Link href="mailto:press@flixreview.com" className="flix-btn flix-btn-primary flix-btn-sm">
          Media Enquiries
        </Link>
      </div>
    </InfoPage>
  )
}
