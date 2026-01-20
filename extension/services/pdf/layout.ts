import jsPDF from 'jspdf'
import type { ArticleMetadata } from '../../lib/types'
import type { ThemeColors } from './config'

// --- TITLE PAGE DISPATCHER ---
export const generateTitlePage = (
    doc: jsPDF,
    metadata: ArticleMetadata,
    coverImage: string | null,
    config: any, // Merged config
    colors: ThemeColors,
    fonts: any
): number => {
    // Dispatch based on layout flag
    const layoutStyle = config.layout?.titlePage || 'classic'

    switch (layoutStyle) {
        case 'modern':
            return renderTitlePageModern(doc, metadata, coverImage, config, colors, fonts)
        case 'formal':
            return renderTitlePageAcademic(doc, metadata, coverImage, config, colors, fonts)
        case 'technical':
            return renderTitlePageTechnical(doc, metadata, coverImage, config, colors, fonts)
        case 'classic':
        default:
            return renderTitlePageStandard(doc, metadata, coverImage, config, colors, fonts)
    }
}

// --- 1. STANDARD / CLASSIC LAYOUT (Sidebar + Accent) ---
const renderTitlePageStandard = (
    doc: jsPDF,
    metadata: ArticleMetadata,
    coverImage: string | null,
    config: any,
    colors: ThemeColors,
    fonts: any
): number => {
  // Background
  doc.setFillColor(config.showSidebar ? colors.sidebar : colors.bg)
  doc.rect(0, 0, config.pageWidth, config.pageHeight, 'F')
  
  const TITLE_START_X = config.margin + 10
  let currentY = config.margin + 30
  
  // Use high contrast for Standard (Sidebar dark/light) vs simple background
  const titlePageTextSecondary = config.showSidebar ? '#E5E7EB' : colors.secondary
  const titlePageTextMain = config.showSidebar ? '#FFFFFF' : colors.text
  
  // Author
  doc.setFont(fonts.ui, 'normal') 
  doc.setFontSize(11)
  doc.setTextColor(titlePageTextSecondary)
  doc.text(metadata.author.toUpperCase(), TITLE_START_X, currentY, { charSpace: 1.5 })
  currentY += 15
  
  // Title
  doc.setFont(fonts.title, 'bold')
  const titleFontSize = metadata.title.length > 80 ? 32 : 42
  doc.setFontSize(titleFontSize)
  doc.setTextColor(titlePageTextMain)
  
  const TITLE_X_OFFSET = 12
  const MAX_TITLE_WIDTH = config.pageWidth - TITLE_START_X - 10 - TITLE_X_OFFSET
  const titleLines = doc.splitTextToSize(metadata.title.toUpperCase(), MAX_TITLE_WIDTH)
  const titleBlockHeight = titleLines.length * (titleFontSize * 0.3527 * 1.15)
  
  // Accent Bar
  doc.setFillColor(colors.accent)
  doc.rect(TITLE_START_X, currentY - 8, 4, titleBlockHeight + 2, 'F') 
  doc.text(titleLines, TITLE_START_X + TITLE_X_OFFSET, currentY)
  
  currentY += titleBlockHeight + 20
  
  // Cover Image
  if (coverImage) {
     currentY = renderCoverImage(doc, coverImage, currentY, config.pageWidth, config)
     currentY += 20
  }
  
  // Metadata & Footer
  renderStandardMetadataAndFooter(doc, metadata, config, colors, fonts, TITLE_START_X, currentY, titlePageTextSecondary)
  
  return currentY
}

