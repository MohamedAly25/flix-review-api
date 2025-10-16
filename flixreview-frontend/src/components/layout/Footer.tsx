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
    <footer className="flix-footer-shell">
      <div className="flix-container">
        <div className="flix-footer">
          <p className="flix-small flix-text-muted flix-text-center">
            Questions? Contact us.
          </p>

          <div className="flix-footer-links">
            {footerLinkGroups.map((links, index) => (
              <ul
                key={index}
                className="flix-footer-column"
              >
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="flix-footer-link">
                      <span className="flix-font-semibold">
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
