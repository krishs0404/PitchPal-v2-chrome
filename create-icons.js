// Simple script to create icon files for the Chrome extension
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base64-encoded 16x16 blue square PNG
const icon16Base64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAlSURBVHgB7cxBEQAACAIxtH+Pu0FWSIIXEXkaAfkHAIDLXiDVCemlMo9o15kFAAAAAElFTkSuQmCC';

// Base64-encoded 128x128 blue square PNG
const icon128Base64 = 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFKSURBVHgB7dIxAQAgEMCwA/+egQcmlrCTrWTenvMDa18A+AHADwB+APADgB8A/ADgBwA/APgBwA8AfgDwA4AfAPwA4AcAPwD4AcAPAH4A8AOAHwD8AOAHAPsHgB8A/ADgBwA/APgBwA8AfgDwA4AfAPwA4AcAPwD4AcAPAH4A8AOAHwD8AOAHAPsHgB8A/ADgBwA/APgBwA8AfgDwA4AfAPwA4AcAPwD4AcAPAH4A8AOAHwD8AOAHAPsHgB8A/ADgBwA/APgBwA8AfgDwA4AfAPwA4AcAPwD4AcAPAH4A8AOAHwD8AID9A8APAH4A8AOAHwD8AOAHAPsHgB8A/ADgBwA/APgBwA8AfgDwA4AfAPwA4AcAPwD4AcAPAH4A8AOAHwD8AID9A8APAH4A8AOAHwD8AOAHAPsHgB8A/ADgBwA/APgBwA8AfgDwA4AfAPwA4LcBvyEBAfL5iusAAAAASUVORK5CYII=';

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Write 16x16 icon
fs.writeFileSync(
  path.join(iconsDir, '16.png'),
  Buffer.from(icon16Base64, 'base64')
);
console.log('Created 16x16 icon');

// Write 128x128 icon
fs.writeFileSync(
  path.join(iconsDir, '128.png'),
  Buffer.from(icon128Base64, 'base64')
);
console.log('Created 128x128 icon');

console.log('Icons created successfully!');
