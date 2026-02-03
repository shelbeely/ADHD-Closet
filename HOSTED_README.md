# Twin Style - Hosted Version Quick Start

This guide helps you deploy the hosted, multi-user version of Twin Style with freemium and ad-supported options.

## Deployment Modes

Twin Style now supports three deployment modes:

| Mode | Auth | Users | Limits | Ads | Cost |
|------|------|-------|--------|-----|------|
| **Self-Hosted** (default) | No | Single | None | No | Free |
| **Hosted Free** | Yes | Multi | 50 items, 20 outfits | No | Free |
| **Hosted Ad-Supported** | Yes | Multi | Unlimited | Yes | Free |
| **Hosted Premium** | Yes | Multi | Unlimited | No | $5/mo |

## Quick Setup

### 1. Choose Your Mode

**Self-Hosted (Default - No Changes):**
```bash
# .env
DEPLOYMENT_MODE="self_hosted"
```

**Hosted Mode:**
```bash
# .env
DEPLOYMENT_MODE="hosted"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://your-domain.com"

# Enable features
ANALYTICS_ENABLED="true"
SUBSCRIPTION_ENABLED="true"
ENABLE_USER_REGISTRATION="true"
```

### 2. Run Database Migrations

```bash
cd app
npx prisma migrate dev --name add_multi_user_support
npx prisma generate
```

### 3. Start the App

```bash
npm run dev
```

## What's New

### For Users

**Free Tier:**
- Up to 50 items
- Up to 20 outfits
- 10 AI generations per month
- No ads
- Full privacy control

**Ad-Supported Tier:**
- Unlimited items
- Unlimited outfits
- 100 AI generations per month
- Shows ads
- Still privacy-first

**Premium Tier ($5/mo):**
- Unlimited everything
- No ads
- Priority support
- All features unlocked

### For Developers

**New APIs:**
- `/api/auth/*` - Authentication (NextAuth.js)
- `/api/analytics/track` - Event tracking
- `/api/subscription` - Subscription management

**New Libraries:**
- `app/lib/config.ts` - Feature flags
- `app/lib/analytics.ts` - Privacy-preserving tracking
- `app/lib/subscription.ts` - Tier management
- `app/lib/auth.ts` - NextAuth configuration

**New Components:**
- `<AdPlacement />` - Ad integration
- `<TierCard />` - Subscription tiers
- `<PrivacySettings />` - User privacy controls

## Configuration

### Authentication

Twin Style uses NextAuth.js for authentication. Configure OAuth providers:

```bash
# .env
GOOGLE_CLIENT_ID="your-google-id"
GOOGLE_CLIENT_SECRET="your-google-secret"
GITHUB_CLIENT_ID="your-github-id"
GITHUB_CLIENT_SECRET="your-github-secret"
```

Uncomment providers in `app/lib/auth.ts`.

### Stripe (Premium Subscriptions)

```bash
# .env
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Create products in Stripe Dashboard and update pricing in code.

### Ad Network

```bash
# .env
AD_NETWORK_ENABLED="true"
AD_NETWORK_ID="your-network-id"
```

Update `AdPlacement.tsx` with your ad network code (Google AdSense, Carbon Ads, etc.).

## Privacy First

Twin Style is built with privacy as a priority:

- ✅ **Opt-in by default** - Analytics OFF by default
- ✅ **Anonymized data** - IP hashing, PII removal
- ✅ **User control** - Granular privacy settings
- ✅ **GDPR compliant** - Data export, deletion, transparency
- ✅ **Never collect** - Photos, dysphoria preferences, mental health data

## Testing

### Self-Hosted Mode
```bash
DEPLOYMENT_MODE="self_hosted" npm run dev
# Should work exactly as before - no auth, no limits
```

### Hosted Mode
```bash
DEPLOYMENT_MODE="hosted" npm run dev
# Visit /auth/signin to create account
# Test subscription tiers
# Verify analytics respect opt-in
```

## Documentation

- **[Full Implementation Guide](./docs/developer/HOSTED_VERSION_GUIDE.md)** - Complete technical documentation
- **[Analytics Research](./docs/developer/MULTI_USER_ANALYTICS.md)** - Data collection strategy
- **[Analytics Examples](./docs/developer/ANALYTICS_EXAMPLES.md)** - SQL queries and use cases

## Support

- **Self-hosted users**: No changes required, everything works as before
- **Hosted version**: See [HOSTED_VERSION_GUIDE.md](./docs/developer/HOSTED_VERSION_GUIDE.md)
- **Questions**: Open a GitHub issue

## Migration Path

**From Self-Hosted to Hosted:**
1. Export your data from self-hosted instance
2. Create account on hosted platform
3. Import your data
4. Choose your tier
5. Set privacy preferences

**From Hosted to Self-Hosted:**
1. Export your data
2. Deploy self-hosted instance
3. Import your data
4. Disable hosted features in `.env`

## License

MIT License - See LICENSE file.

---

**Built for the neurodivergent community, by the community.**

*Twin Style respects your data and your privacy. Self-hosted mode will always be free and fully featured.*
