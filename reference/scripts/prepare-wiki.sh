#!/bin/bash
# Prepare documentation for GitHub Wiki

set -e

WIKI_DIR="wiki-content"
DOCS_DIR="docs"

echo "📚 Preparing GitHub Wiki content..."
rm -rf "$WIKI_DIR"
mkdir -p "$WIKI_DIR"

# Create Home page
cat > "$WIKI_DIR/Home.md" << 'EOF'
# ADHD Closet Wiki

Welcome! This wiki provides quick access to documentation.

## Quick Links
- [Tutorial](Tutorial) - Get started
- [FAQ](FAQ) - Common questions
- [Features](Features) - What can this app do?

## Full Documentation
👉 **[Complete Docs on GitHub Pages](https://shelbeely.github.io/ADHD-Closet/)**

Built with 💜 for people with ADHD
EOF

# Copy main docs
cp "$DOCS_DIR/user-guides/TUTORIAL.md" "$WIKI_DIR/Tutorial.md"
cp "$DOCS_DIR/user-guides/FAQ.md" "$WIKI_DIR/FAQ.md"
cp "$DOCS_DIR/CONTRIBUTING.md" "$WIKI_DIR/Contributing.md"

echo "✅ Wiki content ready in $WIKI_DIR/"
echo ""
echo "To publish: Clone https://github.com/shelbeely/ADHD-Closet.wiki.git"
echo "Then copy files and push"
