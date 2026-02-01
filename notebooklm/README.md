# NotebookLM Documentation Package

This directory contains a comprehensive set of documentation files optimized for import into **Google NotebookLM** to help you understand and visualize the Twin Style project.

## What is NotebookLM?

NotebookLM is Google's AI-powered research and note-taking tool that can analyze documents and help you understand complex projects. Learn more at https://notebooklm.google.com/

## Files in This Package

### Core Documentation

1. **[01-PROJECT-OVERVIEW.md](./01-PROJECT-OVERVIEW.md)**
   - Project identity and purpose
   - Core problem statement and solutions
   - Key features overview
   - Current status and roadmap
   - Design philosophy and principles
   - ~7,900 words

2. **[02-TECHNICAL-ARCHITECTURE.md](./02-TECHNICAL-ARCHITECTURE.md)**
   - System architecture diagrams
   - Technology stack details
   - Component breakdown
   - Data flow patterns
   - Deployment architecture
   - Performance optimizations
   - ~14,600 words

3. **[03-DATABASE-SCHEMA.md](./03-DATABASE-SCHEMA.md)**
   - Complete database schema (Prisma)
   - 11 models with relationships
   - Entity relationship diagrams
   - Enums and field descriptions
   - JSON field structures
   - Query patterns and examples
   - ~17,600 words

4. **[04-API-REFERENCE.md](./04-API-REFERENCE.md)**
   - 25+ REST API endpoints
   - Request/response formats
   - Error handling conventions
   - Code examples (cURL, TypeScript)
   - Authentication and security
   - Best practices
   - ~17,300 words

5. **[05-UI-UX-DESIGN-SYSTEM.md](./05-UI-UX-DESIGN-SYSTEM.md)**
   - Material Design 3 implementation
   - ADHD-optimized UX patterns
   - Component patterns and examples
   - Color system and typography
   - Screenshots of mobile and desktop UI
   - Accessibility guidelines
   - ~16,500 words

6. **[06-FEATURES-AND-CAPABILITIES.md](./06-FEATURES-AND-CAPABILITIES.md)**
   - Complete feature documentation
   - Photo-based inventory management
   - AI-powered enhancements
   - Outfit generation system
   - Organization and tracking features
   - Desktop power tools
   - NFC tag support
   - ~16,900 words

7. **[07-DEVELOPMENT-GUIDE.md](./07-DEVELOPMENT-GUIDE.md)**
   - Quick start instructions
   - Project structure
   - Development workflow
   - Code standards and conventions
   - Common tasks and debugging
   - Deployment procedures
   - ~14,800 words

8. **[08-AI-INTEGRATION.md](./08-AI-INTEGRATION.md)**
   - OpenRouter AI provider setup
   - AI models used (Flux, Gemini)
   - Job queue system (BullMQ + Redis)
   - Prompt engineering templates
   - Error handling and cost management
   - Performance optimization
   - ~16,800 words

9. **[09-CODE-EXAMPLES.md](./09-CODE-EXAMPLES.md)**
   - Real code patterns and snippets
   - API route examples
   - React component patterns
   - Prisma database queries
   - Custom hooks and utilities
   - Error handling patterns
   - ~19,000 words

10. **[10-COMPONENT-CATALOG.md](./10-COMPONENT-CATALOG.md)**
    - Complete component reference
    - Props and usage examples
    - Display, form, and layout components
    - Navigation and utility components
    - Native feature components
    - Component composition patterns
    - ~15,000 words

11. **[11-DEPLOYMENT-OPERATIONS.md](./11-DEPLOYMENT-OPERATIONS.md)**
    - Docker Compose deployment
    - VPS deployment guide
    - SSL/TLS configuration
    - Monitoring and logging
    - Backup and recovery
    - Security hardening
    - ~13,000 words

12. **[12-TROUBLESHOOTING-FAQ.md](./12-TROUBLESHOOTING-FAQ.md)**
    - Common issues and solutions
    - Installation problems
    - Database and Redis issues
    - AI integration troubleshooting
    - Performance optimization
    - Frequently asked questions
    - ~13,000 words

### Supporting Resources

9. **[images/](./images/)**
   - Screenshots of mobile and desktop UI
   - 6 high-quality PNG images
   - Referenced throughout documentation

## How to Use with NotebookLM

### Option 1: Import from GitHub (Recommended)

1. Visit https://notebooklm.google.com/
2. Create a new notebook
3. Click "Add Source" → "Web URL"
4. Add these documentation URLs:
   ```
   https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/notebooklm/01-PROJECT-OVERVIEW.md
   https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/notebooklm/02-TECHNICAL-ARCHITECTURE.md
   https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/notebooklm/03-DATABASE-SCHEMA.md
   https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/notebooklm/04-API-REFERENCE.md
   https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/notebooklm/05-UI-UX-DESIGN-SYSTEM.md
   https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/notebooklm/06-FEATURES-AND-CAPABILITIES.md
   https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/notebooklm/07-DEVELOPMENT-GUIDE.md
   https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/notebooklm/08-AI-INTEGRATION.md
   ```

