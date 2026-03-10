# Screenshot Guide for ADHD-Closet Documentation

**For ADHD users, visual documentation is crucial.** Screenshots reduce cognitive load and make concepts immediately clear.

## Why Screenshots Matter for ADHD Users

- 🎯 **Instant understanding** - No need to parse walls of text
- 📸 **Visual memory** - Pictures stick better than descriptions
- ⚡ **Faster learning** - See exactly what to expect
- ✅ **Confidence** - Know you're doing it right
- 🧠 **Reduced mental load** - Less working memory needed

## Where Screenshots Are Most Important

### Critical Places (MUST have screenshots)

1. **First-time user flows**
   - App home screen (empty state)
   - Adding your first item
   - Taking/uploading a photo
   - AI processing in action
   - Viewing the results

2. **Key features**
   - Category navigation
   - Item detail view
   - Outfit generator interface
   - Bulk edit mode
   - NFC scanning (if available)

3. **Settings and configuration**
   - Settings menu
   - AI model selection
   - Export/import interface

4. **Mobile vs Desktop**
   - Show both views for major features
   - Highlight differences

### Current Screenshots

Located in `docs/../../reference/screenshots/`:
- ✅ guide-page-mobile.png
- ✅ main-desktop-empty.png
- ✅ main-mobile-view.png
- ✅ mobile-menu-open.png
- ✅ outfits-generate-desktop.png
- ✅ outfits-generate-mobile.png

### Screenshots Needed

Add these to improve documentation:

**Tutorial.md needs:**
- [ ] Adding an item (step-by-step)
- [ ] Item detail view with AI suggestions
- [ ] Category filter in action
- [ ] Search functionality
- [ ] Laundry/donate state changes

**FAQ.md needs:**
- [ ] Common error messages (with solutions)
- [ ] AI job history panel
- [ ] Backup/restore interface

**TROUBLESHOOTING.md needs:**
- [ ] Error states and their fixes
- [ ] Network issues indicator
- [ ] Browser console (for debug)

**Features docs need:**
- [ ] NFC_TAG_SUPPORT.md - NFC scanning in action
- [ ] CATEGORIES.md - Category organization view
- [ ] ATTRIBUTES.md - Attribute editing interface
- [ ] OUI_GUIDE.md - Smart UI examples
- [ ] IMAGE_GENERATION.md - Before/after catalog images

**DEPLOYMENT.md needs:**
- [ ] Docker setup terminal output
- [ ] Environment variables file
- [ ] Successfully running app

## How to Add Screenshots

### 1. Capture Screenshots

**For app screenshots:**
```bash
# Use your browser's built-in tools
# Chrome: Cmd/Ctrl + Shift + P → "Capture screenshot"
# Firefox: Right-click → "Take Screenshot"
```

**For mobile:**
- Use browser dev tools device mode
- Or use actual device and AirDrop/transfer

### 2. Optimize Images

```bash
# Install ImageMagick or similar
brew install imagemagick  # macOS
sudo apt install imagemagick  # Linux

# Resize large images (max width 1200px for docs)
convert input.png -resize 1200x output.png

# Or use online tools:
# - TinyPNG (https://tinypng.com)
# - Squoosh (https://squoosh.app)
```

### 3. Save to Correct Location

```bash
# Save in docs/../../reference/screenshots/
docs/../../reference/screenshots/
├── feature-name-view.png
├── feature-name-mobile.png
├── feature-name-error.png
└── ...
```

**Naming convention:**
- `feature-name-view.png` - Main view
- `feature-name-mobile.png` - Mobile version
- `feature-name-detail.png` - Detail/zoomed view
- `feature-name-error.png` - Error state
- `step1-description.png`, `step2-description.png` - Sequential steps

### 4. Add to Documentation

**In Markdown:**

```markdown
## Adding Your First Item

1. Click the "Add Item" button in the top right:

   ![Add Item Button](../../reference/screenshots/add-item-button.png)

2. Choose your photo source (camera or gallery):

   ![Photo Source Selection](../../reference/screenshots/photo-source-select.png)

3. Wait for AI to process (usually 30 seconds):

   ![AI Processing](../../reference/screenshots/ai-processing.png)

4. Review and save:

   ![Item Added](../../reference/screenshots/item-added-success.png)
```

**Tips for good screenshot documentation:**
- Add a brief caption below each image
- Use callouts/arrows to highlight important UI elements (optional)
- Show the complete workflow, not just one screen
- Include error states and edge cases
- Keep images up-to-date with UI changes

### 5. With Annotations (Optional)

For complex screenshots, add arrows/highlights:

**Tools:**
- macOS: Preview (built-in)
- Windows: Snip & Sketch
- Linux: GIMP, Krita
- Online: Excalidraw, Figma

**Example with callouts:**
```markdown
![Item Detail with callouts showing: 1) Edit button, 2) AI suggestions, 3) State toggle](../../reference/screenshots/item-detail-annotated.png)
```

## Screenshot Standards

### Quality
- ✅ High resolution (but optimized file size)
- ✅ Clear, focused content
- ✅ Consistent window sizes
- ✅ Light theme unless showing dark mode specifically

### What to Show
- ✅ Realistic data (not "test test test")
- ✅ Complete workflows
- ✅ Error states (very important!)
- ✅ Loading states
- ✅ Empty states

### What to Avoid
- ❌ Personal information
- ❌ Outdated UI
- ❌ Blurry or low-quality images
- ❌ Screenshots of screenshots
- ❌ Gigantic file sizes (>500KB)

## MkDocs Image Syntax

MkDocs supports standard Markdown image syntax:

```markdown
![Alt text](../../reference/screenshots/image.png)
```

For more control:

```markdown
![Alt text](../../reference/screenshots/image.png){ width="600" }
```

With captions:

```markdown
<figure markdown>
  ![Item Detail](../../reference/screenshots/item-detail.png)
  <figcaption>Item detail view showing AI-detected attributes</figcaption>
</figure>
```

## Screenshot Checklist for Contributors

Before submitting docs with screenshots:

- [ ] Screenshots show current UI (not outdated)
- [ ] Images are optimized (<500KB each)
- [ ] Filenames are descriptive
- [ ] Alt text is provided
- [ ] Screenshots match the content they illustrate
- [ ] Mobile and desktop versions included where relevant
- [ ] No personal/sensitive information visible
- [ ] Captions explain what's shown

## Maintaining Screenshots

Screenshots get outdated. To keep them fresh:

1. **Mark outdated images**: Add `<!-- TODO: Update screenshot -->` in markdown
2. **Regular audits**: Review screenshots every major release
3. **Version tagging**: Name can include version if needed: `v1-feature.png`
4. **Automated checks**: Consider tools that detect UI changes

## Questions?

Need help with screenshots? Open an issue or discussion on GitHub.

---

**Remember**: For ADHD users, one good screenshot is worth 1000 words! 🧠💜
