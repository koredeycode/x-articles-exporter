import { SELECTORS } from "../lib/constants"
import type { ArticleMetadata, ContentBlock } from "../lib/types"
import { convertImageToBase64, extractRichText } from "../lib/utils"

/**
 * Checks if the current page is an X Article or Status page.
 * @returns {boolean} True if the URL matches and the article view element exists.
 */
export function isArticlePage(): boolean {
  const urlPattern = /\/[^/]+\/(?:article|status)\/\d+/
  return urlPattern.test(window.location.pathname) && !!document.querySelector(SELECTORS.articleView)
}

/**
 * Extracts metadata from the current article page.
 * @returns An object containing the title, author, handle, date, and URL.
 */
export function extractMetadata(): ArticleMetadata {
  const title = document.querySelector(SELECTORS.articleTitle)?.textContent?.trim() || 'Untitled Article'
  const userNameEl = document.querySelector(SELECTORS.userName)
  let author = 'X Article'
  let handle = ''
  
  if (userNameEl) {
    author = userNameEl.querySelector('span span')?.textContent?.trim() || author
    handle = userNameEl.querySelector('a[href^="/"]')?.getAttribute('href')?.replace('/', '@') || ''
  }
  
  const dateStr = document.querySelector(SELECTORS.tweetTime)?.getAttribute('datetime')
  const date = dateStr 
    ? new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  return { title, author, handle, date, url: window.location.href }
}

/**
 * Main function to extract all article content (text, images, videos, tweets).
 * @param {function} onProgress - Callback to report status updates.
 * @returns {Promise<{ content: ContentBlock[], coverImage: string | null }>} extracted content and cover image.
 */
export async function extractArticleContent(onProgress?: (status: string) => void): Promise<{ content: ContentBlock[], coverImage: string | null }> {
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
    
    if (type) {
      const segments = extractRichText(block)
      if (segments.length > 0) {
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
       const bgImg = video.querySelector('[style*="background-image"]')
       if (bgImg) {
          const match = (bgImg as HTMLElement).style.backgroundImage.match(/url\("?(.*?)"?\)/)
          if (match) poster = match[1]
       }
    }

    if (poster) {
       const base64 = await convertImageToBase64(poster)
       if (base64) {
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

  // Extract Code Blocks
  const codeBlocks = Array.from(richTextView.querySelectorAll(SELECTORS.codeBlock))
  for (const block of codeBlocks) {
      const codeElement = block.querySelector('code')
      if (codeElement) {
          const text = codeElement.textContent || ''
          const className = codeElement.className || ''
          const languageMatch = className.match(/language-(\w+)/)
          const language = languageMatch ? languageMatch[1] : undefined

          items.push({
              block: {
                  type: 'code-block',
                  text,
                  language
              },
              node: block
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

     // Deduplicate: Skip images inside video players or embedded tweets
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
    const position = a.node.compareDocumentPosition(b.node)
    
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1 // a comes before b
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1 // b comes before a
    return 0
  })

  // Map to content array
  return { content: items.map(i => i.block), coverImage }
}
