# Revenue Activation Guide

**Quick start guide for activating each revenue stream**

---

## 🚀 Quick Wins (Launch Week 1)

### 1. Activate Ad Revenue (2-3 hours)

**Step 1: Apply for Google AdSense**
1. Visit https://adsense.google.com
2. Sign up with Google account
3. Add site URL: `yourdomain.com`
4. Wait for approval (1-2 days typically)

**Step 2: Integrate Ad Code**
```typescript
// app/components/ads/AdPlacement.tsx

// Replace placeholder with:
useEffect(() => {
  if (shouldShowAd && window.adsbygoogle) {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Ad loading error:', err);
    }
  }
}, [shouldShowAd]);

return (
  <ins
    className="adsbygoogle"
    style={{ display: 'block' }}
    data-ad-client="ca-pub-YOUR-PUBLISHER-ID"
    data-ad-slot="YOUR-AD-SLOT-ID"
    data-ad-format="auto"
    data-full-width-responsive="true"
  />
);
```

**Step 3: Add AdSense Script to Layout**
```tsx
// app/layout.tsx
<head>
  <script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR-ID"
    crossOrigin="anonymous"
  />
</head>
```

**Step 4: Test**
```bash
DEPLOYMENT_MODE="hosted" AD_NETWORK_ENABLED="true" npm run dev
# Check ads appear for ad-supported tier users
```

**Expected Revenue**: $500-1,000/month with 1,000 users

---

### 2. Launch Premium Tier (4-6 hours)

**Step 1: Create Stripe Account**
1. Visit https://stripe.com
2. Sign up and complete verification
3. Get API keys from Dashboard

**Step 2: Create Products in Stripe**
```bash
# In Stripe Dashboard:
# Products → Create Product
# Name: "Twin Style Premium"
# Price: $5/month (recurring)
# Copy price ID
```

**Step 3: Configure Environment**
```bash
# .env
STRIPE_SECRET_KEY="sk_test_..." # Use live key in production
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
SUBSCRIPTION_ENABLED="true"
```

**Step 4: Create Checkout Flow UI**
```tsx
// app/(routes)/subscription/upgrade/page.tsx
'use client';

import { loadStripe } from '@stripe/stripe-js';

export default function UpgradePage() {
  const handleUpgrade = async () => {
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    
    const response = await fetch('/api/subscription/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: 'price_XXXXX', // Your Stripe price ID
        userId: session.user.id,
      }),
    });
    
    const { sessionId } = await response.json();
    stripe?.redirectToCheckout({ sessionId });
  };
  
  return (
    <button onClick={handleUpgrade}>
      Upgrade to Premium - $5/month
    </button>
  );
}
```

**Step 5: Add Webhook Handler**
```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/app/lib/stripe';
import { upgradeToPremium } from '@/app/lib/subscription';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await upgradeToPremium(
      session.client_reference_id!,
      session.customer as string,
      session.subscription as string
    );
  }
  
  return new Response(JSON.stringify({ received: true }));
}
```

**Expected Revenue**: $1,000-2,000/month with 10% conversion

---

## 📅 Month 2-3: Affiliate Revenue

### 3. Set Up Affiliate Links (6-8 hours)

**Step 1: Join Affiliate Networks**

**RewardStyle/LTK** (Best for fashion):
1. Apply at https://www.shopltk.com
2. Wait for approval
3. Get API keys

**Amazon Associates**:
1. Join at https://affiliate-program.amazon.com
2. Get tracking ID
3. Generate links

**Step 2: Build Gap Analysis Feature**
```typescript
// app/lib/wardrobe-analysis.ts
export async function analyzeWardrobeGaps(userId: string) {
  const items = await prisma.item.findMany({
    where: { userId },
    select: { category: true },
  });
  
  const counts = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const gaps = [];
  
  // Simple heuristic: tops vs bottoms ratio
  if (counts.tops > counts.bottoms * 3) {
    gaps.push({
      type: 'bottoms',
      reason: 'You have many tops but few bottoms',
      recommendations: ['jeans', 'pants', 'skirts'],
    });
  }
  
  return gaps;
}
```

**Step 3: Create Recommendations Page**
```tsx
// app/(routes)/recommendations/page.tsx
export default async function RecommendationsPage() {
  const gaps = await analyzeWardrobeGaps(userId);
  
  return (
    <div>
      <h1>Wardrobe Suggestions</h1>
      {gaps.map(gap => (
        <div key={gap.type}>
          <p>{gap.reason}</p>
          {gap.recommendations.map(item => (
            <a
              href={`https://www.amazon.com/s?k=${item}&tag=YOUR-AFFILIATE-ID`}
              target="_blank"
              rel="noopener sponsored"
            >
              Shop {item} →
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}
```

**Step 4: Add Disclosure**
```tsx
<p className="text-sm text-gray-500">
  We earn a commission if you purchase through these links (at no extra cost to you).
  This helps us keep Twin Style free!
</p>
```

**Expected Revenue**: $200-500/month initially

---

## 📊 Month 4-6: B2B Revenue

### 4. Launch Fashion Intelligence Reports (20+ hours)

**Step 1: Create Sample Report**
```typescript
// scripts/generate-trend-report.ts
import { prisma } from '@/app/lib/prisma';

