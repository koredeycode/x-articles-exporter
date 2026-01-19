import jsPDF from 'jspdf'
import 'jspdf-autotable'
import type { ArticleMetadata, ContentBlock, Settings } from "../../lib/types"
import { BASE_CONFIG, getFonts, getThemeColors } from './config'
import { finalizeStandardPages, generateNotesPage, generateTitlePage, generateTOC } from './layout'
import { renderCodeBlock, renderFormattedBlock, renderImageBlock, renderTweetBlock, renderVideoBlock, type RenderContext } from './renderers'
import { sanitizeText } from './utils'

// Extend jsPDF type for autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: { finalY: number }
  }
}

/**
 * Main function to generate the PDF document.
 */
export const generatePDF = async (
  metadata: ArticleMetadata,
  content: { content: ContentBlock[], coverImage: string | null },
  settings: Settings,
  onProgress?: (status: string) => void
): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: settings.pageSize
  })
  
  // DYNAMIC CONFIGURATION
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  
  const config = {
      ...BASE_CONFIG,
      pageWidth,
      pageHeight,
      contentWidth: pageWidth - BASE_CONFIG.contentStart - BASE_CONFIG.margin
  }
  
  onProgress?.('Preparing PDF...')

  const isDark = settings.theme === 'dark'
  const colors = getThemeColors(settings.theme)
  const fonts = getFonts(settings.font)

  // --- 1. Title Page ---
  onProgress?.('Generating Title Page...')
  // Returns the Y position after title components
  generateTitlePage(doc, metadata, content.coverImage, config, colors, fonts)

  // --- 2. Content Generation ---
  onProgress?.('Formatting Content...')
  doc.addPage()
  doc.setFillColor(colors.bg)
  doc.rect(0, 0, config.pageWidth, config.pageHeight, 'F')
  
  let currentPageIndex = 2
  let contentY = config.margin
  
  const tocEntries: { text: string, page: number, level: number }[] = []
  
  // PAGE BREAK HANDLER
  const onPageBreak = (currentY: number) => {
      doc.addPage()
      currentPageIndex++
      doc.setFillColor(colors.bg)
      doc.rect(0, 0, config.pageWidth, config.pageHeight, 'F')
      return config.margin
  }

  // Iterate Blocks
  let blockIndex = 0
  for (const block of content.content) {
     blockIndex++
     if (blockIndex % 5 === 0) {
        onProgress?.(`Processing Block ${blockIndex}/${content.content.length}...`)
     }

     if (contentY > config.pageHeight - config.margin - 10) {
         contentY = onPageBreak(contentY)
     }
     
     const X_POS = config.contentStart
     const MAX_W = config.contentWidth
     
     // Render Context
     const ctx: RenderContext = {
         doc,
         config,
         colors,
         fonts,
         currentY: contentY,
         onPageBreak
     }
     
     switch (block.type) {
        case 'heading1':
           doc.setFontSize(config.fonts.heading1)
           doc.setFont(fonts.heading, 'bold') 
           doc.setTextColor(colors.text)
           tocEntries.push({ 
              text: block.text || '', page: currentPageIndex, level: 1 
           })
           contentY = renderFormattedBlock(ctx, block.segments, block.text, X_POS, MAX_W, config.fonts.heading1, colors.text)
           contentY += 3
           break
           
        case 'heading2':
           doc.setFontSize(config.fonts.heading2)
           doc.setFont(fonts.heading, 'bold')
           tocEntries.push({ 
              text: block.text || '', page: currentPageIndex, level: 2 
           })
           contentY = renderFormattedBlock(ctx, block.segments, block.text, X_POS, MAX_W, config.fonts.heading2, colors.text)
           contentY += 2
           break
           
        case 'paragraph':
           doc.setFontSize(config.fonts.body)
           contentY = renderFormattedBlock(ctx, block.segments, block.text, X_POS, MAX_W, config.fonts.body, colors.text)
           contentY += 4
           break
           
        case 'blockquote':
           // Use built-in border support with cleaner indentation
           const INDENT = 8 
           const BLOCK_Start = X_POS + INDENT
           
           contentY = renderFormattedBlock(
               ctx, 
               block.segments, 
               block.text, 
               BLOCK_Start, 
               MAX_W - INDENT, 
               config.fonts.body, 
               colors.secondary,
               { borderLeftColor: colors.accent }
           )
           contentY += 6
           break
           
        case 'list-item-unordered':
           doc.text('•', X_POS, contentY)
           contentY = renderFormattedBlock(ctx, block.segments, block.text, X_POS + 6, MAX_W - 6, config.fonts.body, colors.text)
           contentY += 2
           break
        
        case 'list-item-ordered':
           doc.text('-', X_POS, contentY)
           contentY = renderFormattedBlock(ctx, block.segments, block.text, X_POS + 6, MAX_W - 6, config.fonts.body, colors.text)
           contentY += 2
           break

        case 'image':
           contentY = renderImageBlock(ctx, block, X_POS, MAX_W)
           break

        case 'video':
           contentY = renderVideoBlock(ctx, block, X_POS, MAX_W)
           break

        case 'embed-tweet':
           contentY = renderTweetBlock(ctx, block, X_POS, MAX_W)
           break

        case 'code-block':
           contentY = renderCodeBlock(ctx, block, X_POS, MAX_W, isDark)
           break
     }
  }

  // --- 3. TOC Page Injection and Post-Processing ---
  tocEntries.push({ 
      text: 'NOTES', 
      page: currentPageIndex + 1, 
      level: 1 
  })

  // Calculate TOC pages
  const ENTRY_HEIGHT = 12
  const TOC_TITLE_HEIGHT = 40
  const AVAILABLE_HEIGHT = config.pageHeight - 2 * config.margin
  const totalTocHeight = TOC_TITLE_HEIGHT + (tocEntries.length * ENTRY_HEIGHT)
  const tocPagesCount = Math.ceil(totalTocHeight / AVAILABLE_HEIGHT) || 1
  
  // Insert Pages at position 2
  for (let i = 0; i < tocPagesCount; i++) {
      doc.insertPage(2 + i)
      doc.setPage(2 + i)
      doc.setFillColor(colors.bg)
      doc.rect(0, 0, config.pageWidth, config.pageHeight, 'F')
  }

  onProgress?.('Generating Table of Contents...')
  generateTOC(doc, tocEntries, config, colors, fonts, tocPagesCount)

  // --- 4. Page Finalization (Footers/Sidebars) ---
  onProgress?.('Finalizing Pages...')
  finalizeStandardPages(doc, metadata, config, colors, fonts, isDark)
  
  // --- 5. Notes Page ---
  onProgress?.('Generating Notes Page...')
  generateNotesPage(doc, config, colors, fonts)

  // Save
  onProgress?.('Saving PDF...')
  const filename = `${sanitizeText(metadata.author.toUpperCase())} - ${sanitizeText(metadata.title)}.pdf`
  doc.save(filename)
}
