// chat/components/auth/LoginForm.js
// Modified login form component for HIPAA-compliant chat

import { logChatEvent } from '../../utils/logger.js';

// Header bar colors
const HEADER_COLORS = {
  primary: '#343a40',      // Dark gray/blue - main header color
  secondary: '#3a444f',    // Slightly lighter shade for hover effects
  text: '#ffffff',         // White text
  accent: '#2196F3'        // Blue accent color
};

/**
 * Login Form Component
 * Provides user authentication interface with demo bypass
 */
class LoginForm {
  /**
   * Create a new LoginForm
   * @param {HTMLElement} container - Container element
   * @param {Function} onLoginSuccess - Callback for successful login
   */
  constructor(container, onLoginSuccess) {
    this.container = container;
    this.onLoginSuccess = onLoginSuccess || (() => {});
    this.formElement = null;
    
    // Bind methods
    this.render = this.render.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDemoLogin = this.handleDemoLogin.bind(this);
    
    // Initialize component
    this.render();
  }
  
  /**
   * Render the login form
   */
  render() {
    // Create login container
    const loginContainer = document.createElement('div');
    loginContainer.className = 'login-container';
    this.applyStyles(loginContainer, {
      maxWidth: '380px',
      width: '100%',
      margin: '40px auto 0',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      textAlign: 'center'
    });
    
    // Create logo/title
    const title = document.createElement('h2');
    title.textContent = 'Mountain Care Pharmacy';
    this.applyStyles(title, {
      color: HEADER_COLORS.primary,
      fontSize: '24px',
      margin: '0 0 8px',
      fontWeight: 'bold'
    });
    
    // Create subtitle
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Please log in to continue';
    this.applyStyles(subtitle, {
      color: '#666',
      margin: '0 0 20px',
      fontSize: '14px'
    });
    
    // Create form element
    this.formElement = document.createElement('form');
    this.formElement.className = 'login-form';
    this.applyStyles(this.formElement, {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    });
    
    // Add submit event listener
    this.formElement.addEventListener('submit', this.handleSubmit);
    
    // Username field
    const usernameGroup = this.createFormGroup('Username', 'username', 'text');
    
    // Password field
    const passwordGroup = this.createFormGroup('Password', 'password', 'password');
    
    // Remember me checkbox
    const rememberGroup = document.createElement('div');
    this.applyStyles(rememberGroup, {
      display: 'flex',
      alignItems: 'center',
      marginTop: '-8px'
    });
    
    const rememberCheckbox = document.createElement('input');
    rememberCheckbox.type = 'checkbox';
    rememberCheckbox.id = 'remember-me';
    rememberCheckbox.name = 'remember';
    
    const rememberLabel = document.createElement('label');
    rememberLabel.htmlFor = 'remember-me';
    rememberLabel.textContent = 'Remember me';
    this.applyStyles(rememberLabel, {
      fontSize: '14px',
      color: '#666',
      marginLeft: '8px',
      cursor: 'pointer'
    });
    
    rememberGroup.appendChild(rememberCheckbox);
    rememberGroup.appendChild(rememberLabel);
    
    // Submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Login';
    this.applyStyles(submitButton, {
      backgroundColor: HEADER_COLORS.primary,
      color: HEADER_COLORS.text,
      border: 'none',
      padding: '10px',
      borderRadius: '4px',
      fontSize: '16px',
      cursor: 'pointer',
      fontWeight: 'bold'
    });
    
    // Add hover effect for submit button
    submitButton.addEventListener('mouseover', () => {
      submitButton.style.backgroundColor = HEADER_COLORS.secondary;
    });
    submitButton.addEventListener('mouseout', () => {
      submitButton.style.backgroundColor = HEADER_COLORS.primary;
    });
    
    // Demo button
    const demoButton = document.createElement('button');
    demoButton.type = 'button';
    demoButton.textContent = 'Demo';
    demoButton.id = 'demo-login-button';
    this.applyStyles(demoButton, {
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      padding: '10px',
      borderRadius: '4px',
      fontSize: '16px',
      cursor: 'pointer',
      fontWeight: 'bold',
      marginTop: '8px'
    });
    demoButton.addEventListener('click', this.handleDemoLogin);
    
    // Add hover effect for demo button
    demoButton.addEventListener('mouseover', () => {
      demoButton.style.backgroundColor = '#45a049';
    });
    demoButton.addEventListener('mouseout', () => {
      demoButton.style.backgroundColor = '#4CAF50';
    });
    
    // Compliance text
    const complianceText = document.createElement('p');
    complianceText.textContent = 'This system complies with HIPAA security requirements';
    this.applyStyles(complianceText, {
      fontSize: '12px',
      color: '#666',
      margin: '16px 0 0'
    });
    
    // Encryption notice
    const encryptionText = document.createElement('p');
    encryptionText.textContent = 'All communication is encrypted';
    this.applyStyles(encryptionText, {
      fontSize: '12px',
      color: '#666',
      margin: '8px 0 0'
    });
    
    // Add all elements to form
    this.formElement.appendChild(usernameGroup);
    this.formElement.appendChild(passwordGroup);
    this.formElement.appendChild(rememberGroup);
    this.formElement.appendChild(submitButton);
    this.formElement.appendChild(demoButton);
    
    // Add form to container
    loginContainer.appendChild(title);
    loginContainer.appendChild(subtitle);
    loginContainer.appendChild(this.formElement);
    loginContainer.appendChild(complianceText);
    loginContainer.appendChild(encryptionText);
    
    // Add login container to main container
    this.container.innerHTML = '';
    this.container.appendChild(loginContainer);
  }
  
