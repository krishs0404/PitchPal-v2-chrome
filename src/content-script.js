// Content script for ColdMail AI Assistant
// This script runs in the context of Gmail pages

console.log('ColdMail AI Assistant content script loaded');

// Wait for Gmail to fully load
window.addEventListener('load', function() {
  // Give Gmail a moment to initialize its UI
  setTimeout(initializeExtension, 1500);
});

function initializeExtension() {
  console.log('Initializing ColdMail AI Assistant in Gmail');
  
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
  
  // Show a simple popup form
  showGenerationForm(recipientEmail, subject);
}

// Show a form to configure the email generation
function showGenerationForm(recipientEmail, subject) {
  // Create popup container
  const formContainer = document.createElement('div');
  formContainer.className = 'coldmail-form-container';
  formContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    z-index: 9999;
    width: 400px;
    max-width: 90vw;
    font-family: Arial, sans-serif;
  `;
  
  // Create form content
  formContainer.innerHTML = `
    <h2 style="margin-top: 0; color: #1a73e8;">Generate Email</h2>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">To:</label>
      <input type="email" id="coldmail-recipient" value="${recipientEmail}" placeholder="recipient@example.com" style="width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ddd; border-radius: 4px;">
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">Subject:</label>
      <input type="text" id="coldmail-subject" value="${subject}" placeholder="Brief, compelling subject line" style="width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ddd; border-radius: 4px;">
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">Tone:</label>
      <select id="coldmail-tone" style="width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ddd; border-radius: 4px;">
        <option value="friendly">Friendly</option>
        <option value="professional" selected>Professional</option>
        <option value="persuasive">Persuasive</option>
        <option value="direct">Direct</option>
      </select>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">Context (optional):</label>
      <textarea id="coldmail-context" placeholder="Add any additional context about the recipient or purpose of the email" style="width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ddd; border-radius: 4px; height: 80px; resize: vertical;"></textarea>
    </div>
    
    <div style="display: flex; justify-content: space-between;">
      <button id="coldmail-cancel" style="padding: 8px 15px; background: #f1f1f1; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">Cancel</button>
      <button id="coldmail-generate" style="padding: 8px 15px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer;">Generate</button>
    </div>
    
    <div id="coldmail-status" style="margin-top: 15px; display: none;"></div>
  `;
  
  // Add to page
  document.body.appendChild(formContainer);
  
  // Add event handlers
  document.getElementById('coldmail-cancel').addEventListener('click', function() {
    document.body.removeChild(formContainer);
  });
  
  document.getElementById('coldmail-generate').addEventListener('click', function() {
    const recipient = document.getElementById('coldmail-recipient').value;
    const subject = document.getElementById('coldmail-subject').value;
    const tone = document.getElementById('coldmail-tone').value;
    const context = document.getElementById('coldmail-context').value;
    
    const statusEl = document.getElementById('coldmail-status');
    statusEl.style.display = 'block';
    statusEl.innerHTML = '<div style="text-align:center">Generating email...</div>';
    
    // Construct the prompt
    const prompt = `
      Generate a ${tone} email to ${recipient} 
      with the subject "${subject}".
      ${context ? 'Additional context: ' + context : ''}
    `;
    
    // Send message to background script
    chrome.runtime.sendMessage({ 
      type: 'GENERATE_EMAIL', 
      prompt 
    }, function(response) {
      if (response?.error) {
        statusEl.innerHTML = `<div style="color:red">Error: ${response.error}</div>`;
      } else if (response?.success && response?.email) {
        // Insert the generated email into the compose window
        const composeBody = document.querySelector('div[role="dialog"] div[aria-label="Message Body"]');
        if (composeBody) {
          composeBody.focus();
          // Set the email content
          document.execCommand('insertText', false, response.email.body);
          
          // Set the email subject if provided and not already set
          const subjectField = document.querySelector('div[role="dialog"] input[name="subjectbox"]');
          if (subjectField && (!subjectField.value || subjectField.value === subject)) {
            subjectField.value = response.email.subject;
            
            // Trigger input event to ensure Gmail registers the change
            const inputEvent = new Event('input', { bubbles: true });
            subjectField.dispatchEvent(inputEvent);
          }
        }
        
        // Close the form
        document.body.removeChild(formContainer);
      } else {
        statusEl.innerHTML = '<div style="color:red">Unknown error occurred</div>';
      }
    });
  });
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
