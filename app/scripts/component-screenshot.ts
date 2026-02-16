#!/usr/bin/env node

/**
 * Component Screenshot Capture Tool
 * 
 * Captures screenshots of individual components for visual verification before commits.
 * 
 * Usage:
 *   npm run screenshot:component -- --url http://localhost:3000 --selector ".md3-fab"
 *   npm run screenshot:component -- --url http://localhost:3000 --all
 *   npm run screenshot:component -- --config components.json
 * 
 * Features:
 * - Capture individual components by CSS selector
 * - Capture multiple components at once
 * - Generate timestamped output directories
 * - Create HTML preview pages
 * - Support for viewport variations (mobile/desktop)
 */

import { chromium, Browser, Page } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

interface ComponentConfig {
  name: string;
  selector: string;
  description?: string;
  viewport?: 'mobile' | 'desktop' | 'both';
  waitFor?: string; // Additional selector to wait for
  scroll?: boolean; // Scroll to element before capture
}

interface CaptureOptions {
  url: string;
  outputDir?: string;
  components?: ComponentConfig[];
  viewport?: 'mobile' | 'desktop' | 'both';
  timestamp?: boolean;
}

// Common component configurations
const COMMON_COMPONENTS: ComponentConfig[] = [
  {
    name: 'fab',
    selector: 'button[aria-label="Add new item"]',
    description: 'Floating Action Button (FAB)',
    viewport: 'both'
  },
  {
    name: 'category-tabs',
    selector: '[class*="sticky"]',
    description: 'Category Navigation Tabs',
    viewport: 'mobile'
  },
  {
    name: 'header',
    selector: 'header',
    description: 'Page Header',
    viewport: 'both'
  },
  {
    name: 'item-card',
    selector: '[class*="md3-card-elevated"]',
    description: 'Item Card Component',
    viewport: 'desktop',
    scroll: true
  },
  {
    name: 'dialog',
    selector: 'dialog',
    description: 'MD3 Dialog',
    viewport: 'desktop',
    waitFor: 'dialog[open]'
  },
  {
    name: 'snackbar',
    selector: '.md3-snackbar',
    description: 'MD3 Snackbar',
    viewport: 'both'
  },
  {
    name: 'buttons',
    selector: 'button.md3-button-filled, button.md3-button-tonal, button.md3-button-text',
    description: 'MD3 Button Variants',
    viewport: 'desktop'
  }
];

class ComponentScreenshotCapture {
  private browser: Browser | null = null;
  private outputDir: string;
  private timestamp: string;

  constructor(outputDir: string = './reference/screenshots/components') {
    this.outputDir = outputDir;
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                     new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  }

  async initialize() {
    console.log('🚀 Initializing browser...');
    this.browser = await chromium.launch({ 
      headless: true, // Headless mode for CI/CD and server environments
      slowMo: 0 // No delay in headless mode
    });
  }

