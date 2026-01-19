import { useEffect, useRef, useState } from "react"
import icon from "./assets/icon.png"
import "./popup.css"

// Interface for the user-configurable settings
interface Settings {
  /** Color theme: 'light' or 'dark' */
  theme: 'light' | 'dark'
  /** Paper size for the PDF: 'a4' or 'letter' */
  pageSize: 'a4' | 'letter'
  /** Font style for the PDF text */
  font: 'serif' | 'sans'
}

/** Default settings loaded on first run */
const defaultSettings: Settings = {
  theme: 'light',
  pageSize: 'a4',
  font: 'sans'
}

// Props for the generic CustomDropdown component
interface CustomDropdownProps {
  value: string
  options: { label: string; value: string }[]
  onChange: (value: string) => void
}

/**
 * A custom styled dropdown component to replace the native <select>.
 * Improves the UI consistency with the extension's theme.
 */
const CustomDropdown = ({ value, options, onChange }: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedLabel = options.find((opt) => opt.value === value)?.label

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="dropdown-container">
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="dropdown-trigger"
      >
        {selectedLabel}
        {/* Chevron Icon SVG */}
        <div className="dropdown-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#536471">
            <path d="M12 15.41l-4.48-4.48 1.41-1.42L12 12.58l3.07-3.07 1.41 1.42z" />
          </svg>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="dropdown-menu">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
              className={`dropdown-item ${value === opt.value ? 'selected' : ''}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * The main popup component for the extension.
 * Allows users to configure global settings for the PDF export.
 */
function IndexPopup() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [saved, setSaved] = useState(false)

  // Load settings on mount
  useEffect(() => {
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) {
        // Merge with default to handle new keys (like font) if missing
        setSettings({ ...defaultSettings, ...result.settings })
      }
    })
  }, [])

  // Save settings
  const handleSave = () => {
    chrome.storage.sync.set({ settings }, () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="popup-container">
      {/* Header */}
      <div className="header">
        <img src={icon} alt="Logo" className="header-logo" />
        <div>
          <h1 className="header-title">
            X Articles Exporter
          </h1>
          <p className="header-subtitle">
            Export articles to PDF
          </p>
        </div>
      </div>

      {/* Settings */}
      <div className="settings-section">
        <h2 className="settings-title">
          Settings
        </h2>

        {/* Theme */}
        <div className="setting-row setting-row-border">
          <span className="setting-label">PDF Theme</span>
          <CustomDropdown 
            value={settings.theme}
            options={[
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' }
            ]}
            onChange={(val) => updateSetting('theme', val as 'light' | 'dark')}
          />
        </div>

        {/* Font */}
        <div className="setting-row setting-row-border">
          <span className="setting-label">Font Style</span>
          <CustomDropdown 
            value={settings.font}
            options={[
              { label: 'Sans-Serif', value: 'sans' },
              { label: 'Serif', value: 'serif' }
            ]}
            onChange={(val) => updateSetting('font', val as 'sans' | 'serif')}
          />
        </div>

        {/* Page Size */}
        <div className="setting-row">
          <span className="setting-label">Page Size</span>
          <CustomDropdown 
            value={settings.pageSize}
            options={[
              { label: 'A4', value: 'a4' },
              { label: 'Letter', value: 'letter' }
            ]}
            onChange={(val) => updateSetting('pageSize', val as 'a4' | 'letter')}
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`save-button ${saved ? 'saved' : ''}`}
      >
        {saved ? 'Saved!' : 'Save Settings'}
      </button>

      {/* Usage Info */}
      <div className="usage-info">
        <strong className="usage-title">How to use:</strong>
        <p className="usage-text">
          Visit any X Article page. Look for the "Export to PDF" button in the bottom-right corner.
        </p>
      </div>

      <div className="credit">
        Built by{' '}
        <a 
          href="https://x.com/korecodes" 
          target="_blank" 
          rel="noopener noreferrer"
          className="credit-link"
        >
          @korecodes
        </a>
      </div>

      {/* Footer */}
      <div className="footer">
        v0.0.1 • Privacy-focused • All data stays local
      </div>
    </div>
  )
}
export default IndexPopup
