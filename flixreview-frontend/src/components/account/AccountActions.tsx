import { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

interface ActionCard {
  id: string
  title: string
  description: string
  category: string
  buttonLabel: string
  accent: {
    background: string
    color: string
  }
  icon: ReactNode
}

const ACTION_CARDS: ActionCard[] = [
  {
    id: 'password',
    title: 'Change Password',
    description: 'Update your account password for stronger protection and peace of mind.',
    category: 'Security',
    buttonLabel: 'Change Password',
    accent: {
      background: 'rgba(229, 9, 20, 0.18)',
      color: '#ff7a7a'
    },
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Fine-tune email alerts and stay in sync with the content that matters.',
    category: 'Preferences',
    buttonLabel: 'Manage Alerts',
    accent: {
      background: 'rgba(16, 185, 129, 0.18)',
      color: '#34d399'
    },
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21c4.411 0 8-4.03 8-9s-3.589-9-8-9-8 4.03-8 9a9.06 9.06 0 001.832 5.683L4 21l4.868-8.317z" />
      </svg>
    )
  },
  {
    id: 'privacy',
    title: 'Privacy Settings',
    description: 'Control data sharing, visibility, and connected applications with precision.',
    category: 'Privacy',
    buttonLabel: 'Review Privacy',
    accent: {
      background: 'rgba(139, 92, 246, 0.18)',
      color: '#c4b5fd'
    },
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    id: 'activity',
    title: 'Your Activity',
    description: 'Track review history, ratings, and watch-time trends across all devices.',
    category: 'Insights',
    buttonLabel: 'View Dashboard',
    accent: {
      background: 'rgba(251, 191, 36, 0.18)',
      color: '#fbbf24'
    },
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    id: 'support',
    title: 'Help & Support',
    description: 'Reach our specialists for billing, integrations, or accessibility assistance.',
    category: 'Support',
    buttonLabel: 'Contact Support',
    accent: {
      background: 'rgba(14, 165, 233, 0.18)',
      color: '#38bdf8'
    },
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 'delete',
    title: 'Delete Account',
    description: 'Request a full removal of your data and close your FlixReview membership.',
    category: 'Danger Zone',
    buttonLabel: 'Delete Account',
    accent: {
      background: 'rgba(229, 9, 20, 0.2)',
      color: '#ff6b6b'
    },
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    )
  }
]

export function AccountActions() {
  return (
    <div className="account-actions-container bg-[var(--flix-bg-hover)] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-[var(--shadow-md)] flex flex-col overflow-hidden">
      {/* Card Header Section */}
      <div className="account-actions-header flix-p-lg border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-center flix-gap-sm">
          <div className="account-actions-icon flex items-center justify-center w-8 h-8 rounded-xl" style={{ backgroundColor: 'rgba(229, 9, 20, 0.15)', color: '#ff6b6b' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="account-actions-title text-lg font-semibold text-[var(--flix-text-primary)]">Account Management</h3>
        </div>
      </div>

      {/* Card Content Section */}
      <div className="account-actions-content flex-1 flix-p-lg">
        <div className="account-actions-description flix-mb-lg">
          <p className="text-[var(--flix-text-secondary)] max-w-2xl text-center">
            Configure every detail of your FlixReview experience—from <span className="account-actions-highlight">security and privacy</span> to <span className="account-actions-emphasis">personalized recommendations</span>.
          </p>
        </div>

        <div className="account-actions-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 flix-gap-lg">
          {ACTION_CARDS.map((card) => (
            <div
              key={card.id}
              className="account-action-card bg-[var(--flix-bg-secondary)] border border-[rgba(255,255,255,0.08)] rounded-2xl flix-p-md flex flex-col flix-gap-md shadow-[var(--shadow-sm)] transition-transform duration-300 hover:-translate-y-1 hover:border-[rgba(229,9,20,0.35)]"
            >
              <div className="flex items-start justify-between flix-gap-sm">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{ backgroundColor: card.accent.background, color: card.accent.color }}
                >
                  {card.icon}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--flix-text-secondary)] px-2 py-1 rounded-full border border-[rgba(255,255,255,0.08)]">
                  {card.category}
                </span>
              </div>

              <div className="flex flex-col flix-gap-xs">
                <h4 className="text-base font-semibold text-[var(--flix-text-primary)]">{card.title}</h4>
                <p className="text-sm text-[var(--flix-text-secondary)] leading-relaxed">{card.description}</p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full border border-[rgba(255,255,255,0.16)] hover:border-[rgba(229,9,20,0.4)] hover:bg-[rgba(229,9,20,0.12)] text-[var(--flix-text-primary)] flix-mt-auto"
              >
                {card.buttonLabel}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}