// --- 2. MODERN / MAGAZINE LAYOUT (Centered, Hero Image) ---
const renderTitlePageModern = (
    doc: jsPDF,
    metadata: ArticleMetadata,
    coverImage: string | null,
    config: any,
    colors: ThemeColors,
    fonts: any
): number => {
    // Clean Background
    doc.setFillColor(colors.bg)
    doc.rect(0, 0, config.pageWidth, config.pageHeight, 'F')
    
    let currentY = config.margin + 10

    // SUPER HEADER
    doc.setFont(fonts.ui, 'bold')
    doc.setFontSize(10)
    doc.setTextColor(colors.accent)
    doc.text(metadata.author.toUpperCase(), config.pageWidth / 2, currentY, { align: 'center', charSpace: 2 })
    currentY += 20

    // MASSIVE CENTERED TITLE
    doc.setFont(fonts.title, 'bold')
    const titleFontSize = metadata.title.length > 60 ? 42 : 54
    doc.setFontSize(titleFontSize)
    doc.setTextColor(colors.text)

    const MAX_WIDTH = config.pageWidth - (config.margin * 2)
    const titleLines = doc.splitTextToSize(metadata.title, MAX_WIDTH)
    const titleHeight = titleLines.length * (titleFontSize * 0.3528 * 1.1)
    
    doc.text(titleLines, config.pageWidth / 2, currentY, { align: 'center' })
    currentY += titleHeight + 10

    // Date
    if (metadata.date) {
        doc.setFont(fonts.ui, 'normal')
        doc.setFontSize(11)
        doc.setTextColor(colors.secondary)
        doc.text(metadata.date.toUpperCase(), config.pageWidth / 2, currentY, { align: 'center' })
        currentY += 20
    }

    // Full Width Hero Image
    if (coverImage) {
        try {
            const imgProps = doc.getImageProperties(coverImage)
            const imgRatio = imgProps.height / imgProps.width
            const imgH = config.pageWidth * imgRatio
            doc.addImage(coverImage, 'JPEG', 0, currentY, config.pageWidth, imgH)
            
            // Add a subtle gradient overlay or border if possible, essentially just space
            currentY += imgH + 20
        } catch (e) {}
    } else {
        // Fallback divider if no image
        doc.setDrawColor(colors.border)
        doc.setLineWidth(0.5)
        doc.line(config.margin, currentY, config.pageWidth - config.margin, currentY)
        currentY += 20
    }
    
    // Bottom Branding
    renderSimpleFooter(doc, config, colors, fonts)
    
    return currentY
}

// --- 3. ACADEMIC / FORMAL LAYOUT (Serif, Rules) ---
const renderTitlePageAcademic = (
    doc: jsPDF,
    metadata: ArticleMetadata,
    coverImage: string | null,
    config: any,
    colors: ThemeColors,
    fonts: any
): number => {
    doc.setFillColor(colors.bg)
    doc.rect(0, 0, config.pageWidth, config.pageHeight, 'F')
    
    let currentY = config.margin + 15
    
    // Top Double Rule
    doc.setDrawColor(colors.text)
    doc.setLineWidth(1)
    doc.line(config.margin, currentY, config.pageWidth - config.margin, currentY)
    currentY += 2
    doc.setLineWidth(0.3)
    doc.line(config.margin, currentY, config.pageWidth - config.margin, currentY)
    currentY += 15
    
    // Title (Serif, Left Aligned)
    doc.setFont(fonts.title, 'bold')
    doc.setFontSize(28)
    doc.setTextColor(colors.text)
    
    const titleLines = doc.splitTextToSize(metadata.title, config.pageWidth - (config.margin * 2))
    const lineHeight = 28 * 0.3527 * 1.2 // pt to mm * factor
    const titleBlockHeight = titleLines.length * lineHeight
    
    doc.text(titleLines, config.margin, currentY)
    currentY += titleBlockHeight + 15
    
    // Author Block
    doc.setFont(fonts.body, 'italic')
    doc.setFontSize(14)
    doc.text(`By ${metadata.author}`, config.margin, currentY)
    currentY += 8
    
    if (metadata.handle) {
        doc.setFontSize(11)
        doc.setTextColor(colors.secondary)
        doc.text(metadata.handle, config.margin, currentY)
        currentY += 15
    }
    
    // Abstract / Meta Block
    doc.setDrawColor(colors.secondary)
    doc.setLineWidth(0.1)
    const boxTop = currentY
    
    doc.setFont(fonts.ui, 'bold')
    doc.setFontSize(10)
    doc.setTextColor(colors.text)
    doc.text('METADATA', config.margin + 5, currentY + 6)
    
    doc.setFont(fonts.ui, 'normal')
    doc.setFontSize(10)
    
    let metaTextY = currentY + 18
    if (metadata.date) {
        doc.text(`Published: ${metadata.date}`, config.margin + 5, metaTextY)
        metaTextY += 6
    }
    doc.text(`Source: X (Twitter)`, config.margin + 5, metaTextY)
    doc.link(config.margin + 5, metaTextY - 3, 50, 5, { url: metadata.url })
    
    doc.rect(config.margin, boxTop, config.pageWidth - (config.margin * 2), metaTextY - boxTop + 10)
    currentY = metaTextY + 30
    
    // Image (Smaller, centered if exists)
    if (coverImage) {
         currentY = renderCoverImage(doc, coverImage, currentY, config.pageWidth - (config.margin * 2), config, config.margin)
         currentY += 10
    }

    renderSimpleFooter(doc, config, colors, fonts)
    return currentY
}

