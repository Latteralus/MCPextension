// chat/components/admin/AdminPanelTabs.js
// Tab rendering logic for admin panel

import { getAuditLogStats, searchAuditLog, exportAuditLog } from '../../utils/logger.js';
import { getStorageUsage, cleanupExpiredMessages } from '../../utils/storage.js';
import { getEncryptionInfo } from '../../utils/encryption.js';
import { logChatEvent } from '../../utils/logger.js';

// Import management components
import UserManager from './UserManager.js';
import ChannelManager from './ChannelManager.js';
import RoleManager from './RoleManager.js';

/**
 * Admin Panel Tabs Rendering Utility
 * Handles rendering of different admin panel tabs
 */
class AdminPanelTabs {
  /**
   * Render the specified tab
   * @param {string} tabId - ID of the tab to render
   * @param {HTMLElement} container - Container to render tab content into
   * @param {Object} callbacks - Callbacks for manager creation
   */
  static renderTab(tabId, container, callbacks = {}) {
    // Clear container
    container.innerHTML = '';
    
    // Render specific tab content
    switch (tabId) {
      case 'dashboard':
        this.renderDashboard(container);
        break;
      case 'users':
        this.renderUserManagement(container, callbacks.onUserManagerCreated);
        break;
      case 'channels':
        this.renderChannelManagement(container, callbacks.onChannelManagerCreated);
        break;
      case 'roles':
        this.renderRoleManagement(container, callbacks.onRoleManagerCreated);
        break;
      case 'audit':
        this.renderAuditLog(container);
        break;
      case 'settings':
        this.renderSettings(container);
        break;
      default:
        this.renderUserManagement(container, callbacks.onUserManagerCreated); // Default to users
    }
  }
  
  /**
   * Render the dashboard tab
   * @param {HTMLElement} container - Container to render dashboard into
   */
  static renderDashboard(container) {
    try {
      // Get current stats safely with error handling
      const auditStats = this.getSafeAuditStats();
      const storageStats = this.getSafeStorageStats();
      const encryptionInfo = this.getSafeEncryptionInfo();
      
      // Dashboard header
      const header = this.createSectionHeader('System Dashboard', 'Overview of system status and metrics');
      container.appendChild(header);
      
      // Create stats grid
      const statsGrid = document.createElement('div');
      this.applyStyles(statsGrid, {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      });
      
      // Create and add stat cards
      const statCards = [
        this.createStatCard('👥 Users', [
          { label: 'Total Users', value: storageStats.userCount || 'N/A' },
          { label: 'Users Online', value: storageStats.onlineUsers || 'N/A' },
          { label: 'Admin Users', value: storageStats.adminCount || 'N/A' },
          { label: 'Last Login', value: this.formatDate(storageStats.lastLogin) || 'N/A' }
        ]),
        this.createStatCard('💬 Messages', [
          { label: 'Total Messages', value: storageStats.messageCount || 'N/A' },
          { label: 'Storage Usage', value: storageStats.messagesKB ? `${storageStats.messagesKB} KB` : 'N/A' },
          { label: 'Expiration', value: '24 hours' },
          { label: 'Encryption', value: encryptionInfo.method || 'N/A' }
        ]),
        this.createStatCard('📋 Audit Log', [
          { label: 'Total Entries', value: auditStats.totalEntries || 'N/A' },
          { label: 'Oldest Entry', value: this.formatDate(auditStats.oldestEntry) || 'N/A' },
          { label: 'Newest Entry', value: this.formatDate(auditStats.newestEntry) || 'N/A' },
          { label: 'Retention Period', value: auditStats.retentionDays ? `${auditStats.retentionDays} days` : 'N/A' }
        ])
      ];
      
      statCards.forEach(card => statsGrid.appendChild(card));
      
      container.appendChild(statsGrid);
      
      // Quick actions section
      const actionsSection = this.createQuickActionsSection();
      container.appendChild(actionsSection);
    } catch (error) {
      console.error('[AdminPanelTabs] Error rendering dashboard:', error);
      this.renderErrorState(container, 'Failed to load dashboard');
    }
  }
  
