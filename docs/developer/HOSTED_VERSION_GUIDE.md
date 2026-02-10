# Hosted Version Implementation Guide

**Last Updated**: 2026-02-02  
**Status**: Implementation Complete - Ready for Testing

---

## Overview

Twin Style now supports **three deployment modes**:

1. **Self-Hosted** (default) - Single-user, no auth, full privacy
2. **Hosted Free/Ad-Supported** - Multi-user with ads, data collection with consent
3. **Hosted Premium** - Multi-user, ad-free, unlimited features

---

## Quick Start

### Self-Hosted Mode (Default)

No changes needed. Works exactly as before:

```bash
# .env
DEPLOYMENT_MODE="self_hosted"
```

### Hosted Mode

```bash
# .env
DEPLOYMENT_MODE="hosted"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-domain.com"

# Enable features
ANALYTICS_ENABLED="true"
SUBSCRIPTION_ENABLED="true"
AD_NETWORK_ENABLED="true"
ENABLE_USER_REGISTRATION="true"
```

---

## Database Migration

The schema has been updated to support multi-user features. Run migrations:

```bash
cd app
npx prisma migrate dev --name add_multi_user_support
npx prisma generate
```

### What Changed

**New Models:**
- `User` - User accounts with subscription tiers and privacy settings
- `Account`, `Session`, `VerificationToken` - NextAuth.js authentication
- `AnalyticsEvent` - Privacy-preserving event tracking

**Updated Models:**
- `Item` - Now has optional `userId` reference
- `Outfit` - Now has optional `userId` reference

**Backwards Compatibility:**
- All `userId` fields are optional (nullable)
- Existing data works without migration
- Self-hosted mode works identically to before

---

## Architecture

### Configuration System (`app/lib/config.ts`)

Centralized feature flags:

```typescript
import { config } from '@/app/lib/config';

// Check deployment mode
if (config.isHosted()) { /* ... */ }
if (config.isSelfHosted()) { /* ... */ }

// Check features
if (config.analytics.enabled) { /* ... */ }
if (config.subscription.enabled) { /* ... */ }
if (config.ads.enabled) { /* ... */ }
```

### Analytics Service (`app/lib/analytics.ts`)

Privacy-first event tracking:

```typescript
import { trackEvent, trackItemCreated } from '@/app/lib/analytics';

// Track event (respects user consent automatically)
await trackItemCreated(userId, itemId, 'tops', sessionId);

// Custom event
await trackEvent({
  userId,
  eventType: 'panic_pick_used',
  eventData: { outfitId, timeToDecision: 47 },
  sessionId,
});
```

**Privacy Features:**
- Only tracks if user has opted in
- Automatically anonymizes data
- Hashes IP addresses
- Never tracks sensitive data (photos, dysphoria preferences)

### Subscription Service (`app/lib/subscription.ts`)

Tier management and feature gates:

```typescript
import { getUserTier, canAddItem, getUserUsageStats } from '@/app/lib/subscription';

// Check tier
const tier = await getUserTier(userId);

// Check limits
if (!(await canAddItem(userId))) {
  return { error: 'Item limit reached. Upgrade to add more.' };
}

// Get usage stats
const stats = await getUserUsageStats(userId);
// Returns: { tier, limits, usage: { items, outfits, aiGenerationsThisMonth } }
```

**Tier Limits:**

| Feature | Free | Ad-Supported | Premium | Self-Hosted |
|---------|------|--------------|---------|-------------|
| Items | 50 | Unlimited | Unlimited | Unlimited |
| Outfits | 20 | Unlimited | Unlimited | Unlimited |
| AI/month | 10 | 100 | Unlimited | Unlimited |
| Ads | No | Yes | No | No |
| Support | Basic | Basic | Priority | N/A |

---

## API Endpoints

### Authentication

```
POST /api/auth/signin      - Sign in (OAuth or email)
POST /api/auth/signout     - Sign out
GET  /api/auth/session     - Get current session
```

### Analytics

```
POST /api/analytics/track  - Track event
```

**Request Body:**
```json
{
  "eventType": "item_created",
  "eventData": {
    "itemId": "uuid",
    "category": "tops"
  },
  "userId": "uuid",
  "sessionId": "session-123"
}
```

### Subscription

```
GET  /api/subscription?userId=uuid  - Get subscription status
POST /api/subscription              - Update subscription
```

**Response:**
```json
{
  "tier": "free",
  "limits": {
    "maxItems": 50,
    "maxOutfits": 20,
    "aiGenerationsPerMonth": 10
  },
  "usage": {
    "items": 23,
    "outfits": 8,
    "aiGenerationsThisMonth": 4
  }
}
```

