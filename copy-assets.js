import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create icons directory if it doesn't exist
const distIconsDir = path.join(__dirname, 'dist', 'icons');
if (!fs.existsSync(distIconsDir)) {
  fs.mkdirSync(distIconsDir, { recursive: true });
}

// Copy icon files
const sourceIconsDir = path.join(__dirname, 'icons');
fs.readdirSync(sourceIconsDir).forEach(file => {
  fs.copyFileSync(
    path.join(sourceIconsDir, file),
    path.join(distIconsDir, file)
  );
  console.log(`Copied icon: ${file}`);
});

// Move compiled JS files to root of dist
const moveJsFiles = () => {
  // Find background.js and content-script.js files
  const assetsDir = path.join(__dirname, 'dist', 'assets');
  const files = fs.readdirSync(assetsDir);
  
  // Copy files with correct names
  const backgroundFile = files.find(f => f.includes('background') && f.endsWith('.js'));
  const contentScriptFile = files.find(f => f.includes('content-script') && f.endsWith('.js'));
  
  if (backgroundFile) {
    fs.copyFileSync(
      path.join(assetsDir, backgroundFile),
      path.join(__dirname, 'dist', 'background.js')
    );
    console.log(`Copied ${backgroundFile} to background.js`);
  }
  
  if (contentScriptFile) {
    fs.copyFileSync(
      path.join(assetsDir, contentScriptFile),
      path.join(__dirname, 'dist', 'content-script.js')
    );
    console.log(`Copied ${contentScriptFile} to content-script.js`);
  }
  
  // Also copy CSS files to ensure they're properly linked
  const popupCssFile = files.find(f => f.includes('popup') && f.endsWith('.css'));
  const optionsCssFile = files.find(f => f.includes('options') && f.endsWith('.css'));
  
  // Create CSS directories if they don't exist
  const popupCssDir = path.join(__dirname, 'dist', 'popup');
  const optionsCssDir = path.join(__dirname, 'dist', 'options');
  
  if (popupCssFile && fs.existsSync(popupCssDir)) {
    fs.copyFileSync(
      path.join(assetsDir, popupCssFile),
      path.join(popupCssDir, 'popup.css')
    );
    console.log(`Copied ${popupCssFile} to popup/popup.css`);
  }
  
  if (optionsCssFile && fs.existsSync(optionsCssDir)) {
    fs.copyFileSync(
      path.join(assetsDir, optionsCssFile),
      path.join(optionsCssDir, 'options.css')
    );
    console.log(`Copied ${optionsCssFile} to options/options.css`);
  }
};

// Create popup and options directories at root level
const copyHtmlFiles = () => {
  // Create directories
  const popupDir = path.join(__dirname, 'dist', 'popup');
  const optionsDir = path.join(__dirname, 'dist', 'options');
  
  if (!fs.existsSync(popupDir)) {
    fs.mkdirSync(popupDir, { recursive: true });
  }
  
  if (!fs.existsSync(optionsDir)) {
    fs.mkdirSync(optionsDir, { recursive: true });
  }
  
  // Copy HTML files
  fs.copyFileSync(
    path.join(__dirname, 'dist', 'src', 'popup', 'popup.html'),
    path.join(popupDir, 'popup.html')
  );
  
  fs.copyFileSync(
    path.join(__dirname, 'dist', 'src', 'options', 'options.html'),
    path.join(optionsDir, 'options.html')
  );
  
  console.log('Copied HTML files to correct locations');
};

// Move JS files and copy HTML files
moveJsFiles();
copyHtmlFiles();

// Create a correct manifest.json file with proper paths
const manifest = {
  "manifest_version": 3,
  "name": "ColdMail AI Assistant",
  "version": "0.1.0",
  "description": "Generate personalized cold emails using AI to improve outreach success",
  "icons": {
    "16": "icons/16.png",
    "128": "icons/128.png"
  },
  "action": {
    "default_popup": "popup/popup.html"
  },
  "options_page": "options/options.html",
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["https://mail.google.com/*"],
      "js": ["content-script.js"]
    }
  ],
  "permissions": [
    "storage",
    "identity",
    "activeTab"
  ],
  "host_permissions": [
    "https://api.your-backend.com/*"
  ]
};

// Write the manifest to the dist directory
fs.writeFileSync(
  path.join(__dirname, 'dist', 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);
console.log('Created manifest.json');

console.log('All assets copied successfully!');