  /**
   * Get safe audit stats with error handling
   * @returns {Object} Audit stats with defaults
   */
  static getSafeAuditStats() {
    try {
      return getAuditLogStats() || {};
    } catch (error) {
      console.error('[AdminPanelTabs] Error getting audit stats:', error);
      return {
        totalEntries: 0,
        oldestEntry: null,
        newestEntry: null,
        retentionDays: 30
      };
    }
  }
  
  /**
   * Get safe storage stats with error handling
   * @returns {Object} Storage stats with defaults
   */
  static getSafeStorageStats() {
    try {
      return getStorageUsage() || {};
    } catch (error) {
      console.error('[AdminPanelTabs] Error getting storage stats:', error);
      return {
        userCount: 0,
        messageCount: 0,
        messagesKB: 0,
        onlineUsers: 0,
        adminCount: 0,
        lastLogin: null
      };
    }
  }
  
  /**
   * Get safe encryption info with error handling
   * @returns {Object} Encryption info with defaults
   */
  static getSafeEncryptionInfo() {
    try {
      return getEncryptionInfo() || {};
    } catch (error) {
      console.error('[AdminPanelTabs] Error getting encryption info:', error);
      return {
        method: 'AES-256',
        enabled: true
      };
    }
  }
  
  /**
   * Render the user management tab
   * @param {HTMLElement} container - Container to render user management into
   * @param {Function} onManagerCreated - Callback to notify about created manager
   */
  static renderUserManagement(container, onManagerCreated) {
    try {
      const userManager = new UserManager(container);
      
      // Call callback if provided
      if (onManagerCreated && typeof onManagerCreated === 'function') {
        onManagerCreated(userManager);
      }
    } catch (error) {
      console.error('[AdminPanelTabs] Error rendering user management:', error);
      this.renderErrorState(container, 'Failed to load user management');
    }
  }
  
  /**
   * Render the channel management tab
   * @param {HTMLElement} container - Container to render channel management into
   * @param {Function} onManagerCreated - Callback to notify about created manager
   */
  static renderChannelManagement(container, onManagerCreated) {
    try {
      const channelManager = new ChannelManager(container);
      
      // Call callback if provided
      if (onManagerCreated && typeof onManagerCreated === 'function') {
        onManagerCreated(channelManager);
      }
    } catch (error) {
      console.error('[AdminPanelTabs] Error rendering channel management:', error);
      this.renderErrorState(container, 'Failed to load channel management');
    }
  }
  
  /**
   * Render the role management tab
   * @param {HTMLElement} container - Container to render role management into
   * @param {Function} onManagerCreated - Callback to notify about created manager
   */
  static renderRoleManagement(container, onManagerCreated) {
    try {
      const roleManager = new RoleManager(container);
      
      // Call callback if provided
      if (onManagerCreated && typeof onManagerCreated === 'function') {
        onManagerCreated(roleManager);
      }
    } catch (error) {
      console.error('[AdminPanelTabs] Error rendering role management:', error);
      this.renderErrorState(container, 'Failed to load role management');
    }
  }
  
  /**
   * Render the audit log tab
   * @param {HTMLElement} container - Container to render audit log into
   */
  static renderAuditLog(container) {
    try {
      // Audit log header
      const header = this.createSectionHeader('Audit Log', 'Detailed system activity log');
      container.appendChild(header);
      
      // Audit log search/filter section
      const filterSection = this.createAuditLogFilterSection();
      container.appendChild(filterSection);
      
      // Audit log results area
      const resultsContainer = document.createElement('div');
      resultsContainer.id = 'audit-log-results';
      container.appendChild(resultsContainer);
      
      // Initial search with no filters
      this.performAuditLogSearch(resultsContainer);
    } catch (error) {
      console.error('[AdminPanelTabs] Error rendering audit log:', error);
      this.renderErrorState(container, 'Failed to load audit log');
    }
  }
  
  /**
   * Render the system settings tab
   * @param {HTMLElement} container - Container to render settings into
   */
  static renderSettings(container) {
    try {
      // Settings header
      const header = this.createSectionHeader('System Settings', 'Configure HIPAA-compliant chat system');
      container.appendChild(header);
      
      // Server settings section
      const serverSection = this.createSettingsSection('Server Configuration', '🖥️');
      container.appendChild(serverSection);
      
      // Security settings section
      const securitySection = this.createSettingsSection('Security Settings', '🔒');
      container.appendChild(securitySection);
      
      // Add save button
      const saveButton = this.createSaveButton();
      container.appendChild(saveButton);
    } catch (error) {
      console.error('[AdminPanelTabs] Error rendering settings:', error);
      this.renderErrorState(container, 'Failed to load settings');
    }
  }
  
