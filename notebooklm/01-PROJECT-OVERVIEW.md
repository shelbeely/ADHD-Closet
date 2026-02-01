# Twin Style - Project Overview

## Project Identity

**Name**: Twin Style  
**Type**: Single-user, self-hosted web application  
**Purpose**: ADHD-friendly wardrobe organizer powered by **Google Gemini AI**  
**License**: MIT  
**Target Users**: Individuals with ADHD who need help managing their wardrobe  
**Style Focus**: Emo/goth/alt fashion aesthetic  
**AI Technology**: Built exclusively for Google Gemini 3 models

## Project Description

Twin Style is a personal wardrobe management system designed from the ground up with ADHD-friendly workflows and **powered exclusively by Google Gemini AI**. The name references Gemini (Latin for "twins"), representing the dual nature of **your style** meets **AI assistance**.

It helps users catalog their clothing through photos, uses Gemini's advanced vision AI to generate clean catalog images and automatically categorize items, and provides intelligent outfit recommendations based on weather, mood, and time constraints.

The application leverages **Gemini 3's unique multimodal capabilities**:
- **Image generation** (Gemini 3 Pro Image Preview)
- **Advanced vision understanding** (Gemini 3 Pro)
- **Fast reasoning** (Gemini 3 Flash)

The application is built for self-hosting, giving users complete privacy and control over their data. All images are stored locally, and the single-user design eliminates authentication complexity while maintaining a smooth user experience.

## Core Problem Statement

People with ADHD face unique challenges with wardrobe management:
- **Forgetting items exist**: Out of sight, out of mind
- **Decision paralysis**: Too many choices overwhelm
- **Time blindness**: Getting dressed takes longer than expected
- **Laundry chaos**: Tracking what's clean vs. dirty is difficult
- **Organization fatigue**: Complex systems are abandoned quickly
- **Mismatched pieces**: Hard to remember what works together

## Solution Approach

### ADHD-Optimized Design Principles

1. **Minimal Friction**: Auto-save everything, no forced completion of forms, minimal steps to add items
2. **Decision Paralysis Reducers**: Limited choices (3-5 max), "Panic Pick" for instant decisions, guided workflows
3. **Visual Clarity**: High contrast, obvious calls-to-action, consistent UI patterns
4. **Time Blindness Support**: Show time estimates (~30 seconds), progress indicators, clear status visibility
5. **Cognitive Load Reduction**: One thing at a time, category-first navigation, chunked information
6. **Memory Support**: Recent items prominently displayed, prominent search, breadcrumbs, state preservation
7. **Immediate Feedback**: Instant responses (<100ms), success confirmation, optimistic UI updates
8. **Progressive Disclosure**: Hide advanced options, show complexity only when needed

### Key Features

#### Photo-Based Inventory Management
- Add items via camera or gallery in ~30 seconds
- Multiple photo types: front, back, details, label photos
- Side-by-side display for front and back views
- Progressive disclosure: start with one photo, add more later

#### AI-Powered Enhancement
- **Catalog Image Generation**: Transform casual photos into professional catalog images
- **Smart Categorization**: Automatic detection of category, colors, patterns, and attributes
- **Label Extraction**: OCR from label photos for brand, size, and materials
- **Confidence Scores**: Review AI suggestions before accepting

#### Outfit Generation
- **Panic Pick**: Instant outfit when you need to leave NOW
- **Constraint-Based**: Filter by weather, mood, time available, occasion
- **Fit & Proportion Guide**: Built-in styling guide
- **Ranked Results**: Get 3 outfit options, rate them to improve future suggestions

#### Desktop Power Tools
- Bulk editing for multiple items
- Advanced filtering and search
- Keyboard shortcuts for efficiency
- Table view with sortable columns
- Drag & drop outfit building (planned)

#### Mobile-First Experience
- Category-based navigation optimized for mobile
- Touch-friendly 48x48dp minimum targets
- Responsive breakpoint at 1024px
- Progressive Web App (PWA) support
- Native iOS and Android apps via Capacitor

