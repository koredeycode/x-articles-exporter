import { useEffect, useRef, useState } from "react"
import icon from "./assets/icon.png"

interface Settings {
  theme: 'light' | 'dark'
  pageSize: 'a4' | 'letter'
}

const defaultSettings: Settings = {
  theme: 'light',
  pageSize: 'a4'
}

interface CustomDropdownProps {
  value: string
  options: { label: string; value: string }[]
  onChange: (value: string) => void
}

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
    <div ref={containerRef} style={{ position: "relative", width: 120 }}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "8px 32px 8px 12px",
          fontSize: 14,
          border: "1px solid #CFD9DE",
          borderRadius: 6,
          backgroundColor: "#FFFFFF",
          color: "#0F1419",
          cursor: "pointer",
          userSelect: "none",
          position: "relative",
          whiteSpace: "nowrap"
        }}
      >
        {selectedLabel}
        {/* Chevron Icon SVG */}
        <div
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#536471">
            <path d="M12 15.41l-4.48-4.48 1.41-1.42L12 12.58l3.07-3.07 1.41 1.42z" />
          </svg>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            backgroundColor: "#FFFFFF",
            border: "1px solid #CFD9DE",
            borderRadius: 6,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 10,
            padding: 4
          }}
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
              className="dropdown-item"
              style={{
                padding: "8px 12px",
                fontSize: 13,
                cursor: "pointer",
                borderRadius: 4,
                backgroundColor: value === opt.value ? "#F7F9F9" : "transparent",
                color: value === opt.value ? "#1DA1F2" : "#0F1419",
                fontWeight: value === opt.value ? 600 : 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#EFF3F4"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = value === opt.value ? "#F7F9F9" : "transparent"
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function IndexPopup() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [saved, setSaved] = useState(false)

  // Load settings on mount
  useEffect(() => {
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) {
        setSettings(result.settings)
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
    <div style={{
      width: 280,
      padding: 20,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#fff'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottom: '1px solid #e1e8ed'
      }}>
        <img src={icon} alt="Logo" style={{ width: 32, height: 32, marginRight: 10, borderRadius: 4 }} />
        <div>
          <h1 style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: '#0f1419'
          }}>
            X Articles Exporter
          </h1>
          <p style={{
            margin: '4px 0 0',
            fontSize: 12,
            color: '#536471'
          }}>
            Export articles to PDF
          </p>
        </div>
      </div>

      {/* Settings */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#536471',
          textTransform: 'uppercase',
          marginBottom: 12
        }}>
          Settings
        </h2>

        {/* Theme */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontSize: 14, color: '#0f1419' }}>PDF Theme</span>
          <CustomDropdown 
            value={settings.theme}
            options={[
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' }
            ]}
            onChange={(val) => updateSetting('theme', val as 'light' | 'dark')}
          />
        </div>

        {/* Page Size */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 0'
        }}>
          <span style={{ fontSize: 14, color: '#0f1419' }}>Page Size</span>
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
        style={{
          width: '100%',
          padding: '12px 20px',
          backgroundColor: saved ? '#17bf63' : '#1DA1F2',
          color: 'white',
          border: 'none',
          borderRadius: 9999,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>

      {/* Usage Info */}
      <div style={{
        marginTop: 20,
        padding: 12,
        backgroundColor: '#f7f9fa',
        borderRadius: 8,
        fontSize: 12,
        color: '#536471'
      }}>
        <strong style={{ color: '#0f1419' }}>How to use:</strong>
        <p style={{ margin: '8px 0 0' }}>
          Visit any X Article page. Look for the "Export to PDF" button in the bottom-right corner.
        </p>
      </div>

      <div style={{ marginTop: 15, textAlign: 'center', fontSize: 13, color: '#0f1419' }}>
        Built by{' '}
        <a 
          href="https://x.com/korecodes" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#1DA1F2', textDecoration: 'none', fontWeight: 600 }}
        >
          @korecodes
        </a>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 16,
        textAlign: 'center',
        fontSize: 11,
        color: '#8899a6'
      }}>
        v1.0.0 • Privacy-focused • All data stays local
      </div>
    </div>
  )
}
export default IndexPopup
