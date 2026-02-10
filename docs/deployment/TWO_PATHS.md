# The Two Paths: Self-Hosted vs Hosted

```
┌─────────────────────────────────────────────────────────────────┐
│              TWIN STYLE: CHOOSE YOUR PATH                        │
└─────────────────────────────────────────────────────────────────┘

         ┌──────────────────┐           ┌──────────────────┐
         │   SELF-HOSTED    │           │     HOSTED       │
         │                  │           │  (Freemium/Ads)  │
         └──────────────────┘           └──────────────────┘
                 │                              │
                 ▼                              ▼
         
    🏠 YOUR SERVER                    ☁️  OUR SERVERS
    
    ┌─────────────────┐               ┌─────────────────┐
    │ 100% FREE       │               │ 100% FREE       │
    │ Unlimited All   │               │ Two Free Tiers: │
    │ 100% Private    │               │                 │
    │ Your Control    │               │ 1. Free (50)    │
    │ Tech Required   │               │ 2. Ad-Supported │
    │                 │               │    (Unlimited)  │
    │ Setup: 30 mins  │               │                 │
    │ Maintain: You   │               │ Setup: 1 min    │
    └─────────────────┘               │ Maintain: Us    │
                                      └─────────────────┘
```

---

## The Simple Choice

### Path 1: Self-Hosted 🏠

**Best for:** Tech-savvy users who value complete control

```
┌───────────────────────────────────────────────────┐
│  SELF-HOSTED                                      │
├───────────────────────────────────────────────────┤
│  Cost:          $0 (+ your server costs)          │
│  Items:         ∞ Unlimited                       │
│  Outfits:       ∞ Unlimited                       │
│  AI:            ∞ Unlimited                       │
│  Ads:           🚫 Never                          │
│  Privacy:       🔒 100% (your server)             │
│  Setup:         🛠️  30 minutes                    │
│  Maintenance:   🔧 You handle it                  │
│  Backups:       📦 You manage                     │
│  Updates:       🔄 Manual (git pull)              │
└───────────────────────────────────────────────────┘
```

**You need:**
- A server (VPS, home server, cloud)
- PostgreSQL + Redis
- Basic command line skills
- Time for setup and maintenance

**You get:**
- Complete data ownership
- No external dependencies
- Unlimited everything
- Full customization
- Zero trust needed

---

### Path 2: Hosted (Freemium/Ad-Supported) ☁️

**Best for:** Everyone else who wants it to just work

#### Tier 2.1: Free (Limited)

```
┌───────────────────────────────────────────────────┐
│  HOSTED - FREE TIER                               │
├───────────────────────────────────────────────────┤
│  Cost:          $0                                │
│  Items:         50 max                            │
│  Outfits:       20 max                            │
│  AI:            10/month                          │
│  Ads:           🚫 No                             │
│  Privacy:       🔒 Opt-in analytics               │
│  Setup:         ✨ 1 minute (sign up)             │
│  Maintenance:   ✅ We handle it                   │
│  Backups:       ✅ Automatic                      │
│  Updates:       ✅ Automatic                      │
└───────────────────────────────────────────────────┘
```

**Perfect for:**
- Trying out Twin Style
- Small wardrobes (< 50 items)
- Casual users
- People who want zero hassle

#### Tier 2.2: Ad-Supported (Unlimited)

```
┌───────────────────────────────────────────────────┐
│  HOSTED - AD-SUPPORTED TIER                       │
├───────────────────────────────────────────────────┤
│  Cost:          $0                                │
│  Items:         ∞ Unlimited                       │
│  Outfits:       ∞ Unlimited                       │
│  AI:            100/month                         │
│  Ads:           📺 Yes (respectful)               │
│  Privacy:       🔒 Opt-in analytics               │
│  Setup:         ✨ 1 minute (sign up)             │
│  Maintenance:   ✅ We handle it                   │
│  Backups:       ✅ Automatic                      │
│  Updates:       ✅ Automatic                      │
└───────────────────────────────────────────────────┘
```

**Perfect for:**
- Power users who don't want to self-host
- People with large wardrobes
- Users who don't mind ads
- Anyone who wants unlimited for free

---

## Side-by-Side Comparison

```
┌─────────────────────┬──────────────┬─────────────┬─────────────────┐
│                     │ Self-Hosted  │ Hosted Free │ Hosted Ad-Supp  │
├─────────────────────┼──────────────┼─────────────┼─────────────────┤
│ Monthly Cost        │ $0           │ $0          │ $0              │
│ Server Costs        │ You pay      │ We pay      │ We pay          │
│ Setup Time          │ 30 minutes   │ 1 minute    │ 1 minute        │
│ Tech Skills         │ Required     │ Not needed  │ Not needed      │
│                     │              │             │                 │
│ Items               │ ∞            │ 50          │ ∞               │
│ Outfits             │ ∞            │ 20          │ ∞               │
│ AI Generations/Mo   │ ∞            │ 10          │ 100             │
│                     │              │             │                 │
│ Ads                 │ Never        │ Never       │ Yes             │
│ Privacy Level       │ 100%         │ High        │ High            │
│ Data Location       │ Your server  │ Our servers │ Our servers     │
│                     │              │             │                 │
│ Maintenance         │ You          │ Us          │ Us              │
│ Backups             │ You          │ Automatic   │ Automatic       │
│ Updates             │ Manual       │ Automatic   │ Automatic       │
│ Support             │ Community    │ Email       │ Email           │
└─────────────────────┴──────────────┴─────────────┴─────────────────┘
```

