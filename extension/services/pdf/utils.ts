import DOMPurify from 'dompurify'
import jsPDF from 'jspdf'

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
 * Splits text into lines that fit within a specified width.
 * @param {jsPDF} doc - jsPDF instance.
 * @param {string} text - Text to split.
 * @param {number} maxWidth - Maximum allowed width.
 * @param {number} fontSize - Font size for calculation.
 * @returns {string[]} Array of strings, each representing a line.
 */
export function splitTextToWidth(doc: jsPDF, text: string, maxWidth: number, fontSize: number): string[] {
  doc.setFontSize(fontSize)
  return doc.splitTextToSize(text, maxWidth)
}