// --- 4. TECHNICAL / TERMINAL LAYOUT (Monospace, Boxy) ---
const renderTitlePageTechnical = (
    doc: jsPDF,
    metadata: ArticleMetadata,
    coverImage: string | null,
    config: any,
    colors: ThemeColors,
    fonts: any
): number => {
    // Matrix Green or just accent color
    const termColor = colors.accent
    
    doc.setFillColor(colors.bg)
    doc.rect(0, 0, config.pageWidth, config.pageHeight, 'F')
    
    let currentY = config.margin + 10
    
    // Terminal Header Bar
    doc.setFillColor(colors.secondary)
    doc.rect(config.margin, currentY, config.pageWidth - (2 * config.margin), 8, 'F')
    
    // Dots
    doc.setFillColor('#FF5F56')
    doc.circle(config.margin + 4, currentY + 4, 1.5, 'F')
    doc.setFillColor('#FFBD2E')
    doc.circle(config.margin + 10, currentY + 4, 1.5, 'F')
    doc.setFillColor('#27C93F')
    doc.circle(config.margin + 16, currentY + 4, 1.5, 'F')
    
    doc.setTextColor('#FFFFFF')
    doc.setFont(fonts.ui, 'bold')
    doc.setFontSize(8)
    doc.text('user@x-exporter: ~', config.margin + 25, currentY + 5.5)
    
    currentY += 20
    
    // Command
    doc.setFont(fonts.title, 'normal') // Courier
    doc.setFontSize(12)
    doc.setTextColor(termColor)
    doc.text(`$ cat "${metadata.title.substring(0,20)}..."`, config.margin, currentY)
    currentY += 15
    
    // Output (Title)
    doc.setFontSize(28)
    doc.setTextColor(colors.text)
    const titleLines = doc.splitTextToSize(metadata.title, config.pageWidth - (2 * config.margin))
    const lineHeight = 28 * 0.3527 * 1.2
    const titleBlockHeight = titleLines.length * lineHeight
    
    doc.text(titleLines, config.margin, currentY)
    currentY += titleBlockHeight + 15
    
    // Metadata Table
    const tableData = [
        ['AUTHOR', metadata.author],
        ['HANDLE', metadata.handle],
        ['DATE', metadata.date],
        ['STATUS', 'EXPORTED']
    ]
    
    doc.setFontSize(10)
    tableData.forEach(([key, val]) => {
        if (!val) return
        doc.setTextColor(colors.secondary)
        doc.text(key.padEnd(10), config.margin, currentY)
        doc.setTextColor(colors.text)
        doc.text(`: ${val}`, config.margin + 25, currentY)
        currentY += 6
    })
    
    currentY += 10
    doc.setDrawColor(colors.border)
    doc.setLineWidth(0.5)
    doc.line(config.margin, currentY, config.pageWidth - config.margin, currentY)
    currentY += 20

    if (coverImage) {
        currentY = renderCoverImage(doc, coverImage, currentY, config.pageWidth - (2 * config.margin), config, config.margin)
        currentY += 10
    }
    
    renderSimpleFooter(doc, config, colors, fonts)
    return currentY
}

// --- HELPER FUNCTIONS ---

const renderCoverImage = (doc: jsPDF, img: string, y: number, w: number, config: any, x: number = 0): number => {
    try {
        const imgProps = doc.getImageProperties(img)
        const ratio = imgProps.height / imgProps.width
        const h = w * ratio
        // If x is 0, imply full width standard logic which might be 0 or config.margin depending on call
        // But here we accept direct X
        doc.addImage(img, 'JPEG', x, y, w, h)
        return y + h
    } catch (e) { return y }
}

const renderSimpleFooter = (doc: jsPDF, config: any, colors: ThemeColors, fonts: any) => {
    const text = "Generated by X Articles Exporter"
    doc.setFont(fonts.ui, 'italic')
    doc.setFontSize(8)
    doc.setTextColor(colors.secondary)
    doc.text(text, config.pageWidth / 2, config.pageHeight - 10, { align: 'center' })
}

