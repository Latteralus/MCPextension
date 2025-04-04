// chat/components/app/appcontainer/index.js
// Barrel file to simplify imports from the appcontainer folder

export { createCustomHeader } from './HeaderRenderer.js';
export { renderChatView } from './ChatViewRenderer.js';
export { renderAdminView } from './AdminViewRenderer.js';
export { renderSettingsView } from './SettingsViewRenderer.js';

// Common styling utility
export const COLORS = {
  primary: '#2196F3',        // Blue primary color
  primaryDark: '#1976D2',    // Darker blue for hover states
  secondary: '#343a40',      // Dark gray secondary color 
  accent: '#4CAF50',         // Green accent color
  error: '#F44336',          // Red for errors
  warning: '#FFC107',        // Yellow for warnings
  text: '#333333',           // Main text color
  textSecondary: '#666666',  // Secondary text color
  border: '#e0e0e0',         // Border color
  background: '#f5f7f9',     // Light background color
  white: '#ffffff'           // White
};

/**
 * Apply CSS styles to an element
 * @param {HTMLElement} element - Element to style
 * @param {Object} styles - Styles to apply
 */
export function applyStyles(element, styles) {
  Object.assign(element.style, styles);
}

/**
 * Format a date and time for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date and time
 */
export function formatDateTime(dateString) {
  if (!dateString) return 'Never';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  } catch (error) {
    return dateString;
  }
}

/**
 * Create an action button
 * @param {string} text - Button text
 * @param {string} color - Button color
 * @returns {HTMLElement} Button element
 */
export function createActionButton(text, color = '#2196F3') {
  const button = document.createElement('button');
  button.textContent = text;
  
  applyStyles(button, {
    backgroundColor: color,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 'bold',
    minWidth: '70px'
  });
  
  // Hover effect
  button.addEventListener('mouseover', () => {
    // Darken the color slightly
    const darkenedColor = color.replace(
      /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i, 
      (_, r, g, b) => {
        return '#' + 
          Math.max(0, parseInt(r, 16) - 20).toString(16).padStart(2, '0') +
          Math.max(0, parseInt(g, 16) - 20).toString(16).padStart(2, '0') +
          Math.max(0, parseInt(b, 16) - 20).toString(16).padStart(2, '0');
      }
    );
    button.style.backgroundColor = darkenedColor;
  });
  
  button.addEventListener('mouseout', () => {
    button.style.backgroundColor = color;
  });
  
  return button;
}

// Export common utilities for renderers
export default {
  createCustomHeader,
  renderChatView,
  renderAdminView,
  renderSettingsView,
  COLORS,
  applyStyles,
  formatDateTime,
  createActionButton
};