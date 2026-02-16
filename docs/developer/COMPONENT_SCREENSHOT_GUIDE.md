# Component Screenshot Capture Tool

Visual component verification tool for reviewing UI changes before committing.

## Features

✨ **Automated Component Capture**: Capture screenshots of individual React components  
📱 **Multi-Viewport Support**: Test mobile and desktop views simultaneously  
🎨 **Visual Preview**: Auto-generated HTML gallery for easy review  
⚡ **Fast Workflow**: Quick visual verification before commits  
📦 **Pre-configured Components**: Common MD3 components ready to capture

## Quick Start

### Prerequisites

1. Dev server running on `http://localhost:3000`
2. Playwright browsers installed (auto-installs on first run)

### Basic Usage

```bash
# Start your dev server
cd app
bun dev

# In another terminal, capture all components
npm run screenshot:all

# View results
open ../reference/screenshots/components/{timestamp}/index.html
```

## Commands

### Capture All Components (Mobile + Desktop)

```bash
npm run screenshot:all
```

Captures all pre-configured components in both mobile and desktop viewports.

### Mobile Only

```bash
npm run screenshot:mobile
```

### Desktop Only

```bash
npm run screenshot:desktop
```

### Custom Component

```bash
npm run screenshot:component -- --component ".my-custom-class"
```

### Custom URL

```bash
npm run screenshot:component -- --url http://localhost:3001
```

### Specific Viewport

```bash
npm run screenshot:component -- --viewport mobile --url http://localhost:3000
```

## Pre-configured Components

The tool includes these common components by default:

| Component | Selector | Viewports |
|-----------|----------|-----------|
| **FAB** | `button[aria-label="Add new item"]` | Mobile + Desktop |
| **Category Tabs** | `[class*="sticky"]` | Mobile |
| **Header** | `header` | Mobile + Desktop |
| **Item Card** | `[class*="md3-card-elevated"]` | Desktop |
| **Dialog** | `dialog` | Desktop |
| **Snackbar** | `.md3-snackbar` | Mobile + Desktop |
| **Buttons** | `.md3-button-filled, .md3-button-tonal, .md3-button-text` | Desktop |

## Output Structure

Screenshots are organized with timestamps:

```
reference/screenshots/components/
  └── 2026-02-16_14-30-15/
      ├── index.html          # Visual preview page
      ├── fab_mobile.png
      ├── fab_desktop.png
      ├── category-tabs_mobile.png
      ├── header_mobile.png
      ├── header_desktop.png
      ├── item-card_desktop.png
      └── buttons_desktop.png
```

## Visual Preview Page

Each capture session generates an HTML preview page:

- **Grid Layout**: All screenshots in an organized grid
- **Viewport Labels**: Clear mobile/desktop indicators
- **Click to Zoom**: Lightbox view for detailed inspection
- **Metadata**: Timestamp, source URL, component count

## Workflow Examples

### Before Committing Changes

```bash
# 1. Make your UI changes
# Edit components/AddItemButton.tsx

# 2. Start dev server
cd app && bun dev

# 3. Capture screenshots (in another terminal)
cd app
npm run screenshot:all

# 4. Review in browser
open ../reference/screenshots/components/{latest}/index.html

# 5. Commit if satisfied
git add .
git commit -m "Update FAB styling"
```

### Before/After Comparison

```bash
# Capture "before" state
npm run screenshot:all
# Output: reference/screenshots/components/2026-02-16_14-00-00/

# Make changes to components
# ...

# Capture "after" state
npm run screenshot:all
# Output: reference/screenshots/components/2026-02-16_14-30-00/

# Compare both HTML preview pages
```

### Component-Specific Testing

```bash
# Test just the FAB after changes
npm run screenshot:component -- --component "button[aria-label='Add new item']"

# Test a specific button variant
npm run screenshot:component -- --component ".md3-button-filled"

# Test dark mode (if implemented)
npm run screenshot:component -- --url "http://localhost:3000?theme=dark"
```

