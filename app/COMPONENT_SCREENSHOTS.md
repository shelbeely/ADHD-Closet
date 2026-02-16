# Component Screenshot Tool - Quick Reference

## TL;DR

```bash
cd app
bun dev                      # Start dev server
npm run screenshot:all       # Capture all components
open reference/screenshots/components/{timestamp}/index.html  # View results
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run screenshot:all` | Capture all components (mobile + desktop) |
| `npm run screenshot:mobile` | Mobile viewport only |
| `npm run screenshot:desktop` | Desktop viewport only |
| `npm run screenshot:component -- --component ".selector"` | Capture specific component |
| `npm run screenshot:component -- --help` | Show all options |

## Output Location

Screenshots are saved to:
```
app/reference/screenshots/components/{timestamp}/
  ├── index.html              # Visual preview page
  ├── fab_mobile.png
  ├── fab_desktop.png
  ├── header_mobile.png
  ├── header_desktop.png
  └── ...
```

## Before/After Workflow

1. Capture "before" state: `npm run screenshot:all`
2. Make your UI changes
3. Capture "after" state: `npm run screenshot:all`
4. Compare the two HTML preview pages side-by-side

## Pre-configured Components

- **FAB** (Extended Floating Action Button)
- **Category Tabs** (Navigation chips)
- **Header** (Page header)
- **Item Cards** (MD3 elevated cards)
- **Buttons** (Filled, tonal, text variants)
- **Dialog** (MD3 modal)
- **Snackbar** (Toast notifications)

## Examples

### Capture specific component
```bash
npm run screenshot:component -- --component "button.md3-fab"
```

### Different URL
```bash
npm run screenshot:component -- --url http://localhost:3001
```

### Custom output directory
```bash
npm run screenshot:component -- --output ./my-screenshots
```

## Tips

- Run `npm run screenshot:all` before committing UI changes
- Include screenshot links in PR descriptions
- Use timestamps to track visual history
- Click any screenshot in the HTML preview to zoom

## Full Documentation

See `docs/developer/COMPONENT_SCREENSHOT_GUIDE.md` for complete guide.