#### Data Management
- Export/import via ZIP files
- All images stored locally (no CDN dependency)
- Full data backup capability
- Import supports merge or replace modes

## Project Status

### Current Phase: Phase 4-5 (Active Development)

✅ **Completed Phases**:
- Phase 0: Project setup (Next.js, Prisma, Docker, BullMQ)
- Phase 1: Core data models and CRUD operations
- Phase 2: Mobile-first UI with category navigation
- Phase 3: AI jobs (catalog generation, item inference)

🚧 **In Progress**:
- Phase 4: Desktop power tools (bulk edit, advanced filters)
- Phase 5: Outfit generation and management

⏳ **Planned**:
- Phase 6: 3D closet rail visualization (Three.js)
- Phase 7: Export/import functionality
- Phase 8: Polish and hardening

## Technical Highlights

### Modern Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript 5.9
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL 16 with Prisma ORM 7.3
- **Queue System**: BullMQ 5.x + Redis 7+ for async AI processing
- **AI Provider**: OpenRouter API (Gemini models)
- **3D Graphics**: Three.js, @react-three/fiber for closet visualization
- **Styling**: Tailwind CSS 4 with Material Design 3
- **Runtime**: Bun.js 1.3+ with npm fallback

### Architecture Approach
- Single-user, self-hosted design
- API-first communication
- Background job processing for AI operations
- Local file storage for images
- Responsive mobile-first design
- PWA with offline capabilities
- Optional native mobile apps

### Code Statistics
- **Total Lines of Code**: ~17,446 lines
- **Primary Language**: TypeScript (95%)
- **API Endpoints**: 25 REST endpoints
- **Database Tables**: 11 models with comprehensive relationships
- **React Components**: Modular, reusable architecture

## Project Goals vs. Non-Goals

### Goals (v1)
✅ Single-user self-hosted wardrobe organizer  
✅ AI-powered catalog image generation  
✅ Smart categorization and attribute inference  
✅ ADHD-optimized UX patterns  
✅ Desktop power tools for bulk operations  
✅ Three.js closet rail visualization  
✅ Export/import via ZIP backups  
✅ PWA and native mobile app support

### Explicit Non-Goals (v1)
❌ Multi-user authentication/accounts  
❌ Social sharing features  
❌ Full cloth simulation in 3D  
❌ Sensory tolerance tracking  
❌ Embedding-based similarity search (maybe v2)  
❌ Cloud storage or CDN integration  
❌ Transparent background cutouts on images

## Design Philosophy

### Material Design 3 Expressive
- Dynamic color system with surface tinting
- Rounded, expressive shapes (16-28px border radius)
- Material You typography with clear hierarchy
- Smooth transitions (200-300ms timing)
- Touch-friendly accessibility

### ADHD-First UX Patterns
Every design decision is evaluated against these questions:
1. Does this reduce cognitive load?
2. Can a user complete this while distracted?
3. Is the next step obvious?
4. Can they easily undo a mistake?
5. Does it work in a low-focus state?

## Community and Contribution

The project welcomes contributions that align with the ADHD-first philosophy. All UI changes must prioritize reducing cognitive load and minimizing friction. The codebase follows strict TypeScript standards, Material Design 3 guidelines, and clear documentation practices.

Contributors should understand that this is not a generic wardrobe app—it's specifically designed to address neurodivergent needs, and that focus must remain central to any changes.

## Documentation

Comprehensive documentation is available:
- **GitHub Pages**: https://shelbeely.github.io/ADHD-Closet/
- **GitHub Wiki**: Quick reference
- **In-repo docs**: `/docs` directory with detailed guides
- **API Documentation**: Full OpenAPI-style reference
- **Architecture Diagrams**: System design and data flow

## Success Metrics

Success is measured by how well the app serves its ADHD user base:
- Time to add an item: Target ~30 seconds
- Decision time for outfit: "Panic Pick" < 5 seconds
- User retention: Do users keep using it beyond setup?
- Cognitive load: Can users complete tasks while distracted?
- Friction points: Where do users abandon flows?

The focus is on user experience quality over growth metrics, consistent with the single-user, self-hosted philosophy.
