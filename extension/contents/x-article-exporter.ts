// Content script for X Articles Exporter
// Detects X Article pages and injects Export to PDF button

import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://x.com/*", "https://twitter.com/*"],
  run_at: "document_idle"
}

// DOM Selectors
const SELECTORS = {
  articleView: '[data-testid="twitterArticleReadView"]',
  articleTitle: '[data-testid="twitter-article-title"]',
  userName: '[data-testid="User-Name"]',
  richTextView: '[data-testid="twitterArticleRichTextView"]',
  articleImage: '[data-testid="tweetPhoto"] img',
  tweetTime: 'time[datetime]',
  videoPlayer: '[data-testid="videoPlayer"]',
  tweet: '[data-testid="tweet"]'
}

const EXPORT_BUTTON_ID = 'x-articles-exporter-btn'

// Interfaces
export interface TextSegment {
  text: string
  isBold?: boolean
  isItalic?: boolean
  link?: string
}

export interface ContentBlock {
  type: 'heading1' | 'heading2' | 'paragraph' | 'blockquote' | 'list-item-unordered' | 'list-item-ordered' | 'image' | 'video' | 'embed-tweet'
  text?: string
  segments?: TextSegment[]
  src?: string
  link?: string // For video/tweet links
  author?: string // For embed-tweet
  handle?: string // For embed-tweet
  date?: string // For embed-tweet
}

// Icons
const ICONS = {
  export: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  loading: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
  success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  error: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
}

// Button Styles
const BUTTON_STYLES = `
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
  }
  #${EXPORT_BUTTON_ID}:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`

// Utils
function isArticlePage(): boolean {
  const urlPattern = /\/[^/]+\/(?:article|status)\/\d+/
  return urlPattern.test(window.location.pathname) && !!document.querySelector(SELECTORS.articleView)
}

function extractMetadata() {
  const title = document.querySelector(SELECTORS.articleTitle)?.textContent?.trim() || 'Untitled Article'
  const userNameEl = document.querySelector(SELECTORS.userName)
  let author = 'X Article'
  let handle = ''
  
  if (userNameEl) {
    author = userNameEl.querySelector('span span')?.textContent?.trim() || author
    handle = userNameEl.querySelector('a[href^="/"]')?.getAttribute('href')?.replace('/', '@') || ''
  }
  
  const date = document.querySelector(SELECTORS.tweetTime)?.getAttribute('datetime') 
    ? new Date(document.querySelector(SELECTORS.tweetTime)!.getAttribute('datetime')!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  return { title, author, handle, date, url: window.location.href }
}

function createPlaceholderImage(text: string = 'Image Failed'): string {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 300 // 4:3 Aspect Ratio
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    // Background
    ctx.fillStyle = '#F7F9F9'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Border
    ctx.strokeStyle = '#CFD9DE'
    ctx.lineWidth = 4
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    // Cross icon
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2 - 20, canvas.height / 2 - 20)
    ctx.lineTo(canvas.width / 2 + 20, canvas.height / 2 + 20)
    ctx.moveTo(canvas.width / 2 + 20, canvas.height / 2 - 20)
    ctx.lineTo(canvas.width / 2 - 20, canvas.height / 2 + 20)
    ctx.strokeStyle = '#E0245E' // X Red
    ctx.lineWidth = 4
    ctx.stroke()

    // Text
    ctx.fillStyle = '#536471'
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 40)

    return canvas.toDataURL('image/png')
  } catch (e) {
    return ''
  }
}

async function convertImageToBase64(url: string, retries = 3): Promise<string | null> {
  let attempt = 0
  while (attempt < retries) {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      
      const blob = await response.blob()
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })
    } catch (err) {
      attempt++
      console.warn(`[X Articles Exporter] Image load failed (Attempt ${attempt}/${retries}):`, url, err)
      
      if (attempt >= retries) {
          console.error('[X Articles Exporter] Failed to load image after retries:', url)
          return createPlaceholderImage('Image Could Not Load')
      }
      // Simple backoff: 1s, 2s...
      await new Promise(r => setTimeout(r, 1000 * attempt))
    }
  }
  return null
}