const renderStandardMetadataAndFooter = (
    doc: jsPDF, 
    metadata: ArticleMetadata, 
    config: any, 
    colors: ThemeColors, 
    fonts: any,
    x: number,
    y: number,
    color: string
) => {
    let metaY = config.pageHeight - 60
    if (y > metaY) metaY = y + 10
    
    doc.setFont(fonts.ui, 'bold')
    doc.setFontSize(9)
    doc.setTextColor(color)
    
    if (metadata.date) {
        doc.text(`PUBLISHED: ${metadata.date.toUpperCase()}`, x, metaY)
        metaY += 6
    }
    if (metadata.handle) {
        doc.text(metadata.handle, x, metaY)
        metaY += 6
    }
    
    // URL
    metaY += 4
    doc.setFontSize(9)
    doc.setTextColor(colors.accent)
    doc.textWithLink('Read on X', x, metaY, { url: metadata.url })

    // Badge
    const badgeTextMain = "PDF GENERATED BY X-ARTICLE-EXPORTER | BY "
    const badgeHandle = "@KORECODES"
    
    doc.setFontSize(7)
    doc.setFont(fonts.ui, 'bold')
    const fWidth = doc.getTextWidth(badgeTextMain + badgeHandle) + 12
    const fHeight = 8
    const fX = config.pageWidth - fWidth - 10
    const fY = config.pageHeight - fHeight - 10
    
    doc.setFillColor(color)
    doc.roundedRect(fX, fY, fWidth, fHeight, 1, 1, 'F') 
    
    const badgeTextColor = config.showSidebar ? colors.sidebar : colors.bg
    doc.setTextColor(badgeTextColor)
    doc.text(badgeTextMain, fX + 6, fY + 5.5)
    
    const mainTextWidth = doc.getTextWidth(badgeTextMain)
    // doc.setTextColor(colors.accent) // Might clash on standard sidebar
    doc.text(badgeHandle, fX + 6 + mainTextWidth, fY + 5.5)
    
    doc.link(fX, fY, fWidth, fHeight, { url: 'https://x.com/korecodes' })
}


// --- PAGE FINALIZATION (Footers / Headers) ---

export const finalizePages = (
    doc: jsPDF,
    metadata: ArticleMetadata,
    config: any,
    colors: ThemeColors,
    fonts: any,
    isDark: boolean
) => {
    const footerStyle = config.layout?.footer || 'detailed'
    
    switch (footerStyle) {
        case 'minimal':
            finalizePagesMinimal(doc, metadata, config, colors, fonts)
            break
        case 'simple':
            finalizePagesSimple(doc, metadata, config, colors, fonts)
            break
        case 'detailed':
        default:
            finalizePagesDetailed(doc, metadata, config, colors, fonts, isDark)
            break
    }
}

const finalizePagesDetailed = (
    doc: jsPDF,
    metadata: ArticleMetadata,
    config: any,
    colors: ThemeColors,
    fonts: any,
    isDark: boolean
) => {
    const totalPages = doc.getNumberOfPages()
  
    // Skip Page 1 (Title)
    for (let p = 2; p <= totalPages; p++) {
        doc.setPage(p)
        
        // Draw Sidebar only if enabled
        if (config.showSidebar) {
            doc.setFillColor(colors.sidebar)
            doc.rect(0, 0, config.sidebarWidth, config.pageHeight, 'F')
        }
        
        // Footer Line
        doc.setDrawColor(colors.secondary)
        doc.setLineWidth(0.5)
        doc.line(
           config.contentStart, 
           config.pageHeight - 20, 
           config.pageWidth - config.margin, 
           config.pageHeight - 20
        )
        
        // Footer Title
        doc.setFont(fonts.ui, 'italic')
        doc.setFontSize(9)
        doc.setTextColor(colors.secondary)
        
        const footerTitle = metadata.title.length > 50 ? metadata.title.substring(0, 50) + '...' : metadata.title
        doc.text(
           footerTitle, 
           config.pageWidth - config.margin, 
           config.pageHeight - 15, 
           { align: 'right' }
        )
        
        // Page Number
        doc.setFont(fonts.ui, 'bold')
        doc.setFontSize(12)
        // If sidebar is shown, page num is in sidebar (white text usually)
        // If no sidebar, page num is dark
        const pageNumColor = config.showSidebar ? '#FFFFFF' : colors.text
        doc.setTextColor(pageNumColor) 
        
        const pageNumX = config.showSidebar ? config.sidebarWidth / 2 : config.margin
        doc.text(`${p}`, pageNumX, config.pageHeight - 15, { align: config.showSidebar ? 'center' : 'left' })
    }
}

