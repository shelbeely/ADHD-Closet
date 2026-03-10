# Analytics Use Cases & Examples

**Companion Document to**: [MULTI_USER_ANALYTICS.md](MULTI_USER_ANALYTICS.md)  
**Last Updated**: 2026-02-02

This document provides concrete examples of analytics queries, data visualizations, and business use cases that could be built from Twin Style's clothing choice data.

---

## Sample Analytics Queries

### Fashion Trend Queries

#### Q1: What are the most popular colors this season?

```sql
-- Aggregated color popularity by season
WITH color_wears AS (
  SELECT 
    EXTRACT(YEAR FROM last_worn_date) as year,
    EXTRACT(QUARTER FROM last_worn_date) as quarter,
    jsonb_array_elements_text(color_palette::jsonb) as color,
    COUNT(*) as wear_count
  FROM items
  WHERE last_worn_date IS NOT NULL
  GROUP BY year, quarter, color
)
SELECT 
  year,
  quarter,
  color,
  wear_count,
  RANK() OVER (PARTITION BY year, quarter ORDER BY wear_count DESC) as popularity_rank
FROM color_wears
WHERE year = 2026 AND quarter = 1
ORDER BY wear_count DESC
LIMIT 10;
```

**Business Value**: Fashion brands can align production with actual wearing patterns, not just sales data.

#### Q2: Which outfit combinations get the highest ratings?

```sql
-- Top-rated outfit combinations
SELECT 
  o.id as outfit_id,
  o.rating,
  o.weather,
  o.vibe,
  o.occasion,
  json_agg(
    json_build_object(
      'role', oi.role,
      'category', i.category,
      'brand', i.brand,
      'colors', i.color_palette
    )
  ) as items
FROM outfits o
JOIN outfit_items oi ON o.id = oi.outfit_id
JOIN items i ON oi.item_id = i.id
WHERE o.rating = 'up'
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 50;
```

**Business Value**: Identify successful styling patterns to power recommendation engines.

#### Q3: What brands have the highest wear-to-wash ratio?

```sql
-- Brand durability/sustainability score
SELECT 
  brand,
  COUNT(*) as item_count,
  AVG(wears_before_wash) as avg_wears_before_wash,
  AVG(EXTRACT(EPOCH FROM (last_washed_date - last_worn_date)) / 86400) as avg_days_between_washes,
  COUNT(CASE WHEN state = 'available' THEN 1 END)::float / COUNT(*) as availability_rate
FROM items
WHERE brand IS NOT NULL
  AND last_worn_date IS NOT NULL
GROUP BY brand
HAVING COUNT(*) >= 5
ORDER BY avg_wears_before_wash DESC
LIMIT 20;
```

**Business Value**: Sustainable brands can prove their quality; consumers can make informed choices.

### User Behavior Queries

#### Q4: Average wardrobe composition

```sql
-- Wardrobe distribution across users
SELECT 
  category,
  COUNT(*) as total_items,
  AVG(COUNT(*)) OVER () as avg_items_per_category,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage_of_wardrobe
FROM items
GROUP BY category
ORDER BY total_items DESC;
```

**Insight**: "Users own 3.2x more tops than bottoms on average" → Opportunity for bottom recommendations.

#### Q5: Item lifecycle analysis

```sql
-- From purchase to donation: item longevity
SELECT 
  category,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400) as avg_days_owned,
  AVG(current_wears) as avg_total_wears,
  COUNT(CASE WHEN state = 'donate' THEN 1 END) * 100.0 / COUNT(*) as donation_rate_percent
FROM items
GROUP BY category
ORDER BY avg_days_owned DESC;
```

**Insight**: Fast fashion items might have high donation rates and low wear counts.

#### Q6: "Panic Pick" usage patterns

```sql
-- How often users use emergency outfit generation
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_outfits,
  COUNT(CASE WHEN time_available = 'quick' THEN 1 END) as panic_picks,
  COUNT(CASE WHEN time_available = 'quick' THEN 1 END) * 100.0 / COUNT(*) as panic_pick_rate
FROM outfits
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date;
```

