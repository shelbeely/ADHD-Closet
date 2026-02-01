# Welcome to Twin Style Documentation

**Your ADHD-friendly wardrobe organizer powered by Google Gemini AI**

Twin Style leverages the power of Google's Gemini AI (the "twins" reference) to help you manage your wardrobe effortlessly. The dual nature of **your style** meets **AI assistance**.

## Quick Links

<div class="grid cards" markdown>

- :material-rocket-launch: **[Get Started](user-guides/TUTORIAL.md)**

    New here? Start with the quick tutorial

- :material-chat-question: **[FAQ](user-guides/FAQ.md)**

    Common questions answered

- :material-wrench: **[Troubleshooting](user-guides/TROUBLESHOOTING.md)**

    Having issues? Find solutions here

- :material-github: **[Contributing](CONTRIBUTING.md)**

    Want to help? Read the contributor guide

</div>

## What is ADHD Closet?

ADHD Closet helps you organize your clothing with AI-powered tools designed specifically for ADHD-friendly workflows. Take photos of your clothes, let AI generate clean catalog images and suggest categories, then get instant outfit recommendations based on weather, mood, and time constraints.

### Key Features

- **Quick Item Capture** - Add items in ~30 seconds via camera or gallery
- **AI Catalog Generation** - Transform real photos into professional catalog images
- **Smart Categorization** - AI automatically detects categories, colors, patterns, and attributes
- **Outfit Generation** - Get AI-powered outfit suggestions with "Panic Pick" for instant decisions
- **ADHD-Optimized Design** - Minimal friction, decision paralysis reducers, progressive disclosure
- **Mobile-First** - Optimized category-based navigation on mobile
- **PWA + Native Support** - Install as a Progressive Web App or build as a native iOS/Android app

## Documentation Structure

### For Users

- **[Tutorial](user-guides/TUTORIAL.md)** - Step-by-step walkthrough
- **[FAQ](user-guides/FAQ.md)** - Frequently asked questions  
- **[Troubleshooting](user-guides/TROUBLESHOOTING.md)** - Problem solving guide

### Features

- **[Categories](features/CATEGORIES.md)** - How items are organized
- **[Attributes](features/ATTRIBUTES.md)** - Item metadata and details
- **[AI Models](features/MODEL_SELECTION.md)** - Choosing the right models
- **[Image Generation](features/IMAGE_GENERATION.md)** - Catalog image features
- **[NFC Tags](features/NFC_TAG_SUPPORT.md)** - Track items with NFC
- **[Mobile Apps](features/MOBILE_APPS.md)** - PWA and native apps

### For Developers

- **[Architecture](developer/ARCHITECTURE.md)** - System design
- **[Contributing](CONTRIBUTING.md)** - Contribution guidelines
- **[API Reference](api/API_DOCUMENTATION.md)** - Complete API docs
- **[Deployment](deployment/DEPLOYMENT.md)** - Production setup

## Quick Start

```bash
# Clone the repository
git clone https://github.com/shelbeely/ADHD-Closet.git
cd ADHD-Closet

# Start database services
docker compose up -d

# Set up the app
cd app
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# Install dependencies and run
bun install
npx prisma migrate dev
bun dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## Need Help?

1. Check the **[FAQ](user-guides/FAQ.md)** for common questions
2. Read **[Troubleshooting](user-guides/TROUBLESHOOTING.md)** for problems
3. Open a GitHub Discussion for questions
4. Open a GitHub Issue for bugs or feature requests

---

**Built with 💜 for people with ADHD**