## Advanced Options

### CLI Arguments

```
--url <url>              URL to capture from (default: http://localhost:3000)
--viewport <type>        Viewport: mobile, desktop, both (default: both)
--output <dir>           Output directory
--component <selector>   Capture single component by CSS selector
--help, -h              Show help
```

### Custom Component Configuration

Create a custom config file:

```typescript
// my-components.json
[
  {
    "name": "custom-modal",
    "selector": ".my-modal",
    "description": "Custom modal component",
    "viewport": "desktop",
    "waitFor": ".my-modal[data-open='true']",
    "scroll": false
  }
]
```

Use it:

```bash
npm run screenshot:component -- --config my-components.json
```

## Troubleshooting

### "Component not found" warnings

The component might not be visible on the initial page load. Options:

1. **Add waitFor**: Specify a selector to wait for
2. **Enable scroll**: Set `scroll: true` in config
3. **Check selector**: Verify CSS selector is correct
4. **Trigger component**: Navigate to page where component appears

### Screenshots are blank

- Ensure animations have completed (tool waits 1 second)
- Check if component is hidden by default
- Verify z-index and positioning

### Browser doesn't close

The tool uses `headless: false` for visual feedback. Close manually if needed, or modify the script to use `headless: true`.

## Integration with Git Workflow

### Pre-commit Hook (Optional)

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Auto-capture screenshots before commit
if [[ $(git diff --cached --name-only | grep -E '\.(tsx|jsx)$') ]]; then
  echo "📸 Capturing component screenshots..."
  cd app && npm run screenshot:all --silent
fi
```

### PR Review Checklist

1. Run `npm run screenshot:all` before creating PR
2. Include screenshot link in PR description
3. Reviewers can visually verify changes
4. Archive screenshots with `git add reference/screenshots/`

## Performance Tips

- **Headless Mode**: Edit script to use `headless: true` for faster captures
- **Selective Captures**: Use custom selectors to capture only changed components
- **Viewport-Specific**: Use `--viewport mobile` or `--viewport desktop` when only one is needed
- **Parallel Sessions**: Run multiple capture sessions simultaneously (different ports)

## Configuration Reference

### ComponentConfig Interface

```typescript
interface ComponentConfig {
  name: string;           // Identifier for output filename
  selector: string;       // CSS selector to find component
  description?: string;   // Human-readable description
  viewport?: 'mobile' | 'desktop' | 'both';  // Which viewports to capture
  waitFor?: string;       // Additional selector to wait for
  scroll?: boolean;       // Scroll element into view before capture
}
```

### Viewport Sizes

- **Mobile**: 375x667 (iPhone SE)
- **Desktop**: 1920x1080 (Standard HD)

## Examples Gallery

### Extended FAB (Before/After)

![FAB Extended](example-fab-extended.png)  
*Extended FAB showing label on scroll up*

![FAB Collapsed](example-fab-collapsed.png)  
*Collapsed FAB icon-only when scrolling down*

### Staggered List Animation

![List Stagger](example-list-stagger.png)  
*Items with staggered entry animation*

### Button Variants

![Button Variants](example-buttons.png)  
*MD3 button variants: filled, tonal, text*

## Related Tools

- **Playwright DevTools**: `npx playwright codegen http://localhost:3000`
- **Visual Regression Testing**: Consider Percy or Chromatic for automated comparisons
- **Storybook**: For isolated component development and documentation

## Contributing

Improvements welcome! Consider adding:

- Video capture support
- Interaction recordings
- Automated visual regression testing
- Component state variations (hover, focus, disabled)
- Theme switching (light/dark mode captures)

## License

Part of Twin Style (ADHD-Closet) project.

---

**Last Updated**: 2026-02-16  
**Version**: 1.0.0  
**Maintainer**: Development Team
