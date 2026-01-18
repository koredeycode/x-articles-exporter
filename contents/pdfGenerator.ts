// PDF Generator for X Articles Exporter
// Creates professional PDFs with title page, TOC, and formatted content

import DOMPurify from 'dompurify'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Extend jsPDF type for autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: { finalY: number }
  }
}

// Settings interface matching popup
export interface Settings {
  theme: 'light' | 'dark'
  pageSize: 'a4' | 'letter'
  font: 'serif' | 'serif'
}

interface ArticleMetadata {
  title: string
  author: string
  handle: string
  date: string
  url: string
}

export interface TextSegment {
  text: string
  isBold?: boolean
  isItalic?: boolean
  link?: string
}

export interface ContentBlock {
  type: 'heading1' | 'heading2' | 'paragraph' | 'blockquote' | 'list-item-unordered' | 'list-item-ordered' | 'image'
  text?: string
  segments?: TextSegment[]
  src?: string
}

// PDF Constants
const PDF_CONFIG = {
  pageWidth: 210, 
  pageHeight: 297,
  margin: 20,
  sidebarWidth: 35, // Width of the colored sidebar
  contentStart: 50, // Start X for content (35 sidebar + 15 padding)
  get contentWidth() { return this.pageWidth - this.contentStart - this.margin },
  lineHeight: 7,
  fonts: {
    title: 24,
    heading1: 18,
    heading2: 14,
    body: 11,
    caption: 9
  },
  themes: {
    light: {
      primary: '#1DA1F2',
      text: '#0F1419',
      secondary: '#536471',
      accent: '#1D9BF0',
      background: '#FFFFFF',
      sidebar: '#F7F9F9', // Light gray sidebar for light mode
      blockquoteBorder: '#1DA1F2'
    },
    dark: {
      primary: '#1DA1F2',
      text: '#E7E9EA',
      secondary: '#71767B',
      accent: '#1D9BF0',
      background: '#000000',
      sidebar: '#16181C', // Dark gray sidebar for dark mode
      blockquoteBorder: '#1DA1F2'
    }
  }
}

// Sanitize text for PDF
function sanitizeText(text: string): string {
  const cleaned = DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
  return cleaned.trim()
}

// Split text
function splitTextToWidth(doc: jsPDF, text: string, maxWidth: number, fontSize: number): string[] {
  doc.setFontSize(fontSize)
  return doc.splitTextToSize(text, maxWidth)
}

