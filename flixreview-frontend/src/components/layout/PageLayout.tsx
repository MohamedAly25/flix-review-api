import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { cn } from '@/utils/cn'

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  mainClassName?: string
  withBackgroundGlow?: boolean
  hideFooter?: boolean
}

/**
 * Shared page layout wrapper that provides the global header/footer and consistent spacing
 */
export function PageLayout({
  children,
  className,
  mainClassName,
  withBackgroundGlow = true,
  hideFooter = false,
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        'flix-page-shell min-h-screen flex flex-col bg-[var(--color-background)]',
        withBackgroundGlow && 'flix-body-theme',
        className
      )}
    >
      <Header />
      <main className={cn('flex-grow pt-24 sm:pt-28', mainClassName)}>{children}</main>
      {!hideFooter && <Footer />}
    </div>
  )
}
