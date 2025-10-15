import Link from 'next/link'

interface FooterLink {
  label: string
  href: string
}

const footerLinkGroups: FooterLink[][] = [
  [
    {
      label: 'FAQ',
      href: '/faq',
    },
    {
      label: 'Help Center',
      href: '/help-center',
    },
    {
      label: 'Account',
      href: '/account',
    },
  ],
  [
    {
      label: 'Media Center',
      href: '/media-center',
    },
    {
      label: 'Terms of Use',
      href: '/terms-of-use',
    },
    {
      label: 'Privacy',
      href: '/privacy',
    },
  ],
  [
    {
      label: 'Cookie Preferences',
      href: '/cookie-preferences',
    },
    {
      label: 'Corporate Information',
      href: '/corporate-information',
    },
    {
      label: 'Contact Us',
      href: '/contact',
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
