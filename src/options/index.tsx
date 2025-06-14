import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

interface OptionsState {
  apiBaseUrl: string;
  oauthClientId: string;
  defaultTemplates: string;
  isSaving: boolean;
  saveMessage: string | null;
  saveStatus: 'success' | 'error' | null;
}

const OptionsPage: React.FC = () => {
  const [options, setOptions] = useState<OptionsState>({
    apiBaseUrl: '',
    oauthClientId: '',
    defaultTemplates: '',
    isSaving: false,
    saveMessage: null,
    saveStatus: null
  });

  // Load stored settings when component mounts
  useEffect(() => {
    chrome.storage.sync.get([
      'apiBaseUrl',
      'oauthClientId',
      'defaultTemplates'
    ], (result) => {
      setOptions(prevState => ({
        ...prevState,
        apiBaseUrl: result.apiBaseUrl || '',
        oauthClientId: result.oauthClientId || '',
        defaultTemplates: result.defaultTemplates || 
          '# Default Email Templates\n\n' +
          '## Professional\n' +
          'Dear {recipient},\n\n' +
          'I hope this email finds you well. I am writing regarding {subject}...\n\n' +
          '## Friendly\n' +
          'Hi {recipient},\n\n' +
          'Hope you\'re having a great day! I wanted to reach out about {subject}...\n\n'
      }));
    });
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOptions(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const saveOptions = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setOptions(prevState => ({
      ...prevState,
      isSaving: true,
      saveMessage: 'Saving settings...',
      saveStatus: null
    }));

    try {
      await chrome.storage.sync.set({
        apiBaseUrl: options.apiBaseUrl,
        oauthClientId: options.oauthClientId,
        defaultTemplates: options.defaultTemplates
      });

      setOptions(prevState => ({
        ...prevState,
        isSaving: false,
        saveMessage: 'Settings saved successfully!',
        saveStatus: 'success'
      }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setOptions(prevState => ({
          ...prevState,
          saveMessage: null,
          saveStatus: null
        }));
      }, 3000);
    } catch (error) {
      setOptions(prevState => ({
        ...prevState,
        isSaving: false,
        saveMessage: `Error saving settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        saveStatus: 'error'
      }));
    }
  };

  const resetOptions = () => {
    if (window.confirm('Are you sure you want to reset all options to their default values?')) {
      setOptions(prevState => ({
        ...prevState,
        apiBaseUrl: 'https://api.your-backend.com',
        oauthClientId: '',
        defaultTemplates: '# Default Email Templates\n\n' +
          '## Professional\n' +
          'Dear {recipient},\n\n' +
          'I hope this email finds you well. I am writing regarding {subject}...\n\n' +
          '## Friendly\n' +
          'Hi {recipient},\n\n' +
          'Hope you\'re having a great day! I wanted to reach out about {subject}...\n\n'
      }));
    }
  };

  return (
    <div className="options-container">
      <header>
        <h1>ColdMail AI Assistant Settings</h1>
      </header>

      <main>
        <form onSubmit={saveOptions}>
          <div className="form-section">
            <h2>API Configuration</h2>
            <div className="form-group">
              <label htmlFor="apiBaseUrl">API Base URL:</label>
              <input
                type="url"
                id="apiBaseUrl"
                name="apiBaseUrl"
                value={options.apiBaseUrl}
                onChange={handleInputChange}
                placeholder="https://api.your-backend.com"
                required
              />
              <small>The base URL for the email generation API</small>
            </div>

            <div className="form-group">
              <label htmlFor="oauthClientId">OAuth Client ID (optional):</label>
              <input
                type="text"
                id="oauthClientId"
                name="oauthClientId"
                value={options.oauthClientId}
                onChange={handleInputChange}
                placeholder="Your OAuth client ID if required"
              />
              <small>Required only if your API uses OAuth authentication</small>
            </div>
          </div>

          <div className="form-section">
            <h2>Default Templates</h2>
            <div className="form-group">
              <label htmlFor="defaultTemplates">Email Templates (Markdown):</label>
              <textarea
                id="defaultTemplates"
                name="defaultTemplates"
                value={options.defaultTemplates}
                onChange={handleInputChange}
                rows={12}
                placeholder="Enter your email templates in markdown format"
              />
              <small>
                Templates support variables: {'{recipient}'}, {'{subject}'}, etc.
                Use markdown headings (## Template Name) to organize templates.
              </small>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="save-button" 
              disabled={options.isSaving}
            >
              {options.isSaving ? 'Saving...' : 'Save Settings'}
            </button>
            
            <button 
              type="button" 
              className="reset-button" 
              onClick={resetOptions}
              disabled={options.isSaving}
            >
              Reset to Defaults
            </button>
          </div>

          {options.saveMessage && (
            <div className={`save-message ${options.saveStatus}`}>
              {options.saveMessage}
            </div>
          )}
        </form>
      </main>

      <footer>
        <p>ColdMail AI Assistant &copy; {new Date().getFullYear()}</p>
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
    <OptionsPage />
  </React.StrictMode>
);

export default OptionsPage;
