export function Footer() {
  return (
    <footer className="flix-bg-secondary" style={{ borderTop: '1px solid var(--flix-border)', marginTop: 'auto' }}>
      <div className="flix-container flix-p-lg">
        <div className="flix-text-center flix-mb-md">
          <p className="flix-small flix-text-muted flix-mb-sm">
            Questions? Contact us.
          </p>
        </div>
        
        <div className="flix-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li className="flix-mb-xs"><a href="#" className="flix-small flix-text-muted" style={{ textDecoration: 'underline' }}>FAQ</a></li>
              <li className="flix-mb-xs"><a href="#" className="flix-small flix-text-muted" style={{ textDecoration: 'underline' }}>Help Center</a></li>
              <li className="flix-mb-xs"><a href="#" className="flix-small flix-text-muted" style={{ textDecoration: 'underline' }}>Account</a></li>
            </ul>
          </div>
          <div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li className="flix-mb-xs"><a href="#" className="flix-small flix-text-muted" style={{ textDecoration: 'underline' }}>Media Center</a></li>
              <li className="flix-mb-xs"><a href="#" className="flix-small flix-text-muted" style={{ textDecoration: 'underline' }}>Terms of Use</a></li>
              <li className="flix-mb-xs"><a href="#" className="flix-small flix-text-muted" style={{ textDecoration: 'underline' }}>Privacy</a></li>
            </ul>
          </div>
          <div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li className="flix-mb-xs"><a href="#" className="flix-small flix-text-muted" style={{ textDecoration: 'underline' }}>Cookie Preferences</a></li>
              <li className="flix-mb-xs"><a href="#" className="flix-small flix-text-muted" style={{ textDecoration: 'underline' }}>Corporate Information</a></li>
              <li className="flix-mb-xs"><a href="#" className="flix-small flix-text-muted" style={{ textDecoration: 'underline' }}>Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="flix-text-center">
          <p className="flix-small flix-text-muted">
            &copy; {new Date().getFullYear()} FlixReview. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
