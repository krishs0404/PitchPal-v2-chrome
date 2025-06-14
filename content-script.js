// Content script for ColdMail AI Assistant
// This script runs in the context of Gmail pages

console.log('ColdMail AI Assistant content script loaded');

// Wait for Gmail to fully load
window.addEventListener('load', function() {
  // Give Gmail a moment to initialize its UI
  setTimeout(initializeExtension, 1500);
});

function initializeExtension() {
  // Inform background script that the page is ready for scanning
  chrome.runtime.sendMessage({
    action: 'scanPage',
    url: window.location.href
  });
  
  // Check if we're in a compose window
  if (isInComposeMode()) {
    injectComposeTools();
  }
  
  // Listen for Gmail navigation changes to detect compose window opening
  observeGmailNavigation();
}

// Check if we're in a Gmail compose window
function isInComposeMode() {
  return document.querySelector('div[role="dialog"] div[aria-label="Message Body"]') !== null;
}

// Inject our tools into the Gmail compose interface
function injectComposeTools() {
  // Find the compose area
  const composeArea = document.querySelector('div[role="dialog"] div[aria-label="Message Body"]');
  if (!composeArea) return;
  
  // Find the formatting toolbar
  const toolbar = composeArea.closest('div[role="dialog"]').querySelector('div[role="toolbar"]');
  if (!toolbar) return;
  
  // Check if our button already exists
  if (toolbar.querySelector('#coldmail-generate-btn')) return;
  
  // Create generate email button
  const generateBtn = document.createElement('button');
  generateBtn.id = 'coldmail-generate-btn';
  generateBtn.innerHTML = '✨ Generate Email';
  generateBtn.style.cssText = `
    margin-left: 10px;
    background-color: #1a73e8;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  `;
  
  // Add button to toolbar
  toolbar.appendChild(generateBtn);
  
  // Add event listener
  generateBtn.addEventListener('click', handleGenerateEmail);
}

// Handle generate email button click
function handleGenerateEmail() {
  // Extract recipient from the To field
  const recipientField = document.querySelector('div[role="dialog"] input[name="to"]');
  let recipientEmail = '';
  
  if (recipientField) {
    recipientEmail = recipientField.value.trim();
  }
  
  // Extract subject from the Subject field
  const subjectField = document.querySelector('div[role="dialog"] input[name="subjectbox"]');
  let subject = '';
  
  if (subjectField) {
    subject = subjectField.value.trim();
  }
  
  // Show our extension popup for email generation
  chrome.runtime.sendMessage({
    action: 'showGenerationForm',
    data: {
      recipient: recipientEmail,
      subject: subject
    }
  }, function(response) {
    if (response && response.generatedEmail) {
      insertGeneratedEmail(response.generatedEmail);
    }
  });
}

// Insert generated email into compose window
function insertGeneratedEmail(emailContent) {
  const composeBody = document.querySelector('div[role="dialog"] div[aria-label="Message Body"]');
  if (!composeBody) return;
  
  // Simple way to insert text (in a real extension, would handle HTML/rich text)
  composeBody.innerText = emailContent;
  
  // Focus on the compose area to simulate user interaction
  composeBody.focus();
}

// Observer to detect when Gmail's UI changes (e.g., compose window opens)
function observeGmailNavigation() {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        // Check if any added node is a compose window
        if (isInComposeMode()) {
          // Wait a moment for Gmail to fully render the compose window
          setTimeout(injectComposeTools, 500);
        }
      }
    });
  });
  
  // Observe the entire document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Extract information from Gmail contact/profile
function extractRecipientInfo() {
  // In a real implementation, this would extract info from Gmail
  // This is a placeholder for demonstration purposes
  
  let info = {
    name: '',
    email: '',
    company: '',
    title: ''
  };
  
  // Look for a profile card or contact info in Gmail
  const profileCard = document.querySelector('.gD'); // This selector would need to be adjusted
  if (profileCard) {
    const nameElement = profileCard.querySelector('.gE');
    if (nameElement) {
      info.name = nameElement.textContent.trim();
    }
    
    // Additional extraction would be implemented here
  }
  
  return info;
}
