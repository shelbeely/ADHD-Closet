# MkDocs Documentation Setup

This project uses MkDocs with Material theme for beautiful, searchable documentation.

## Quick Start

### View Documentation Locally

```bash
# Install MkDocs (one time)
pip install mkdocs-material

# Serve documentation
cd /path/to/ADHD-Closet
mkdocs serve

# Open http://127.0.0.1:8000 in your browser
```

### Build Static Site

```bash
mkdocs build
# Output in site/ directory
```

## Features

The MkDocs setup provides:

- ✅ **Search** - Full-text search across all documentation
- ✅ **Dark mode** - Automatic theme switching
- ✅ **Mobile-friendly** - Responsive design for all devices
- ✅ **Tab navigation** - Clean, organized navigation structure
- ✅ **ADHD-friendly** - Minimal clutter, clear sections
- ✅ **Fast loading** - Instant page transitions
- ✅ **Code highlighting** - Syntax highlighting for code examples
- ✅ **Copy buttons** - One-click code copying

## Deployment

### GitHub Pages

Deploy to GitHub Pages with one command:

```bash
mkdocs gh-deploy
```

This builds the docs and pushes to the `gh-pages` branch.

Your docs will be available at: `https://shelbeely.github.io/ADHD-Closet/`

### Manual Deployment

Build and host the `site/` directory on any static hosting:

```bash
mkdocs build
# Upload site/ directory to your hosting provider
```

## Configuration

Documentation structure is defined in `mkdocs.yml`:

- **Theme**: Material Design 3 with purple accent
- **Navigation**: Organized by audience (Users, Features, Developers)
- **Search**: Enabled with suggestions and highlighting
- **Extensions**: Admonitions, tabs, emoji, code highlighting

## Adding New Pages

1. Create markdown file in appropriate `docs/` subdirectory
2. Add to navigation in `mkdocs.yml`
3. Test locally with `mkdocs serve`
4. Commit and push

Example:

```yaml
nav:
  - Home: index.md
  - New Section:
    - New Page: section/new-page.md
```

## Writing Docs

### Admonitions (Call-outs)

```markdown
!!! note "Title"
    This is a note

!!! warning "Warning"
    This is a warning

!!! tip "Tip"
    This is a helpful tip
```

### Tabs

```markdown
=== "Tab 1"
    Content for tab 1

=== "Tab 2"
    Content for tab 2
```

### Code with Copy Button

````markdown
```python
print("Hello, world!")
```
````

The copy button appears automatically.

## Troubleshooting

**MkDocs not found**
```bash
pip install mkdocs-material
```

**Build warnings about missing files**
- Check that all linked files exist in `docs/` directory
- Update links in `mkdocs.yml` navigation

**Site not loading locally**
- Make sure port 8000 is not in use
- Try `mkdocs serve --dev-addr=127.0.0.1:8001`

**GitHub Pages not updating**
- Check that `gh-pages` branch exists
- Verify GitHub Pages is enabled in repository settings
- May take a few minutes to deploy

## Benefits for ADHD Users

MkDocs provides an ADHD-friendly documentation experience:

1. **Clear navigation** - Tab-based, not overwhelming
2. **Search** - Find what you need instantly
3. **Dark mode** - Reduces eye strain
4. **Progressive disclosure** - Collapsible sections
5. **Fast** - No waiting, instant page loads
6. **Clean design** - Minimal distractions
7. **Mobile-friendly** - Read on any device

---

For more information, see [MkDocs documentation](https://www.mkdocs.org/) and [Material theme docs](https://squidfunk.github.io/mkdocs-material/).
