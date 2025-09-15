(function () {
  'use strict';

  // Prevent multiple instances
  if (window.ChatbotWidget) {
    return;
  }

  // CSS Styles as string
  /* Replace your CSS_STYLES constant with these enhanced styles */

  const CSS_STYLES = `
        /* Reset and base styles for chatbot */
        .chatbot-container * {
            box-sizing: border-box;
        }

        /* Chatbot container - positioned fixed for embedding */
        .chatbot-container {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        /* Enhanced toggle button with modern design */
        .chatbot-toggle {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--chatbot-primary-color, #4f46e5) 0%, var(--chatbot-primary-hover, #3730a3) 100%);
            border: none;
            cursor: pointer;
            box-shadow: 0 8px 32px rgba(79, 70, 229, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            color: white;
            font-size: 24px;
            position: relative;
            overflow: hidden;
        }

        .chatbot-toggle::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .chatbot-toggle:hover {
            transform: scale(1.1) translateY(-2px);
            box-shadow: 0 12px 40px rgba(79, 70, 229, 0.5);
        }

        .chatbot-toggle:hover::before {
            opacity: 1;
        }

        .chatbot-toggle.active {
            background: linear-gradient(135deg, var(--chatbot-danger-color, #ef4444) 0%, #dc2626 100%);
            box-shadow: 0 8px 32px rgba(239, 68, 68, 0.4);
        }

        /* Enhanced chat window with glassmorphism effect */
        .chatbot-window {
            position: absolute;
            bottom: 88px;
            right: 0;
            width: 420px;
            height: 580px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
            display: none;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .chatbot-window.open {
            display: flex;
            animation: chatbot-slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes chatbot-slideUp {
            from {
                opacity: 0;
                transform: translateY(30px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        /* Modern header with gradient */
        .chatbot-header {
            background: linear-gradient(135deg, var(--chatbot-primary-color, #4f46e5) 0%, var(--chatbot-primary-hover, #3730a3) 100%);
            color: var(--chatbot-header-text-color, #ffffff);
            padding: 20px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
        }

        .chatbot-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%);
        }

        .chatbot-title {
            font-size: 18px;
            font-weight: 700;
            margin: 0;
            position: relative;
            z-index: 1;
            letter-spacing: -0.025em;
        }

        .chatbot-close {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: var(--chatbot-header-text-color, #ffffff);
            font-size: 20px;
            cursor: pointer;
            padding: 8px;
            border-radius: 12px;
            transition: all 0.3s ease;
            position: relative;
            z-index: 1;
            backdrop-filter: blur(10px);
        }

        .chatbot-close:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.1);
        }

        /* Enhanced messages area */
        .chatbot-messages {
            flex: 1;
            padding: 24px;
            overflow-y: auto;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            display: flex;
            flex-direction: column;
            gap: 16px;
            position: relative;
        }

        .chatbot-messages::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 80%, rgba(79, 70, 229, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.05) 0%, transparent 50%);
            pointer-events: none;
        }

        .chatbot-messages::-webkit-scrollbar {
            width: 6px;
        }

        .chatbot-messages::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
            border-radius: 6px;
        }

        .chatbot-messages::-webkit-scrollbar-track {
            background: transparent;
        }

        /* Enhanced message bubbles */
        .chatbot-message {
            max-width: 85%;
            padding: 16px 20px;
            border-radius: 20px;
            font-size: 14px;
            line-height: 1.5;
            word-wrap: break-word;
            position: relative;
            animation: messageSlide 0.3s ease-out;
        }

        @keyframes messageSlide {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .chatbot-message.bot {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
            color: var(--chatbot-bot-message-text, #1e293b);
            align-self: flex-start;
            border: 1px solid rgba(226, 232, 240, 0.6);
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .chatbot-message.bot::before {
            content: '';
            position: absolute;
            left: -8px;
            top: 20px;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 8px 8px 8px 0;
            border-color: transparent rgba(255, 255, 255, 0.9) transparent transparent;
        }

        .chatbot-message.user {
            background: linear-gradient(135deg, var(--chatbot-primary-color, #4f46e5) 0%, var(--chatbot-primary-hover, #3730a3) 100%);
            color: var(--chatbot-user-message-text, #ffffff);
            align-self: flex-end;
            box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3);
        }

        .chatbot-message.user::after {
            content: '';
            position: absolute;
            right: -8px;
            top: 20px;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 8px 0 8px 8px;
            border-color: transparent transparent transparent var(--chatbot-primary-color, #4f46e5);
        }

        /* Enhanced typing indicator */
        .chatbot-typing-indicator {
    display: none;
    align-self: flex-start;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
    border: 1px solid rgba(226, 232, 240, 0.6);
    padding: 16px 20px;
    border-radius: 20px;
    max-width: 100px;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    margin-bottom: 16px; /* Add spacing from next message */
    position: relative;
}

/* Add the message bubble tail */
.chatbot-typing-indicator::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 20px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 8px 8px 8px 0;
    border-color: transparent rgba(255, 255, 255, 0.9) transparent transparent;
}

        .chatbot-typing-indicator.show {
            display: block;
            animation: messageSlide 0.3s ease-out;
        }

        .chatbot-typing-dots {
            display: flex;
            gap: 6px;
            justify-content: center;
        }

        .chatbot-typing-dots span {
            width: 8px;
            height: 8px;
            background: linear-gradient(135deg, #64748b 0%, #475569 100%);
            border-radius: 50%;
            animation: chatbot-typing 1.4s infinite ease-in-out;
        }

        .chatbot-typing-dots span:nth-child(2) {
            animation-delay: 0.16s;
        }

        .chatbot-typing-dots span:nth-child(3) {
            animation-delay: 0.32s;
        }

        @keyframes chatbot-typing {
            0%, 80%, 100% { 
                transform: scale(0.8);
                opacity: 0.5; 
            }
            40% { 
                transform: scale(1);
                opacity: 1; 
            }
        }

        /* Enhanced input area */
        .chatbot-input-area {
            padding: 20px 24px 24px;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(226, 232, 240, 0.6);
            display: flex;
            gap: 12px;
            align-items: flex-end;
        }

        .chatbot-input {
            flex: 1;
            border: 2px solid rgba(226, 232, 240, 0.8);
            border-radius: 16px;
            padding: 16px 20px;
            font-size: 14px;
            font-family: inherit;
            background: rgba(255, 255, 255, 0.9);
            color: var(--chatbot-input-text, #1e293b);
            resize: none;
            min-height: 48px;
            max-height: 120px;
            outline: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
        }

        .chatbot-input:focus {
            border-color: var(--chatbot-primary-color, #4f46e5);
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
            transform: translateY(-1px);
        }

        .chatbot-input::placeholder {
            color: var(--chatbot-placeholder-color, #64748b);
        }

        .chatbot-send {
            width: 48px;
            height: 48px;
            border: none;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--chatbot-primary-color, #4f46e5) 0%, var(--chatbot-primary-hover, #3730a3) 100%);
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            flex-shrink: 0;
            box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3);
        }

        .chatbot-send:hover:not(:disabled) {
            background: linear-gradient(135deg, var(--chatbot-primary-hover, #3730a3) 0%, #312e81 100%);
            transform: scale(1.05) translateY(-1px);
            box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
        }

        .chatbot-send:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        /* Enhanced welcome message */
        .chatbot-welcome-message {
            text-align: center;
            color: var(--chatbot-welcome-text, #64748b);
            font-size: 14px;
            padding: 24px;
            font-weight: 500;
        }

        /* Enhanced mobile responsive */
        @media (max-width: 480px) {
            .chatbot-container {
                bottom: 16px;
                right: 16px;
                left: 16px;
            }

            .chatbot-window {
                width: 100%;
                height: 75vh;
                max-height: 600px;
                bottom: 88px;
                right: 0;
                left: 0;
                margin: 0;
                border-radius: 24px 24px 0 0;
            }

            .chatbot-toggle {
                width: 60px;
                height: 60px;
                font-size: 22px;
                position: absolute;
                right: 0;
            }

            .chatbot-message {
                max-width: 90%;
            }

            .chatbot-messages {
                padding: 20px;
            }

            .chatbot-input-area {
                padding: 16px 20px 20px;
            }

            .chatbot-header {
                padding: 16px 20px;
            }
        }

        @media (max-width: 320px) {
            .chatbot-window {
                height: 85vh;
                border-radius: 20px 20px 0 0;
            }
            
            .chatbot-messages {
                padding: 16px;
                gap: 12px;
            }
            
            .chatbot-input-area {
                padding: 12px 16px 16px;
            }

            .chatbot-message {
                padding: 12px 16px;
                font-size: 13px;
            }

            .chatbot-toggle {
                width: 56px;
                height: 56px;
                font-size: 20px;
            }
        }

        /* Position variants with enhanced spacing */
        .chatbot-container.position-bottom-left {
            left: 24px;
            right: auto;
        }

        .chatbot-container.position-bottom-left .chatbot-window {
            left: 0;
            right: auto;
        }

        @media (max-width: 480px) {
            .chatbot-container.position-bottom-left {
                left: 16px;
            }

            .chatbot-container.position-bottom-left .chatbot-toggle {
                left: 0;
                right: auto;
            }
        }

        /* Dark theme enhancements */
        .chatbot-container.dark-theme {
            --chatbot-bg-color: rgba(15, 23, 42, 0.95);
            --chatbot-messages-bg: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            --chatbot-bot-message-bg: linear-gradient(135deg, rgba(51, 65, 85, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%);
            --chatbot-bot-message-text: #f1f5f9;
            --chatbot-bot-message-border: rgba(71, 85, 105, 0.6);
            --chatbot-input-bg: rgba(51, 65, 85, 0.9);
            --chatbot-input-text: #f1f5f9;
            --chatbot-input-border: rgba(71, 85, 105, 0.8);
            --chatbot-input-area-bg: rgba(15, 23, 42, 0.8);
            --chatbot-border-color: rgba(71, 85, 105, 0.6);
            --chatbot-placeholder-color: #94a3b8;
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
            .chatbot-toggle,
            .chatbot-window,
            .chatbot-message,
            .chatbot-send,
            .chatbot-input {
                animation: none !important;
                transition: none !important;
            }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
            .chatbot-window {
                border: 2px solid;
            }
            
            .chatbot-message.bot {
                border: 2px solid;
            }
        }
    `;

  // SVG Icons
  const ICONS = {
    chat: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
        </svg>`,
    close: '×',
    send: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>`,
  };

  class ChatbotWidget {
    constructor(config = {}) {
      this.config = {
        apiEndpoint: config.apiEndpoint || '',
        title: config.title || 'Chat Support',
        welcomeMessage:
          config.welcomeMessage || 'Hello! How can I help you today?',
        placeholder: config.placeholder || 'Type your message...',
        position: config.position || 'bottom-right',
        theme: config.theme || 'light',
        ...config,
      };

      this.isOpen = false;
      this.isLoading = false;
      this.messages = [];
      this.styleSheet = null;

      this.init();
    }

    init() {
      this.injectStyles();
      this.createWidget();
      this.applyCustomStyles();
      this.bindEvents();
      this.addWelcomeMessage();
    }

    injectStyles() {
      if (!document.getElementById('chatbot-widget-styles')) {
        this.styleSheet = document.createElement('style');
        this.styleSheet.id = 'chatbot-widget-styles';
        this.styleSheet.textContent = CSS_STYLES;
        document.head.appendChild(this.styleSheet);
      }
    }

    createWidget() {
      // Create container
      this.container = document.createElement('div');
      this.container.className = `chatbot-container position-${this.config.position}`;

      // Create HTML structure
      this.container.innerHTML = `
                <div class="chatbot-window" id="chatbot-window">
                    <div class="chatbot-header">
                        <h3 class="chatbot-title">${this.config.title}</h3>
                        <button class="chatbot-close" id="chatbot-close">${ICONS.close}</button>
                    </div>
                    <div class="chatbot-messages" id="chatbot-messages"></div>
                    <div class="chatbot-input-area">
                        <textarea class="chatbot-input" id="chatbot-input" placeholder="${this.config.placeholder}" rows="1"></textarea>
                        <button class="chatbot-send" id="chatbot-send">${ICONS.send}</button>
                    </div>
                </div>
                <button class="chatbot-toggle" id="chatbot-toggle">${ICONS.chat}</button>
            `;

      document.body.appendChild(this.container);

      // Get references to elements
      this.toggleBtn = this.container.querySelector('#chatbot-toggle');
      this.window = this.container.querySelector('#chatbot-window');
      this.closeBtn = this.container.querySelector('#chatbot-close');
      this.messagesContainer =
        this.container.querySelector('#chatbot-messages');
      this.input = this.container.querySelector('#chatbot-input');
      this.sendBtn = this.container.querySelector('#chatbot-send');
    }

    applyCustomStyles() {
      const root = document.documentElement;

      // Apply custom CSS variables if provided
      Object.keys(this.config).forEach((key) => {
        if (
          key.endsWith('Color') ||
          key.endsWith('Bg') ||
          key.endsWith('Border') ||
          key.endsWith('Text')
        ) {
          const cssVar =
            '--chatbot-' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
          root.style.setProperty(cssVar, this.config[key]);
        }
      });

      // Apply theme presets
      if (this.config.theme === 'dark') {
        this.applyDarkTheme();
      }
    }

    applyDarkTheme() {
      const root = document.documentElement;
      const darkTheme = {
        '--chatbot-bg-color': '#2c2c2c',
        '--chatbot-messages-bg': '#1e1e1e',
        '--chatbot-bot-message-bg': '#3c3c3c',
        '--chatbot-bot-message-text': '#ffffff',
        '--chatbot-bot-message-border': '#4c4c4c',
        '--chatbot-input-bg': '#3c3c3c',
        '--chatbot-input-text': '#ffffff',
        '--chatbot-input-border': '#4c4c4c',
        '--chatbot-input-area-bg': '#2c2c2c',
        '--chatbot-border-color': '#4c4c4c',
        '--chatbot-placeholder-color': '#aaaaaa',
      };

      Object.entries(darkTheme).forEach(([prop, value]) => {
        root.style.setProperty(prop, value);
      });
    }

    bindEvents() {
      // Toggle button
      this.toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      // Close button
      this.closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close();
      });

      // Send button
      this.sendBtn.addEventListener('click', () => this.sendMessage());

      // Input events
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      this.input.addEventListener('input', () => this.autoResize());

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (this.isOpen && !this.container.contains(e.target)) {
          this.close();
        }
      });

      // Prevent closing when clicking inside
      this.window.addEventListener('click', (e) => e.stopPropagation());
    }

    autoResize() {
      this.input.style.height = 'auto';
      this.input.style.height = Math.min(this.input.scrollHeight, 120) + 'px';
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.isOpen = true;
      this.window.classList.add('open');
      this.toggleBtn.classList.add('active');
      this.toggleBtn.innerHTML = ICONS.close;
      setTimeout(() => this.input.focus(), 300);
    }

    close() {
      this.isOpen = false;
      this.window.classList.remove('open');
      this.toggleBtn.classList.remove('active');
      this.toggleBtn.innerHTML = ICONS.chat;
    }

    addWelcomeMessage() {
      if (this.config.welcomeMessage) {
        this.addMessage(this.config.welcomeMessage, 'bot');
      }
    }

    addMessage(text, sender) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `chatbot-message ${sender}`;
      messageDiv.textContent = text;

      this.messagesContainer.appendChild(messageDiv);
      this.scrollToBottom();

      this.messages.push({ text, sender, timestamp: new Date() });
    }

    showTyping() {
      // Remove existing typing indicator if present
      const existingTyping = this.messagesContainer.querySelector(
        '#chatbot-typing-indicator',
      );
      if (existingTyping) {
        existingTyping.remove();
      }

      // Create and append new typing indicator
      const typingDiv = document.createElement('div');
      typingDiv.className = 'chatbot-typing-indicator show';
      typingDiv.id = 'chatbot-typing-indicator';
      typingDiv.innerHTML = `
        <div class="chatbot-typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

      this.messagesContainer.appendChild(typingDiv);
      this.typingIndicator = typingDiv;
      this.scrollToBottom();
    }

    hideTyping() {
      const typingIndicator = this.messagesContainer.querySelector(
        '#chatbot-typing-indicator',
      );
      if (typingIndicator) {
        typingIndicator.remove();
      }
      this.typingIndicator = null;
    }

    scrollToBottom() {
      setTimeout(() => {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      }, 50);
    }

    async sendMessage() {
      const message = this.input.value.trim();
      if (!message || this.isLoading) return;

      // Validate API endpoint
      if (!this.config.apiEndpoint) {
        console.error('Chatbot Widget: No API endpoint configured');
        this.addMessage('Configuration error: No API endpoint set.', 'bot');
        return;
      }

      // Add user message
      this.addMessage(message, 'user');
      this.input.value = '';
      this.autoResize();

      // Show typing indicator
      this.showTyping();
      this.isLoading = true;
      this.sendBtn.disabled = true;

      try {
        // Make API call to backend
        const response = await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiHeaders || {}),
          },
          body: JSON.stringify({
            message: message,
            conversation_id: this.config.conversationId || null,
            user_id: this.config.userId || null,
            ...this.config.customPayload,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Hide typing indicator
        this.hideTyping();

        // Add bot response
        const botMessage =
          data.response ||
          data.message ||
          data.reply ||
          'Sorry, I could not process your request.';
        this.addMessage(botMessage, 'bot');

        // Update conversation ID if provided
        if (data.conversation_id) {
          this.config.conversationId = data.conversation_id;
        }
      } catch (error) {
        console.error('Chatbot Widget API Error:', error);
        this.hideTyping();

        // Show error message or fallback response
        const errorMessage =
          this.config.errorMessage ||
          "Sorry, I'm having trouble connecting right now. Please try again later.";
        this.addMessage(errorMessage, 'bot');
      } finally {
        this.isLoading = false;
        this.sendBtn.disabled = false;
        this.input.focus();
      }
    }

    // Public API methods
    destroy() {
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      if (this.styleSheet && this.styleSheet.parentNode) {
        this.styleSheet.parentNode.removeChild(this.styleSheet);
      }
    }

    updateConfig(newConfig) {
      this.config = { ...this.config, ...newConfig };
      this.applyCustomStyles();

      // Update title if changed
      if (newConfig.title) {
        this.container.querySelector('.chatbot-title').textContent =
          newConfig.title;
      }

      // Update placeholder if changed
      if (newConfig.placeholder) {
        this.input.placeholder = newConfig.placeholder;
      }
    }

    clearMessages() {
      this.messagesContainer.innerHTML = '';
      this.messages = [];
      this.addWelcomeMessage();
    }

    // Get conversation history
    getMessages() {
      return [...this.messages];
    }

    // Programmatically add a message
    addBotMessage(text) {
      this.addMessage(text, 'bot');
    }

    // Show/hide the widget
    show() {
      this.container.style.display = 'block';
    }

    hide() {
      this.container.style.display = 'none';
    }
  }

  // Global API
  window.ChatbotWidget = {
    instance: null,

    init: function (config) {
      if (this.instance) {
        this.instance.destroy();
      }
      this.instance = new ChatbotWidget(config);
      return this.instance;
    },

    destroy: function () {
      if (this.instance) {
        this.instance.destroy();
        this.instance = null;
      }
    },

    getInstance: function () {
      return this.instance;
    },
  };

  // Auto-initialize if config is provided in script tag
  document.addEventListener('DOMContentLoaded', function () {
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];

    // Check for data attributes on script tag
    if (currentScript && currentScript.dataset.apiEndpoint) {
      const config = {};
      for (const attr in currentScript.dataset) {
        config[attr] = currentScript.dataset[attr];
      }
      window.ChatbotWidget.init(config);
    }
  });
})();