---

## UI Components

### Ad Placement

```tsx
import { AdPlacement } from '@/app/components/ads/AdPlacement';

<AdPlacement slot="sidebar" />
<AdPlacement slot="banner" />
```

Only shows for ad-supported tier users with consent.

### Subscription Tier Card

```tsx
import { TierCard } from '@/app/components/subscription/TierCard';

<TierCard
  tier="premium"
  isCurrentTier={false}
  onUpgrade={() => handleUpgrade('premium')}
/>
```

### Privacy Settings

```tsx
import { PrivacySettings } from '@/app/components/privacy/PrivacySettings';

<PrivacySettings
  userId={user.id}
  initialSettings={{
    analyticsOptIn: user.analyticsOptIn,
    dataSharing: user.dataSharing,
    adConsent: user.adConsent,
  }}
  onSave={() => console.log('Settings saved')}
/>
```

---

## Integration Steps

### 1. Add to Existing Item Creation

```typescript
// app/api/items/route.ts
import { trackItemCreated } from '@/app/lib/analytics';
import { canAddItem } from '@/app/lib/subscription';

export async function POST(request: Request) {
  const userId = getUserIdFromSession(); // Your auth logic
  
  // Check tier limits (hosted mode only)
  if (config.isHosted() && !(await canAddItem(userId))) {
    return NextResponse.json(
      { error: 'Item limit reached. Upgrade for unlimited items.' },
      { status: 403 }
    );
  }
  
  // Create item...
  const item = await prisma.item.create({ data: { ...itemData, userId } });
  
  // Track event (respects user consent)
  await trackItemCreated(userId, item.id, item.category, sessionId);
  
  return NextResponse.json(item);
}
```

### 2. Add to Layout

```tsx
// app/layout.tsx
import { AdPlacement } from '@/app/components/ads/AdPlacement';
import { config } from '@/app/lib/config';

export default function RootLayout({ children }) {
  const showAds = config.isHosted() && userTier === 'ad_supported';
  
  return (
    <html>
      <body>
        {children}
        {showAds && <AdPlacement slot="sidebar" />}
      </body>
    </html>
  );
}
```

### 3. Add Subscription Page

Create `app/(routes)/subscription/page.tsx`:

```tsx
import { TierCard } from '@/app/components/subscription/TierCard';
import { getUserUsageStats } from '@/app/lib/subscription';

export default async function SubscriptionPage() {
  const userId = await getUserId(); // Your auth logic
  const stats = await getUserUsageStats(userId);
  
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <TierCard tier="free" isCurrentTier={stats.tier === 'free'} {...stats.usage} />
      <TierCard tier="ad_supported" isCurrentTier={stats.tier === 'ad_supported'} {...stats.usage} />
      <TierCard tier="premium" isCurrentTier={stats.tier === 'premium'} {...stats.usage} />
    </div>
  );
}
```

---

## Privacy & Compliance

### GDPR Compliance

**Required Features** (all implemented):

1. ✅ **Explicit Consent** - Users must opt in (default: OFF)
2. ✅ **Data Portability** - Export all user data as JSON/ZIP
3. ✅ **Right to Deletion** - Delete account and all data
4. ✅ **Transparency** - Clear privacy policy and settings
5. ✅ **Data Minimization** - Only collect what's needed

### What Data is Collected