  /**
   * Render error state
   * @param {HTMLElement} container - Container to render error into
   * @param {string} message - Error message
   */
  static renderErrorState(container, message) {
    const errorContainer = document.createElement('div');
    this.applyStyles(errorContainer, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '50px 20px',
      textAlign: 'center',
      color: '#721c24',
      backgroundColor: '#f8d7da',
      borderRadius: '4px'
    });
    
    const errorIcon = document.createElement('div');
    errorIcon.textContent = '⚠️';
    this.applyStyles(errorIcon, {
      fontSize: '48px',
      marginBottom: '20px'
    });
    
    const errorMessage = document.createElement('h3');
    errorMessage.textContent = message || 'An error occurred';
    
    const errorHint = document.createElement('p');
    errorHint.textContent = 'Please try refreshing the page or contact system administrator.';
    
    errorContainer.appendChild(errorIcon);
    errorContainer.appendChild(errorMessage);
    errorContainer.appendChild(errorHint);
    
    // Clear container and add error
    container.innerHTML = '';
    container.appendChild(errorContainer);
  }
  
  /**
   * Create a section header
   * @param {string} title - Section title
   * @param {string} subtitle - Section subtitle
   * @returns {HTMLElement} Header element
   */
  static createSectionHeader(title, subtitle) {
    const header = document.createElement('div');
    this.applyStyles(header, {
      marginBottom: '20px'
    });
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    this.applyStyles(titleEl, {
      margin: '0 0 8px 0',
      fontSize: '20px',
      fontWeight: 'bold'
    });
    
    const subtitleEl = document.createElement('p');
    subtitleEl.textContent = subtitle;
    this.applyStyles(subtitleEl, {
      margin: '0',
      color: '#6c757d',
      fontSize: '14px'
    });
    
    header.appendChild(titleEl);
    header.appendChild(subtitleEl);
    
    return header;
  }
  
  /**
   * Create a stat card
   * @param {string} title - Card title
   * @param {Array} stats - Array of stat objects
   * @returns {HTMLElement} Stat card element
   */
  static createStatCard(title, stats) {
    const card = document.createElement('div');
    this.applyStyles(card, {
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '16px',
      border: '1px solid #e9ecef'
    });
    
    const cardTitle = document.createElement('h4');
    cardTitle.textContent = title;
    this.applyStyles(cardTitle, {
      margin: '0 0 12px 0',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#495057',
      borderBottom: '1px solid #e9ecef',
      paddingBottom: '8px'
    });
    
    card.appendChild(cardTitle);
    
    // Add stats
    stats.forEach(stat => {
      const statItem = document.createElement('div');
      this.applyStyles(statItem, {
        display: 'flex',
        justifyContent: 'space-between',
        margin: '8px 0'
      });
      
      const statLabel = document.createElement('span');
      statLabel.textContent = stat.label;
      this.applyStyles(statLabel, {
        color: '#6c757d',
        fontSize: '14px'
      });
      
      const statValue = document.createElement('span');
      statValue.textContent = stat.value;
      this.applyStyles(statValue, {
        fontWeight: 'bold',
        fontSize: '14px'
      });
      
      statItem.appendChild(statLabel);
      statItem.appendChild(statValue);
      
      card.appendChild(statItem);
    });
    
    return card;
  }
  
  /**
   * Create quick actions section
   * @returns {HTMLElement} Quick actions section
   */
  static createQuickActionsSection() {
    const section = document.createElement('div');
    this.applyStyles(section, {
      marginBottom: '30px'
    });
    
    const title = document.createElement('h4');
    title.textContent = 'Quick Actions';
    this.applyStyles(title, {
      margin: '0 0 15px 0',
      fontSize: '16px',
      fontWeight: 'bold'
    });
    
    section.appendChild(title);
    
    const actionsGrid = document.createElement('div');
    this.applyStyles(actionsGrid, {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '10px'
    });
    
    const actions = [
      { 
        label: 'Add User', 
        icon: '👤', 
        action: () => logChatEvent('admin', 'Initiated add user action') 
      },
      { 
        label: 'Create Channel', 
        icon: '💬', 
        action: () => logChatEvent('admin', 'Initiated create channel action') 
      },
      { 
        label: 'Export Audit Log', 
        icon: '📥', 
        action: () => {
          exportAuditLog();
          logChatEvent('admin', 'Exported audit log');
        }
      },
      { 
        label: 'Clean Messages', 
        icon: '🧹', 
        action: () => {
          const removedCount = cleanupExpiredMessages();
          logChatEvent('admin', `Cleaned ${removedCount} expired messages`);
        }
      }
    ];
    
    actions.forEach(({ label, icon, action }) => {
      const button = this.createActionButton(label, icon, action);
      actionsGrid.appendChild(button);
    });
    
    section.appendChild(actionsGrid);
    
    return section;
  }
  
  /**
   * Create an action button
   * @param {string} label - Button label
   * @param {string} icon - Button icon
   * @param {Function} onClick - Click handler
   * @returns {HTMLElement} Button element
   */
  static createActionButton(label, icon, onClick) {
    const button = document.createElement('button');
    this.applyStyles(button, {
      padding: '10px',
      backgroundColor: '#ffffff',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100%',
      textAlign: 'left',
      transition: 'background-color 0.2s'
    });
    
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = '#f8f9fa';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = '#ffffff';
    });
    
    const iconElement = document.createElement('span');
    iconElement.textContent = icon;
    this.applyStyles(iconElement, {
      marginRight: '8px',
      fontSize: '16px'
    });
    
    const labelElement = document.createElement('span');
    labelElement.textContent = label;
    
    button.appendChild(iconElement);
    button.appendChild(labelElement);
    
    button.addEventListener('click', onClick);
    
    return button;
  }
  
  /**
   * Create audit log filter section
   * @returns {HTMLElement} Filter section
   */
  static createAuditLogFilterSection() {
    const section = document.createElement('div');
    this.applyStyles(section, {
      backgroundColor: '#f8f9fa',
      padding: '16px',
      borderRadius: '4px',
      marginBottom: '20px',
      border: '1px solid #dee2e6'
    });
    
    // Placeholder for future implementation
    const placeholder = document.createElement('p');
    placeholder.textContent = 'Audit log filtering coming soon...';
    section.appendChild(placeholder);
    
    return section;
  }
  
  /**
   * Perform audit log search
   * @param {HTMLElement} resultsContainer - Container for results
   * @param {Object} filters - Search filters
   */
  static performAuditLogSearch(resultsContainer, filters = {}) {
    // Placeholder for future implementation
    resultsContainer.innerHTML = '<p>Audit log search results will be displayed here.</p>';
  }
  
  /**
   * Create settings section
   * @param {string} title - Section title
   * @param {string} icon - Section icon
   * @returns {HTMLElement} Settings section
   */
  static createSettingsSection(title, icon) {
    const section = document.createElement('div');
    this.applyStyles(section, {
      backgroundColor: '#ffffff',
      borderRadius: '4px',
      border: '1px solid #dee2e6',
      marginBottom: '20px',
      overflow: 'hidden'
    });
    
    // Section header
    const header = document.createElement('div');
    this.applyStyles(header, {
      padding: '12px 16px',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #dee2e6',
      display: 'flex',
      alignItems: 'center'
    });
    
    const iconElement = document.createElement('span');
    iconElement.textContent = icon;
    this.applyStyles(iconElement, {
      marginRight: '8px',
      fontSize: '18px'
    });
    
    const titleElement = document.createElement('h4');
    titleElement.textContent = title;
    this.applyStyles(titleElement, {
      margin: '0',
      fontSize: '16px',
      fontWeight: 'bold'
    });
    
    header.appendChild(iconElement);
    header.appendChild(titleElement);
    section.appendChild(header);
    
    // Section content
    const content = document.createElement('div');
    this.applyStyles(content, {
      padding: '16px'
    });
    section.appendChild(content);
    
    return section;
  }
  
  /**
   * Create a setting item
   * @param {string} name - Setting name
   * @param {string} description - Setting description
   * @param {string} type - Input type
   * @param {string} defaultValue - Default value
   * @returns {HTMLElement} Setting item element
   */
  static createSettingItem(name, description, type, defaultValue) {
    const item = document.createElement('div');
    this.applyStyles(item, {
      marginBottom: '16px',
      paddingBottom: '16px',
      borderBottom: '1px solid #f0f0f0'
    });
    
    // Setting header
    const itemHeader = document.createElement('div');
    this.applyStyles(itemHeader, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    });
    
    const nameElement = document.createElement('label');
    nameElement.textContent = name;
    nameElement.htmlFor = `setting-${name}`;
    this.applyStyles(nameElement, {
      fontWeight: 'bold',
      fontSize: '14px'
    });
    
    let inputElement;
    
    if (type === 'checkbox') {
      inputElement = document.createElement('input');
      inputElement.type = 'checkbox';
      inputElement.id = `setting-${name}`;
      inputElement.checked = defaultValue === 'true';
      this.applyStyles(inputElement, {
        transform: 'scale(1.2)'
      });
    } else {
      inputElement = document.createElement('input');
      inputElement.type = type;
      inputElement.id = `setting-${name}`;
      inputElement.value = defaultValue;
      this.applyStyles(inputElement, {
        padding: '6px 8px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        width: '200px'
      });
    }
    
    itemHeader.appendChild(nameElement);
    itemHeader.appendChild(inputElement);
    
    // Setting description
    const descElement = document.createElement('div');
    descElement.textContent = description;
    this.applyStyles(descElement, {
      fontSize: '12px',
      color: '#6c757d'
    });
    
    item.appendChild(itemHeader);
    item.appendChild(descElement);
    
    return item;
  }
  
  /**
   * Create a save button for settings
   * @returns {HTMLElement} Save button
   */
  static createSaveButton() {
    const button = document.createElement('button');
    button.textContent = 'Save Settings';
    this.applyStyles(button, {
      padding: '10px 20px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      display: 'inline-block',
      marginTop: '10px'
    });
    
    button.addEventListener('click', () => {
      const settings = this.collectSettingsFromInputs();
      
      if (this.validateSettings(settings)) {
        this.saveSettings(settings);
        alert('Settings saved successfully');
      }
    });
    
    return button;
  }
  
  /**
   * Format a date for display
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date or 'N/A'
   */
  static formatDate(date) {
    if (!date) return 'N/A';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleString();
    } catch (error) {
      console.error('[AdminPanelTabs] Error formatting date:', error);
      return 'N/A';
    }
  }
  
  /**
   * Collect settings from input elements
   * @returns {Object} Collected settings
   */
  static collectSettingsFromInputs() {
    const settings = {};
    
    // Collect all settings inputs
    const settingInputs = document.querySelectorAll('[id^="setting-"]');
    
    settingInputs.forEach(input => {
      const name = input.id.replace('setting-', '');
      
      if (input.type === 'checkbox') {
        settings[name] = input.checked;
      } else {
        settings[name] = input.value;
      }
    });
    
    return settings;
  }
  
  /**
   * Validate collected settings
   * @param {Object} settings - Settings to validate
   * @returns {boolean} Whether settings are valid
   */
  static validateSettings(settings) {
    // Basic validation examples
    if (settings.serverUrl && !this.isValidUrl(settings.serverUrl)) {
      alert('Invalid server URL');
      return false;
    }
    
    if (settings.sessionTimeout && (isNaN(settings.sessionTimeout) || settings.sessionTimeout < 1)) {
      alert('Session timeout must be a positive number');
      return false;
    }
    
    return true;
  }
  
  /**
   * Save settings to storage or send to backend
   * @param {Object} settings - Settings to save
   */
  static saveSettings(settings) {
    try {
      // In a real implementation, this would interact with a backend service
      Object.entries(settings).forEach(([key, value]) => {
        localStorage.setItem(`admin_setting_${key}`, JSON.stringify(value));
      });
      
      // Log the settings update
      logChatEvent('admin', 'Updated system settings', { 
        settingsUpdated: Object.keys(settings)
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  }
  
  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {boolean} Whether URL is valid
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Apply CSS styles to an element
   * @param {HTMLElement} element - Element to style
   * @param {Object} styles - Styles to apply
   */
  static applyStyles(element, styles) {
    Object.assign(element.style, styles);
  }
}

export default AdminPanelTabs;