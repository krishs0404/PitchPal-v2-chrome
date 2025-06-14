// Background script for ColdMail AI Assistant

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(function() {
  console.log('ColdMail AI Assistant installed');
  
  // Set default settings in sync storage
  chrome.storage.sync.set({
    apiBaseUrl: 'https://api.your-backend.com',
    emailTone: 'professional',
    defaultTemplates: '# Default Templates\n\n## Professional\nDear {recipient},\n\nI hope this email finds you well. I am writing regarding {subject}...\n\n## Friendly\nHi {recipient},\n\nHope you\'re having a great day! I wanted to reach out about {subject}...',
    autoSuggest: true
  });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // Handle email generation request from the popup
  if (request.type === 'GENERATE_EMAIL') {
    const prompt = request.prompt;
    console.log('Generate email request received with prompt:', prompt);
    
    // Get the API configuration from storage
    chrome.storage.sync.get(['apiBaseUrl', 'oauthClientId'], function(config) {
      if (!config.apiBaseUrl) {
        sendResponse({ 
          error: 'API URL not configured. Please visit the options page.' 
        });
        return;
      }
      
      // In a real implementation, this would make an API call
      // For now, we'll simulate a response
      setTimeout(() => {
        // Parse prompt to extract key information
        const tone = prompt.toLowerCase().includes('friendly') ? 'friendly' : 
                    prompt.toLowerCase().includes('professional') ? 'professional' :
                    prompt.toLowerCase().includes('persuasive') ? 'persuasive' : 'direct';
                    
        // Extract recipient email if present in the prompt
        let recipientEmail = '';
        const emailMatch = prompt.match(/to\s+([^\s@]+@[^\s@]+\.[^\s@]+)/i);
        if (emailMatch) {
          recipientEmail = emailMatch[1];
        }
        
        // Extract subject if present in the prompt
        let subject = '';
        const subjectMatch = prompt.match(/subject\s+"([^"]+)"/i);
        if (subjectMatch) {
          subject = subjectMatch[1];
        }
        
        // Generate sample email based on tone
        const email = generateSampleEmail(tone, recipientEmail, subject);
        
        // Send the response back
        sendResponse({
          success: true,
          email: email
        });
      }, 1500);
    });
    
    // Return true to indicate we'll send a response asynchronously
    return true;
  }
});

// Generate a sample email based on tone and recipient
function generateSampleEmail(tone, recipient, subject) {
  const templates = {
    friendly: {
      subject: subject || `Quick chat about ${Math.random() > 0.5 ? 'collaboration' : 'opportunity'}`,
      body: `Hey${recipient ? ' ' + recipient.split('@')[0] : ''},

Hope you're doing well! I came across your profile and thought we could benefit from connecting.

${subject ? 'About "' + subject + '", I' : 'I'} believe there's an opportunity for us to work together that could be mutually beneficial.

Would you be open to a quick 15-minute chat this week?

Cheers,
[Your Name]`
    },
    professional: {
      subject: subject || `Regarding potential ${Math.random() > 0.5 ? 'partnership' : 'opportunity'}`,
      body: `Dear ${recipient ? recipient.split('@')[0] : 'Recipient'},

I hope this email finds you well. I am writing to discuss ${subject || 'a potential opportunity'} that I believe would be of interest to you.

Based on your background, I think there could be significant value in exploring how we might work together.

Would you be available for a brief call next week to discuss this further?

Best regards,
[Your Name]`
    },
    persuasive: {
      subject: subject || `Value proposition for ${Math.random() > 0.5 ? 'your consideration' : 'your business'}`,
      body: `Hello ${recipient ? recipient.split('@')[0] : 'there'},

I've been researching ${recipient ? recipient.split('@')[1].split('.')[0] : 'your company'} and noticed an opportunity to ${subject || 'improve your results by 20%'}.

Our clients have seen the following benefits:
- Increased efficiency by 30%
- Reduced costs by 25%
- Improved customer satisfaction scores

I'd like to show you how we could achieve similar results for you. Are you available for a 20-minute call this Thursday?

Regards,
[Your Name]`
    },
    direct: {
      subject: subject || `Quick question about ${Math.random() > 0.5 ? 'your needs' : 'your goals'}`,
      body: `Hi ${recipient ? recipient.split('@')[0] : ''},

I'll get straight to the point. I have a solution that addresses ${subject || 'the key challenges in your industry'}.

Three things you should know:
1. It takes less than a week to implement
2. ROI is typically seen within the first month
3. No long-term commitment required

Can I send you more information or schedule a brief demo?

[Your Name]`
    }
  };
  
  return templates[tone];
}
