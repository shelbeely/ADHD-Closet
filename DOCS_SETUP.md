# Documentation Setup Guide

This repository has dual documentation:
1. **GitHub Pages** (MkDocs) - Full-featured docs site
2. **GitHub Wiki** - Quick reference accessible from Wiki tab

## GitHub Pages (MkDocs)

### Automatic Deployment

GitHub Actions workflow automatically deploys docs to GitHub Pages when changes are pushed to `main` branch.

**Workflow**: `.github/workflows/deploy-docs.yml`

**Triggers on**:
- Changes to `docs/**`
- Changes to `mkdocs.yml`
- Manual workflow dispatch

**View live docs**: https://shelbeely.github.io/ADHD-Closet/

### Manual Deployment

To deploy manually:

```bash
# Install dependencies
pip install mkdocs-material mkdocs-minify-plugin

# Build and deploy
mkdocs gh-deploy
```

This builds the site and pushes to `gh-pages` branch.

### Local Development

To preview docs locally:

```bash
# Install dependencies
pip install mkdocs-material mkdocs-minify-plugin

# Start local server
mkdocs serve

# Open http://127.0.0.1:8000
```

## GitHub Wiki

### Initial Setup

1. **Enable Wiki** in repository settings on GitHub
2. **Prepare content**:
   ```bash
   ./scripts/prepare-wiki.sh
   ```
3. **Clone wiki repository**:
   ```bash
   git clone https://github.com/shelbeely/ADHD-Closet.wiki.git
   ```
4. **Copy content**:
   ```bash
   cp -r wiki-content/* ADHD-Closet.wiki/
   ```
5. **Commit and push**:
   ```bash
   cd ADHD-Closet.wiki
   git add .
   git commit -m "Initial wiki setup with ADHD-friendly documentation"
   git push
   ```

### Updating Wiki

To update wiki content:

1. Run `./scripts/prepare-wiki.sh` to regenerate content
2. Copy updated files to wiki repository
3. Commit and push

Or edit pages directly on GitHub's wiki interface.

## Adding Screenshots

Screenshots are crucial for ADHD users! See [SCREENSHOT_GUIDE.md](SCREENSHOT_GUIDE.md) for:
- Why screenshots matter
- Where to add them
- How to capture and optimize
- Naming conventions
- Best practices

### Quick Screenshot Guide

1. **Capture** - Use browser devtools or screen capture
2. **Optimize** - Keep under 500KB each
3. **Save** - Put in `docs/screenshots/`
4. **Use** - Add to markdown: `![Description](../screenshots/filename.png)`

### Current Screenshots

Located in `docs/screenshots/`:
- guide-page-mobile.png
- main-desktop-empty.png
- main-mobile-view.png
- mobile-menu-open.png
- outfits-generate-desktop.png
- outfits-generate-mobile.png

## Documentation Structure

```
docs/
├── index.md (homepage)
├── CONTRIBUTING.md
├── user-guides/ (3 files)
│   ├── TUTORIAL.md (with screenshots!)
│   ├── FAQ.md
│   └── TROUBLESHOOTING.md
├── developer/ (2 files)
│   ├── ARCHITECTURE.md
│   └── SPEC.md
├── features/ (10 files)
├── api/ (1 file)
├── deployment/ (1 file)
└── screenshots/ (images)
```

## MkDocs Configuration

Edit `mkdocs.yml` to:
- Change site name/description
- Update navigation structure
- Modify theme colors
- Add extensions

## For Contributors

When adding documentation:

1. **Add to both places**: Update docs for both MkDocs and Wiki
2. **Include screenshots**: Visual > text for ADHD users
3. **Keep it simple**: Short paragraphs, bullet points
4. **Test locally**: Run `mkdocs serve` before committing
5. **Update navigation**: Add new pages to `mkdocs.yml`

## Troubleshooting

### GitHub Pages not updating

1. Check workflow ran: GitHub → Actions tab
2. Check `gh-pages` branch exists
3. Verify Pages enabled in Settings → Pages
4. Wait a few minutes for deployment

### Wiki not showing

1. Ensure Wiki is enabled in repository settings
2. Verify you pushed to the wiki repository (not main repo)
3. Check wiki URL: https://github.com/shelbeely/ADHD-Closet/wiki

### Images not loading

- Use relative paths: `![Alt](../screenshots/image.png)`
- Verify image exists in `docs/screenshots/`
- Check filename matches exactly (case-sensitive)

## Resources

- [MkDocs Documentation](https://www.mkdocs.org/)
- [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)
- [GitHub Wiki Help](https://docs.github.com/en/communities/documenting-your-project-with-wikis)

---

Questions? Open a GitHub Discussion!
