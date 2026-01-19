// Content script for X Articles Exporter
// Detects X Article pages and injects Export to PDF button

import type { PlasmoCSConfig } from "plasmo"
import { extractArticleContent, extractMetadata, isArticlePage } from "../services/content-extractor"
import { generatePDF } from "../services/pdf"
import { injectExportButton, removeExportButton, setButtonDefault, setButtonError, setButtonLoading, setButtonSuccess } from "../services/ui-manager"

/**
 * Plasmo Content Script Configuration.
 * Specifies the matching patterns (X.com and Twitter.com) and run time (when document is idle).
 */
export const config: PlasmoCSConfig = {
  matches: ["https://x.com/*", "https://twitter.com/*"],
  run_at: "document_idle"
}

// Handlers

/**
 * Handles the export button click event.
 * Orchestrates the data extraction and PDF generation process.
 */
async function handleExportClick() {
  // Set Loading State
  setButtonLoading('Processing...')
  
  try {
    const storage = await chrome.storage.sync.get('settings')
    const settings = storage.settings || { theme: 'light', pageSize: 'a4' }
    
    const metadata = extractMetadata()
    const { content, coverImage } = await extractArticleContent((status) => {
       setButtonLoading(status)
    })
    
    await generatePDF(metadata, { content, coverImage }, settings, (status) => {
      setButtonLoading(status)
    })
    
    // Set Success State
    setButtonSuccess()
  } catch (error) {
    console.error(error)
    // Set Error State
    setButtonError()
  } finally {
    setTimeout(() => {
      // Reset State
      setButtonDefault()
    }, 2500)
  }
}

/**
 * Checks the current page state and injects or removes the button accordingly.
 */
function checkAndInject() {
  isArticlePage() ? injectExportButton(handleExportClick) : removeExportButton()
}

// Init

/**
 * Sets up a MutationObserver to detect navigation changes (SPA behavior).
 * Re-checks injection logic whenever the body content changes.
 */
function setupObserver() {
  checkAndInject()
  let lastUrl = window.location.href
  let timeoutId: NodeJS.Timeout
  const handleMutation = () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      checkAndInject()
    }, 500) // Debounce by 500ms
  }

  const observer = new MutationObserver(handleMutation)
  observer.observe(document.body, { childList: true, subtree: true })
}

window.addEventListener('keydown', (e) => {
  if (e.altKey && e.code === 'KeyP' && isArticlePage()) handleExportClick()
})

setupObserver()
