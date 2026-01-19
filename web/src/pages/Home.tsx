import { Link, useNavigate } from 'react-router-dom'

export function Home() {
  const navigate = useNavigate()

  const handleDownload = () => {
    // Let the download happen naturally via the anchor tag default behavior
    // Then redirect after a short delay
    setTimeout(() => {
      navigate('/docs')
    }, 1000)
  }

  return (
    <>
      <div className="github-star-wrapper">
        <a 
          href="https://github.com/koredeycode/x-articles-exporter" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-outline"
          style={{ fontSize: '0.9rem', padding: '8px 16px' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Star on GitHub
        </a>
      </div>
      <main className="container">
        <section className="hero">
          <img src="/icon.png" alt="X Articles Exporter Logo" style={{ width: '100px', height: '100px', marginBottom: '1rem', borderRadius: '16px' }} />
          <h1>
            Export X Articles<br />
            to Formatted PDFs
          </h1>
          <p style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
            The ultimate tool for archiving and reading long-form X/Twitter Article content offline. 
            Preserve formatting, images, and readability with a single click.
          </p>
          <div className="hero-buttons">
            <a href="/x-article-exporter.zip" className="btn btn-primary" download onClick={handleDownload}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download Extension
            </a>
            <Link to="/docs" className="btn btn-outline">
              How to Install
            </Link>
          </div>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(255, 255, 255, 0.05)', 
            padding: '8px 16px', 
            borderRadius: '9999px',
            border: '1px solid var(--border)',
            fontSize: '0.9rem',
            color: 'var(--text-muted)'
          }}>
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill='currentColor'><title>Google Chrome</title><path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-5.344 9.257c.206.01.413.016.621.016 6.627 0 12-5.373 12-12 0-1.54-.29-3.011-.818-4.364zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728Z"></path></svg>
            Coming soon to Chrome Web Store     
          </div>
        </section>
      </main>
    </>
  )
}

