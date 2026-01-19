import jsPDF from 'jspdf'
import type { ContentBlock, TextSegment } from '../../lib/types'
import type { ThemeColors } from './config'
import { splitTextToWidth } from './utils'

export interface RenderContext {
    doc: jsPDF
    config: any
    colors: ThemeColors
    fonts: any
    currentY: number
    onPageBreak: (newY: number) => number
}

// Render Helper for Rich Text
export const renderFormattedBlock = (
    ctx: RenderContext,
    segments: TextSegment[] | undefined, 
    text: string | undefined,
    startX: number, 
    maxWidth: number,
    fontSize: number,
    baseColor: string,
    options?: { borderLeftColor?: string }
): number => {
     const { doc, fonts } = ctx
     let currentPageYStart = ctx.currentY
     
     // Helper to handle page breaks via callback
     const checkAndAddPage = (currentY: number, lh: number): number => {
         // Using the context's page break handler which manages logic
         if (currentY + lh > ctx.config.pageHeight - ctx.config.margin - 10) {
             // Draw border for the current page chunk before breaking
             if (options?.borderLeftColor) {
                 doc.setDrawColor(options.borderLeftColor)
                 doc.setLineWidth(1)
                 const lineBottom = currentY + lh - 2 
                 doc.line(startX - 5, currentPageYStart - 2, startX - 5, lineBottom)
             }
             const newY = ctx.onPageBreak(currentY)
             currentPageYStart = newY
             return newY
         }
         return currentY
     }
     
     const drawFinalBorder = (endY: number) => {
         if (options?.borderLeftColor) {
             doc.setDrawColor(options.borderLeftColor)
             doc.setLineWidth(1)
             doc.line(startX - 5, currentPageYStart - 2, startX - 5, endY)
         }
     }

     if (!segments || segments.length === 0) {
         if (!text) return ctx.currentY
         doc.setTextColor(baseColor)
         doc.setFont(fonts.body, 'normal') 
         const lines = splitTextToWidth(doc, text, maxWidth, fontSize)
         
         let curY = ctx.currentY
         const lh = fontSize * 0.3527 * 1.5
         
         for (const line of lines) {
             curY = checkAndAddPage(curY, lh)
             doc.text(line, startX, curY)
             curY += lh
         }
          // Draw final border segment
         drawFinalBorder(curY)
         return curY
     }
     
     let cursorX = startX
     let cursorY = ctx.currentY
     const lineHeight = fontSize * 0.3527 * 1.5
     
     for (const seg of segments) {
        let fontStyle = 'normal'
        if (seg.isBold && seg.isItalic) fontStyle = 'bolditalic'
        else if (seg.isBold) fontStyle = 'bold'
        else if (seg.isItalic) fontStyle = 'italic'
        
        doc.setFont(fonts.body, fontStyle)
        doc.setFontSize(fontSize)
        if (seg.link) doc.setTextColor(ctx.colors.accent)
        else doc.setTextColor(baseColor)
        
        const words = seg.text.split(/(\s+)/)
        for (const word of words) {
           const wordWidth = doc.getTextWidth(word)
           if (cursorX + wordWidth > startX + maxWidth) {
              cursorX = startX
              cursorY += lineHeight
              cursorY = checkAndAddPage(cursorY, lineHeight)
           }
           if (seg.link) doc.textWithLink(word, cursorX, cursorY, { url: seg.link })
           else doc.text(word, cursorX, cursorY)
           cursorX += wordWidth
        }
     }
     // End of block
     const finalY = cursorX > startX ? cursorY + lineHeight : cursorY
     drawFinalBorder(finalY)
     return finalY
}

export const renderImageBlock = (ctx: RenderContext, block: ContentBlock, x: number, width: number): number => {
    if (!block.src) return ctx.currentY
    try {
        const maxH = 120
        const props = ctx.doc.getImageProperties(block.src)
        const ratio = props.height / props.width
        let w = width
        let h = w * ratio
        if (h > maxH) { h = maxH; w = h / ratio; }

        if (ctx.currentY + h > ctx.config.pageHeight - ctx.config.margin) {
            ctx.currentY = ctx.onPageBreak(ctx.currentY)
        }
        
        ctx.doc.addImage(block.src, 'JPEG', x, ctx.currentY, w, h)
        return ctx.currentY + h + 10
    } catch (e) {
        return ctx.currentY
    }
}

