import { BUTTON_STYLES, EXPORT_BUTTON_ID, ICONS } from "../lib/constants"

export interface ButtonState {
  text?: string
  icon?: string
  color?: string
  disabled?: boolean
}

/**
 * Injects the styled export button into the DOM.
 * @param onClickHandler - The function to call when the button is clicked.
 */
export function injectExportButton(onClickHandler: () => void) {
  if (document.getElementById(EXPORT_BUTTON_ID)) return
  
  const style = document.createElement('style')
  style.textContent = BUTTON_STYLES
  document.head.appendChild(style)

  const button = document.createElement('button')
  button.id = EXPORT_BUTTON_ID
  button.innerHTML = `${ICONS.export} Export to PDF`
  button.addEventListener('click', onClickHandler)
  
  document.body.appendChild(button)
}

/**
 * Removes the export button from the DOM.
 */
export function removeExportButton() {
  document.getElementById(EXPORT_BUTTON_ID)?.remove()
}

/**
 * Updates the visual state of the export button.
 * @param state - object containing desired text, icon, color, etc.
 */
export function updateButtonState(state: ButtonState) {
  const button = document.getElementById(EXPORT_BUTTON_ID) as HTMLButtonElement
  if (!button) return

  if (state.disabled !== undefined) button.disabled = state.disabled
  if (state.color) button.style.backgroundColor = state.color
  
  // Construct inner HTML
  let content = ''
  if (state.icon) content += `${state.icon} `
  if (state.text) content += state.text
  
  // If no content, don't wipe it out, just update styles
  if (content) button.innerHTML = content
}

/**
 * Helper to set button to loading state.
 */
export function setButtonLoading(status: string) {
  updateButtonState({
    text: status,
    icon: ICONS.loading,
    disabled: true
  })
}

/**
 * Helper to set button to success state.
 */
export function setButtonSuccess() {
  updateButtonState({
    text: 'Saved!',
    icon: ICONS.success,
    color: '#17BF63',
    disabled: true
  })
}

/**
 * Helper to set button to error state.
 */
export function setButtonError() {
  updateButtonState({
    text: 'Error',
    icon: ICONS.error,
    color: '#DC3545',
    disabled: true
  })
}

/**
 * Helper to reset button to default state.
 */
export function setButtonDefault() {
  updateButtonState({
    text: 'Export to PDF',
    icon: ICONS.export,
    color: '#1D9BF0',
    disabled: false
  })
}
