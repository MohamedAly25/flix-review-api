import Link from 'next/link'

interface FooterLink {
  label: string
  href: string
  description: string
}

const footerLinkGroups: FooterLink[][] = [
  [
    {
      label: 'FAQ',
      href: '/faq',
      description: 'Find answers to the most common FlixReview questions.',
    },
    {
      label: 'Help Center',
      href: '/help-center',
      description: 'Step-by-step guidance for exploring the platform.',
    },
    {
      label: 'Account',
      href: '/account',
      description: 'Manage your profile, watchlist, and notification settings.',
    },
  ],
  [
    {
      label: 'Media Center',
      href: '/media-center',
      description: 'Press kits, brand assets, and editorial inquiries.',
    },
    {
      label: 'Terms of Use',
      href: '/terms-of-use',
      description: 'The rules that keep FlixReview fair for everyone.',
    },
    {
      label: 'Privacy',
      href: '/privacy',
      description: 'Learn how we protect your viewing habits and reviews.',
    },
  ],
  [
    {
      label: 'Cookie Preferences',
      href: '/cookie-preferences',
      description: 'Choose how analytics and personalization power your feed.',
    },
    {
      label: 'Corporate Information',
      href: '/corporate-information',
      description: 'Meet the studio behind FlixReview and our mission.',
    },
    {
      label: 'Contact Us',
      href: '/contact',
      description: 'Reach out to support, partnerships, or press teams.',
    },
  ],
]

export function Footer() {
  return (
    <footer
      className="flix-bg-secondary"
      style={{ borderTop: '1px solid var(--flix-border)', marginTop: 'auto' }}
    >
      <div className="flix-container">
        <div className="flix-footer">
          <p className="flix-small flix-text-muted flix-text-center">
            Questions? Contact us.
          </p>

          <div className="flix-footer-links">
            {footerLinkGroups.map((links, index) => (
              <ul
                key={index}
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="flix-footer-link" style={{ textAlign: 'center' }}>
                      <span className="flix-font-semibold" style={{ display: 'block' }}>
                        {link.label}
                      </span>
                      <span className="flix-small" style={{ display: 'block', marginTop: '4px' }}>
                        {link.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>

          <p className="flix-small flix-text-muted flix-text-center">
            &copy; {new Date().getFullYear()} FlixReview. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
