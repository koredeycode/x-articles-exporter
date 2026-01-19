/**
 * DOM Selectors used to identify key elements on the X Article page.
 * These selectors target internal test-ids used by React on X.com.
 */
export const SELECTORS = {
  articleView: '[data-testid="twitterArticleReadView"]',
  articleTitle: '[data-testid="twitter-article-title"]',
  userName: '[data-testid="User-Name"]',
  richTextView: '[data-testid="twitterArticleRichTextView"]',
  articleImage: '[data-testid="tweetPhoto"] img',
  tweetTime: 'time[datetime]',
  videoPlayer: '[data-testid="videoPlayer"]',
  tweet: '[data-testid="tweet"]',
  codeBlock: '[data-testid="markdown-code-block"]'
}

/** Unique ID for the injected Export button. */
export const EXPORT_BUTTON_ID = 'x-articles-exporter-btn'

/**
 * SVG icons used in the export button for different states.
 */
export const ICONS = {
  export: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  loading: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
  success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  error: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
}

/**
 * CSS Styles for the injected export button.
 * Includes positioning, colors, and hover states.
 */
export const BUTTON_STYLES = `
  #${EXPORT_BUTTON_ID} {
    position: fixed;
    bottom: 30px;
    right: 100px;
    z-index: 9999;
    background-color: #1D9BF0;
    color: white;
    border: none;
    border-radius: 24px;
    padding: 12px 24px;
    font-weight: bold;
    font-size: 15px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s, background-color 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  #${EXPORT_BUTTON_ID}:hover {
    transform: scale(1.05);
    background-color: #1A8CD8;
  }
  #${EXPORT_BUTTON_ID}:active {
    transform: scale(0.95);
    background-color: #1982c4;
  }
  #${EXPORT_BUTTON_ID}:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
`
