// Gmail AI Compose Integration - Content Script
// Interacts with Gmail interface to add AI composition features

interface GmailComposeButton {
  element: HTMLElement;
  observer?: MutationObserver;
}

class GmailIntegration {
  private composeButtons: GmailComposeButton[] = [];
  private observerConfig = { childList: true, subtree: true };
  private mainObserver: MutationObserver;
  private initialized = false;

  constructor() {
    console.log('ColdMail AI Assistant: Content script loaded');
    this.mainObserver = new MutationObserver(this.onDOMChange.bind(this));
  }

  /**
   * Initialize Gmail integration
   */
  public init(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Start observing the document body for changes
    this.mainObserver.observe(document.body, this.observerConfig);
    
    // Initial scan for compose buttons
    this.scanForComposeButtons();

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener(this.handleMessages.bind(this));

    console.log('ColdMail AI Assistant: Initialized Gmail integration');
  }

  /**
   * Handle DOM changes to detect new compose buttons
   */
  private onDOMChange(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        this.scanForComposeButtons();
      }
    }
  }

  /**
   * Scan the DOM for Gmail compose buttons
   */
  private scanForComposeButtons(): void {
    // Gmail's compose button has different selectors in different views
    const composeSelectors = [
      'div[gh="cm"]', // Main view compose button
      '.T-I.T-I-KE.L3' // Alternative selector
    ];

    for (const selector of composeSelectors) {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach((button) => {
        if (button instanceof HTMLElement && !this.isButtonTracked(button)) {
          this.injectAIComposeButton(button);
        }
      });
    }
  }

  /**
   * Check if a button is already being tracked
   */
  private isButtonTracked(element: HTMLElement): boolean {
    return this.composeButtons.some(btn => btn.element === element);
  }

  /**
   * Inject AI compose button next to Gmail's compose button
   */
  private injectAIComposeButton(composeButton: HTMLElement): void {
    // Don't add if the button already has our AI button as a sibling
    const existingButton = composeButton.parentElement?.querySelector('.coldmail-ai-button');
    if (existingButton) return;

    // Create our custom AI compose button
    const aiButton = document.createElement('div');
    aiButton.className = 'coldmail-ai-button';
    aiButton.innerHTML = '✨ Compose with AI';
    
    // Style to match Gmail's compose button
    aiButton.style.cssText = `
      margin-top: 8px;
      padding: 10px 16px;
      background-color: #1a73e8;
      color: white;
      border-radius: 24px;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 1px 2px 0 rgba(60,64,67,0.302), 0 1px 3px 1px rgba(60,64,67,0.149);
      transition: box-shadow .08s linear,min-width .15s cubic-bezier(0.4,0.0,0.2,1);
      text-align: center;
    `;

    // Add click event listener
    aiButton.addEventListener('click', this.onAIComposeClick.bind(this));

    // Insert our button after Gmail's compose button
    if (composeButton.parentElement) {
      composeButton.parentElement.insertBefore(aiButton, composeButton.nextSibling);
    }

    // Track the button
    const buttonInfo: GmailComposeButton = { element: composeButton };
    this.composeButtons.push(buttonInfo);
    
    console.log('ColdMail AI Assistant: AI compose button injected');
  }

  /**
   * Handle click on AI compose button
   */
  private onAIComposeClick(): void {
    // Wait for the compose window to appear
    setTimeout(() => {
      // Find the open compose window
      const composeWindow = document.querySelector('div[role="dialog"][aria-label*="Compose"]');
      if (!composeWindow) {
        console.warn('ColdMail AI Assistant: No compose window found');
        return;
      }

      // Find the draft body area
      const draftBody = composeWindow.querySelector('div[role="textbox"][aria-label="Message Body"]');
      if (!draftBody) {
        console.warn('ColdMail AI Assistant: No draft body found');
        return;
      }

      // Read the current draft content
      const draftContent = draftBody.textContent || '';

      // Read the recipient and subject
      const recipientField = composeWindow.querySelector('input[name="to"]') as HTMLInputElement;
      const subjectField = composeWindow.querySelector('input[name="subjectbox"]') as HTMLInputElement;
      
      const recipient = recipientField?.value || '';
      const subject = subjectField?.value || '';

      // Create a prompt with all context
      const prompt = `
Recipient: ${recipient}
Subject: ${subject}
Draft Content: ${draftContent}
      `.trim();

      // Send message to background script
      chrome.runtime.sendMessage({ 
        type: 'GENERATE_EMAIL', 
        prompt 
      });

      // Show generating indicator
      this.showGeneratingIndicator(composeWindow, draftBody as HTMLElement);
    }, 300); // Short delay to ensure compose window is open
  }

  /**
   * Show an indicator that email is being generated
   */
  private showGeneratingIndicator(composeWindow: Element, draftBody: HTMLElement): void {
    // Create a loading overlay
    const overlay = document.createElement('div');
    overlay.id = 'coldmail-generating-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Google Sans', Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
    `;

    // Add loading indicator and text
    overlay.innerHTML = `
      <div style="width: 48px; height: 48px; border: 4px solid #f3f3f3; border-top: 4px solid #1a73e8; border-radius: 50%; animation: coldmail-spin 1s linear infinite;"></div>
      <div style="margin-top: 16px; font-size: 16px; color: #202124;">Generating email with AI...</div>
      <style>
        @keyframes coldmail-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    // Position the overlay
    const container = draftBody.closest('div[role="dialog"]');
    if (container) {
      (container as HTMLElement).style.position = 'relative';
      container.appendChild(overlay);
    }
  }

  /**
   * Handle messages from background script
   */
  private handleMessages(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): void {
    if (message.type === 'EMAIL_RESULT') {
      this.handleEmailResult(message.emailText);
      sendResponse({ status: 'received' });
    } else if (message.type === 'EMAIL_ERROR') {
      this.handleEmailError(message.error);
      sendResponse({ status: 'error_received' });
    }
  }

  /**
   * Handle successful email generation
   */
  private handleEmailResult(emailText: string): void {
    // Remove loading overlay
    const overlay = document.getElementById('coldmail-generating-overlay');
    if (overlay) {
      overlay.remove();
    }

    // Find the open compose window
    const composeWindow = document.querySelector('div[role="dialog"][aria-label*="Compose"]');
    if (!composeWindow) return;

    // Find the draft body area
    const draftBody = composeWindow.querySelector('div[role="textbox"][aria-label="Message Body"]');
    if (!draftBody) return;

    // Insert the generated email
    draftBody.innerHTML = emailText.replace(/\n/g, '<br>');
  }

  /**
   * Handle email generation error
   */
  private handleEmailError(error: string): void {
    // Remove loading overlay
    const overlay = document.getElementById('coldmail-generating-overlay');
    if (overlay) {
      overlay.remove();
    }

    // Show error notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 16px;
      right: 16px;
      background-color: #f8d7da;
      color: #721c24;
      padding: 12px 16px;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 9999;
      max-width: 300px;
      font-family: 'Google Sans', Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
    `;
    notification.textContent = `Error generating email: ${error}`;
    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// Initialize when the document is fully loaded
window.addEventListener('load', () => {
  const gmailIntegration = new GmailIntegration();
  gmailIntegration.init();
});
