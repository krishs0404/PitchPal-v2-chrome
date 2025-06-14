import type { ManifestV3Export } from '@crxjs/vite-plugin';

export const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: "ColdMail Extension",
  description: "Generate personalized cold emails using AI",
  version: "1.0.0",
  action: {
    default_popup: "index.html",
    default_icon: {
      "16": "src/assets/icon16.png",
      "48": "src/assets/icon48.png",
      "128": "src/assets/icon128.png"
    }
  },
  permissions: ["storage", "activeTab", "scripting"],
  host_permissions: ["*://*/*"],
  background: {
    service_worker: "src/pages/background/index.ts",
    type: "module"
  },
  content_scripts: [
    {
      matches: ["*://*/*"],
      js: ["src/pages/content/index.tsx"]
    }
  ],
  web_accessible_resources: [
    {
      resources: ["src/assets/*"],
      matches: ["*://*/*"]
    }
  ]
};
