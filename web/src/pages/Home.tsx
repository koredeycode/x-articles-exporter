import { Link, useNavigate } from 'react-router-dom'

export function Home() {
  const navigate = useNavigate()

  const handleDownload = () => {
    // Let the download happen naturally via the anchor tag default behavior
    // Then redirect after a short delay
    setTimeout(() => {
      navigate('/install')
    }, 1000)
  }

  return (
    <>
      <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
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
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
            <a href="/x-article-exporter.zip" className="btn btn-primary" download onClick={handleDownload}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download Extension
            </a>
            <Link to="/install" className="btn btn-outline">
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 18.5c-3.59 0-6.5-2.91-6.5-6.5s2.91-6.5 6.5-6.5 6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5zm-2.5-6.5c0-1.381 1.119-2.5 2.5-2.5s2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5-2.5-1.119-2.5-2.5z"/>
              <path d="M12 8.75c-1.795 0-3.25 1.455-3.25 3.25s1.455 3.25 3.25 3.25 3.25-1.455 3.25-3.25-1.455-3.25-3.25-3.25zm0 5c-.967 0-1.75-.783-1.75-1.75s.783-1.75 1.75-1.75 1.75.783 1.75 1.75-.783 1.75-1.75 1.75z" fill="#FFF"/>
            </svg>
            Coming soon to Chrome Web Store
          </div>
        </section>
      </main>
    </>
  )
}

