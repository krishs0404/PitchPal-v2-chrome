// Function to generate email using OpenAI API directly from popup
async function generateEmailWithOpenAI() {
  try {
    // Get form inputs
    const nameInput = document.getElementById('name');
    const companyInput = document.getElementById('company');
    const toneSelect = document.getElementById('tone');
    const generateButton = document.getElementById('generate-button');
    const emailOutput = document.getElementById('email-output');
    const statusMessage = document.getElementById('status-message');
    
    // Validate inputs
    if (!nameInput.value || !companyInput.value) {
      statusMessage.textContent = 'Please fill in all required fields';
      statusMessage.className = 'message error';
      return;
    }
    
    // Get values from inputs
    const name = nameInput.value;
    const company = companyInput.value;
    const tone = toneSelect.value || 'professional';
    
    // Show generating state
    generateButton.disabled = true;
    statusMessage.textContent = 'Generating email...';
    statusMessage.className = 'message info';
    emailOutput.value = '';
    
    // Get API key from Chrome storage
    const { openaiApiKey } = await new Promise(resolve => {
      chrome.storage.sync.get(['openaiApiKey'], resolve);
    });
    
    if (!openaiApiKey) {
      statusMessage.textContent = 'OpenAI API key not configured. Please visit the options page.';
      statusMessage.className = 'message error';
      generateButton.disabled = false;
      
      // Prompt to open options page
      setTimeout(() => {
        if (confirm('Would you like to configure your OpenAI API key now?')) {
          chrome.runtime.openOptionsPage();
        }
      }, 1000);
      
      return;
    }
    
    // Build the prompt for OpenAI
    const prompt = `Write a cold outreach email to ${name} at ${company} with a ${tone} tone, highlighting how our product can solve their key pain points. Be concise, actionable, and professional.`;
    
    // Make API request to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in writing effective cold outreach emails that get responses.'
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
    
    // Display the generated email
    const generatedEmail = data.choices[0].message.content.trim();
    emailOutput.value = generatedEmail;
    emailOutput.style.display = 'block';
    
    // Show success message
    statusMessage.textContent = 'Email generated successfully!';
    statusMessage.className = 'message success';
    
    // Enable copy button
    document.getElementById('copy-button').disabled = false;
    
  } catch (error) {
    console.error('Email generation failed:', error);
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = `Error: ${error.message || 'Unknown error'}`;
    statusMessage.className = 'message error';
  } finally {
    // Re-enable generate button
    document.getElementById('generate-button').disabled = false;
  }
}

// Function to copy the generated email to clipboard
function copyEmailToClipboard() {
  const emailOutput = document.getElementById('email-output');
  emailOutput.select();
  document.execCommand('copy');
  
  const statusMessage = document.getElementById('status-message');
  statusMessage.textContent = 'Email copied to clipboard!';
  statusMessage.className = 'message success';
  
  // Reset message after 3 seconds
  setTimeout(() => {
    statusMessage.textContent = '';
    statusMessage.className = '';
  }, 3000);
}

// Set up event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get form elements
  const emailForm = document.getElementById('email-form');
  const generateButton = document.getElementById('generate-button');
  const copyButton = document.getElementById('copy-button');
  
  // Set up form submission
  emailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    generateEmailWithOpenAI();
  });
  
  // Set up copy button
  copyButton.addEventListener('click', copyEmailToClipboard);
  
  // Check for API key on startup
  chrome.storage.sync.get(['openaiApiKey'], (result) => {
    if (!result.openaiApiKey) {
      const statusMessage = document.getElementById('status-message');
      statusMessage.textContent = 'Please configure your OpenAI API key in the extension options';
      statusMessage.className = 'message warning';
    }
  });
});
