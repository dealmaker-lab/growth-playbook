'use client';

interface EbookLink {
  href: string;
  label: string;
}

interface TopNavProps {
  ebookLinks?: EbookLink[];
}

export default function TopNav({ ebookLinks }: TopNavProps) {
  return (
    <>
      <nav className="top-nav" id="topNav" style={{ top: 0 }}>
        <a href="https://appsamurai.com" className="nav-logo" target="_blank" rel="noopener noreferrer">
          <img src="/appsamurai-logo.png" alt="AppSamurai" style={{ height: '28px', width: 'auto' }} />
        </a>
        <div className="nav-right">
          {ebookLinks && ebookLinks.length > 0 && (
            <div className="nav-dropdown">
              <button className="nav-link nav-link--dropdown">Ebooks <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4l3 3 3-3"/></svg></button>
              <div className="nav-dropdown-menu">
                {ebookLinks.map((link) => (
                  <a key={link.href} href={link.href}>{link.label}</a>
                ))}
              </div>
            </div>
          )}
          <div className="nav-dropdown">
            <button className="nav-link nav-link--dropdown">Solutions <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4l3 3 3-3"/></svg></button>
            <div className="nav-dropdown-menu">
              <a href="https://appsamurai.com/gaming/" target="_blank" rel="noopener noreferrer">AppSamurai For Games</a>
              <a href="https://appsamurai.com/dsp/" target="_blank" rel="noopener noreferrer">DSP (UA &amp; Retargeting)</a>
              <a href="https://appsamurai.com/oem/" target="_blank" rel="noopener noreferrer">OEM (App Discovery)</a>
              <a href="https://appsamurai.com/appsprize-monetization/" target="_blank" rel="noopener noreferrer">Rewarded Playtime</a>
            </div>
          </div>
          <div className="nav-dropdown">
            <button className="nav-link nav-link--dropdown">Resources <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4l3 3 3-3"/></svg></button>
            <div className="nav-dropdown-menu">
              <a href="https://appsamurai.com/blog/" target="_blank" rel="noopener noreferrer">Blog</a>
              <a href="https://appsamurai.com/success-stories/" target="_blank" rel="noopener noreferrer">Success Stories</a>
              <a href="https://appsamurai.com/all-about-apps-podcast/" target="_blank" rel="noopener noreferrer">Podcast</a>
              <a href="https://appsamurai.com/ebooks/" target="_blank" rel="noopener noreferrer">eBooks</a>
              <a href="https://appsamurai.com/glossary/" target="_blank" rel="noopener noreferrer">Glossary</a>
              <a href="https://help.appsamurai.com" target="_blank" rel="noopener noreferrer">Help Center</a>
            </div>
          </div>
          <div className="nav-dropdown">
            <button className="nav-link nav-link--dropdown">Company <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4l3 3 3-3"/></svg></button>
            <div className="nav-dropdown-menu">
              <a href="https://appsamurai.com/about-us/" target="_blank" rel="noopener noreferrer">About Us</a>
              <a href="https://appsamurai.com/about-us/#culture" target="_blank" rel="noopener noreferrer">Culture</a>
              <a href="https://appsamurai.com/about-us/#careers" target="_blank" rel="noopener noreferrer">Careers</a>
            </div>
          </div>
          <a href="https://dashboard.appsamurai.com/login" className="nav-link" target="_blank" rel="noopener noreferrer">Login</a>
          <a href="https://appsamurai.com/contact-us/" className="btn-primary nav-cta" target="_blank" rel="noopener noreferrer">Talk to us</a>
        </div>
        <button className="nav-hamburger" aria-label="Menu" onClick={() => { const m = document.getElementById('mobileMenu'); if (m) m.classList.toggle('open'); }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round"><path d="M3 6h16M3 11h16M3 16h16"/></svg>
        </button>
      </nav>
      {/* Mobile Menu */}
      <div className="mobile-menu" id="mobileMenu">
        <div className="mobile-menu-inner">
          {ebookLinks && ebookLinks.length > 0 && (
            <div className="mobile-menu-section"><span className="mobile-menu-label">Ebooks</span>
              {ebookLinks.map((link) => (
                <a key={link.href} href={link.href}>{link.label}</a>
              ))}
            </div>
          )}
          <div className="mobile-menu-section"><span className="mobile-menu-label">Solutions</span>
            <a href="https://appsamurai.com/gaming/">AppSamurai For Games</a>
            <a href="https://appsamurai.com/dsp/">DSP (UA &amp; Retargeting)</a>
            <a href="https://appsamurai.com/oem/">OEM (App Discovery)</a>
            <a href="https://appsamurai.com/appsprize-monetization/">Rewarded Playtime</a>
          </div>
          <div className="mobile-menu-section"><span className="mobile-menu-label">Resources</span>
            <a href="https://appsamurai.com/blog/">Blog</a>
            <a href="https://appsamurai.com/success-stories/">Success Stories</a>
            <a href="https://appsamurai.com/ebooks/">eBooks</a>
          </div>
          <div className="mobile-menu-section"><span className="mobile-menu-label">Company</span>
            <a href="https://appsamurai.com/about-us/">About Us</a>
            <a href="https://appsamurai.com/about-us/#careers">Careers</a>
          </div>
          <a href="https://dashboard.appsamurai.com/login" className="mobile-menu-link">Login</a>
          <a href="https://appsamurai.com/contact-us/" className="btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '12px', textDecoration: 'none' }}>Talk to us</a>
        </div>
      </div>
    </>
  );
}
