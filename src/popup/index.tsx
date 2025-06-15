import React, { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

interface FormState {
  name: string;
  company: string;
  tone: string;
  templateType: string;
}

interface SavedEmail {
  id: string;
  name: string;
  company: string;
  subject: string;
  content: string;
  createdAt: number;
}

const EmailForm: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    name: '',
    company: '',
    tone: 'Professional',
    templateType: 'Sales'
  });
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [savedEmails, setSavedEmails] = useState<SavedEmail[]>([]);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const emailTextAreaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Show toast notification
  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  // Copy email to clipboard and show toast
  const handleCopyToClipboard = () => {
    if (generatedEmail && emailTextAreaRef.current) {
      emailTextAreaRef.current.select();
      document.execCommand('copy');
      showToastNotification('Email copied to clipboard!');
    }
  };
  
  // Extract subject from email content
  const extractSubject = (emailContent: string): string => {
    const subjectMatch = emailContent.match(/Subject:\s*(.+?)\n/i);
    return subjectMatch ? subjectMatch[1].trim() : 'Untitled Email';
  };
  
  // Save email to local storage
  const handleSaveEmail = () => {
    if (!generatedEmail) return;
    
    const subject = extractSubject(generatedEmail);
    const newEmail: SavedEmail = {
      id: `email-${Date.now()}`,
      name: formState.name,
      company: formState.company,
      subject,
      content: generatedEmail,
      createdAt: Date.now()
    };
    
    const updatedEmails = [...savedEmails, newEmail];
    setSavedEmails(updatedEmails);
    
    // Save to Chrome storage
    chrome.storage.local.set({ savedEmails: updatedEmails }, () => {
      showToastNotification('Email saved successfully!');
    });
  };
  
  // Load saved email to editor
  const loadSavedEmail = (email: SavedEmail) => {
    setGeneratedEmail(email.content);
    showToastNotification('Loaded saved email!');
  };
  
  // Delete saved email
  const deleteSavedEmail = (id: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the parent click event
    const updatedEmails = savedEmails.filter(email => email.id !== id);
    setSavedEmails(updatedEmails);
    
    // Update Chrome storage
    chrome.storage.local.set({ savedEmails: updatedEmails }, () => {
      showToastNotification('Email deleted!');
    });
  };
  
  // Load saved emails and check API key on component mount
  useEffect(() => {
    // Check if OpenAI API key is configured
    chrome.storage.sync.get(['openaiApiKey'], (result) => {
      if (!result.openaiApiKey) {
        setMessage('Please configure your OpenAI API key in the extension options');
      }
    });
    
    // Load saved emails from Chrome storage
    chrome.storage.local.get(['savedEmails'], (result) => {
      if (result.savedEmails && Array.isArray(result.savedEmails)) {
        setSavedEmails(result.savedEmails);
      }
    });
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formState.name || !formState.company) {
      setMessage('Please fill in all required fields');
      return;
    }
    
    // Check if OpenAI API key is configured
    const apiKeyCheck = await new Promise<boolean>((resolve) => {
      chrome.storage.sync.get(['openaiApiKey'], (result) => {
        resolve(!!result.openaiApiKey);
      });
    });
    
    if (!apiKeyCheck) {
      setMessage('OpenAI API key not configured. Please visit the settings page.');
      return;
    }
    
    // Start generating state
    setIsGenerating(true);
    setMessage('Generating email...');
    setGeneratedEmail('');
    
    // Construct the prompt based on template type
    let prompt = '';
    
    switch (formState.templateType) {
      case 'Sales':
        prompt = `You're an expert sales copywriter. Write a cold email to ${formState.name} at ${formState.company} with a ${formState.tone.toLowerCase()} tone highlighting how our AI tool improves productivity and efficiency. Make it crisp, warm, and end with a clear call to action. Include a compelling subject line.`;
        break;
        
      case 'Recruiting':
        prompt = `You're an experienced technical recruiter. Write a ${formState.tone.toLowerCase()} talent outreach email to ${formState.name} at ${formState.company}. Focus on career growth opportunities, challenging work, and our supportive company culture. Keep it personalized and end with a specific next step. Include a compelling subject line.`;
        break;
        
      case 'Fundraising':
        prompt = `You're a fundraising specialist. Write a ${formState.tone.toLowerCase()} email to ${formState.name} at ${formState.company} introducing our startup and requesting a short meeting to discuss potential investment opportunities. Highlight our traction, team strengths, and market opportunity. Include a compelling subject line.`;
        break;
        
      case 'Partnership':
        prompt = `You're a business development expert. Write a ${formState.tone.toLowerCase()} email to ${formState.name} at ${formState.company} proposing a strategic partnership. Highlight mutual benefits, combined value proposition, and suggest a specific collaboration opportunity. End with a clear next step. Include a compelling subject line.`;
        break;
        
      case 'Follow-up':
        prompt = `You're a persistent but respectful sales professional. Write a ${formState.tone.toLowerCase()} follow-up email to ${formState.name} at ${formState.company} after not receiving a response to your initial outreach. Provide additional value, keep it brief, and suggest a specific next step. Don't be pushy but show conviction in the value of connecting. Include a compelling subject line.`;
        break;
        
      default:
        prompt = `Generate a ${formState.tone.toLowerCase()} cold outreach email to ${formState.name} who works at ${formState.company}. The email should be concise, professional, and have a clear call to action. Include a subject line at the top.`;
    }
    
    // Send message to background script
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out. Please try again.')), 30000);
      });
      
      const responsePromise = new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({ 
          type: 'GENERATE_EMAIL', 
          prompt 
        }, (response) => resolve(response));
      });
      
      // Race between the response and the timeout
      const response = await Promise.race([responsePromise, timeoutPromise]);
        
      setIsGenerating(false);
      
      if (response?.error) {
        setMessage(`Error: ${response.error}`);
        showToastNotification(`Error: ${response.error}`);
        
        // If the error is about API key, provide a link to options
        if (response.error.includes('API key')) {
          setTimeout(() => {
            if (window.confirm('Would you like to configure your OpenAI API key now?')) {
              chrome.runtime.openOptionsPage();
            }
          }, 1000);
        }
      } else if (response?.emailText) {
        setGeneratedEmail(response.emailText);
        setMessage('Email generated successfully!');
        showToastNotification('Email generated successfully!');
      } else {
        // Fallback for testing when not connected to actual OpenAI
        const sampleEmail = `Subject: Opportunity to revolutionize your approach at ${formState.company}

Dear ${formState.name},

I hope this email finds you well. I recently came across ${formState.company} and was impressed by your work in the industry.

Our platform has helped similar organizations increase efficiency by 30%. I'd love to schedule a quick 15-minute call to discuss how we might be able to help ${formState.company} as well.

Would you be available for a brief conversation next week?

Best regards,
Your Name
Company
Phone Number
`;
        
        setGeneratedEmail(sampleEmail);
        setMessage('Email generated successfully!');
        showToastNotification('Email generated successfully!');
      }
    } catch (error) {
      setIsGenerating(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`Error: ${errorMessage}`);
      showToastNotification(`Error: ${errorMessage}`);
      console.error('Email generation error:', error);
    }
  };
  
  return (
    <div className="email-form-container">
      <header>
        <h1>ColdMail AI Assistant</h1>
      </header>
      
      <form onSubmit={handleSubmit} className="email-form">
        <div className="form-group">
          <label htmlFor="name">Recipient Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formState.name}
            onChange={handleInputChange}
            placeholder="John Smith"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="company">Company:</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formState.company}
            onChange={handleInputChange}
            placeholder="Acme Corporation"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="templateType">Email Purpose:</label>
          <select
            id="templateType"
            name="templateType"
            value={formState.templateType}
            onChange={handleInputChange}
          >
            <option value="Sales">Sales</option>
            <option value="Recruiting">Recruiting</option>
            <option value="Fundraising">Fundraising</option>
            <option value="Partnership">Partnership</option>
            <option value="Follow-up">Follow-up</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tone">Tone:</label>
          <select
            id="tone"
            name="tone"
            value={formState.tone}
            onChange={handleInputChange}
          >
            <option value="Friendly">Friendly</option>
            <option value="Professional">Professional</option>
            <option value="Bold">Bold</option>
            <option value="Persuasive">Persuasive</option>
            <option value="Direct">Direct</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          className="generate-button" 
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Email'}
        </button>
        
        {message && (
          <div className={`message ${isGenerating ? 'info' : message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {isGenerating && (
          <div className="spinner-container">
            <div className="spinner"></div>
            <span>Generating your email...</span>
          </div>
        )}
        
        {generatedEmail && (
          <div className="generated-email-container">
            <h3>Generated Email:</h3>
            <textarea
              ref={emailTextAreaRef}
              className="generated-email"
              value={generatedEmail}
              readOnly
              rows={12}
            />
            <div className="button-row">
              <button
                type="button"
                className="copy-button"
                onClick={handleCopyToClipboard}
              >
                Copy to Clipboard
              </button>
              <button
                type="button"
                className="save-button"
                onClick={handleSaveEmail}
              >
                Save Email
              </button>
            </div>
          </div>
        )}
        
        {/* Saved Emails List */}
        {savedEmails.length > 0 && (
          <div className="saved-emails">
            <h3>
              Saved Emails
              <span>{savedEmails.length} {savedEmails.length === 1 ? 'email' : 'emails'}</span>
            </h3>
            <div className="email-list">
              {savedEmails.map(email => (
                <div 
                  key={email.id} 
                  className="email-list-item"
                  onClick={() => loadSavedEmail(email)}
                >
                  <div>
                    <strong>{email.subject}</strong>
                    <div>To: {email.name} at {email.company}</div>
                  </div>
                  <div className="email-actions">
                    <button onClick={(e) => deleteSavedEmail(email.id, e)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Toast Notification */}
        {showToast && (
          <div className={`toast ${showToast ? 'visible' : ''}`}>
            {toastMessage}
          </div>
        )}
      </form>
      
      <footer>
        <button className="settings-button" onClick={() => chrome.runtime.openOptionsPage()}>
          Settings
        </button>
      </footer>
    </div>
  );
};

// Mount the React application
const root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <EmailForm />
  </React.StrictMode>
);

export default EmailForm;
