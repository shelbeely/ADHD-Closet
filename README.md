# 👕 Twin Style

**Your ADHD-friendly wardrobe organizer powered by Google Gemini AI**

> **Built for Gemini**: Twin Style leverages Google's Gemini AI models (the "twins" of AI), using Gemini 3's advanced vision, image generation, and reasoning capabilities to help you manage your wardrobe effortlessly.

[![Documentation](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://shelbeely.github.io/ADHD-Closet/)
[![Wiki](https://img.shields.io/badge/docs-GitHub%20Wiki-green)](https://github.com/shelbeely/ADHD-Closet/wiki)
[![License](https://img.shields.io/badge/license-MIT-purple)](LICENSE)

![Desktop View](https://github.com/user-attachments/assets/caa04353-a7bd-48f8-906d-65f4f4faa0fb)
*Desktop view with filters and table layout*

## 📚 Documentation

- **[📖 Full Documentation (GitHub Pages)](https://shelbeely.github.io/ADHD-Closet/)** - Complete docs with search and dark mode
- **[📝 Quick Wiki](https://github.com/shelbeely/ADHD-Closet/wiki)** - Fast reference on GitHub
- **[❓ FAQ](https://shelbeely.github.io/ADHD-Closet/user-guides/FAQ/)** - Common questions
- **[🎓 Tutorial](https://shelbeely.github.io/ADHD-Closet/user-guides/TUTORIAL/)** - Get started guide

## ✨ What is this?

Twin Style helps you organize your clothing with **Google Gemini AI** (the "twins" reference) designed specifically for ADHD-friendly workflows. Take photos of your clothes, let Gemini's advanced vision AI generate clean catalog images and suggest categories, then get instant outfit recommendations based on weather, mood, and time constraints.

### 🧠 Why Gemini? Why "Twin Style"?

The name **Twin Style** is a playful reference to Gemini (Latin for "twins"), while representing the dual nature of the app: **your style** meets **AI assistance**.

This app is built exclusively around **Google Gemini 3** models:
- **Gemini 3 Pro Image Preview**: Only model that can generate high-quality catalog images
- **Gemini 3 Pro**: Advanced vision capabilities for accurate item categorization and OCR
- **Gemini 3 Flash**: Fast, cost-effective outfit generation with excellent reasoning

The entire workflow is optimized for Gemini's multimodal capabilities, making it the perfect AI closet companion.

### 🎯 Key Features

- **📸 Quick Item Capture**: Add items in ~30 seconds via camera or gallery
- **🤖 AI Catalog Generation**: Transform real photos into professional catalog images
- **🏷️ Smart Categorization**: AI automatically detects categories, colors, patterns, and attributes
- **✨ Outfit Generation**: Get AI-powered outfit suggestions with "Panic Pick" for instant decisions
- **📖 Fit & Proportion Guide**: Built-in styling guide to help you understand what works
- **🎨 ADHD-Optimized Design**: 
  - Minimal friction (auto-save, no forced completion)
  - Decision paralysis reducers (limited choices, guided workflows)
  - Progressive disclosure (show complexity only when needed)
  - Time estimates and status visibility
- **💻 Desktop Power Tools**: Bulk editing, keyboard shortcuts, advanced filtering
- **📱 Mobile-First**: Optimized category-based navigation on mobile
- **📲 PWA + Native Support**: Install as a Progressive Web App or build as a native iOS/Android app with Capacitor
- **📡 NFC Tag Support**: Scan NFC tags on hangers to track items removed from/returned to closet (works in Chrome/Edge on Android, or native iOS/Android apps)
- **💾 Export/Import**: Full data backup via ZIP files

## 📸 Screenshots

### Mobile Experience
<table>
  <tr>
    <td width="33%">
      <img src="https://github.com/user-attachments/assets/1ef28e34-69d0-4e5d-83ba-ba4c51bd8f2c" alt="Mobile Main View" width="100%"/>
      <p align="center"><em>Category-first navigation</em></p>
    </td>
    <td width="33%">
      <img src="https://github.com/user-attachments/assets/206d814e-f2e7-48a5-a231-27d651d92715" alt="Mobile Menu" width="100%"/>
      <p align="center"><em>Quick access menu</em></p>
    </td>
    <td width="33%">
      <img src="https://github.com/user-attachments/assets/492791d2-ac58-4acf-a8c9-5df51b6c7828" alt="Outfit Generator" width="100%"/>
      <p align="center"><em>Outfit generation with Panic Pick</em></p>
    </td>
  </tr>
</table>

### Desktop Experience
![Outfit Generator Desktop](https://github.com/user-attachments/assets/540f4c56-2f74-4e33-a854-65c64f9eea52)
*Outfit generator with weather, mood, and time constraints*

### Fit & Proportion Guide
![Guide Page](https://github.com/user-attachments/assets/373b1a49-d3a6-4c2c-86f6-bf939716f54a)
*Built-in styling guide with collapsible sections*

## 📁 What's in this repository

- **`/app`** — Next.js application (see [app/README.md](app/README.md))
- **`docker-compose.yml`** — Postgres + Redis setup
- **`/docs`** — Product spec, API contracts, and implementation guides

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose (for Postgres + Redis)
- [Bun](https://bun.sh) ≥ 1.0.0 (recommended) or [Node.js](https://nodejs.org/) ≥ 20
- [OpenRouter API key](https://openrouter.ai/) (for AI features)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/shelbeely/ADHD-Closet.git
cd ADHD-Closet

# 2. Start database services
docker compose up -d

# 3. Set up the app
cd app
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# 4. Install dependencies
bun install  # or: npm install

# 5. Run database migrations
npx prisma migrate dev

# 6. Generate Prisma Client
npm run prisma:generate

# 7. Start development server
bun dev  # or: npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 🏗️ Architecture

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS
- **Design System**: Material Design 3 Expressive with ADHD-optimized UX patterns
- **3D Visualization**: Three.js + @react-three/fiber for interactive closet rail view
- **Backend**: Next.js Route Handlers (API Routes)
- **Database**: PostgreSQL 16 with Prisma ORM
- **Background Jobs**: BullMQ + Redis for async AI processing
- **AI Provider**: OpenRouter with multiple Gemini models:
  - **Image Generation**: Gemini 3 Pro Image Preview (nicknamed "Nano Banana Pro")
  - **Vision/OCR**: Gemini 3 Pro (highest quality for item inference)
  - **Text**: Gemini 3 Flash (fast outfit generation)
- **Image Processing**: Sharp for server-side thumbnails and optimization
- **Runtime**: Bun.js (with npm fallback for broader compatibility)
- **PWA**: next-pwa with service worker and offline support
- **Native Bridge**: Capacitor for iOS and Android native capabilities

## 📲 PWA & Native Apps

This application can be deployed as:

1. **Progressive Web App (PWA)** - Install directly from the browser on any device
2. **Native iOS App** - Build and deploy to the App Store using Capacitor
3. **Native Android App** - Build and deploy to Google Play using Capacitor

### Native Capabilities

When running as a native app, additional device features are available:

- **Native Camera** - Direct camera access with better performance
- **File System** - Native file system access for better storage management
- **Share Sheet** - Native share functionality
- **Haptic Feedback** - Tactile feedback for interactions
- **Status Bar** - Customizable status bar styling
- **Splash Screen** - Native splash screen on app launch
- **NFC Tags** - Scan NFC tags to track clothing items (also works in Chrome/Edge on Android via Web NFC API)

For detailed instructions on building native apps, see the Mobile Apps section in [DEPLOYMENT.md](docs/deployment/DEPLOYMENT.md).

For NFC tag functionality, see [NFC_TAG_SUPPORT.md](docs/features/NFC_TAG_SUPPORT.md).

## 🎨 Design Principles

### Material Design 3 Expressive
- **Dynamic color system** with surface tinting and elevation-based depth
- **Rounded, expressive shapes** (16-28px border radius)
- **Material You typography** with clear hierarchy
- **Smooth transitions** and motion (200-300ms timing)
- **Touch-friendly targets** (48x48dp minimum for accessibility)

### ADHD-Optimized UX
Our design specifically addresses common ADHD challenges:

| Challenge | Solution |
|-----------|----------|
| **Friction** | Auto-save, no forced completion, minimal steps |
| **Decision Paralysis** | Limited choices (3-5 max), "Panic Pick" feature, guided workflows |
| **Visual Clarity** | High contrast, obvious CTAs, consistent patterns |
| **Time Blindness** | Time estimates (~30 sec), progress indicators, status visibility |
| **Cognitive Load** | One thing at a time, category-first navigation, chunked information |
| **Memory** | Recent items, prominent search, breadcrumbs, state preservation |
| **Feedback** | Instant responses (<100ms), success confirmation, optimistic UI |

See [SPEC.md](docs/developer/SPEC.md) for complete design system guidelines.

## 🎯 Key Features

### Photo-Based Item Management
- **Quick capture**: Add items via camera or gallery in ~30 seconds
- **Multiple photo types**: Front, back, details, and label photos
- **Side-by-side display**: See front and back views simultaneously
- **Progressive disclosure**: Start with one photo, add more later

### AI-Powered Enhancement
- **Catalog image generation**: Clean, centered, professional-looking images from casual photos
- **Smart categorization**: Automatic detection of:
  - Category (tops, bottoms, dresses, outerwear, shoes, accessories, etc.)
  - Colors and color palettes
  - Patterns (solid, striped, graphic, etc.)
  - Attributes (neckline, sleeve length, rise, materials, etc.)
- **Label extraction**: OCR from label photos for brand, size, and materials
- **Confidence scores**: Review AI suggestions before accepting

### Outfit Generation
- **"Panic Pick"**: Instant outfit when you need to leave NOW
- **Constraint-based**: Filter by:
  - Weather (hot, warm, cool, cold, rain, snow)
  - Mood (dysphoria-safe, confidence boost, dopamine hit, neutral)
  - Time available (quick 5 min, normal 15+ min)
  - Occasion (work, date, errands, staying home)
- **Fit & Proportion Guide integration**: Apply styling principles to outfit suggestions
- **Ranked results**: Get 3 outfit options, rate them to improve future suggestions

### Desktop Power Tools
- **Bulk editing**: Select multiple items and edit in batch
- **Advanced filtering**: Multi-category, multi-state, search
- **Keyboard shortcuts**: Navigate and edit efficiently
- **Table view**: See more items at once with sortable columns
- **Drag & drop**: Build outfits visually (coming soon in Phase 5)

### Data Management
- **Export/Import**: Full backup via ZIP files including all images and metadata
- **Local storage**: All images stored on your server, no external CDN
- **Single-user**: No authentication complexity, self-hosted for privacy

## 📚 Documentation

**[📖 Complete Documentation Index](DOCUMENTATION_INDEX.md)** - Find everything you need

### Quick Links

**Getting Started:**
- [Tutorial](docs/user-guides/TUTORIAL.md) - Step-by-step guide
- [FAQ](docs/user-guides/FAQ.md) - Common questions
- [Troubleshooting](docs/user-guides/TROUBLESHOOTING.md) - Problem solving

**Developers:**
- [Development Guide](app/README.md) - Setup and API
- [Contributing](CONTRIBUTING.md) - Code standards
- [Architecture](docs/developer/ARCHITECTURE.md) - System design
- [API Documentation](docs/api/API_DOCUMENTATION.md) - Endpoints
- [Android APK Build Guide](docs/mobile/ANDROID_BUILD.md) - Build Android app

**Features:**
- [Categories](docs/features/CATEGORIES.md) - Item organization
- [OUI Guide](docs/features/OUI_GUIDE.md) - Smart UI system
- [NFC Tags](docs/features/NFC_TAG_SUPPORT.md) - Tag scanning
- [PWA & Native](docs/deployment/DEPLOYMENT.md#mobile-apps) - Mobile apps

## 📋 Implementation Status

The project is actively being developed with the following phases:

- ✅ **Phase 0**: Project setup (Next.js, Prisma, Docker, BullMQ)
- ✅ **Phase 1**: Core data models and CRUD operations
- ✅ **Phase 2**: Mobile-first UI with category navigation
- ✅ **Phase 3**: AI jobs (catalog generation, item inference)
- 🚧 **Phase 4**: Desktop power tools (bulk edit, advanced filters)
- 🚧 **Phase 5**: Outfit generation and management
- ⏳ **Phase 6**: 3D closet rail visualization
- ⏳ **Phase 7**: Export/import functionality
- ⏳ **Phase 8**: Polish and hardening

Check [GitHub Issues](https://github.com/shelbeely/ADHD-Closet/issues) for current priorities and progress tracking.

## ⚙️ Environment Configuration

### Required Variables
```bash
# Supabase PostgreSQL (connection pooler for runtime)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
# Supabase PostgreSQL (direct connection for Prisma migrations)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
REDIS_URL="redis://localhost:6379"
OPENROUTER_API_KEY="your-api-key-here"
```

### AI Model Configuration (Optimal Setup)
```bash
# Image generation (REQUIRED for catalog images)
OPENROUTER_IMAGE_MODEL="google/gemini-3-pro-image-preview"

# Vision/OCR (BEST quality for item inference)
OPENROUTER_VISION_MODEL="google/gemini-3-pro-preview"

# Text generation (FAST and cost-effective for outfits)
OPENROUTER_TEXT_MODEL="google/gemini-3-flash-preview"
```

See [MODEL_SELECTION.md](docs/features/MODEL_SELECTION.md) for detailed model comparisons and [app/.env.example](app/.env.example) for all available options.

## 🤝 Contributing

This project welcomes contributions! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Before You Start
1. Check [GitHub Issues](https://github.com/shelbeely/ADHD-Closet/issues) for current priorities
2. Read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
3. Review [SPEC.md](docs/developer/SPEC.md) to understand the design principles

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the coding standards
4. Test thoroughly (see Definition of Done in [CONTRIBUTING.md](CONTRIBUTING.md#definition-of-done))
5. Submit a pull request

## 📝 Important Notes

- **Single-user only**: This is a self-hosted personal tool, not a multi-user platform
- **Images stored locally**: All images live on your server, no external CDN required
- **No transparent cutouts**: AI generates catalog images, but doesn't cut out backgrounds
- **OpenRouter required**: All AI processing happens server-side through OpenRouter
- **Privacy-first**: Your data stays on your server, you control everything

## 🐛 Troubleshooting

### Common Issues

**Database connection fails**
```bash
# Verify your Supabase DATABASE_URL is correct in .env
# Test connection with Prisma
cd app && npx prisma db pull

# If using local PostgreSQL for offline development:
docker compose --profile local-db up -d
docker exec wardrobe-postgres pg_isready -U wardrobe
```

**AI jobs not processing**
```bash
# Check Redis is running
docker exec wardrobe-redis redis-cli ping

# Verify OPENROUTER_API_KEY is set in .env
```

**Bun crashes in VM environments**
- See [app/BUN_SETUP.md](app/BUN_SETUP.md) for workarounds
- The project fully supports npm as a fallback

For more help, see [TROUBLESHOOTING.md](docs/user-guides/TROUBLESHOOTING.md).

## 📄 License

[Add your license here]

---

<div align="center">

**Built with 💜 for people with ADHD**

[Report Bug](https://github.com/shelbeely/ADHD-Closet/issues) · [Request Feature](https://github.com/shelbeely/ADHD-Closet/issues) · [View Docs](docs/developer/SPEC.md)

</div>
