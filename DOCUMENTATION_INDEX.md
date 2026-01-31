# Documentation Index

Complete guide to all documentation in the ADHD-Closet project.

## 🚀 Getting Started

Start here if you're new:

1. **[README.md](README.md)** - Project overview and quick start
2. **[TUTORIAL.md](TUTORIAL.md)** - Step-by-step walkthrough
3. **[FAQ.md](FAQ.md)** - Common questions answered
4. **[DEPLOYMENT.md](DEPLOYMENT.md)** - How to install and deploy

## 👥 For Users

Using the application:

- **[TUTORIAL.md](TUTORIAL.md)** - Complete user guide
- **[FAQ.md](FAQ.md)** - Frequently asked questions
- **[KEYBOARD_SHORTCUTS.md](KEYBOARD_SHORTCUTS.md)** - Keyboard shortcuts (desktop)
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Problem solving guide

## 💻 For Developers

Contributing to the project:

### Setup & Development
- **[app/README.md](app/README.md)** - Development setup and API reference
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines and standards
- **[DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md)** - Quality acceptance criteria
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide

### Architecture & Design
- **[SPEC.md](SPEC.md)** - Complete product and technical specification
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design decisions
- **[API_CONTRACT.md](API_CONTRACT.md)** - API design principles
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference

### Security & Performance
- **[SECURITY_PRIVACY.md](SECURITY_PRIVACY.md)** - Security considerations
- **[PERFORMANCE.md](PERFORMANCE.md)** - Performance optimization guide

## 📚 Feature Documentation

Detailed guides for specific features:

### Core Features
- **[CATEGORIES.md](CATEGORIES.md)** - Category system and organization
- **[ATTRIBUTES.md](ATTRIBUTES.md)** - Item attributes and metadata
- **[OUI_GUIDE.md](OUI_GUIDE.md)** - Orchestrated UI system
- **[ADHD_IMPROVEMENTS.md](ADHD_IMPROVEMENTS.md)** - ADHD-friendly features

### AI & Models
- **[MODEL_SELECTION.md](MODEL_SELECTION.md)** - AI model configuration
- **[PRO_VS_FLASH_GUIDE.md](PRO_VS_FLASH_GUIDE.md)** - Model comparison
- **[IMAGE_GENERATION.md](IMAGE_GENERATION.md)** - Image generation features
- **[VISION_MODEL_GUIDE.md](VISION_MODEL_GUIDE.md)** - Vision model features

### Mobile & Native
- **[PWA_NATIVE_BRIDGE.md](PWA_NATIVE_BRIDGE.md)** - PWA and native app support
- **[NFC_TAG_SUPPORT.md](NFC_TAG_SUPPORT.md)** - NFC tag scanning

### Specialized Features
- **[BAND_MERCH.md](BAND_MERCH.md)** - Band merch and licensed products

## 📋 Project Management

Tracking progress and planning:

- **[TASK_BOARD.md](TASK_BOARD.md)** - Implementation checklist and progress
- **[DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md)** - Quality standards

## 📖 Document Organization

### By Audience

**New Users:**
README.md → TUTORIAL.md → FAQ.md

**Developers Starting Out:**
README.md → app/README.md → CONTRIBUTING.md → SPEC.md

**Setting Up Deployment:**
DEPLOYMENT.md → SECURITY_PRIVACY.md → PERFORMANCE.md

**Working on Features:**
SPEC.md → ARCHITECTURE.md → API_DOCUMENTATION.md → specific feature docs

### By Topic

**Wardrobe Organization:**
- CATEGORIES.md (how items are organized)
- ATTRIBUTES.md (item metadata)
- BAND_MERCH.md (licensed product support)

**AI Features:**
- MODEL_SELECTION.md (choosing models)
- PRO_VS_FLASH_GUIDE.md (model comparison)
- IMAGE_GENERATION.md (catalog images)
- VISION_MODEL_GUIDE.md (item inference)

**User Experience:**
- SPEC.md section 7 (ADHD-friendly design)
- OUI_GUIDE.md (intelligent UI)
- ADHD_IMPROVEMENTS.md (UX enhancements)

**Mobile & Apps:**
- PWA_NATIVE_BRIDGE.md (installation)
- NFC_TAG_SUPPORT.md (tag scanning)

**Development:**
- CONTRIBUTING.md (code standards)
- API_DOCUMENTATION.md (endpoints)
- ARCHITECTURE.md (system design)

## 🔍 Finding Information

### Common Scenarios

**"How do I install this?"**
→ [README.md](README.md) Quick Start section