// Generate PDF
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
  
  onProgress?.('Preparing PDF...')

  const articleCover = content.coverImage // simplified
  const isDark = settings.theme === 'dark'
  const isSerif = settings.font === 'serif'

  // Font Selection
  const fonts = {
    title: isSerif ? 'times' : 'helvetica',
    body: isSerif ? 'times' : 'helvetica', 
    heading: isSerif ? 'times' : 'helvetica', 
    ui: 'helvetica' // Keep UI elements (badges, author labels) in Sans for readability/style
  }
  
  // Custom Color Palette for Sidebar Design
  const colors = isDark ? {
    bg: '#000000',
    sidebar: '#16181C', 
    text: '#E7E9EA',
    secondary: '#71767B',
    accent: '#1D9BF0',
    border: '#38444D'
  } : {
    bg: '#FFFFFF',
    sidebar: '#2C3E50', // Dark Slate Blue for Light Mode Sidebar
    text: '#0F1419',
    secondary: '#536471',
    accent: '#1D9BF0',
    border: '#CFD9DE'
  }

  // Override for specific design look
  if (!isDark) {
      colors.sidebar = '#34495E' 
  }

  // --- 1. Title Page (Custom Design) ---
  onProgress?.('Generating Title Page...')
  // Background Color for Title Page
  doc.setFillColor(colors.sidebar)
  doc.rect(0, 0, PDF_CONFIG.pageWidth, PDF_CONFIG.pageHeight, 'F')
  
  const TITLE_START_X = PDF_CONFIG.margin + 10
  let currentY = PDF_CONFIG.margin + 30
  
  const titlePageTextMain = '#FFFFFF'
  const titlePageTextSecondary = '#E5E7EB' 
  
  // 1. Author Name
  doc.setFont(fonts.ui, 'normal') 
  doc.setFontSize(11)
  doc.setTextColor(titlePageTextSecondary)
  doc.text(metadata.author.toUpperCase(), TITLE_START_X, currentY, { charSpace: 1.5 })
  currentY += 15
  
  // 2. Title with Accent Bar
  doc.setFont(fonts.title, 'bold')
  const titleFontSize = 42
  doc.setFontSize(titleFontSize)
  doc.setTextColor(titlePageTextMain)
  
  const TITLE_X_OFFSET = 12
  const MAX_TITLE_WIDTH = PDF_CONFIG.pageWidth - TITLE_START_X - 10 - TITLE_X_OFFSET
  const titleLines = doc.splitTextToSize(metadata.title.toUpperCase(), MAX_TITLE_WIDTH)
  const titleBlockHeight = titleLines.length * (titleFontSize * 0.3527 * 1.15)
  
  // Accent Bar
  doc.setFillColor(colors.accent)
  doc.rect(TITLE_START_X, currentY - 8, 4, titleBlockHeight + 2, 'F') 
  doc.text(titleLines, TITLE_START_X + TITLE_X_OFFSET, currentY)
  
  currentY += titleBlockHeight + 20
  
  // 3. Cover Image 
  if (articleCover) {
     try {
        const imgProps = doc.getImageProperties(articleCover)
        const imgRatio = imgProps.height / imgProps.width
        const imgWidth = PDF_CONFIG.pageWidth 
        const imgHeight = imgWidth * imgRatio
        
        doc.addImage(articleCover, 'JPEG', 0, currentY, imgWidth, imgHeight)
        
        currentY += imgHeight + 20
     } catch (e) {
        console.warn('Cover image error', e)
     }
  }
  
  // 4. Metadata
  let metaY = PDF_CONFIG.pageHeight - 60
  if (currentY > metaY) metaY = currentY + 10
  
  doc.setFont(fonts.ui, 'bold')
  doc.setFontSize(9)
  doc.setTextColor(titlePageTextSecondary)
  
  if (metadata.date) {
    doc.text(`PUBLISHED: ${metadata.date.toUpperCase()}`, TITLE_START_X, metaY)
    metaY += 6
  }
  if (metadata.handle) {
      doc.text(metadata.handle, TITLE_START_X, metaY)
      metaY += 6
  }
  
  // URL Link
  metaY += 4
  doc.setFontSize(9)
  doc.setTextColor(colors.accent)
  doc.textWithLink('Read on X', TITLE_START_X, metaY, { url: metadata.url })

  // 5. Badge Footer (Linked)
  const badgeTextMain = "PDF GENERATED BY X-ARTICLE-EXPORTER | BUILT BY "
  const badgeHandle = "@KORECODES"
  const fullBadgeText = badgeTextMain + badgeHandle
  
  doc.setFontSize(7)
  doc.setFont(fonts.ui, 'bold')
  const fWidth = doc.getTextWidth(fullBadgeText) + 12
  const fHeight = 8
  const fX = PDF_CONFIG.pageWidth - fWidth - 10
  const fY = PDF_CONFIG.pageHeight - fHeight - 10
  
  doc.setDrawColor(titlePageTextSecondary)
  doc.setLineWidth(0.3)
  doc.rect(fX, fY, fWidth, fHeight) 
  
  doc.setTextColor(titlePageTextSecondary)
  doc.text(badgeTextMain, fX + 6, fY + 5.5)
  
  const mainTextWidth = doc.getTextWidth(badgeTextMain)
  doc.setTextColor(colors.accent)
  doc.text(badgeHandle, fX + 6 + mainTextWidth, fY + 5.5)
  
  doc.link(fX, fY, fWidth, fHeight, { url: 'https://x.com/korecodes' })

  // --- 2. Content Generation ---
  onProgress?.('Formatting Content...')
  doc.addPage()
  doc.setFillColor(colors.bg)
  doc.rect(0, 0, PDF_CONFIG.pageWidth, PDF_CONFIG.pageHeight, 'F')
  
  let currentPageIndex = 2
  
  let contentY = PDF_CONFIG.margin
  
  const tocEntries: { text: string, page: number, level: number }[] = []
  
  // Render Helper
  const renderFormattedBlock = (
     targetDoc: jsPDF,
     segments: TextSegment[] | undefined, 
     text: string | undefined,
     startX: number, 
     startY: number, 
     maxWidth: number,
     fontSize: number,
     baseColor: string
  ): number => {
      // Helper to add new content page with BG
      const checkAndAddPage = (currentY: number) => {
          if (currentY > PDF_CONFIG.pageHeight - PDF_CONFIG.margin - 10) { 
              targetDoc.addPage()
              currentPageIndex++
              if (targetDoc === doc) {
                  targetDoc.setFillColor(colors.bg)
                  targetDoc.rect(0, 0, PDF_CONFIG.pageWidth, PDF_CONFIG.pageHeight, 'F')
              }
              return PDF_CONFIG.margin
          }
          return currentY
      }

      if (!segments || segments.length === 0) {
          if (!text) return startY
          targetDoc.setTextColor(baseColor)
          targetDoc.setFont(fonts.body, 'normal') 
          const lines = splitTextToWidth(targetDoc, text, maxWidth, fontSize)
          
          let curY = startY
          const lh = fontSize * 0.3527 * 1.5
          
          for (const line of lines) {
              const nextY = curY + lh
              // Proper Re-implementation of Add Page Logic inline
              if (curY + lh > PDF_CONFIG.pageHeight - PDF_CONFIG.margin - 10) {
                  targetDoc.addPage()
                  currentPageIndex++
                  if (targetDoc === doc) {
                      targetDoc.setFillColor(colors.bg)
                      targetDoc.rect(0, 0, PDF_CONFIG.pageWidth, PDF_CONFIG.pageHeight, 'F')
                  }
                  curY = PDF_CONFIG.margin
              }
              
              targetDoc.text(line, startX, curY)
              curY += lh
          }
          return curY
      }
      
      let cursorX = startX
      let cursorY = startY
      const lineHeight = fontSize * 0.3527 * 1.5
      
      for (const seg of segments) {
         let fontStyle = 'normal'
         if (seg.isBold && seg.isItalic) fontStyle = 'bolditalic'
         else if (seg.isBold) fontStyle = 'bold'
         else if (seg.isItalic) fontStyle = 'italic'
         
         targetDoc.setFont(fonts.body, fontStyle)
         targetDoc.setFontSize(fontSize)
         if (seg.link) targetDoc.setTextColor(colors.accent)
         else targetDoc.setTextColor(baseColor)
         
         const words = seg.text.split(/(\s+)/)
         for (const word of words) {
            const wordWidth = targetDoc.getTextWidth(word)
            if (cursorX + wordWidth > startX + maxWidth) {
               cursorX = startX
               cursorY += lineHeight
               if (cursorY > PDF_CONFIG.pageHeight - PDF_CONFIG.margin - 10) {
                   targetDoc.addPage()
                   currentPageIndex++
                   if (targetDoc === doc) {
                       targetDoc.setFillColor(colors.bg)
                       targetDoc.rect(0, 0, PDF_CONFIG.pageWidth, PDF_CONFIG.pageHeight, 'F')
                   }
                   cursorY = PDF_CONFIG.margin
               }
            }
            if (seg.link) targetDoc.textWithLink(word, cursorX, cursorY, { url: seg.link })
            else targetDoc.text(word, cursorX, cursorY)
            cursorX += wordWidth
         }
      }
      return cursorY + lineHeight
  }

  // Iterate Blocks
  let blockIndex = 0
  for (const block of content.content) {
     blockIndex++
     if (blockIndex % 5 === 0) {
        onProgress?.(`Processing Block ${blockIndex}/${content.content.length}...`)
     }

     if (contentY > PDF_CONFIG.pageHeight - PDF_CONFIG.margin - 10) {
        doc.addPage()
        currentPageIndex++
        doc.setFillColor(colors.bg)
        doc.rect(0, 0, PDF_CONFIG.pageWidth, PDF_CONFIG.pageHeight, 'F')
        contentY = PDF_CONFIG.margin
     }
     
     const X_POS = PDF_CONFIG.contentStart
     const MAX_W = PDF_CONFIG.contentWidth
     
     switch (block.type) {
        case 'heading1':
           doc.setFontSize(PDF_CONFIG.fonts.heading1)
           doc.setFont(fonts.heading, 'bold') 
           doc.setTextColor(colors.text)
           tocEntries.push({ 
              text: block.text || '', page: currentPageIndex, level: 1 
           })
           contentY = renderFormattedBlock(doc, block.segments, block.text, X_POS, contentY, MAX_W, PDF_CONFIG.fonts.heading1, colors.text)
           contentY += 3
           break
           
        case 'heading2':
           doc.setFontSize(PDF_CONFIG.fonts.heading2)
           doc.setFont(fonts.heading, 'bold')
           tocEntries.push({ 
              text: block.text || '', page: currentPageIndex, level: 2 
           })
           contentY = renderFormattedBlock(doc, block.segments, block.text, X_POS, contentY, MAX_W, PDF_CONFIG.fonts.heading2, colors.text)
           contentY += 2
           break
           
        case 'paragraph':
           doc.setFontSize(PDF_CONFIG.fonts.body)
           contentY = renderFormattedBlock(doc, block.segments, block.text, X_POS, contentY, MAX_W, PDF_CONFIG.fonts.body, colors.text)
           contentY += 4
           break
           
        case 'blockquote':
           doc.setDrawColor(colors.accent)
           doc.setLineWidth(1)
           
           const tempDoc = new jsPDF({ unit: 'mm', format: settings.pageSize }) as any
           const tempY = renderFormattedBlock(tempDoc, block.segments, block.text, X_POS + 5, contentY, MAX_W - 10, PDF_CONFIG.fonts.body, colors.secondary)
           const h = tempY - contentY
           
           doc.line(X_POS, contentY - 2, X_POS, contentY + h)
           contentY = renderFormattedBlock(doc, block.segments, block.text, X_POS + 5, contentY, MAX_W - 10, PDF_CONFIG.fonts.body, colors.secondary)
           contentY += 6
           break
           
        case 'list-item-unordered':
           doc.text('•', X_POS, contentY)
           contentY = renderFormattedBlock(doc, block.segments, block.text, X_POS + 6, contentY, MAX_W - 6, PDF_CONFIG.fonts.body, colors.text)
           contentY += 2
           break
        
        case 'list-item-ordered':
           doc.text('-', X_POS, contentY)
           contentY = renderFormattedBlock(doc, block.segments, block.text, X_POS + 6, contentY, MAX_W - 6, PDF_CONFIG.fonts.body, colors.text)
           contentY += 2
           break
           
        case 'image':
           if (block.src) {
               try {
                  const maxH = 120
                  if (contentY + 50 > PDF_CONFIG.pageHeight - PDF_CONFIG.margin) {
                      doc.addPage()
                      currentPageIndex++
                      doc.setFillColor(colors.bg)
                      doc.rect(0, 0, PDF_CONFIG.pageWidth, PDF_CONFIG.pageHeight, 'F')
                      contentY = PDF_CONFIG.margin
                  }
                  
                  const props = doc.getImageProperties(block.src)
                  const ratio = props.height / props.width
                  let w = MAX_W
                  let h = w * ratio
                  if (h > maxH) { h = maxH; w = h / ratio; }
                  
                  doc.addImage(block.src, 'JPEG', X_POS, contentY, w, h)
                  contentY += h + 10
              } catch (e) {}
           }
           break
     }
  }

  // --- 3. TOC Page Injection and Post-Processing ---
  onProgress?.('Generating Table of Contents...')
  const ITEMS_PER_PAGE_TOC = 20 // Approx safety limit
  const ENTRY_HEIGHT = 12
  const TOC_TITLE_HEIGHT = 40
  const AVAILABLE_HEIGHT = PDF_CONFIG.pageHeight - 2 * PDF_CONFIG.margin
  
  const totalTocHeight = TOC_TITLE_HEIGHT + (tocEntries.length * ENTRY_HEIGHT)
  const tocPagesCount = Math.ceil(totalTocHeight / AVAILABLE_HEIGHT) || 1
  
  // Insert Pages at position 2
  for (let i = 0; i < tocPagesCount; i++) {
      doc.insertPage(2 + i)
      doc.setPage(2 + i)
      doc.setFillColor(colors.bg)
      doc.rect(0, 0, PDF_CONFIG.pageWidth, PDF_CONFIG.pageHeight, 'F')
  }

  // --- 4. Content Page Number Fix via Post-Loop ---
  onProgress?.('Finalizing Pages...')
  const totalPages = doc.getNumberOfPages()
  
  // Apply Sidebar and Page Numbers to ALL Standard Pages (TOC + Content)
  // Skip Page 1 (Title)
  for (let p = 2; p <= totalPages; p++) {
      doc.setPage(p)
      // Draw Sidebar
      doc.setFillColor(colors.sidebar)
      doc.rect(0, 0, PDF_CONFIG.sidebarWidth, PDF_CONFIG.pageHeight, 'F')
      
      // Footer Line
      doc.setDrawColor(colors.secondary)
      doc.setLineWidth(0.5)
      doc.line(
         PDF_CONFIG.contentStart, 
         PDF_CONFIG.pageHeight - 20, 
         PDF_CONFIG.pageWidth - PDF_CONFIG.margin, 
         PDF_CONFIG.pageHeight - 20
      )
      
      // Footer Title
      doc.setFont(fonts.ui, 'italic')
      doc.setFontSize(9)
      doc.setTextColor(colors.secondary)
      
      const footerTitle = metadata.title.length > 50 ? metadata.title.substring(0, 50) + '...' : metadata.title
      doc.text(
         footerTitle, 
         PDF_CONFIG.pageWidth - PDF_CONFIG.margin, 
         PDF_CONFIG.pageHeight - 15, 
         { align: 'right' }
      )
      
      // Page Number
      doc.setFont(fonts.ui, 'bold')
      doc.setFontSize(12)
      doc.setTextColor(isDark ? '#FFFFFF' : '#FFFFFF') 
      doc.text(`${p}`, PDF_CONFIG.sidebarWidth / 2, PDF_CONFIG.pageHeight - 15, { align: 'center' })
  }
  
  // --- 5. Render TOC Content ---
  let currentTocPage = 0
  let tocY = PDF_CONFIG.margin + 10
  
  doc.setPage(2)
  // TOC Title
  doc.setFont(fonts.title, 'normal')
  doc.setFontSize(32)
  doc.setTextColor(colors.text)
  doc.text('TABLE OF CONTENTS', PDF_CONFIG.contentStart, tocY)
  tocY += 25
  
  doc.setFont(fonts.body, 'normal')
  doc.setFontSize(12)
  
  tocEntries.forEach((entry, i) => {
      // Check for page break within TOC pages
      if (tocY > PDF_CONFIG.pageHeight - PDF_CONFIG.margin - 20) {
          currentTocPage++
          // Switch to naturally next page (which we already inserted)
          const nextPageIndex = 2 + currentTocPage
          if (nextPageIndex <= 1 + tocPagesCount) {
             doc.setPage(nextPageIndex)
             tocY = PDF_CONFIG.margin + 20
          }
      }
      
      const roman = (num: number) => {
         const lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1}
         let str = '', q = num
         for (let i in lookup) {
             while (q >= lookup[i]) { str += i; q -= lookup[i] }
         }
         return str
      }
      
      const prefix = entry.level === 1 ? `${roman(i+1).padEnd(5)}` : '  '
      const title = entry.text.length > 55 ? entry.text.substring(0, 55) + '...' : entry.text
      
      const targetPageNum = entry.page + tocPagesCount
      
      const ROW_Y = tocY
      
      doc.setTextColor(colors.text)
      doc.setFont(fonts.body, 'normal')
      doc.text(prefix, PDF_CONFIG.contentStart, ROW_Y)
      
      const titleX = PDF_CONFIG.contentStart + 15
      
      doc.setTextColor(colors.accent)
      doc.setFont(fonts.body, 'bold')
      doc.text(title, titleX, ROW_Y)
      
      const textWidth = doc.getTextWidth(title)
      doc.setDrawColor(colors.accent)
      doc.setLineWidth(0.3)
      doc.line(titleX, ROW_Y + 1, titleX + textWidth, ROW_Y + 1)
      
      doc.setTextColor(colors.text)
      doc.setFont(fonts.body, 'normal')
      doc.text(
         `${targetPageNum}`, 
         PDF_CONFIG.pageWidth - PDF_CONFIG.margin, 
         ROW_Y, 
         { align: 'right' }
      )
      
      doc.link(PDF_CONFIG.contentStart, ROW_Y - 5, 140, 10, { pageNumber: targetPageNum })
      tocY += 12
  })
  
  // Save
  onProgress?.('Saving PDF...')
  const filename = `${sanitizeText(metadata.author.toUpperCase())} - ${sanitizeText(metadata.title)}.pdf`
  doc.save(filename)
}

