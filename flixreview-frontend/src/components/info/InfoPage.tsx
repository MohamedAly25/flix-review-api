import { ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface InfoPageProps {
  title: string
  tagline: string
  paragraphs: string[]
  children?: ReactNode
}

export function InfoPage({ title, tagline, paragraphs, children }: InfoPageProps) {
  return (
    <div className="flix-min-h-screen flix-flex flix-flex-col flix-bg-primary">
      <Header />
      <main className="flix-flex-1 flix-flex flix-items-center flix-justify-center">
        <section className="flix-container" style={{ maxWidth: '720px' }}>
          <div className="flix-flex flix-flex-col flix-gap-md flix-text-center">
            <h1 className="flix-title">{title}</h1>
            <p className="flix-body flix-text-muted" style={{ fontSize: '18px' }}>
              {tagline}
            </p>
            <div className="flix-flex flix-flex-col flix-gap-sm" style={{ marginTop: '16px' }}>
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="flix-body flix-text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
            {children}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