// Recursive Rich Text Extraction
function extractRichText(node: Node): TextSegment[] {
  const segments: TextSegment[] = []
  
  function traverse(currentNode: Node, currentStyle: { isBold: boolean, isItalic: boolean, link?: string }) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      const text = currentNode.textContent
      if (text) segments.push({ text, ...currentStyle })
      return
    }

    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      const element = currentNode as HTMLElement
      const style = window.getComputedStyle(element)
      const newStyle = { ...currentStyle }
      
      if (parseInt(style.fontWeight) >= 600 || style.fontWeight === 'bold' || ['B', 'STRONG'].includes(element.tagName)) newStyle.isBold = true
      if (style.fontStyle === 'italic' || ['I', 'EM'].includes(element.tagName)) newStyle.isItalic = true
      if (element.tagName === 'A') newStyle.link = (element as HTMLAnchorElement).href
      
      currentNode.childNodes.forEach(child => traverse(child, newStyle))
    }
  }
  
  traverse(node, { isBold: false, isItalic: false })
  
  // Merge
  if (segments.length === 0) return []
  const merged: TextSegment[] = [segments[0]]
  for (let i = 1; i < segments.length; i++) {
    const prev = merged[merged.length - 1]
    const curr = segments[i]
    if (prev.isBold === curr.isBold && prev.isItalic === curr.isItalic && prev.link === curr.link) {
      prev.text += curr.text
    } else {
      merged.push(curr)
    }
  }
  return merged
}

// Main Content Extraction
async function extractArticleContent(onProgress?: (status: string) => void): Promise<{ content: ContentBlock[], coverImage: string | null }> {
  const content: ContentBlock[] = []
  let coverImage: string | null = null
  const richTextView = document.querySelector(SELECTORS.richTextView)
  
  if (!richTextView) return { content, coverImage: null }

  onProgress?.('Analysing content...')

  // Detect Cover Image
  const articleView = document.querySelector(SELECTORS.articleView)
  if (articleView) {
     const allImages = Array.from(articleView.querySelectorAll('img'))
     for (const img of allImages) {
        if (img.width < 200 || img.height < 100) continue
        if (img.src.includes('profile_images')) continue
        if (img.closest(SELECTORS.userName)) continue
        
        const base64 = await convertImageToBase64(img.src)
        if (base64) {
          coverImage = base64
          break
        }
     }
  }
  
  // Temporary array to hold items with their DOM nodes for sorting
  const items: { block: ContentBlock, node: Element }[] = []

  // Extract Text Blocks
  const blocks = richTextView.querySelectorAll('[data-block="true"]')
  for (const block of Array.from(blocks)) {
    const classList = block.className
    let type: ContentBlock['type'] | null = null
    
    if (classList.includes('longform-header-one')) type = 'heading1'
    else if (classList.includes('longform-header-two')) type = 'heading2'
    else if (classList.includes('longform-blockquote')) type = 'blockquote'
    else if (classList.includes('longform-unordered-list-item')) type = 'list-item-unordered'
    else if (classList.includes('longform-ordered-list-item')) type = 'list-item-ordered'
    else if (classList.includes('longform-unstyled')) type = 'paragraph'
    
    // Explicitly handle image blocks if they markup them as blocks?
    // Usually images are not marked with these text classes.
    
    if (type) {
      const segments = extractRichText(block)
      if (segments.length > 0) {
        // Only add if it has actual text (to avoid empty blocks if simple image wrappers technically match)
        // But some paragraphs might be empty breaks?
        // Using segments check is good.
        items.push({ 
           block: { type, segments, text: segments.map(s => s.text).join('') }, 
           node: block 
        })
      }
    }
  }
  
  // Extract Videos
  const videos = Array.from(richTextView.querySelectorAll(SELECTORS.videoPlayer))
  for (const video of videos) {
    onProgress?.(`Processing Videos...`)
    
    // Attempt to find poster/thumbnail
    const videoEl = video.querySelector('video')
    let poster = videoEl?.getAttribute('poster')
    
    if (!poster) {
       // Check for background image on a sibling or parent if standard poster isn't there
       // Often X uses a div with background-image for the poster
       const bgImg = video.querySelector('[style*="background-image"]')
       if (bgImg) {
          const match = (bgImg as HTMLElement).style.backgroundImage.match(/url\("?(.*?)"?\)/)
          if (match) poster = match[1]
       }
    }

    if (poster) {
       const base64 = await convertImageToBase64(poster)
       if (base64) {
          // Find link
          const link = video.closest('a')?.href || video.querySelector('a')?.href || window.location.href
          
          items.push({
             block: { type: 'video', src: base64, link },
             node: video
          })
       }
    }
  }

  // Extract Embedded Tweets
  const tweets = Array.from(richTextView.querySelectorAll(SELECTORS.tweet))
  for (const tweet of tweets) {
     onProgress?.(`Processing Embeds...`)
     
     const text = tweet.querySelector('[data-testid="tweetText"]')?.textContent || ''
     const authorName = tweet.querySelector('[data-testid="User-Name"]')?.textContent?.split('@')[0]?.trim() || 'Unknown'
     const handle = tweet.querySelector('[data-testid="User-Name"] a')?.getAttribute('href')?.replace('/', '@') || ''
      const link = (tweet.querySelector('a[href*="/status/"]') as HTMLAnchorElement)?.href || ''
    
     if (text) {
        items.push({
           block: { 
             type: 'embed-tweet', 
             text, 
             author: authorName, 
             handle,
             link
           },
           node: tweet
        })
     }
  }

  // Extract Body Images
  const contentImages = Array.from(richTextView.querySelectorAll(SELECTORS.articleImage))
  let processedImages = 0
  const totalImages = contentImages.length

  for (const img of contentImages) {
     if (totalImages > 0) {
        onProgress?.(`Processing Images (${processedImages}/${totalImages})...`)
     }

     const src = (img as HTMLImageElement).src
     if (!src) continue

     // Deduplicate: Skip images inside video players or embedded tweets to avoid double rendering
     if (img.closest(SELECTORS.videoPlayer) || img.closest(SELECTORS.tweet)) continue
     
     const base64 = await convertImageToBase64(src)
     if (base64) {
       items.push({
          block: { type: 'image', src: base64 },
          node: img
       })
     }
     processedImages++
     if (totalImages > 0) {
        onProgress?.(`Processing Images (${processedImages}/${totalImages})...`)
     }
  }

  // Sort items by DOM position
  items.sort((a, b) => {
    // compareDocumentPosition bitmask:
    // 2: Preceding (b comes before a)
    // 4: Following (b comes after a)
    const position = a.node.compareDocumentPosition(b.node)
    
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1 // a comes before b
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1 // b comes before a
    return 0
  })

  // Map to content array
  return { content: items.map(i => i.block), coverImage }
}