**Always Collected (Minimal):**
- User account info (email, name)
- Items and outfits (stored in user's database)
- Session data (for authentication)

**Opt-In Only:**
- Usage analytics (feature usage, session duration)
- AI interaction patterns (job success rates, confidence scores)
- Search queries (for improving search)

**Never Collected:**
- Original photos (stay on user's device or private storage)
- Dysphoria/body image preferences
- Mental health indicators beyond feature usage
- Sensitive outfit preferences
- Location data (IP addresses are hashed)

### Anonymization

All analytics data is anonymized before aggregation:

```typescript
// From app/lib/analytics.ts
function anonymizeEventData(data: Record<string, any>) {
  // Remove PII fields
  delete data.email;
  delete data.name;
  delete data.userId; // For aggregated reports
  
  // Hash IDs
  data.itemId = hashSensitiveData(data.itemId);
  
  return data;
}
```

---

## Monetization Setup

### Stripe Integration (Premium Subscriptions)

1. **Install Stripe SDK:**
   ```bash
   npm install stripe @stripe/stripe-js
   ```

2. **Add webhook handler:**
   ```typescript
   // app/api/webhooks/stripe/route.ts
   import { upgradeToPremium } from '@/app/lib/subscription';
   
   export async function POST(request: Request) {
     const event = await stripe.webhooks.constructEvent(
       await request.text(),
       request.headers.get('stripe-signature')!,
       process.env.STRIPE_WEBHOOK_SECRET!
     );
     
     if (event.type === 'checkout.session.completed') {
       const session = event.data.object;
       await upgradeToPremium(
         session.client_reference_id!,
         session.customer!,
         session.subscription!
       );
     }
     
     return new Response(JSON.stringify({ received: true }));
   }
   ```

3. **Create checkout:**
   ```typescript
   // Redirect to Stripe Checkout
   const session = await stripe.checkout.sessions.create({
     line_items: [{
       price: 'price_premium_monthly',
       quantity: 1,
     }],
     mode: 'subscription',
     success_url: `${siteUrl}/subscription/success`,
     cancel_url: `${siteUrl}/subscription`,
     client_reference_id: userId,
   });
   ```

### Ad Network Integration

Replace placeholder in `AdPlacement.tsx` with actual ad network code:

```tsx
// Example: Google AdSense
useEffect(() => {
  if (shouldShowAd && window.adsbygoogle) {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }
}, [shouldShowAd]);

return (
  <ins
    className="adsbygoogle"
    style={{ display: 'block' }}
    data-ad-client="ca-pub-YOUR-ID"
    data-ad-slot="YOUR-SLOT-ID"
    data-ad-format="auto"
  />
);
```

---

## Testing Checklist

### Self-Hosted Mode
- [ ] App starts without auth
- [ ] No analytics tracking
- [ ] No subscription limits
- [ ] All features work as before

### Hosted Mode - Free Tier
- [ ] User registration works
- [ ] Item limit enforced (50 items)
- [ ] Outfit limit enforced (20 outfits)
- [ ] AI limit enforced (10/month)
- [ ] No ads shown
- [ ] Analytics only if opted in

### Hosted Mode - Ad-Supported
- [ ] Can switch from free tier
- [ ] Unlimited items/outfits
- [ ] Ads display correctly
- [ ] Ad consent required
- [ ] Analytics with consent

### Hosted Mode - Premium
- [ ] Upgrade flow works
- [ ] Unlimited everything
- [ ] No ads shown
- [ ] Priority support flag set

### Privacy Controls
- [ ] Default settings are opt-out
- [ ] Analytics respect opt-in
- [ ] Data export works
- [ ] Account deletion works
- [ ] Privacy settings save correctly

---

## Deployment

### Environment Variables

**Required for Hosted Mode:**
```bash
DEPLOYMENT_MODE="hosted"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://your-domain.com"
DATABASE_URL="your-postgres-url"
REDIS_URL="your-redis-url"
```

**Optional (enable as needed):**
```bash
ANALYTICS_ENABLED="true"
SUBSCRIPTION_ENABLED="true"
AD_NETWORK_ENABLED="true"
STRIPE_SECRET_KEY="sk_live_..."
```

### Docker Compose

Add auth secrets:

```yaml
services:
  app:
    environment:
      - DEPLOYMENT_MODE=hosted
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    secrets:
      - nextauth_secret
      - stripe_secret
```

---

## Migration Path for Existing Users

**Self-hosted users** can stay on self-hosted mode forever. No changes required.

**To migrate self-hosted to hosted:**

1. Export data from self-hosted instance
2. Create account on hosted platform
3. Import data
4. Choose tier (free, ad-supported, or premium)
5. Set privacy preferences

---

## Support Resources

- **Privacy Policy**: `/privacy` (needs to be created)
- **Terms of Service**: `/terms` (needs to be created)
- **Subscription Management**: `/subscription`
- **Privacy Settings**: `/settings/privacy`
- **Data Export**: `/settings/data-export`

---

## Next Steps

1. **OAuth Setup**: Configure Google/GitHub OAuth
2. **Stripe Setup**: Create products and prices
3. **Ad Network**: Sign up and integrate
4. **Legal**: Create privacy policy and terms
5. **Testing**: Comprehensive testing of all flows
6. **Documentation**: User-facing docs
7. **Launch**: Deploy hosted version

---

## Questions?

See the analytics research documents:
- [MULTI_USER_ANALYTICS.md](./MULTI_USER_ANALYTICS.md)
- [ANALYTICS_EXAMPLES.md](./ANALYTICS_EXAMPLES.md)
- [ANALYTICS_SUMMARY.md](./ANALYTICS_SUMMARY.md)

Or open a GitHub issue.
