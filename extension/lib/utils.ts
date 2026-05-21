import DOMPurify from 'dompurify'
import type { TextSegment } from "./types"

/**
 * Sanitizes input text using DOMPurify to prevent XSS or unexpected characters.
 * @param {string} text - Raw text input.
 * @returns {string} Sanitized text string.
 */
export function sanitizeText(text: string): string {
  const cleaned = DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
  return cleaned.trim()
}

/**
 * Creates a placeholder image as a data URL when an image fails to load.
 * @param {string} text - Text to display on the placeholder.
 * @returns {string} Base64 data URL of the generated placeholder image.
 */
const BACKGROUND_IMAGE_URL_RE = /url\(["']?(.*?)["']?\)/

export function sanitizeImageUrl(url: string): string {
  return url
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '')
    .trim()
}

export function normalizeTwitterImageUrl(url: string): string {
  const cleaned = sanitizeImageUrl(url)
  try {
    const parsed = new URL(cleaned)
    if (parsed.hostname.includes('twimg.com')) {
      parsed.searchParams.set('name', 'large')
    }
    return parsed.toString()
  } catch {
    return cleaned.replace(/name=(small|medium|thumb)/, 'name=large')
  }
}

function extractBackgroundImageUrl(el: HTMLElement | null): string | null {
  if (!el) return null
  const inlineMatch = el.style.backgroundImage.match(BACKGROUND_IMAGE_URL_RE)
  if (inlineMatch?.[1]) return inlineMatch[1]

  const computedMatch = window.getComputedStyle(el).backgroundImage.match(BACKGROUND_IMAGE_URL_RE)
  return computedMatch?.[1] || null
}

export function resolveTweetPhotoUrl(photo: Element): string | null {
  const root = photo.matches('[data-testid="tweetPhoto"]')
    ? photo
    : photo.closest('[data-testid="tweetPhoto"]') || photo

  const img = root.querySelector('img') as HTMLImageElement | null
  const bgEl = root.querySelector('[style*="background-image"]') as HTMLElement | null
  const bgUrl = extractBackgroundImageUrl(bgEl)
    || extractBackgroundImageUrl(root as HTMLElement)

  const src = img?.currentSrc || img?.src
  const isPlaceholder = !src
    || src.startsWith('data:image/gif')
    || src === window.location.href

  const url = (!isPlaceholder ? src : null) || bgUrl
  return url ? normalizeTwitterImageUrl(url) : null
}

export function getImageFormatFromDataUrl(src: string): 'JPEG' | 'PNG' | 'WEBP' | 'GIF' {
  if (src.startsWith('data:image/png')) return 'PNG'
  if (src.startsWith('data:image/webp')) return 'WEBP'
  if (src.startsWith('data:image/gif')) return 'GIF'
  return 'JPEG'
}

export function createPlaceholderImage(text: string = 'Image Failed'): string {
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

async function loadImageAsDataUrl(url: string, timeoutMs = 12000): Promise<string | null> {
  const normalizedUrl = normalizeTwitterImageUrl(url)
  const preferPng = normalizedUrl.includes('format=png')

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.referrerPolicy = 'no-referrer'

    const timer = setTimeout(() => {
      cleanup()
      resolve(null)
    }, timeoutMs)

    const cleanup = () => {
      clearTimeout(timer)
      img.onload = null
      img.onerror = null
    }

    img.onload = () => {
      cleanup()
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL(preferPng ? 'image/png' : 'image/jpeg', 0.92))
      } catch (err) {
        console.warn('[X Articles Exporter] Canvas export failed:', normalizedUrl, err)
        resolve(null)
      }
    }

    img.onerror = () => {
      cleanup()
      resolve(null)
    }

    img.src = normalizedUrl
  })
}

async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  const normalizedUrl = normalizeTwitterImageUrl(url)
  const response = await fetch(normalizedUrl, { referrerPolicy: 'no-referrer' })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

  const blob = await response.blob()
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}

/**
 * Loads an image from a URL and converts it to a Base64 string.
 * Uses Image+canvas first (works with twimg CORS), fetch as fallback.
 */
export async function convertImageToBase64(url: string, retries = 3): Promise<string | null> {
  let attempt = 0
  while (attempt < retries) {
    let dataUrl = await loadImageAsDataUrl(url)
    if (!dataUrl) {
      try {
        dataUrl = await fetchImageAsDataUrl(url)
      } catch (err) {
        console.warn(`[X Articles Exporter] Fetch fallback failed (Attempt ${attempt + 1}/${retries}):`, url, err)
      }
    }

    if (dataUrl) return dataUrl

    attempt++
    console.warn(`[X Articles Exporter] Image load failed (Attempt ${attempt}/${retries}):`, url)

    if (attempt >= retries) {
      console.error('[X Articles Exporter] Failed to load image after retries:', url)
      return createPlaceholderImage('Image Could Not Load')
    }

    await new Promise(r => setTimeout(r, 1000 * attempt))
  }
  return null
}

/**
 * Recursively extracts rich text from a DOM node.
 * Preserves bold, italic, and link formatting.
 * @param {Node} node - The DOM node to traverse.
 * @returns {TextSegment[]} An array of text segments with style information.
 */
export function extractRichText(node: Node): TextSegment[] {
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
