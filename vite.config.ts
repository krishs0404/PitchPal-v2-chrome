import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';

// JavaScript object matching the manifest structure
const manifest = {
  manifest_version: 3,
  name: "PitchPal",
  version: "0.1.0",
  description: "Generate compelling cold outreach emails using AI to boost your pitch success rate",
  icons: {
    "16": "icons/16.png",
    "128": "icons/128.png"
  },
  action: {
    default_popup: "src/popup/popup.html"
  },
  options_page: "src/options/options.html",
  background: {
    service_worker: "background.js",
    type: "module"
  },
  content_scripts: [
    {
      matches: ["https://mail.google.com/*"],
      js: ["content-script.js"]
    }
  ],
  permissions: [
    "storage",
    "identity",
    "activeTab"
  ],
  host_permissions: [
    "https://api.your-backend.com/*"
  ]
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: 'src/popup/popup.html',
        options: 'src/options/options.html',
        background: 'src/background.ts',
        'content-script': 'src/content-script.ts'
      }
    }
  }
});
