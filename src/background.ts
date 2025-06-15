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
  openaiApiKey?: string;
}

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(async () => {
  console.log('ColdMail AI Assistant installed');
  
  // Set default settings
  await chrome.storage.sync.set({
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    emailTone: 'professional',
    openaiApiKey: '' // This needs to be configured by the user
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
    
    if (!config.openaiApiKey) {
      throw new Error('OpenAI API key not configured. Please visit the options page.');
    }

    // Make API request to OpenAI
    const emailResult = await generateEmailFromAPI(config.openaiApiKey, message.prompt);
    
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
    chrome.storage.sync.get(['apiUrl', 'oauthClientId', 'openaiApiKey'], (result) => {
      resolve({
        apiUrl: result.apiUrl as string,
        oauthClientId: result.oauthClientId as string,
        openaiApiKey: result.openaiApiKey as string
      });
    });
  });
}

/**
 * Make API request to generate email
 */
async function generateEmailFromAPI(apiKey: string, prompt: string): Promise<EmailResult> {
  try {
    console.log('Making OpenAI API request');
    
    // Call OpenAI API directly
    const openaiApiUrl = 'https://api.openai.com/v1/chat/completions';
    
    const response = await fetch(openaiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert cold email writer. Generate a concise, professional email based on the provided prompt.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API request failed (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid OpenAI API response: missing content');
    }

    return {
      emailText: data.choices[0].message.content.trim()
    };
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
