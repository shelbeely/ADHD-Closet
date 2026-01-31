# Frequently Asked Questions (FAQ)

Common questions about Wardrobe AI Closet.

## General Questions

### What is Wardrobe AI Closet?
A self-hosted, single-user wardrobe organizer powered by AI. It helps you catalog your clothes, generate outfit suggestions, and reduce decision paralysis. Built with ADHD users in mind.

### Who is this for?
Anyone who:
- Has too many clothes and forgets what they own
- Struggles with outfit decisions (decision paralysis)
- Wants to organize their wardrobe digitally
- Prefers self-hosted, privacy-first apps
- Has ADHD or similar executive function challenges

### Why self-hosted?
- **Privacy**: Your wardrobe data stays on your device
- **Control**: You own your data, no subscriptions or account lockouts
- **Customization**: Modify the app to suit your needs
- **Cost**: Only pay for AI usage, no monthly fees

### Is this free?
- **The app**: Yes, 100% open source and free
- **AI features**: Requires OpenRouter API (pay-per-use, ~$0.01-0.10 per request)
- **Hosting**: Free (localhost) or $5-20/month for VPS

---

## Feature Questions

### What can the AI do?
1. **Generate catalog images**: Clean, professional-looking photos from your casual pics
2. **Infer metadata**: Automatically detect category, colors, and attributes
3. **Extract labels**: Read brand, size, and material info from label photos
4. **Suggest outfits**: Generate 1-5 outfit combinations based on weather, vibe, occasion

### Can I use it without AI?
Yes! AI features are optional. You can:
- Upload photos without AI processing
- Manually enter all item details
- Skip outfit generation and plan outfits yourself

You'll miss out on time-saving automation, but the app is fully functional without AI.

### Does it track what I wear?
Not automatically in v1. You can manually rate outfits (👍/👎/😐) after wearing them, which influences future suggestions.

### Can I add items without photos?
No, photos are required. The app is built around visual organization since that's more effective for ADHD users.

### How many items can I store?
Tested with 10,000+ items. Limits depend on:
- **Storage space**: ~5-10MB per item (images)
- **Database size**: Minimal (metadata is small)

### Can I organize items into collections?
Not custom collections in v1. You can:
- Filter by **category** (tops, bottoms, dresses, etc.)
- Filter by **state** (available, laundry, donate)
- Filter by **tags** (your custom tags like "goth", "comfy", "work")

### Does it work offline?
The app works offline for browsing and manual edits. AI features require internet (calls OpenRouter API).

### Can multiple people use one installation?
It's designed as single-user. For multiple users:
- Run separate instances (different ports/domains)
- Or fork the repo and add multi-user auth (see CONTRIBUTING.md)

---

## Technical Questions

### What platforms does it run on?
- **Development**: macOS, Linux, Windows (via WSL)
- **Production**: Any server running Node.js/Bun, PostgreSQL, and Redis
  - Linux VPS (Ubuntu/Debian)
  - Docker containers
  - Cloud platforms (Vercel, Railway, Fly.io)

### What are the system requirements?
**Minimum**:
- 2GB RAM
- 10GB disk space (for ~500 items with images)
- Node.js 20+ or Bun 1.0+
- PostgreSQL 14+
- Redis 7+

**Recommended**:
- 4GB RAM
- 50GB+ disk space
- SSD for faster image loading

### Do I need to know how to code?
Not for basic usage. You'll need command-line skills for:
- Installation (copy/paste commands from docs)
- Updates (git pull, restart service)
- Backups (export feature is click-based)

For customization: Basic TypeScript/React knowledge helpful.

### Can I run this on a Raspberry Pi?
Yes, but:
- Use Raspberry Pi 4 with 4GB+ RAM
- Expect slower AI job processing
- Use external SSD for image storage (not SD card)
- May need to reduce AI concurrency to 1

### Does it work on mobile?
Yes! The web interface is fully responsive:
- **Mobile (<1024px)**: Optimized for touch, simplified UI
- **Desktop (≥1024px)**: Advanced features, bulk editing

There's no native iOS/Android app, but you can "Add to Home Screen" for app-like experience.

---

## Deployment Questions

