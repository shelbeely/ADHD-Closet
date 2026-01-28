# Wardrobe AI Closet

A single-user, self-hosted wardrobe organizer powered by AI. Capture clothing items via photos, generate AI-enhanced catalog images, and get intelligent outfit suggestions optimized for ADHD-friendly workflows.

## Features

- **📸 Photo-based Item Management**: Add items via camera/gallery with minimal friction
- **🤖 AI-Powered Catalog Images**: Generate clean, centered, professional-looking images from real photos
- **🏷️ Smart Categorization**: AI infers categories, colors, patterns, and attributes
- **👗 Outfit Generation**: Get ranked outfit suggestions based on weather, mood, and constraints
- **📊 Desktop Power Tools**: Bulk edit, keyboard shortcuts, drag/drop outfit builder
- **🎨 3D Closet Rail**: Browse your wardrobe in an interactive Three.js visualization
- **💾 Export/Import**: Full data backup via ZIP (includes all images and metadata)
- **🧠 ADHD-Optimized**: Category-first navigation, decision paralysis reducers, progressive disclosure

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **3D**: Three.js, @react-three/fiber, @react-three/drei
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Prisma ORM)
- **Jobs**: BullMQ + Redis for background AI processing
- **AI**: OpenRouter (Vision + Text + Image generation)
- **Image Processing**: Sharp for thumbnails and optimization
- **Runtime**: Bun.js (with npm fallback for CI)

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.0.0 (recommended) or Node.js ≥ 20
- Docker & Docker Compose (for Postgres + Redis)
- OpenRouter API key ([get one here](https://openrouter.ai/))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shelbeely/ADHD-Closet.git
   cd ADHD-Closet/app
   ```

2. **Install dependencies**:
   ```bash
   # With Bun (recommended)
   bun install
   
   # Or with npm
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENROUTER_API_KEY
   ```

4. **Start database services**:
   ```bash
   cd ..
   docker-compose up -d postgres redis
   ```

5. **Run database migrations**:
   ```bash
   cd app
   npx prisma migrate dev
   ```

6. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

7. **Start the development server**:
   ```bash
   # With Bun
   bun dev
   
   # Or with npm
   npm run dev
   ```

8. **Open in browser**: [http://localhost:3000](http://localhost:3000)

## Development

### Available Scripts

- `dev` - Start development server
- `build` - Build for production
- `start` - Start production server
- `lint` - Run ESLint
- `prisma:generate` - Generate Prisma Client
- `prisma:migrate` - Run database migrations
- `prisma:studio` - Open Prisma Studio (database GUI)

### Database Management

#### View/Edit Database
```bash
npm run prisma:studio
```

#### Create Migration
```bash
npx prisma migrate dev --name your_migration_name
```

#### Reset Database
```bash
npx prisma migrate reset
```

### Optional Admin Tools

Start Redis Commander and pgAdmin for debugging:
```bash
cd ..
docker-compose --profile debug up -d
```

- **Redis Commander**: [http://localhost:8081](http://localhost:8081)
- **pgAdmin**: [http://localhost:5050](http://localhost:5050)
  - Email: admin@wardrobe.local
  - Password: admin

## Project Structure

```
app/
├── app/                # Next.js App Router
│   ├── api/           # API Routes
│   ├── (routes)/      # Page routes
│   ├── components/    # React components
│   └── lib/           # Utilities and shared logic
├── prisma/
│   └── schema.prisma  # Database schema
├── public/            # Static assets
└── data/              # Local file storage (created at runtime)
    ├── images/        # Original and AI-generated images
    └── thumbs/        # Thumbnails
```

## Environment Variables

See `.env.example` for all available configuration options.

### Required

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `OPENROUTER_API_KEY` - Your OpenRouter API key

### Optional

- `DATA_DIR` - Local storage directory (default: `./data`)
- `AI_ENABLED` - Enable/disable AI processing (default: `true`)
- `PUBLIC_BASE_URL` - Public URL for the app (default: `http://localhost:3000`)

## OpenRouter Models

Configure AI models in `.env`:

- `OPENROUTER_IMAGE_MODEL` - For catalog image generation and outfit visualization (default: `google/gemini-3-pro-image-preview`)
- `OPENROUTER_VISION_MODEL` - For item inference and OCR (e.g., Claude 3.5 Sonnet)
- `OPENROUTER_TEXT_MODEL` - For outfit generation (e.g., Claude 3.5 Sonnet)

**Recommended Image Model**: Nano Banana Pro (`google/gemini-3-pro-image-preview`) offers the best multi-image consistency for outfit visualizations.

See [OpenRouter Models](https://openrouter.ai/models) for available options and pricing.

## Deployment

### Production Build

```bash
bun run build
bun start
```

### Docker Deployment

Full Docker deployment coming soon. For now, use docker-compose for Postgres/Redis and deploy the Next.js app separately.

### Environment Considerations

- Ensure `DATA_DIR` is persisted (use volumes or shared storage)
- Set `NODE_ENV=production`
- Use a strong `POSTGRES_PASSWORD`
- Consider using a managed PostgreSQL and Redis service

## Troubleshooting

### Bun Issues

If Bun crashes in your environment (especially in VMs), see `BUN_SETUP.md` for workarounds. The project fully supports npm as a fallback.

### Database Connection

If migrations fail, ensure:
1. Docker containers are running: `docker ps`
2. PostgreSQL is accessible: `docker exec wardrobe-postgres pg_isready -U wardrobe`
3. DATABASE_URL matches your docker-compose settings

### AI Jobs Not Processing

1. Check Redis is running: `docker exec wardrobe-redis redis-cli ping`
2. Verify OPENROUTER_API_KEY is set in `.env`
3. Check BullMQ worker logs (implementation coming in Phase 3)

## License

[MIT](../LICENSE) (if applicable - add your license)

## Contributing

This is a single-user project, but contributions are welcome! Please open an issue first to discuss proposed changes.

## Documentation

- [Full Specification](../SPEC.md)
- [API Contract](../API_CONTRACT.md)
- [Task Board](../TASK_BOARD.md)
- [Definition of Done](../DEFINITION_OF_DONE.md)
- [Bun Setup Guide](./BUN_SETUP.md)

