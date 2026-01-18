import { useState } from 'react'
import { Link } from 'react-router-dom'

export function Install() {
  const [activeTab, setActiveTab] = useState<'install' | 'build'>('install')
  const [copiedStep, setCopiedStep] = useState<string | null>(null)

  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(stepId)
    setTimeout(() => setCopiedStep(null), 2000)
  }

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
        </nav>
      </aside>

      <main className="doc-content">
        {activeTab === 'install' ? (
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
          </section>
        ) : (
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
          </section>
        )}
      </main>
    </div>
  )
}
