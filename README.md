# ColdMail AI Assistant - Chrome Extension

A Chrome extension for generating personalized cold emails using AI to improve outreach success rates.

## Features

- **Gmail Integration**: Works directly within Gmail's compose interface
- **AI-Powered Email Generation**: Creates personalized cold emails based on recipient information
- **Template Management**: Create and manage custom email templates
- **Settings & Customization**: Configure your sender details and preferred email tone

## Extension Structure

- **manifest.json**: Chrome extension configuration file (Manifest V3)
- **popup.html/js**: The extension popup UI that appears when clicking the extension icon
- **options.html/js**: Settings page for configuring API keys, user details, and templates
- **background.js**: Background service worker handling API calls and extension state
- **content-script.js**: Script that runs in the Gmail context to add functionality

## Installation

**Developer Mode:**

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension icon should now appear in your Chrome toolbar

## Usage

1. Click the extension icon to open the popup interface
2. Enter recipient information and choose an email purpose
3. Click "Generate Personalized Email" to create your email
4. Copy the generated email or customize it further
5. When in Gmail compose, a "Generate Email" button will appear in the toolbar

## Configuration

Visit the options page by right-clicking the extension icon and selecting "Options" to:

1. Set your API key and endpoint URL
2. Configure your personal details (name, company, role)
3. Create and manage email templates
4. Set preferences for email tone and auto-suggestions

## Development Notes

- This extension uses Manifest V3 for Chrome extensions
- Icons need to be replaced with actual icon files before publishing
- API integration with your backend service is implemented but needs proper API key configuration

## Next Steps

- Implement real API integration with your AI email generation backend
- Add LinkedIn integration for recipient profile scraping
- Develop analytics to track email performance
- Add follow-up scheduling functionality

## License

MIT