### How do I install it?
See [DEPLOYMENT.md](../deployment/DEPLOYMENT.md) for full guides:
- **Easiest**: Docker (one command)
- **Most control**: VPS (step-by-step)
- **Fastest**: Vercel/Railway (click deploy)

### Can I access it from anywhere?
Yes, if you:
1. Deploy to a VPS with public IP
2. Setup domain name (optional but recommended)
3. Enable HTTPS (certbot, Let's Encrypt, or Cloudflare)
4. **Secure it**: Add authentication (not built-in!)

**Warning**: Default installation has NO authentication. Don't expose to internet without protection.

### How do I update to the latest version?
```bash
# Docker
git pull
docker-compose up -d --build

# VPS
git pull
cd app
bun install
bun run build
sudo systemctl restart wardrobe
```

### How do I backup my data?
Three methods:
1. **App export**: Settings → Export Wardrobe (downloads ZIP)
2. **Database backup**: `pg_dump` your PostgreSQL database
3. **File backup**: Copy `DATA_DIR/images` directory

Recommended: Use all three, scheduled weekly.

### What if I lose my data?
Restore from backup:
1. Settings → Import Wardrobe → Upload ZIP
2. Choose "Replace" mode to restore fully
3. Or "Merge" mode to add to existing data

---

## Cost Questions

### How much does AI cost?
Depends on usage:

**Typical costs per item**:
- Generate catalog image: $0.02-0.10
- Infer metadata: $0.01-0.03
- Extract label: $0.01-0.02
- Generate outfit: $0.01-0.03

**Example monthly costs**:
- Add 10 items/month: ~$0.50-2.00
- Generate 20 outfits/month: ~$0.50
- **Total**: ~$1-3/month for active use

**Cost control**:
- Use AI selectively (skip catalog generation for simple items)
- Batch process items when you have free credits
- Manual entry costs $0

### Which AI models should I use?
**Recommended** (balance of quality and cost):
- Image generation: `openai/dall-e-3` or `stability-ai/stable-diffusion-xl`
- Vision: `anthropic/claude-3-haiku` or `openai/gpt-4o-mini`
- Text: `anthropic/claude-3-haiku` or `openai/gpt-4o-mini`

**Budget** (cheapest):
- All: `anthropic/claude-3-haiku`

**Best Quality** (expensive):
- Image: `openai/dall-e-3`
- Vision: `anthropic/claude-3-opus` or `openai/gpt-4o`
- Text: `anthropic/claude-3-opus`

Configure in `.env` (see API_DOCUMENTATION.md).

### Can I use local AI instead of OpenRouter?
Not in v1. You'd need to:
1. Run local models (Ollama, LocalAI, etc.)
2. Modify `app/lib/ai/openrouter.ts` to use local endpoint
3. Test thoroughly (local models vary in quality)

Contributions welcome!

---

## Design & UX Questions

### Why is it designed this way?
Every design decision prioritizes ADHD users:
- **One action per screen**: Reduce overwhelm
- **Auto-save**: No "Did I save?" anxiety
- **Progressive disclosure**: Hide complexity until needed
- **Panic pick**: Emergency decision-making
- **Limited choices**: 3-5 options max to avoid paralysis

See [SPEC.md](../developer/SPEC.md) section 7.1 for detailed UX rules.

### Can I change the colors/theme?
Yes! Modify `app/app/globals.css` color tokens:
```css
:root {
  --md-sys-color-primary: #6750A4;  /* Change to your color */
  /* ... */
}
```

Dark mode is built-in (Settings → Dark Mode).

### Can I add more categories?
Yes, but requires code changes:
1. Edit `app/prisma/schema.prisma` (add to `Category` enum)
2. Run `bunx prisma migrate dev`
3. Update `CATEGORIES` array in components

### Why no drag-and-drop outfit builder?
It's on the roadmap! Desktop power tools (≥1024px) will include:
- Drag-and-drop outfit builder
- Side-by-side item comparison
- Advanced filtering

### Can I hide certain features?
Not yet. Future: Settings to disable features you don't use.

---

## Troubleshooting Questions

### The AI isn't working. What do I check?
1. OpenRouter API key valid? (https://openrouter.ai/keys)
2. Sufficient credits? (https://openrouter.ai/account)
3. Redis running? (`redis-cli ping`)
4. Check AI job status in item detail page
5. See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### Images aren't loading. Why?
Common causes:
1. File permissions (app can't read image directory)
2. Wrong `DATA_DIR` in `.env`
3. Disk full
4. Corrupt image file

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) → "Image Upload Failures"

### The app is slow. How do I fix it?
1. Check available RAM: `free -h`
2. Check disk I/O: `iostat`
3. Optimize images (see TROUBLESHOOTING.md)
4. Increase PostgreSQL shared_buffers
5. Use SSD instead of HDD

### How do I reset everything?
**CAUTION: Deletes all data!**
```bash
# Stop app
sudo systemctl stop wardrobe

# Drop and recreate database
sudo -u postgres psql
DROP DATABASE wardrobe;
CREATE DATABASE wardrobe OWNER wardrobe;
\q

# Clear Redis
redis-cli FLUSHALL

# Delete images
rm -rf /var/www/wardrobe/data/images/*

# Reinitialize
cd /var/www/wardrobe/app
bunx prisma migrate deploy
sudo systemctl start wardrobe
```

---

## Privacy & Security Questions

### Is my data private?
Yes! Everything stays on your server:
- Images stored locally (never uploaded to cloud)
- Database on your server
- Only AI requests send data to OpenRouter (and only when you trigger AI features)

### What data does OpenRouter see?
Only when you use AI features:
- Image files (for image generation and inference)
- Text prompts (for outfit generation)
- Never your entire database

OpenRouter privacy: https://openrouter.ai/privacy

### Should I password-protect it?
**YES** if accessible from internet. Options:
1. **Nginx basic auth** (simplest)
2. **Tailscale/ZeroTier** (VPN, most secure)
3. **Cloudflare Access** (SSO)
4. **Custom auth** (add to app, see CONTRIBUTING.md)

### Can I use this for commercial purposes?
The app is open source (MIT license). You can:
- Use for business/commercial purposes
- Modify and distribute
- Sell services based on it

But you must:
- Keep the MIT license notice
- Respect OpenRouter's terms of service (for AI)

---

## Contributing Questions

### How can I contribute?
See [CONTRIBUTING.md](../../CONTRIBUTING.md) for:
- Code standards
- PR process
- Design system rules
- Areas needing help

### I found a bug. What do I do?
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Search existing GitHub issues
3. Open a new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if UI bug)
   - Environment (OS, Node version, etc.)

### I have a feature idea!
Open a GitHub Discussion or Issue:
- Describe the feature
- Explain the use case
- Why it helps ADHD users (if applicable)
- Mock-ups or examples (optional)

### Can I translate the app?
Not yet internationalized. If you want to add i18n:
1. Open a discussion to coordinate
2. Use next-intl or react-i18next
3. Follow Material Design 3 localization guidelines

---

## Roadmap Questions

### What features are planned?
**High Priority**:
- Wear tracking (mark when worn)
- Smart notifications (laundry reminders, outfit suggestions)
- Outfit calendar (plan outfits for the week)
- Better 3D closet rail

**Medium Priority**:
- Virtual try-on (AI overlay items on body photo)
- Clothing care tracking (wash cycles, repairs)
- Size tracking (weight changes affecting fit)
- Multi-photo comparison

**Low Priority** (or community-driven):
- Multi-user support
- Social sharing
- Embroidery/alterations log
- Clothing cost tracking

### When is v2.0 coming?
No timeline. This is a passion project. Contributions welcome to accelerate development!

### Will there be a mobile app?
Not planned. The web interface is fully responsive and works great as a PWA (Add to Home Screen).

Native apps require:
- React Native rewrite (duplicate effort)
- App Store fees ($99/year iOS, $25 one-time Android)
- Separate maintenance burden

---

## Still Have Questions?

- **Technical issues**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Setup help**: See [DEPLOYMENT.md](../deployment/DEPLOYMENT.md)
- **Architecture questions**: See [ARCHITECTURE.md](../developer/ARCHITECTURE.md)
- **API questions**: See [API_DOCUMENTATION.md](../api/API_DOCUMENTATION.md)
- **Everything else**: Open a GitHub Discussion

Happy organizing! 👗👔🧥