const finalizePagesSimple = (
    doc: jsPDF,
    metadata: ArticleMetadata,
    config: any,
    colors: ThemeColors,
    fonts: any
) => {
    const totalPages = doc.getNumberOfPages()
    for (let p = 2; p <= totalPages; p++) {
        doc.setPage(p)
        
        // Simple Top Rule for Academic/Classic feel
        if (config.layout?.useHorizontalRules) {
             doc.setDrawColor(colors.text)
             doc.setLineWidth(0.5)
             doc.line(config.margin, config.margin, config.pageWidth - config.margin, config.margin)
             
             // Tiny header info
             doc.setFont(fonts.ui, 'normal')
             doc.setFontSize(8)
             doc.setTextColor(colors.secondary)
             doc.text(metadata.title, config.margin, config.margin - 2)
             doc.text(`${p}`, config.pageWidth - config.margin, config.margin - 2, { align: 'right' })
             doc.text(`${p}`, config.pageWidth - config.margin, config.margin - 2, { align: 'right' })
        }
        
        // Just simple bottom page number with branding
        doc.setFont(fonts.ui, 'normal')
        doc.setFontSize(8)
        doc.setTextColor(colors.secondary)
        const footerText = `Generated by X-Article-Exporter | By @korecodes`
        doc.text(footerText, config.pageWidth / 2, config.pageHeight - 10, { align: 'center' })
        doc.text(`${p}`, config.pageWidth - config.margin, config.pageHeight - 10, { align: 'right' })
    }
}

const finalizePagesMinimal = (
    doc: jsPDF,
    metadata: ArticleMetadata,
    config: any,
    colors: ThemeColors,
    fonts: any
) => {
    const totalPages = doc.getNumberOfPages()
    for (let p = 2; p <= totalPages; p++) {
        doc.setPage(p)
        // Very subtle page number bottom right
        doc.setFont(fonts.ui, 'normal')
        doc.setFontSize(8)
        doc.setTextColor(colors.border) // Very faint
        const footerText = `Generated by X-Article-Exporter | By @korecodes`
        doc.text(footerText, config.pageWidth / 2, config.pageHeight - 10, { align: 'center' })
        doc.text(`${p} / ${totalPages}`, config.pageWidth - config.margin, config.pageHeight - 10, { align: 'right' })
    }
}

export const generateTOC = (
    doc: jsPDF,
    tocEntries: { text: string, page: number, level: number }[],
    config: any,
    colors: ThemeColors,
    fonts: any,
    tocPagesCount: number
) => {
    let currentTocPage = 0
    let tocY = config.margin + 10
    
    doc.setPage(2)
    // TOC Title
    doc.setFont(fonts.title, 'normal')
    doc.setFontSize(32)
    doc.setTextColor(colors.text)
    doc.text('TABLE OF CONTENTS', config.contentStart, tocY)
    tocY += 25
    
    doc.setFont(fonts.body, 'normal')
    doc.setFontSize(12)
    
    tocEntries.forEach((entry, i) => {
        // Check for page break within TOC pages
        if (tocY > config.pageHeight - config.margin - 20) {
            currentTocPage++
            // Switch to naturally next page (which we already inserted)
            const nextPageIndex = 2 + currentTocPage
            if (nextPageIndex <= 1 + tocPagesCount) {
               doc.setPage(nextPageIndex)
               tocY = config.margin + 20
            }
        }
        
        const roman = (num: number) => {
           const lookup: any = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1}
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
        doc.text(prefix, config.contentStart, ROW_Y)
        
        const titleX = config.contentStart + 15
        
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
           config.pageWidth - config.margin, 
           ROW_Y, 
           { align: 'right' }
        )
        
        doc.link(config.contentStart, ROW_Y - 5, 140, 10, { pageNumber: targetPageNum })
        tocY += 12
    })
}

export const generateNotesPage = (
    doc: jsPDF,
    config: any,
    colors: ThemeColors,
    fonts: any
) => {
  doc.addPage()
  doc.setFillColor(colors.bg)
  doc.rect(0, 0, config.pageWidth, config.pageHeight, 'F')
  
  // Header
  doc.setFont(fonts.title, 'bold')
  doc.setFontSize(24)
  doc.setTextColor(colors.text)
  doc.text('NOTES', config.margin, config.margin + 10)
  
  // Rule Lines
  doc.setDrawColor(colors.border)
  doc.setLineWidth(0.2)
  
  const startNotesY = config.margin + 30
  const endNotesY = config.pageHeight - config.margin
  const lineSpacing = 10
  
  for (let y = startNotesY; y < endNotesY; y += lineSpacing) {
      doc.line(config.margin, y, config.pageWidth - config.margin, y)
  }
  
  // Footer Badge for End Page
  doc.setFont(fonts.ui, 'italic')
  doc.setFontSize(10)
  doc.setTextColor(colors.secondary)
  doc.text('Generated by X Articles Exporter', config.pageWidth / 2, config.pageHeight - 15, { align: 'center' })
}
