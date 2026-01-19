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

/**
 * Fetches an image from a URL and converts it to a Base64 string.
 * Retries up to `retries` times on failure.
 * @param {string} url - The URL of the image.
 * @param {number} retries - Number of retry attempts.
 * @returns {Promise<string | null>} Base64 string or null/placeholder on failure.
 */
export async function convertImageToBase64(url: string, retries = 3): Promise<string | null> {
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
