/**
 * Base configuration for PDF layout and styling.
 * These values can be dynamic adjusted based on page size.
 */
export const BASE_CONFIG = {
  margin: 20,
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

export function getThemeColors(theme: 'light' | 'dark'): ThemeColors {
    const isDark = theme === 'dark'
    const colors = isDark ? BASE_CONFIG.themes.dark : BASE_CONFIG.themes.light
    
    // Specific override mentioned in original code
    if (!isDark) {
        return { ...colors, sidebar: '#34495E' }
    }
    return colors
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