**Insight**: High panic pick rates might indicate need for more pre-planned outfits or wardrobe optimization.

### ADHD-Specific Queries

#### Q7: Which ADHD-friendly features reduce decision time?

```sql
-- Correlation between features and outfit generation speed
SELECT 
  CASE 
    WHEN time_available = 'quick' THEN 'Panic Pick'
    ELSE 'Normal Generation'
  END as feature_type,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_generation_time_seconds,
  COUNT(*) as usage_count,
  AVG(CASE WHEN rating = 'up' THEN 1 WHEN rating = 'neutral' THEN 0 ELSE -1 END) as avg_satisfaction_score
FROM outfits o
JOIN ai_jobs aj ON o.id = aj.outfit_id
WHERE aj.type = 'generate_outfit'
  AND aj.status = 'succeeded'
GROUP BY feature_type;
```

**Insight**: If "Panic Pick" has 90% satisfaction despite 10x faster generation, it's highly valuable for ADHD users.

### Franchise Merchandise Queries

#### Q8: Band merch wear frequency

```sql
-- Which band merch gets worn most?
SELECT 
  franchise,
  franchise_type,
  COUNT(*) as item_count,
  AVG(current_wears) as avg_wears,
  AVG(EXTRACT(EPOCH FROM (NOW() - last_worn_date)) / 86400) as avg_days_since_last_wear,
  COUNT(CASE WHEN state = 'available' THEN 1 END) * 100.0 / COUNT(*) as availability_rate
FROM items
WHERE is_licensed_merch = true
  AND franchise IS NOT NULL
GROUP BY franchise, franchise_type
HAVING COUNT(*) >= 3
ORDER BY avg_wears DESC
LIMIT 20;
```

**Business Value**: Band managers/labels can see which merch designs actually get worn vs sit in closets.

---

## Data Visualization Concepts

### 1. Personal Wardrobe Dashboard (User-Facing)

**"Your Wardrobe at a Glance"**

```
📊 Wardrobe Stats
━━━━━━━━━━━━━━━━━━━━━━━
Total Items: 157
Most Worn Category: Tops (43%)
Favorite Brand: Uniqlo (worn 2.4x/week)
Sustainability Score: 8.2/10

📈 This Month
━━━━━━━━━━━━━━━━━━━━━━━
New Items: 3
Items Donated: 2
Outfits Created: 18
Panic Picks Used: 5

🎨 Your Color Palette
━━━━━━━━━━━━━━━━━━━━━━━
[Black] ████████████ 45%
[Gray]  ██████ 22%
[Blue]  ████ 15%
[White] ███ 10%
[Red]   ██ 8%

💡 Insights
━━━━━━━━━━━━━━━━━━━━━━━
• You haven't worn 12 items in 3+ months
• Consider pairing your red top with gray pants
• Your jeans need a wash (worn 4/3 times)
```

### 2. Fashion Trends Dashboard (B2B Product)

**"Fashion Intelligence Platform"**

```
🌍 Global Trend Report - Q1 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Color Trends
┌─────────────────────────────────┐
│ Trending Up (+47%)              │
│ Earth Tones: #8B7355 #D2B48C    │
│                                  │
│ Trending Down (-23%)            │
│ Neon Colors: #00FF00 #FF00FF    │
└─────────────────────────────────┘

👔 Style Trends
┌─────────────────────────────────┐
│ Oversized Fit: +34%             │
│ Crew Necklines: +28%            │
│ Wide-Leg Pants: +51%            │
│ Platform Shoes: -12%            │
└─────────────────────────────────┘

🏷️ Brand Insights
┌─────────────────────────────────┐
│ Most Owned (by item count)      │
│ 1. Uniqlo                       │
│ 2. H&M                          │
│ 3. Zara                         │
│                                  │
│ Most Worn (by frequency)        │
│ 1. Patagonia                    │
│ 2. Everlane                     │
│ 3. Uniqlo                       │
└─────────────────────────────────┘

♻️ Sustainability Metrics
┌─────────────────────────────────┐
│ Avg Wears Before Wash: 2.1      │
│ Avg Item Lifespan: 2.3 years    │
│ Donation Rate: 18% annually     │
│ Sustainable Brand %: 34%        │
└─────────────────────────────────┘
```

