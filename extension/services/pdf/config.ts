/**
 * Base configuration for PDF layout and styling.
 * These values can be dynamic adjusted based on page size.
 */
export const BASE_CONFIG = {
  margin: 25, // Increased from 20 to prevent header overlap in Academic/Technical layouts
  /** Width of the colored sidebar on the left. */
  sidebarWidth: 35, 
  /** X-coordinate where content starts (sidebar + padding). */
  contentStart: 50, 
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
      bg: '#FFFFFF',
      sidebar: '#F7F9F9', // Light gray sidebar for light mode
      blockquoteBorder: '#1DA1F2',
      border: '#CFD9DE' // Added from implicit use
    },
    dark: {
      primary: '#1DA1F2',
      text: '#E7E9EA',
      secondary: '#71767B',
      accent: '#1D9BF0',
      bg: '#000000',
      sidebar: '#16181C', // Dark gray sidebar for dark mode
      blockquoteBorder: '#1DA1F2',
      border: '#38444D' // Added from implicit use
    }
  }
}

export type ThemeColors = typeof BASE_CONFIG.themes.light

export interface DesignConfig {
    name: string
    /** Template ID for layout logic switching */
    template: 'standard' | 'modern' | 'academic' | 'technical'
    sidebarWidth: number
    contentStart: number
    headerOffset?: number // Extra margin for top headers
    fonts: {
        title: string
        body: string
        heading: string
        ui: string
    }
    showSidebar: boolean
    /** Specific layout flags */
    layout: {
        titlePage: 'classic' | 'modern' | 'formal' | 'technical'
        footer: 'simple' | 'detailed' | 'minimal'
        useHorizontalRules: boolean
        useBoxedContent: boolean // For technical code blocks/callouts
    }
}

const DESIGNS: Record<string, DesignConfig> = {
    standard: {
        name: 'Standard',
        template: 'standard',
        sidebarWidth: 35,
        contentStart: 50,
        fonts: { title: 'helvetica', body: 'helvetica', heading: 'helvetica', ui: 'helvetica' },
        showSidebar: true,
        layout: { titlePage: 'classic', footer: 'detailed', useHorizontalRules: false, useBoxedContent: false }
    },
    // Modern / Magazine: Huge centered title, large hero image, clean whitespace
    modern: {
        name: 'Modern (Magazine)',
        template: 'modern',
        sidebarWidth: 0,
        contentStart: 25,
        fonts: { title: 'helvetica', body: 'helvetica', heading: 'helvetica', ui: 'helvetica' },
        showSidebar: false,
        layout: { titlePage: 'modern', footer: 'minimal', useHorizontalRules: false, useBoxedContent: false }
    },
    // Academic: Serif, formal metadata block, horizontal rules
    academic: {
        name: 'Academic (Paper)',
        template: 'academic',
        sidebarWidth: 0,
        contentStart: 25,
        headerOffset: 15,
        fonts: { title: 'times', body: 'times', heading: 'times', ui: 'times' },
        showSidebar: false,
        layout: { titlePage: 'formal', footer: 'simple', useHorizontalRules: true, useBoxedContent: false }
    },
    // Technical: Monospace, dark elements, terminal aesthetic
    technical: {
        name: 'Technical (Docs)',
        template: 'technical',
        sidebarWidth: 0,
        contentStart: 20,
        fonts: { title: 'courier', body: 'courier', heading: 'courier', ui: 'courier' },
        showSidebar: false,
        layout: { titlePage: 'technical', footer: 'simple', useHorizontalRules: false, useBoxedContent: true }
    }
}

export function getThemeColors(theme: 'light' | 'dark'): ThemeColors {
    const isDark = theme === 'dark'
    const colors = isDark ? BASE_CONFIG.themes.dark : BASE_CONFIG.themes.light
    
    // Specific override mentioned in original code
    if (!isDark) {
        return { ...colors, sidebar: '#34495E' }
    }
    return colors
}

export function getDesignConfig(designName: string = 'standard'): DesignConfig {
    return DESIGNS[designName] || DESIGNS.standard
}

export function getFonts(fontStyle: 'serif' | 'sans') {
    const isSerif = fontStyle === 'serif'
    return {
        title: isSerif ? 'times' : 'helvetica',
        body: isSerif ? 'times' : 'helvetica', 
        heading: isSerif ? 'times' : 'helvetica', 
        ui: 'helvetica' 
    }
}