async function generateTrendReport(startDate: Date, endDate: Date) {
  // Color trends
  const colorData = await prisma.$queryRaw`
    SELECT 
      jsonb_array_elements_text(color_palette) as color,
      COUNT(*) as frequency
    FROM items
    WHERE created_at BETWEEN ${startDate} AND ${endDate}
    GROUP BY color
    ORDER BY frequency DESC
    LIMIT 20
  `;
  
  // Brand performance
  const brandData = await prisma.item.groupBy({
    by: ['brand'],
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    _count: true,
    _avg: {
      currentWears: true,
    },
  });
  
  return {
    period: { start: startDate, end: endDate },
    colorTrends: colorData,
    brandPerformance: brandData,
    totalItems: await prisma.item.count(),
  };
}
```

**Step 2: Build Brand Portal Landing Page**
```tsx
// brand-portal/page.tsx (separate site or subdomain)
export default function BrandPortalPage() {
  return (
    <div>
      <h1>Twin Style Fashion Intelligence</h1>
      <p>Real-world fashion data from 10,000+ wardrobes</p>
      
      <h2>What You Get:</h2>
      <ul>
        <li>Quarterly trend reports</li>
        <li>Brand performance benchmarks</li>
        <li>Color & style forecasting</li>
        <li>Custom research studies</li>
      </ul>
      
      <h2>Pricing:</h2>
      <ul>
        <li>Starter: $500/month</li>
        <li>Professional: $2,000/month</li>
        <li>Enterprise: Custom pricing</li>
      </ul>
      
      <button>Request Demo</button>
    </div>
  );
}
```

**Step 3: Reach Out to Brands**

Email template:
```
Subject: Fashion Intelligence Data for [Brand Name]

Hi [Name],

I'm reaching out from Twin Style, a wardrobe organization app with 10,000+ active users.

We've been collecting real-world fashion data and noticed some insights that might interest [Brand Name]:

• [Stat about their brand or category]
• [Trend relevant to their product line]
• [Gap in market they could fill]

We offer fashion intelligence reports to brands that include:
- Quarterly trend analysis
- Brand performance benchmarks
- Color and style forecasting
- Custom research studies

Would you be interested in a demo report?

Best regards,
[Your Name]
```

**Expected Revenue**: $5,000-10,000/month with 5-10 customers

---

## 📈 Quick Metrics Dashboard

Create admin dashboard to track revenue:

```typescript
// app/(routes)/admin/revenue/page.tsx
export default async function RevenueDashboard() {
  const metrics = await getRevenueMetrics();
  
  return (
    <div>
      <h1>Revenue Dashboard</h1>
      
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Ad Revenue (MTD)"
          value={`$${metrics.adRevenue}`}
          change="+15%"
        />
        <MetricCard
          title="Premium MRR"
          value={`$${metrics.premiumMRR}`}
          change="+23%"
        />
        <MetricCard
          title="Affiliate Revenue"
          value={`$${metrics.affiliateRevenue}`}
          change="+8%"
        />
        <MetricCard
          title="B2B Revenue"
          value={`$${metrics.b2bRevenue}`}
          change="New!"
        />
      </div>
      
      <div>
        <h2>User Breakdown</h2>
        <ul>
          <li>Free Tier: {metrics.freeUsers}</li>
          <li>Ad-Supported: {metrics.adUsers}</li>
          <li>Premium: {metrics.premiumUsers}</li>
        </ul>
      </div>
      
      <div>
        <h2>Conversion Rates</h2>
        <ul>
          <li>Free → Ad-Supported: {metrics.freeToAdRate}%</li>
          <li>Ad-Supported → Premium: {metrics.adToPremiumRate}%</li>
        </ul>
      </div>
    </div>
  );
}
```

---

## 🎯 Success Checklist

### Week 1
- [ ] Google AdSense approved and integrated
- [ ] Premium tier launched with Stripe
- [ ] At least 100 hosted users signed up

### Month 1
- [ ] $500+ ad revenue
- [ ] 5+ premium subscribers
- [ ] Analytics tracking all conversions

### Month 3
- [ ] Affiliate links integrated
- [ ] First affiliate commission earned
- [ ] 1,000+ hosted users

### Month 6
- [ ] B2B portal launched
- [ ] First brand customer signed
- [ ] $5,000+ MRR from all sources

### Month 12
- [ ] $30,000+ MRR
- [ ] 10,000+ hosted users
- [ ] Multiple revenue streams active
- [ ] Break-even or profitable

---

## 💡 Pro Tips

**Ad Revenue**:
- Test different ad placements with A/B testing
- Monitor ad performance in AdSense dashboard
- Don't overdo it - user experience first
- Respect "panic pick" mode (no ads there)

**Premium Conversion**:
- Offer 7-day free trial
- Show "Upgrade" prompts at natural points (hit limit, saved 10 outfits)
- Highlight value: "Save $60/year"
- Make cancellation easy (builds trust)

**Affiliates**:
- Only recommend items that genuinely help
- Focus on quality over quantity
- Test with Amazon first (easier)
- Track which categories convert best

**B2B Sales**:
- Start with indie brands (easier to reach)
- Offer first month free for testimonials
- Create case studies
- Network at fashion industry events

---

## 🚨 Common Mistakes to Avoid

❌ **Too many ads** - Kills user experience  
✅ Limit to 1 ad per screen

❌ **Hiding affiliate links** - Illegal in many places  
✅ Clear disclosure: "We earn a commission"

❌ **Overpricing premium** - $10+ is too much for this market  
✅ Keep at $5/month sweet spot

❌ **Selling individual user data** - Privacy violation  
✅ Only sell aggregated, anonymized insights

❌ **Neglecting self-hosted** - Breaks our promise  
✅ Keep it free and full-featured forever

---

## 📞 Getting Help

**Technical Issues**:
- Stripe docs: https://stripe.com/docs
- AdSense help: https://support.google.com/adsense

**Business Questions**:
- Email: business@twinstyle.app
- GitHub Issues for feature requests

**Community**:
- Discord (coming soon)
- Reddit: r/twinstyle

---

**Ready to make money? Let's go! 🚀**
