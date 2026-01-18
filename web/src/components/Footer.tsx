export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          <p className="copyright">
            &copy; {new Date().getFullYear()} X Articles Exporter. All rights reserved.
          </p>
          <div className="footer-links">
            <a 
              href="https://twitter.com/korecodes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              Built by @korecodes
            </a>
            <a 
              href="https://github.com/koredeycode/x-articles-exporter" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