**"I'm getting an error..."**
→ [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

**"How does [feature] work?"**
→ Search this index for the feature name

**"I want to contribute code"**
→ [CONTRIBUTING.md](CONTRIBUTING.md)

**"How do I configure AI models?"**
→ [MODEL_SELECTION.md](MODEL_SELECTION.md)

**"What categories exist?"**
→ [CATEGORIES.md](CATEGORIES.md)

**"What can I track about items?"**
→ [ATTRIBUTES.md](ATTRIBUTES.md)

**"How do I deploy to production?"**
→ [DEPLOYMENT.md](DEPLOYMENT.md)

**"What's the API for [endpoint]?"**
→ [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

**"Why was it designed this way?"**
→ [SPEC.md](SPEC.md) section 7 (Design Philosophy)

## 📁 File Locations

### Root Documentation (/)
All main documentation files are in the repository root for easy access.

### App-Specific Docs (/app)
- `app/README.md` - Development setup
- `app/BUN_SETUP.md` - Bun runtime configuration (if needed)

### Hidden Docs (/.github)
- `.github/agents/` - Agent configurations
- `.github/humanizer/` - Documentation humanization guides

## 🎯 Documentation Standards

All documentation in this project follows these principles:

### Writing Style
- **Natural language** - Sounds like a human wrote it
- **Direct and clear** - No corporate jargon or AI patterns
- **ADHD-friendly** - Short paragraphs, bullet points, clear headers
- **Practical** - Includes examples and code snippets
- **Honest** - Acknowledges limitations and trade-offs

### Structure
- **Table of contents** for docs over 100 lines
- **Clear sections** with descriptive headers
- **Progressive disclosure** - basics first, details later
- **Cross-references** to related docs
- **Last updated date** when relevant

### Technical Content
- **Code examples** that actually work
- **Accurate API references**
- **Real error messages** not hypothetical ones
- **Tested commands** not guesses
- **Version information** when it matters

## 🔄 Keeping Docs Updated

When you make changes to the code:

1. **Update relevant docs** in the same PR
2. **Check cross-references** - do links still work?
3. **Test code examples** - do they still run?
4. **Update version numbers** if applicable
5. **Review for AI patterns** before committing

See [CONTRIBUTING.md](CONTRIBUTING.md) Documentation Standards section for details.

## 📝 Creating New Documentation

Need to add a new doc? Ask yourself:

1. **Who is this for?** (users, developers, contributors)
2. **What problem does it solve?**
3. **Where should it live?** (root, app/, or elsewhere)
4. **Does it overlap with existing docs?** (maybe update instead of creating)
5. **Will it stay relevant?** (or is it a temporary implementation note)

Then:
1. Create the doc following the standards above
2. Add it to this index in the appropriate sections
3. Cross-reference from related docs
4. Submit in a PR with explanation

## 🗑️ Removed Documentation

The following docs were consolidated or removed to reduce clutter:

### Consolidated
- **OUI docs** (5 files) → [OUI_GUIDE.md](OUI_GUIDE.md)
- **Quick references** (4 files) → Appended to main docs
- **Band merch pair** (2 files) → [BAND_MERCH.md](BAND_MERCH.md)
- **Image generation pair** (2 files) → [IMAGE_GENERATION.md](IMAGE_GENERATION.md)
- **Vision model pair** (2 files) → [VISION_MODEL_GUIDE.md](VISION_MODEL_GUIDE.md)

### Removed (Implementation Summaries)
Session logs and implementation notes that aren't needed long-term:
- ADHD_IMPROVEMENTS_SUMMARY.md
- ATTRIBUTE_SYSTEM_IMPROVEMENTS.md
- BAND_MERCH_SUMMARY.md
- FEATURE_REMOVAL_SUMMARY.md
- IMAGE_TO_IMAGE_SUMMARY.md
- IMPLEMENTATION_SUMMARY.md
- MORE_PLEASE_DELIVERED.md
- NEW_CATEGORIES_SUMMARY.md
- NFC_IMPLEMENTATION_COMPLETE.md
- OUI_IMPLEMENTATION_SUMMARY.md
- REMOVAL_COMPLETE_VERIFICATION.md
- SESSION_SUMMARY_ATTRIBUTE_IMPROVEMENTS.md
- SHOW_ONLY_REAL_CLOTHES_SUMMARY.md
- VISION_MODEL_SUMMARY.md

### Removed (Duplicates/Internal)
- FEATURES_SHOWCASE.md (redundant with README/SPEC)
- HANDOFF_PROMPT.md (internal agent instructions)
- NANO_BANANA_PRO.md (covered in MODEL_SELECTION.md)
- OUTFIT_VISUALIZATIONS.md (covered in features)
- PWA_NATIVE_IMPLEMENTATION.md (merged into PWA_NATIVE_BRIDGE.md)
- REAL_VS_GENERATED_ITEMS.md (implementation detail)
- WEB_NFC_IMPLEMENTATION.md (merged into NFC_TAG_SUPPORT.md)
- WEB_VIBRATION_API.md (minor feature, covered in PWA docs)
- WEB_VIBRATION_IMPLEMENTATION.md (merged)

**Before:** 57 files  
**After:** 28 files  
**Reduction:** 51% fewer docs, 100% of the important information retained

## 📞 Need Help?

Can't find what you're looking for?

1. **Search this repository** for keywords
2. **Check [FAQ.md](FAQ.md)** for common questions
3. **Read [TROUBLESHOOTING.md](TROUBLESHOOTING.md)** for problems
4. **Open a GitHub Discussion** for questions
5. **Open a GitHub Issue** for bugs or feature requests

---

**Last Updated:** 2026-01-31  
**Documentation Cleanup:** Complete ✅

*Built with 💜 for developers who want docs that actually help*
