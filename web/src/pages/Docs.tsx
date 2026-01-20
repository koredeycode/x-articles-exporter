import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

type TabType = 'install' | 'build' | 'usage'

const TABS: TabType[] = ['install', 'build', 'usage']

export function Docs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [copiedStep, setCopiedStep] = useState<string | null>(null)

  const activeTab = (searchParams.get('tab') as TabType) || 'install'

  const setActiveTab = (tab: TabType) => {
    setSearchParams({ tab })
  }

  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(stepId)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const currentIndex = TABS.indexOf(activeTab)
  const prevTab = currentIndex > 0 ? TABS[currentIndex - 1] : null
  const nextTab = currentIndex < TABS.length - 1 ? TABS[currentIndex + 1] : null

  const renderNavButtons = () => (
    <div className="doc-nav-buttons">
      {prevTab ? (
        <button 
          onClick={() => setActiveTab(prevTab)}
          className="nav-card-btn"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <div>
            <div className="nav-card-btn-label">Previous</div>
            <div className="nav-card-btn-title">{prevTab === 'install' ? 'Installation' : prevTab === 'build' ? 'Build from Source' : 'How to Use'}</div>
          </div>
        </button>
      ) : <div />}
      
      {nextTab ? (
        <button 
          onClick={() => setActiveTab(nextTab)}
          className="nav-card-btn right"
        >
          <div>
            <div className="nav-card-btn-label">Next</div>
            <div className="nav-card-btn-title">{nextTab === 'install' ? 'Installation' : nextTab === 'build' ? 'Build from Source' : 'How to Use'}</div>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      ) : <div />}
    </div>
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeTab])

  return (
    <div className="doc-layout">
      <aside className="doc-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </Link>
        </div>
        <nav className="doc-nav">
          <button 
            className={`nav-btn ${activeTab === 'install' ? 'active' : ''}`}
            onClick={() => setActiveTab('install')}
          >
            Installation
          </button>
          <button 
            className={`nav-btn ${activeTab === 'build' ? 'active' : ''}`}
            onClick={() => setActiveTab('build')}
          >
            Build from Source
          </button>
          <button 
            className={`nav-btn ${activeTab === 'usage' ? 'active' : ''}`}
            onClick={() => setActiveTab('usage')}
          >
            How to Use
          </button>
        </nav>
      </aside>

      <main className="doc-content">
        {activeTab === 'usage' && (
           <section className="fade-in">
             <h1>How to Use</h1>
             <p className="lead">Learn how to export your favorite X (Twitter) articles to PDF.</p>
             
             <div className="step-group">
               <div className="step">
                 <div className="step-number">01</div> 
                 <div className="step-content">
                   <h3>Open an Article</h3>
                   <p>Navigate to any article on <a href="https://x.com" target="_blank" rel="noopener noreferrer">x.com</a> (Twitter). Ensure you are viewing the full article content.</p>
                 </div>
               </div>

               <div className="step">
                 <div className="step-number">02</div>
                 <div className="step-content">
                   <h3>Open Extension</h3>
                   <p>Click the <strong>X Articles Exporter</strong> icon in your browser toolbar to open the popup for settings.</p>
                 </div>
               </div>

               <div className="step">
                 <div className="step-number">03</div>
                  <div className="step-content">
                    <h3>Customize Settings</h3>
                    <p>
                      Click the extension icon to customize:
                      <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', marginBottom: 0 }}>
                        <li><strong>Design</strong>: Standard, Modern, Academic, Technical</li>
                        <li><strong>Theme</strong>: Light / Dark</li>
                        <li><strong>Size</strong>: A4 / Letter</li>
                      </ul>
                    </p>
                  </div>
               </div>

               <div className="step">
                 <div className="step-number">04</div>
                 <div className="step-content">
                   <h3>Export</h3>
                   <p>Click the <strong>Export to PDF</strong> button on the page or press <code style={{ fontSize: '0.9em' }}>Alt + P</code> (Option + P on Mac) to export instantly.</p>
                 </div>
               </div>
             </div>
             {renderNavButtons()}
           </section>
        )}

        {activeTab === 'install' && (
          <section className="fade-in">
            <h1>Installation Guide</h1>
            <p className="lead">Follow these steps to install X Articles Exporter directly into your Chrome browser.</p>
            
            <div className="step-group">
              <div className="step">
                <div className="step-number">01</div> 
                <div className="step-content">
                  <h3>Download & Extract</h3>
                  <p>Download the latest version of the extension and extract the zip file to a safe location on your computer.</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">02</div>
                <div className="step-content">
                  <h3>Open Extensions Page</h3>
                  <p>In Chrome, navigate to <code>chrome://extensions</code> by typing it in the address bar.</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">03</div>
                <div className="step-content">
                  <h3>Enable Developer Mode</h3>
                  <p>Toggle the <strong>Developer mode</strong> switch in the top right corner of the Extensions page.</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">04</div>
                <div className="step-content">
                  <h3>Load Extension</h3>
                  <p>Click <strong>Load unpacked</strong> button and select the folder you extracted in Step 1.</p>
                </div>
              </div>
            </div>
            {renderNavButtons()}
          </section>
        )}
        
        {activeTab === 'build' && (
          <section className="fade-in">
            <h1>Build from Source</h1>
            <p className="lead">Developers can clone the repository and build the extension locally.</p>
            
            <div className="step-group">
              <div className="step">
                <div className="step-number">01</div>
                <div className="step-content">    
                  <h3>Clone the repository</h3>
                  <div className="code-block">
                    <div className="code-header">
                      <span>Terminal</span>
                      <button onClick={() => copyToClipboard('git clone https://github.com/koredeycode/x-articles-exporter.git', 'step1')} className="copy-btn">
                        {copiedStep === 'step1' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <pre><span className="token-cmd">git</span> <span className="token-arg">clone</span> https://github.com/koredeycode/x-articles-exporter.git</pre>
                  </div>
                </div>
              </div>

              <div className="step">
                <div className="step-number">02</div>
                <div className="step-content">
                  <h3>Navigate to extension directory</h3>
                  <div className="code-block">
                    <div className="code-header">
                      <span>Terminal</span>
                      <button onClick={() => copyToClipboard('cd x-articles-exporter/extension', 'step2')} className="copy-btn">
                        {copiedStep === 'step2' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <pre><span className="token-cmd">cd</span> <span className="token-arg">x-articles-exporter/extension</span></pre>
                  </div>
                </div>
              </div>

              <div className="step">
                <div className="step-number">03</div>
                <div className="step-content">
                  <h3>Install dependencies</h3>
                  <div className="code-block">
                    <div className="code-header">
                      <span>Terminal</span>
                      <button onClick={() => copyToClipboard('pnpm install', 'step3')} className="copy-btn">
                        {copiedStep === 'step3' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <pre><span className="token-cmd">pnpm</span> <span className="token-arg">install</span></pre>
                  </div>
                </div>
              </div>

              <div className="step">
                <div className="step-number">04</div>
                <div className="step-content">
                  <h3>Build the extension</h3>
                  <div className="code-block">
                    <div className="code-header">
                      <span>Terminal</span>
                      <button onClick={() => copyToClipboard('pnpm build', 'step4')} className="copy-btn">
                        {copiedStep === 'step4' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <pre><span className="token-cmd">pnpm</span> <span className="token-arg">build</span></pre>
                  </div>
                  <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>The built extension will be in the <code>extension/build/chrome-mv3-prod</code> directory.</p>
                </div>
              </div>
            </div>
            {renderNavButtons()}
          </section>
        )}
      </main>
    </div>
  )
}
