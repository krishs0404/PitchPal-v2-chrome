import React, { useState, FormEvent, ChangeEvent } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

interface FormState {
  to: string;
  subject: string;
  tone: string;
}

const EmailForm: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    to: '',
    subject: '',
    tone: 'Professional'
  });
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formState.to || !formState.subject) {
      setMessage('Please fill in all required fields');
      return;
    }
    
    setIsGenerating(true);
    setMessage('Generating email...');
    
    // Construct the prompt for the AI
    const prompt = `
      Generate a ${formState.tone.toLowerCase()} email to ${formState.to} 
      with the subject "${formState.subject}".
    `;
    
    // Send message to background script
    try {
      chrome.runtime.sendMessage({ 
        type: 'GENERATE_EMAIL', 
        prompt 
      }, (response) => {
        setIsGenerating(false);
        
        if (response?.error) {
          setMessage(`Error: ${response.error}`);
        } else {
          setMessage('Email generated! Check your compose window.');
        }
      });
    } catch (error) {
      setIsGenerating(false);
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  return (
    <div className="email-form-container">
      <header>
        <h1>ColdMail AI Assistant</h1>
      </header>
      
      <form onSubmit={handleSubmit} className="email-form">
        <div className="form-group">
          <label htmlFor="to">To:</label>
          <input
            type="email"
            id="to"
            name="to"
            value={formState.to}
            onChange={handleInputChange}
            placeholder="recipient@example.com"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="subject">Subject:</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formState.subject}
            onChange={handleInputChange}
            placeholder="Brief, compelling subject line"
            required
          />
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
