// Background script for ColdMail AI Assistant

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(function() {
  console.log('ColdMail AI Assistant installed');
  
  // Set default settings
  chrome.storage.local.set({
    apiUrl: 'https://api.your-backend.com/generate',
    emailTone: 'professional',
    autoSuggest: true
  });
  
  // Create a context menu item for quick access
  chrome.contextMenus.create({
    id: 'generate-email',
    title: 'Generate Email for Selected Contact',
    contexts: ['selection']
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === 'generate-email') {
    // Send selected text to popup for processing
    chrome.storage.local.set({
      'selectedText': info.selectionText
    }, function() {
      // Open popup with selected text
      chrome.action.openPopup();
    });
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'generateEmail') {
    // In a real implementation, this would call your API
    generateEmail(request.data)
      .then(response => sendResponse({success: true, data: response}))
      .catch(error => sendResponse({success: false, error: error.message}));
    return true; // Required for async sendResponse
  }
  
  if (request.action === 'scanPage') {
    // Notify the user that the extension is analyzing the page
    chrome.action.setBadgeText({text: '...'});
    chrome.action.setBadgeBackgroundColor({color: '#1a73e8'});
    
    // Clear badge after 3 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({text: ''});
    }, 3000);
    
    sendResponse({success: true, message: 'Page scan initiated'});
    return true;
  }
});

// Mock function for generating email
async function generateEmail(data) {
  // In a real implementation, this would call your API
  // This is just a placeholder that simulates an API call
  
  return new Promise((resolve, reject) => {
    // Check if API key is configured
    chrome.storage.local.get(['apiKey', 'apiUrl'], function(items) {
      if (!items.apiKey) {
        reject(new Error('API key not configured. Please visit the options page.'));
        return;
      }
      
      // Simulate API call with a timeout
      setTimeout(() => {
        // Sample response structure
        const response = {
          subject: `Personalized outreach to ${data.recipient.split(' ')[0]}`,
          body: `Dear ${data.recipient},\n\nI'm reaching out because I noticed your work at ${data.company || '[company]'} and thought my solution might be valuable to you.\n\nWould you be available for a brief call to discuss this further?\n\nBest regards,\n[Your Name]`,
          suggestedFollowUps: [
            '3 days if no response',
            '1 week with additional value proposition'
          ]
        };
        
        resolve(response);
      }, 1500);
    });
  });
}
