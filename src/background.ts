// Background service worker for ColdMail AI Assistant
// Uses Manifest V3 service worker API

interface GenerateEmailMessage {
  type: 'GENERATE_EMAIL';
  prompt: string;
}

interface EmailResult {
  emailText: string;
}

interface StorageConfig {
  apiUrl?: string;
  oauthClientId?: string;
}

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(async () => {
  console.log('ColdMail AI Assistant installed');
  
  // Set default settings
  await chrome.storage.sync.set({
    apiUrl: 'https://api.your-backend.com/generate',
    emailTone: 'professional'
  });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GENERATE_EMAIL') {
    // Need to handle this asynchronously
    handleGenerateEmail(message as GenerateEmailMessage, sender)
      .then(() => {
        console.log('Email generation process completed');
      })
      .catch(error => {
        console.error('Email generation failed:', error);
      });
    
    // Return true to indicate we'll send a response asynchronously
    return true;
  }
});

/**
 * Handle email generation request
 */
async function handleGenerateEmail(
  message: GenerateEmailMessage, 
  sender: chrome.runtime.MessageSender
): Promise<void> {
  try {
    if (!sender.tab?.id) {
      throw new Error('Invalid sender tab information');
    }

    const tabId = sender.tab.id;
    console.log(`Processing email generation request from tab ${tabId}`);

    // Get API configuration from storage
    const config = await getStorageConfig();
    
    if (!config.apiUrl) {
      throw new Error('API URL not configured. Please visit the options page.');
    }

    // Make API request
    const emailResult = await generateEmailFromAPI(config.apiUrl, message.prompt);
    
    // Send the result back to the content script
    await chrome.tabs.sendMessage(tabId, { 
      type: 'EMAIL_RESULT', 
      emailText: emailResult.emailText 
    });

  } catch (error) {
    console.error('Error in handleGenerateEmail:', error);
    
    // Send error message to content script
    if (sender.tab?.id) {
      await chrome.tabs.sendMessage(sender.tab.id, { 
        type: 'EMAIL_ERROR', 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
}

/**
 * Get storage configuration
 */
async function getStorageConfig(): Promise<StorageConfig> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['apiUrl', 'oauthClientId'], (result) => {
      resolve({
        apiUrl: result.apiUrl as string,
        oauthClientId: result.oauthClientId as string
      });
    });
  });
}

/**
 * Make API request to generate email
 */
async function generateEmailFromAPI(apiUrl: string, prompt: string): Promise<EmailResult> {
  try {
    console.log(`Making API request to ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API request failed (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.emailText) {
      throw new Error('Invalid API response: missing emailText field');
    }

    return data as EmailResult;
  } catch (error) {
    console.error('API request failed:', error);
    throw new Error(error instanceof Error ? 
      `API request failed: ${error.message}` : 
      'API request failed with unknown error');
  }
}

/**
 * Log extension status
 */
function logStatus(message: string): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ColdMail AI: ${message}`);
}

// Log that the service worker has started
logStatus('Background service worker initialized');