### 3. Outfit Success Heat Map

**Which outfit types work best for different contexts?**

```
              Hot  Warm  Cool  Cold  Rain
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Casual         🟢   🟢   🟢   🟡   🟡
Work           🟡   🟢   🟢   🟢   🟢
Date Night     🟢   🟢   🟡   🔴   🟡
Exercise       🟢   🟢   🟢   🟡   🟡
Errands        🟢   🟢   🟢   🟢   🟢

🟢 = High success rate (80%+ upvotes)
🟡 = Moderate success (50-80%)
🔴 = Low success (<50%)
```

### 4. Wardrobe Gap Analysis

**"What you're missing"**

```
Your Wardrobe Gaps
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ High Priority
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• White Button-Up Shirt
  You tried to create 5 outfits that needed this
  
• Black Ankle Boots
  Missing in 8 cold-weather outfit attempts
  
• Denim Jacket
  Would complete 12 existing outfits

💡 Nice to Have
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Neutral Cardigan
• Statement Belt
• Crossbody Bag
```

---

## Business Use Case Examples

### Use Case 1: "Style Profile Matching" for E-Commerce

**Problem**: Online shoppers struggle to find clothes that match their actual style.

**Solution**: Use Twin Style wardrobe data to create accurate style profiles.

**How it works**:
1. User connects Twin Style account to retailer website
2. System analyzes user's existing wardrobe:
   - Color preferences (they actually wear black 60% of the time)
   - Style preferences (they buy trendy but wear classic)
   - Fit preferences (they own oversized but wear fitted)
   - Brand affinity (they're loyal to specific brands)
3. Retailer shows products that:
   - Match colors user actually wears
   - Complement existing wardrobe
   - Fill identified gaps
   - Are from brands user trusts

**Example**:
```
For User #12345:
━━━━━━━━━━━━━━━━━━
Actual Style: Minimalist, monochrome, oversized
Wardrobe: 45% black, 22% gray, 18% white
Top Brand: Everlane (ethical, quality basics)

Recommended Products:
✓ Everlane Organic Cotton Oversized Tee (Black)
✓ Uniqlo Wide-Leg Pants (Gray)
✗ Shein Trendy Graphic Crop Top (Pink) ← Doesn't match style
```

**Revenue Potential**: Reduce returns by 30%, increase conversion by 20%

### Use Case 2: "Wear-More-Of-What-You-Own" Reminder Service

**Problem**: Users forget about items they own, leading to unnecessary purchases.

**Solution**: Proactive outfit suggestions using underutilized items.

**How it works**:
1. System identifies items not worn in 30+ days
2. Generates 3 outfit suggestions featuring forgotten item
3. Sends push notification: "Remember this red blazer? Here's how to style it"
4. Tracks whether user wears the item after reminder

**Example**:
```
📱 Notification:
━━━━━━━━━━━━━━━━━━━━━━━━━━
🔔 Haven't seen this in a while!

Your leopard print scarf (not worn in 47 days)

3 ways to wear it today:
• With your black turtleneck + jeans
• As a hair accessory with your denim jacket
• As a bag accent with your leather tote

[See Outfits] [Mark as Donate]
```

**Business Value**: Reduces new purchase desire, increases sustainable practices

### Use Case 3: "Franchise Merchandise Performance Analytics"

**Problem**: Entertainment companies don't know if their merch gets worn or sits in drawers.

**Solution**: Track wear frequency, styling patterns, and fan engagement.

**How it works**:
1. Tag merchandise with franchise identifiers
2. Track wear frequency, outfit pairings, ratings
3. Provide quarterly reports to franchise owners

**Example Report**:
```
Taylor Swift Eras Tour Merch Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Ownership: 12,450 items across 8,234 users
👕 Most Popular: "Midnights" Hoodie (3,421 owned)
⭐ Highest Rated: "Folklore" Cardigan (4.8/5 stars)

📈 Wear Patterns:
• Avg wears/month: 3.2 (above avg for band merch)
• Peak wearing: Concert weeks, album releases
• Styled with: Jeans (78%), skirts (12%), shorts (10%)

💡 Insights:
• "Folklore" cardigan worn 2x more than other merch
  → Suggests wearable, high-quality designs > graphic tees
• "Reputation" snake graphic tee rarely worn
  → Bold graphics harder to style into everyday outfits
• Merch worn even outside concert/fandom events
  → High brand loyalty, not just event-specific

🎯 Recommendations:
• Produce more wearable basics (cardigans, solid tees)
• Offer styling guides with merch purchases
• Consider limited-edition quality pieces > mass graphic tees
```

**Revenue Potential**: B2B subscription model for entertainment industry

### Use Case 4: "Sustainable Fashion Score"

**Problem**: Consumers want to be sustainable but don't know if they're succeeding.

**Solution**: Calculate and display personal sustainability metrics.

**How it works**:
1. Track item lifespan, wear frequency, donation patterns
2. Calculate sustainability score (0-100)
3. Provide personalized tips to improve score
4. Compare to community benchmarks

**Example Dashboard**:
```
Your Sustainability Score: 78/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ You're doing great at:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Wearing items frequently (avg 2.8x/week)
  Better than 68% of users
  
• Long item lifespan (avg 2.7 years)
  Better than 72% of users
  
• Washing less often (avg 3.2 wears/wash)
  Saves water, extends garment life

⚠️ Room for improvement:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Donation rate higher than average (24% vs 18%)
  Tip: Try "30 wears challenge" before donating
  
• 15% of wardrobe unworn in 90+ days
  Tip: Consider selling or swapping

🌱 Impact This Year:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• ~450 liters of water saved (fewer washes)
• ~12kg CO2 prevented (wearing longer)
• 3 items diverted from landfill (repairs)
```

**Revenue Potential**: Partner with sustainable brands, carbon offset programs

### Use Case 5: "Outfit Generation API for Personal Stylists"

**Problem**: Personal stylists spend hours creating outfit options manually.

**Solution**: White-label API that generates outfits based on client wardrobes.

**How it works**:
1. Stylist uploads client's wardrobe photos
2. AI generates catalog images and attributes
3. Stylist provides context (event, weather, preferences)
4. API returns 5 outfit suggestions with explanations
5. Stylist reviews, tweaks, and presents to client

**Example API Request**:
```json
POST /api/v1/generate-outfits
{
  "client_id": "uuid",
  "context": {
    "occasion": "Business casual meeting",
    "weather": "cool",
    "preferences": {
      "avoid_colors": ["yellow"],
      "preferred_fit": "tailored",
      "vibe": "confidence_boost"
    }
  },
  "count": 5
}
```

**Example API Response**:
```json
{
  "outfits": [
    {
      "id": "outfit-1",
      "items": [
        {"id": "item-1", "role": "top", "title": "Navy Blazer"},
        {"id": "item-2", "role": "top", "title": "White Button-Up"},
        {"id": "item-3", "role": "bottom", "title": "Gray Trousers"},
        {"id": "item-4", "role": "shoes", "title": "Black Loafers"}
      ],
      "explanation": "Classic business casual with a tailored fit. Navy and gray create a confident, professional look without being too formal. The white shirt adds crispness.",
      "confidence_score": 0.92,
      "visualization_url": "https://..."
    }
  ]
}
```

**Revenue Potential**: SaaS pricing for personal stylists, subscription tiers

---

## Privacy-Preserving Analytics Examples

### Differential Privacy Example

**Goal**: Share aggregate color trends without revealing individual wardrobes

**Technique**: Add mathematical noise to counts

```python
# Without differential privacy (RISKY)
SELECT color, COUNT(*) as count
FROM items
GROUP BY color;

# Result: Exact counts could identify users with rare colors
# Black: 10,450 | Pink: 3 ← User with pink might be identifiable

# With differential privacy (SAFE)
import numpy as np

def add_laplace_noise(true_count, epsilon=1.0):
    """Add noise to count for differential privacy"""
    noise = np.random.laplace(0, 1/epsilon)
    return max(0, true_count + noise)  # Ensure non-negative

# Apply noise to each color count
results = {
    "Black": add_laplace_noise(10450),
    "White": add_laplace_noise(8234),
    "Pink": add_laplace_noise(3),  # Now includes noise
}

# Result: Pink count might show as 2 or 5, preventing identification
```

### K-Anonymity Example

**Goal**: Share outfit preference data without identifying individuals

**Technique**: Ensure each data point applies to at least K users

```sql
-- K-anonymity: Group similar users (K=5)
WITH user_profiles AS (
  SELECT 
    user_id,
    CASE 
      WHEN AVG(wears_before_wash) < 1.5 THEN 'frequent_washer'
      WHEN AVG(wears_before_wash) < 3 THEN 'moderate_washer'
      ELSE 'infrequent_washer'
    END as wash_pattern,
    CASE
      WHEN COUNT(*) < 50 THEN 'small_wardrobe'
      WHEN COUNT(*) < 150 THEN 'medium_wardrobe'
      ELSE 'large_wardrobe'
    END as wardrobe_size
  FROM items
  GROUP BY user_id
),
grouped_users AS (
  SELECT 
    wash_pattern,
    wardrobe_size,
    COUNT(*) as user_count,
    AVG(total_items) as avg_items
  FROM user_profiles
  GROUP BY wash_pattern, wardrobe_size
  HAVING COUNT(*) >= 5  -- K-anonymity: at least 5 users per group
)
SELECT * FROM grouped_users;

-- Result: No group has fewer than 5 users, preventing identification
```

---

## Advertising Copy Examples (Ethical)

### For Fashion Brands (Trend Reports)

```
📊 Fashion Intelligence That Actually Matters

Not just what people buy. What they wear.

Twin Style Trend Reports reveal:
✓ Real wear frequency (not just sales data)
✓ What gets styled together (actual outfit combos)
✓ Colors that work (not just trend predictions)
✓ Brand loyalty drivers (quality > marketing)

Trusted by: [Brand Logos]

[Request Demo]
```

### For Sustainable Fashion Advocates

```
🌱 Proof Your Sustainable Choices Matter

Track your fashion footprint:
• Items worn 2.8x/week average
• 2.3 year item lifespan
• 450L water saved this year

Join 10,000+ conscious consumers making data-driven
sustainable fashion choices.

[Calculate Your Impact]
```

### For Personal Stylists

```
⚡ Style Your Clients 10x Faster

Stop manually creating outfit boards. Let AI do the heavy lifting.

Upload wardrobe → Get instant outfit options → Present to client

Built for personal stylists who value:
✓ Speed (5 outfits in 30 seconds)
✓ Quality (AI trained on 100k+ successful outfits)
✓ Personalization (learns each client's style)

14-day free trial. No credit card required.

[Start Styling]
```

---

## Key Takeaways

1. **Data Richness**: Twin Style captures more complete fashion data than e-commerce platforms (full lifecycle, usage patterns, context)

2. **Multiple Revenue Streams**: B2B trend reports, brand partnerships, white-label API, premium features

3. **User Benefit First**: All analytics should improve user experience (better recommendations, sustainability insights, wardrobe optimization)

4. **Privacy is Non-Negotiable**: Use differential privacy, k-anonymity, and explicit opt-in for all data collection

5. **ADHD-Specific Value**: Track what helps neurodivergent users make decisions faster with less stress

6. **Sustainability Focus**: Fashion industry needs better lifecycle data to reduce waste

**Next Steps**: Prioritize use cases, prototype privacy-preserving analytics, gather community feedback on data ethics approach.

---

**Related Documents**:
- [MULTI_USER_ANALYTICS.md](MULTI_USER_ANALYTICS.md) - Main strategy document
- [SPEC.md](SPEC.md) - Product design system
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture

**Feedback**: Open a GitHub issue to discuss specific use cases or privacy concerns.