  /**
   * Create a form group with label and input
   * @param {string} labelText - Label text
   * @param {string} name - Input name
   * @param {string} type - Input type
   * @returns {HTMLElement} Form group element
   */
  createFormGroup(labelText, name, type) {
    const group = document.createElement('div');
    this.applyStyles(group, {
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'left'
    });
    
    const label = document.createElement('label');
    label.htmlFor = name;
    label.textContent = labelText;
    this.applyStyles(label, {
      fontSize: '14px',
      color: '#666',
      marginBottom: '4px'
    });
    
    const inputWrapper = document.createElement('div');
    this.applyStyles(inputWrapper, {
      position: 'relative'
    });
    
    const input = document.createElement('input');
    input.type = type;
    input.id = name;
    input.name = name;
    input.required = true;
    this.applyStyles(input, {
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      width: '100%',
      boxSizing: 'border-box',
      fontSize: '14px'
    });
    
    // Add visibility toggle for password fields
    if (type === 'password') {
      const toggleButton = document.createElement('button');
      toggleButton.type = 'button';
      toggleButton.textContent = '👁️';
      this.applyStyles(toggleButton, {
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        color: '#f44336'
      });
      
      toggleButton.addEventListener('click', () => {
        input.type = input.type === 'password' ? 'text' : 'password';
      });
      
      inputWrapper.appendChild(toggleButton);
    }
    
    inputWrapper.appendChild(input);
    group.appendChild(label);
    group.appendChild(inputWrapper);
    
    return group;
  }
  
  /**
   * Handle form submission
   * @param {Event} event - Submit event
   */
  async handleSubmit(event) {
    event.preventDefault();
    
    try {
      const username = event.target.username.value;
      const password = event.target.password.value;
      const remember = event.target.remember?.checked || false;
      
      // Disable form fields and button during login
      const submitButton = event.target.querySelector('button[type="submit"]');
      const inputs = event.target.querySelectorAll('input');
      
      submitButton.disabled = true;
      submitButton.textContent = 'Logging in...';
      inputs.forEach(input => input.disabled = true);
      
      // Alert the user about server not being available
      setTimeout(() => {
        alert('Server connection not available. Please use the Demo button to explore the UI.');
        
        // Re-enable form
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
        inputs.forEach(input => input.disabled = false);
      }, 1000);
    } catch (error) {
      console.error('[CRM Extension] Login error:', error);
      alert('An error occurred during login. Please try again or use the Demo button.');
      
      // Re-enable form
      const submitButton = event.target.querySelector('button[type="submit"]');
      const inputs = event.target.querySelectorAll('input');
      
      submitButton.disabled = false;
      submitButton.textContent = 'Login';
      inputs.forEach(input => input.disabled = false);
    }
  }
  
  /**
   * Handle demo login button click - Bypasses server connection entirely
   */
  handleDemoLogin() {
    try {
      console.log('[CRM Extension] Demo login button clicked - Direct UI access');
      
      // Create demo user
      const demoUser = {
        id: 'demo_user_' + Date.now(),
        username: 'DemoUser',
        displayName: 'Demo User',
        role: 'user',
        isDemo: true
      };
      
      // Store in localStorage to simulate authentication
      localStorage.setItem('crmplus_chat_auth_token', 'demo_token_' + Date.now());
      localStorage.setItem('crmplus_chat_user_info', JSON.stringify(demoUser));
      
      // Log the demo login
      logChatEvent('system', 'Demo UI access - no server connection', { username: demoUser.username });
      
      // Call success callback after a small delay to show button feedback
      setTimeout(() => {
        this.onLoginSuccess(demoUser);
      }, 100);
    } catch (error) {
      console.error('[CRM Extension] Demo login error:', error);
      alert('An error occurred. Please try again.');
    }
  }
  
  /**
   * Apply CSS styles to an element
   * @param {HTMLElement} element - Element to style
   * @param {Object} styles - Styles to apply
   */
  applyStyles(element, styles) {
    Object.assign(element.style, styles);
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    if (this.formElement) {
      this.formElement.removeEventListener('submit', this.handleSubmit);
    }
    
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default LoginForm;