---

## Decision Tree

```
                    START HERE
                        │
                        ▼
            ┌───────────────────────┐
            │ Do you have a server  │
            │ or want to run one?   │
            └───────────────────────┘
                   │         │
              YES  │         │  NO
                   ▼         ▼
          ┌───────────┐  ┌────────────┐
          │ Are you    │  │ How big is │
          │ tech-savvy?│  │ wardrobe?  │
          └───────────┘  └────────────┘
               │              │
          YES  │         <50  │  50+
               ▼              ▼    ▼
          ┌─────────┐   ┌──────┐ ┌──────────┐
          │ SELF-   │   │ FREE │ │ Can you  │
          │ HOSTED  │   │ TIER │ │ tolerate │
          │         │   │      │ │ ads?     │
          └─────────┘   └──────┘ └──────────┘
                                      │
                                 YES  │  NO
                                      ▼    ▼
                              ┌─────────┐ ┌──────────┐
                              │ AD-     │ │ Consider │
                              │ SUPPORT │ │ self-    │
                              │ TIER    │ │ hosting  │
                              └─────────┘ └──────────┘
```

---

## Data Privacy Comparison

### Self-Hosted
```
USER → YOUR SERVER → YOUR DATABASE
```
**Nothing ever leaves your control.**

### Hosted (Both Tiers)
```
USER → OUR SECURE SERVERS → ENCRYPTED DATABASE
              ↓
       [Privacy Settings]
              ↓
      DEFAULT: Everything OFF
              ↓
        [User Opts In?]
              ↓
     Anonymized Analytics
```
**We only see what you explicitly allow.**

---

## What You Give Up (and Get Back)

### Self-Hosted → Hosted
**Give Up:**
- Complete control
- Direct database access
- Server customization
- Zero external dependencies

**Get Back:**
- No server management
- Automatic backups
- Automatic updates
- Email support
- Mobile apps (official)
- Easier setup

### Hosted Free → Ad-Supported
**Give Up:**
- Ad-free experience

**Get Back:**
- Unlimited items
- Unlimited outfits
- 10x more AI generations
- Still 100% free

---

## Real-World Examples

### Sarah (Self-Hosted)
```
Profile: Software engineer, privacy-conscious
Wardrobe: 200+ items
Choice: Self-Hosted

Why: "I already have a home server, and I want 
      complete control. Setup took 20 minutes."

Monthly cost: $0 (uses existing home server)
```

### Alex (Hosted Free)
```
Profile: College student, minimal wardrobe
Wardrobe: 35 items
Choice: Hosted Free Tier

Why: "Perfect for my needs. No setup, just works.
      50 items is plenty for me."

Monthly cost: $0
```

### Jordan (Ad-Supported)
```
Profile: Fashion enthusiast, large wardrobe
Wardrobe: 150+ items
Choice: Hosted Ad-Supported

Why: "I don't mind ads, and I don't want to 
      deal with servers. Unlimited everything!"

Monthly cost: $0
```

---

## The Bottom Line

**Self-Hosted:**
- For people who want 100% control
- Requires technical skills
- $0 software cost (you pay for server)
- Unlimited everything
- Maximum privacy

**Hosted (Either Tier):**
- For everyone else
- Zero technical skills needed
- $0 always
- Choose limits (no ads) or unlimited (with ads)
- High privacy (opt-in)

---

## Both Options Share

✅ **ADHD-friendly design**  
✅ **Same core features**  
✅ **Same AI capabilities**  
✅ **Data export anytime**  
✅ **No vendor lock-in**  
✅ **Built for neurodivergent users**  
✅ **Privacy-first philosophy**

---

## Our Commitment

**We promise to:**
1. Always offer self-hosted as a free option
2. Never make hosted tiers predatory
3. Keep ads respectful and relevant
4. Allow migration between options
5. Be transparent about data collection
6. Prioritize ADHD-friendly UX
7. Never exploit vulnerable users

---

## Get Started

### Self-Hosted
```bash
git clone https://github.com/shelbeely/ADHD-Closet.git
cd ADHD-Closet/app
# Follow setup guide
```

### Hosted
Visit: **https://twinstyle.app**  
Sign up in 60 seconds

---

**The choice is yours. Both paths lead to the same great app.**

**Pick the one that fits your life.**