// Handlers
async function handleExportClick() {
  const button = document.getElementById(EXPORT_BUTTON_ID) as HTMLButtonElement
  if (!button || button.disabled) return
  
  // Set Loading State
  button.innerHTML = `${ICONS.loading} Processing...`
  button.disabled = true
  
  try {
    const { generatePDF } = await import('./pdfGenerator')
    const storage = await chrome.storage.sync.get('settings')
    const settings = storage.settings || { theme: 'light', pageSize: 'a4' }
    
    const metadata = extractMetadata()
    const { content, coverImage } = await extractArticleContent((status) => {
       button.innerHTML = `${ICONS.loading} ${status}`
    })
    
    await generatePDF(metadata, { content, coverImage }, settings, (status) => {
      button.innerHTML = `${ICONS.loading} ${status}`
    })
    
    // Set Success State
    button.innerHTML = `${ICONS.success} Saved!`
    button.style.backgroundColor = '#17BF63'
  } catch (error) {
    console.error(error)
    // Set Error State
    button.innerHTML = `${ICONS.error} Error`
    button.style.backgroundColor = '#DC3545'
  } finally {
    setTimeout(() => {
      // Reset State
      button.innerHTML = `${ICONS.export} Export to PDF`
      button.style.backgroundColor = '#1D9BF0'
      button.disabled = false
    }, 2500)
  }
}

function injectExportButton() {
  if (document.getElementById(EXPORT_BUTTON_ID)) return
  
  const style = document.createElement('style')
  style.textContent = BUTTON_STYLES
  document.head.appendChild(style)

  const button = document.createElement('button')
  button.id = EXPORT_BUTTON_ID
  button.innerHTML = `${ICONS.export} Export to PDF`
  button.addEventListener('click', handleExportClick)
  
  document.body.appendChild(button)
}

function removeExportButton() {
  document.getElementById(EXPORT_BUTTON_ID)?.remove()
}

function checkAndInject() {
  isArticlePage() ? injectExportButton() : removeExportButton()
}

// Init
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