5. Add screenshot images as sources:
   ```
   https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/docs/screenshots/main-mobile-view.png
   https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/docs/screenshots/mobile-menu-open.png
   https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/docs/screenshots/outfits-generate-mobile.png
   https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/docs/screenshots/outfits-generate-desktop.png
   https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/docs/screenshots/main-desktop-empty.png
   https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/docs/screenshots/guide-page-mobile.png
   ```

6. Add primary documentation site:
   ```
   https://shelbeely.github.io/ADHD-Closet/
   ```

### Option 2: Upload Local Files

1. Visit https://notebooklm.google.com/
2. Create a new notebook
3. Click "Add Source" → "Upload"
4. Upload all 8 markdown files from this directory
5. Optionally upload images from the `images/` subdirectory

### Option 3: Copy-Paste

1. Visit https://notebooklm.google.com/
2. Create a new notebook
3. Click "Add Source" → "Text"
4. Copy-paste content from each markdown file

## Suggested Questions for NotebookLM

Once you've imported the documentation, try asking NotebookLM:

### Architecture & Technical
- "Explain the system architecture and how components interact"
- "What database schema is used and how are relationships structured?"
- "How does the AI job queue work with BullMQ and Redis?"
- "What are the API endpoints and how do they work together?"
- "Explain the technology stack choices and rationale"

### Features & Functionality
- "What are the main features and how do they work?"
- "How does the outfit generation system work?"
- "Explain the ADHD-optimized UX patterns"
- "How does NFC tag support work?"
- "What AI capabilities does the system have?"

### Development
- "How do I set up the development environment?"
- "What are the coding standards and best practices?"
- "How do I add a new API endpoint?"
- "Explain the database migration process"
- "How do I deploy this application?"

### Design & UX
- "What is the Material Design 3 implementation?"
- "How are ADHD users specifically accommodated?"
- "Explain the mobile-first responsive design approach"
- "What accessibility features are included?"
- "How does the color system work?"

### AI Integration
- "How does AI catalog image generation work?"
- "Explain the prompt engineering for outfit generation"
- "What AI models are used and why?"
- "How are AI costs managed?"
- "What error handling exists for AI failures?"

### Project Overview
- "What problem does this project solve?"
- "Who is the target user?"
- "What is the current development status?"
- "What are the future plans?"
- "How does this compare to other wardrobe apps?"

## Document Statistics

| Document | Words | Focus Area |
|----------|-------|------------|
| Project Overview | ~7,900 | High-level understanding |
| Technical Architecture | ~14,600 | System design |
| Database Schema | ~17,600 | Data models |
| API Reference | ~17,300 | Integration |
| UI/UX Design System | ~16,500 | User interface |
| Features & Capabilities | ~16,900 | Functionality |
| Development Guide | ~14,800 | Building & contributing |
| AI Integration | ~16,800 | AI workflows |
| Code Examples | ~19,000 | Code patterns |
| Component Catalog | ~15,000 | UI components |
| Deployment & Operations | ~13,000 | Production deployment |
| Troubleshooting & FAQ | ~13,000 | Problem solving |
| **Total** | **~182,000 words** | **Complete project knowledge** |

## Additional Resources

### External Documentation
- **Full Documentation Site**: https://shelbeely.github.io/ADHD-Closet/
- **GitHub Repository**: https://github.com/shelbeely/ADHD-Closet
- **Contributing Guide**: https://github.com/shelbeely/ADHD-Closet/blob/main/CONTRIBUTING.md

### Reference Links in Documents
All documentation files include web URLs for:
- External resources (Material Design, W3C, etc.)
- Internal documentation cross-references
- GitHub repository links
- Published documentation site links
- Screenshot images

### Technology Documentation
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Three.js**: https://threejs.org/docs
- **BullMQ**: https://docs.bullmq.io/
- **OpenRouter**: https://openrouter.ai/docs
- **Material Design 3**: https://m3.material.io/

## Maintenance

This documentation package is maintained in the repository at:
```
/notebooklm/
```

To update:
1. Edit markdown files in this directory
2. Ensure all web URLs remain valid
3. Update screenshot images if UI changes
4. Keep word counts and statistics current
5. Verify images are accessible via GitHub raw URLs

## File Format Notes

### Markdown Compatibility
- All files use standard GitHub-flavored Markdown
- Code blocks use proper syntax highlighting
- Tables are formatted for readability
- Links use both relative and absolute URLs

### Image Format
- PNG format for screenshots
- High resolution (suitable for display)
- Stored in Git LFS for efficiency
- Accessible via GitHub raw content URLs

### Web URL Strategy
All documentation uses web URLs for:
- **Images**: `https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/...`
- **Documentation**: `https://shelbeely.github.io/ADHD-Closet/...`
- **Repository**: `https://github.com/shelbeely/ADHD-Closet/...`
- **External**: Direct links to authoritative sources

This ensures NotebookLM can access all referenced resources directly.

## Support

For questions or issues with this documentation:
- **GitHub Issues**: https://github.com/shelbeely/ADHD-Closet/issues
- **GitHub Discussions**: https://github.com/shelbeely/ADHD-Closet/discussions

## License

This documentation is part of the Twin Style project and shares the same MIT license.

---

**Last Updated**: February 2026  
**Documentation Version**: 1.0  
**Project Phase**: 4-5 (Active Development)

Built with 💜 for people with ADHD