  async captureComponent(
    page: Page, 
    component: ComponentConfig, 
    viewport: 'mobile' | 'desktop'
  ): Promise<string | null> {
    try {
      // Wait for component to be visible
      const selector = component.waitFor || component.selector;
      await page.waitForSelector(selector, { timeout: 5000, state: 'visible' });

      // Scroll to element if requested
      if (component.scroll) {
        await page.locator(component.selector).first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(500); // Wait for scroll animation
      }

      const element = page.locator(component.selector).first();
      const count = await element.count();
      
      if (count === 0) {
        console.log(`   ⚠️  Component not found: ${component.name}`);
        return null;
      }

      // Generate filename
      const filename = `${component.name}_${viewport}.png`;
      const outputPath = path.join(this.outputDir, this.timestamp, filename);

      // Ensure directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Capture screenshot
      await element.screenshot({
        path: outputPath,
        type: 'png'
      });

      console.log(`   ✅ Captured: ${filename}`);
      return outputPath;

    } catch (error) {
      console.log(`   ❌ Failed to capture ${component.name}: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  async captureComponents(options: CaptureOptions): Promise<void> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const components = options.components || COMMON_COMPONENTS;
    const capturedFiles: { component: string; viewport: string; path: string }[] = [];

    console.log(`\n📸 Capturing ${components.length} components from: ${options.url}\n`);

    // Desktop captures
    if (options.viewport === 'desktop' || options.viewport === 'both') {
      console.log('🖥️  Desktop viewport (1920x1080)...');
      const desktopPage = await this.browser.newPage({
        viewport: { width: 1920, height: 1080 }
      });

      await desktopPage.goto(options.url, { waitUntil: 'networkidle' });
      await desktopPage.waitForTimeout(1000); // Wait for animations

      for (const component of components) {
        if (component.viewport === 'mobile') continue;
        
        const filePath = await this.captureComponent(desktopPage, component, 'desktop');
        if (filePath) {
          capturedFiles.push({
            component: component.name,
            viewport: 'desktop',
            path: filePath
          });
        }
      }

      await desktopPage.close();
    }

    // Mobile captures
    if (options.viewport === 'mobile' || options.viewport === 'both') {
      console.log('\n📱 Mobile viewport (375x667)...');
      const mobilePage = await this.browser.newPage({
        viewport: { width: 375, height: 667 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
      });

      await mobilePage.goto(options.url, { waitUntil: 'networkidle' });
      await mobilePage.waitForTimeout(1000); // Wait for animations

      for (const component of components) {
        if (component.viewport === 'desktop') continue;
        
        const filePath = await this.captureComponent(mobilePage, component, 'mobile');
        if (filePath) {
          capturedFiles.push({
            component: component.name,
            viewport: 'mobile',
            path: filePath
          });
        }
      }

      await mobilePage.close();
    }

    // Generate preview page
    await this.generatePreviewPage(capturedFiles, options.url);

    console.log(`\n✨ Captured ${capturedFiles.length} component screenshots`);
    console.log(`📁 Output directory: ${path.join(this.outputDir, this.timestamp)}`);
    console.log(`🔗 Preview: ${path.join(this.outputDir, this.timestamp, 'index.html')}`);
  }

  async generatePreviewPage(
    captures: { component: string; viewport: string; path: string }[],
    sourceUrl: string
  ): Promise<void> {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Screenshots - ${this.timestamp}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 2rem;
      line-height: 1.6;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }
    .meta {
      color: #666;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e0e0e0;
    }
    .meta a {
      color: #6750A4;
      text-decoration: none;
    }
    .meta a:hover {
      text-decoration: underline;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    .component {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1rem;
      background: #fafafa;
    }
    .component h2 {
      font-size: 1.25rem;
      color: #333;
      margin-bottom: 0.5rem;
    }
    .component .viewport {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: #6750A4;
      color: white;
      border-radius: 4px;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    .component img {
      width: 100%;
      height: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .component img:hover {
      transform: scale(1.02);
    }
    .lightbox {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.9);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .lightbox.active {
      display: flex;
    }
    .lightbox img {
      max-width: 90%;
      max-height: 90%;
      border: 2px solid white;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📸 Component Screenshots</h1>
    <div class="meta">
      <p><strong>Captured:</strong> ${new Date(this.timestamp.replace(/_/g, ':')).toLocaleString()}</p>
      <p><strong>Source:</strong> <a href="${sourceUrl}" target="_blank">${sourceUrl}</a></p>
      <p><strong>Total Components:</strong> ${captures.length}</p>
    </div>

    <div class="grid">
      ${captures.map((capture, index) => `
        <div class="component">
          <h2>${capture.component.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
          <span class="viewport">${capture.viewport === 'mobile' ? '📱' : '🖥️'} ${capture.viewport}</span>
          <img 
            src="${path.basename(capture.path)}" 
            alt="${capture.component}"
            onclick="openLightbox(this.src)"
          />
        </div>
      `).join('')}
    </div>
  </div>

  <div class="lightbox" id="lightbox" onclick="closeLightbox()">
    <img id="lightbox-image" src="" alt="Full size">
  </div>

  <script>
    function openLightbox(src) {
      document.getElementById('lightbox-image').src = src;
      document.getElementById('lightbox').classList.add('active');
    }
    function closeLightbox() {
      document.getElementById('lightbox').classList.remove('active');
    }
  </script>
</body>
</html>`;

    const htmlPath = path.join(this.outputDir, this.timestamp, 'index.html');
    await fs.writeFile(htmlPath, htmlContent, 'utf-8');
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('\n✅ Browser closed');
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const options: CaptureOptions = {
    url: 'http://localhost:3000',
    viewport: 'both'
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      options.url = args[i + 1];
      i++;
    } else if (args[i] === '--viewport' && args[i + 1]) {
      options.viewport = args[i + 1] as 'mobile' | 'desktop' | 'both';
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      options.outputDir = args[i + 1];
      i++;
    } else if (args[i] === '--component' && args[i + 1]) {
      // Single component by selector
      options.components = [{
        name: 'custom',
        selector: args[i + 1],
        viewport: 'both'
      }];
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Component Screenshot Capture Tool

Usage:
  npm run screenshot:component -- [options]

Options:
  --url <url>              URL to capture from (default: http://localhost:3000)
  --viewport <type>        Viewport type: mobile, desktop, both (default: both)
  --output <dir>           Output directory (default: ./reference/screenshots/components)
  --component <selector>   Capture single component by CSS selector
  --help, -h              Show this help message

Examples:
  # Capture all common components
  npm run screenshot:component

  # Capture from specific URL
  npm run screenshot:component -- --url http://localhost:3000

  # Capture specific component
  npm run screenshot:component -- --component ".md3-fab"

  # Mobile viewport only
  npm run screenshot:component -- --viewport mobile
      `);
      process.exit(0);
    }
  }

  const capture = new ComponentScreenshotCapture(options.outputDir);

  try {
    await capture.initialize();
    await capture.captureComponents(options);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await capture.close();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { ComponentScreenshotCapture, COMMON_COMPONENTS };
