import type { PlasmoCSConfig } from "plasmo"

// Plasmo Config
export const config: PlasmoCSConfig = {
  matches: ["https://x.com/*", "https://twitter.com/*"],
  run_at: "document_idle"
}

// Interfaces

/**
 * Represents a segment of text with specific formatting.
 */
export interface TextSegment {
  /** The actual text content. */
  text: string
  /** Whether the text is bold. */
  isBold?: boolean
  /** Whether the text is italicized. */
  isItalic?: boolean
  /** URL if the segment is a link. */
  link?: string
}

/**
 * Represents a block of content extracted from the article.
 * Can be a heading, paragraph, image, video, or embedded tweet.
 */
export interface ContentBlock {
  type: 'heading1' | 'heading2' | 'paragraph' | 'blockquote' | 'list-item-unordered' | 'list-item-ordered' | 'image' | 'video' | 'embed-tweet' | 'code-block'
  /** Combined text content for text-based blocks. */
  text?: string
  /** Detailed segments for rich text formatting. */
  segments?: TextSegment[]
  /** Source URL for images or posters. */
  src?: string
  /** Link URL for video or tweet embeds. */
  link?: string 
  /** Author name for embedded tweets. */
  author?: string 
  /** Author handle for embedded tweets. */
  handle?: string 
  /** Publish date for embedded tweets. */
  date?: string
  /** Language for code blocks. */
  language?: string
}

/**
 * Metadata about the article being exported.
 */
export interface ArticleMetadata {
  title: string
  author: string
  handle: string
  date: string
  url: string
}

/**
 * User-configurable settings for PDF generation.
 */
export interface Settings {
  /** Color theme: 'light' or 'dark'. */
  theme: 'light' | 'dark'
  /** Page size: 'a4' or 'letter'. */
  pageSize: 'a4' | 'letter'
  /** Font style: 'serif' or 'sans'. */
  font: 'serif' | 'sans'
}