export const renderVideoBlock = (ctx: RenderContext, block: ContentBlock, x: number, width: number): number => {
    if (!block.src) return ctx.currentY
    try {
        const maxH = 120
        const props = ctx.doc.getImageProperties(block.src)
        const ratio = props.height / props.width
        let w = width
        let h = w * ratio
        if (h > maxH) { h = maxH; w = h / ratio; }

        if (ctx.currentY + h > ctx.config.pageHeight - ctx.config.margin) {
            ctx.currentY = ctx.onPageBreak(ctx.currentY)
        }

        // Draw Poster
        ctx.doc.addImage(block.src, 'JPEG', x, ctx.currentY, w, h)
        
        // Draw Play Overlay
        ctx.doc.setFillColor(0, 0, 0)
        ctx.doc.saveGraphicsState()
        ctx.doc.setGState(new (ctx.doc as any).GState({ opacity: 0.4 }))
        ctx.doc.circle(x + w/2, ctx.currentY + h/2, 10, 'F')
        ctx.doc.restoreGraphicsState()
        
        // Draw Play Icon (White Triangle)
        ctx.doc.setFillColor(255, 255, 255)
        ctx.doc.triangle(
          x + w/2 - 3, ctx.currentY + h/2 - 5,
          x + w/2 - 3, ctx.currentY + h/2 + 5,
          x + w/2 + 5, ctx.currentY + h/2,
          'F'
        )

        // Link
        if (block.link) {
            ctx.doc.link(x, ctx.currentY, w, h, { url: block.link })
        }

        return ctx.currentY + h + 10
    } catch (e) {
        return ctx.currentY
    }
}

export const renderTweetBlock = (ctx: RenderContext, block: ContentBlock, x: number, width: number): number => {
   const CARD_PADDING = 10
   const CARD_W = width
   
   // Calculate Exact Height First
   ctx.doc.setFont(ctx.fonts.body, 'normal')
   ctx.doc.setFontSize(10)
   
   let textHeight = 0
   let splitText: string[] = []
   
   if (block.text) {
       splitText = ctx.doc.splitTextToSize(block.text, CARD_W - (CARD_PADDING * 2))
       textHeight = (splitText.length * 5) // Line height approx
   }
   
   const headerHeight = 16 
   const totalCardHeight = headerHeight + textHeight + (CARD_PADDING * 2)
   
   if (ctx.currentY + totalCardHeight > ctx.config.pageHeight - ctx.config.margin) {
       ctx.currentY = ctx.onPageBreak(ctx.currentY)
   }

   const startY = ctx.currentY
   
   // Card Border
   ctx.doc.setDrawColor(ctx.colors.border)
   ctx.doc.setLineWidth(0.5)
   ctx.doc.roundedRect(x, startY, CARD_W, totalCardHeight, 3, 3, 'S')
   
   let innerY = startY + CARD_PADDING
   
   // Author
   ctx.doc.setFont(ctx.fonts.ui, 'bold')
   ctx.doc.setFontSize(10)
   ctx.doc.setTextColor(ctx.colors.text)
   ctx.doc.text(block.author || (block.handle || 'Tweet'), x + CARD_PADDING, innerY)
   
   if (block.handle) {
       ctx.doc.setFont(ctx.fonts.ui, 'normal')
       ctx.doc.setTextColor(ctx.colors.secondary)
       ctx.doc.text(` ${block.handle}`, x + CARD_PADDING + ctx.doc.getTextWidth(block.author || '') + 2, innerY)
   }
   innerY += 6

   // Text
   ctx.doc.setFont(ctx.fonts.body, 'normal')
   ctx.doc.setFontSize(10)
   ctx.doc.setTextColor(ctx.colors.text)
   
   if (block.text && splitText.length > 0) {
       ctx.doc.text(splitText, x + CARD_PADDING, innerY + 4)
   }

   // Link
   if (block.link) {
       ctx.doc.link(x, startY, CARD_W, totalCardHeight, { url: block.link })
   }
   
   return startY + totalCardHeight + 10
}

export const renderCodeBlock = (ctx: RenderContext, block: ContentBlock, x: number, width: number, isDark: boolean): number => {
    const CODE_PADDING = 10
    const CODE_BG_COLOR = isDark ? '#1F2937' : '#F7F9F9' 
    const CODE_TEXT_COLOR = isDark ? '#E5E7EB' : '#374151'
    
    ctx.doc.setFont('courier', 'normal')
    ctx.doc.setFontSize(10)
    
    const codeLines = ctx.doc.splitTextToSize(block.text || '', width - (CODE_PADDING * 2))
    const codeHeight = (codeLines.length * 4) + (CODE_PADDING * 2) 
    
    // Check page break
    if (ctx.currentY + codeHeight > ctx.config.pageHeight - ctx.config.margin) {
       ctx.currentY = ctx.onPageBreak(ctx.currentY)
    }
    
    // Background
    ctx.doc.setFillColor(CODE_BG_COLOR)
    ctx.doc.rect(x, ctx.currentY, width, codeHeight, 'F')
    
    // Language Label
    if (block.language) {
        ctx.doc.setFont(ctx.fonts.ui, 'bold')
        ctx.doc.setFontSize(8)
        ctx.doc.setTextColor(ctx.colors.secondary)
        ctx.doc.text(block.language.toUpperCase(), x + width - 10, ctx.currentY + 8, { align: 'right' })
    }
    
    // Code Text
    ctx.doc.setFont('courier', 'normal')
    ctx.doc.setFontSize(10)
    ctx.doc.setTextColor(CODE_TEXT_COLOR)
    
    let codeY = ctx.currentY + CODE_PADDING + 2
    for (const line of codeLines) {
        ctx.doc.text(line, x + CODE_PADDING, codeY)
        codeY += 4
    }
    
    return ctx.currentY + codeHeight + 6
}
