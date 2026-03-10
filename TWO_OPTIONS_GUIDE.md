# Twin Style: Two Simple Deployment Options

**Choose your path:**

1. 🏠 **Self-Hosted** - Free, unlimited, 100% private (for tech-savvy users)
2. ☁️ **Hosted** - Free with freemium/ad-supported tiers (for everyone else)

---

## Option 1: Self-Hosted (Free Forever)

### What You Get
- ✅ **100% Free** - No subscription, no ads, ever
- ✅ **Unlimited Everything** - Items, outfits, AI generations
- ✅ **Complete Privacy** - All data stays on your server
- ✅ **No Authentication** - Single-user, no login needed
- ✅ **Full Control** - Your server, your rules, your data

### Requirements
- Your own server (VPS, home server, etc.)
- Docker or Node.js
- PostgreSQL + Redis
- Basic tech skills

### Setup
```bash
# 1. Clone repo
git clone https://github.com/shelbeely/ADHD-Closet.git
cd ADHD-Closet/app

# 2. Configure
cp .env.example .env
# Edit .env: Set DEPLOYMENT_MODE="self_hosted"

# 3. Start services
docker compose up -d postgres redis

# 4. Run migrations
npx prisma migrate dev
npx prisma generate

# 5. Start app
npm run dev
```

**That's it!** No authentication, no limits, just works.

---

## Option 2: Hosted Freemium/Ad-Supported

### What You Get

**Two tiers to choose from:**

#### 🆓 **Free Tier**
- Up to 50 items
- Up to 20 outfits
- 10 AI generations per month
- No ads
- Full privacy control
- Perfect for trying out or casual use

#### 📺 **Ad-Supported Tier** (Recommended)
- **Unlimited items**
- **Unlimited outfits**
- **100 AI generations per month**
- Shows ads (respectful, not intrusive)
- Still privacy-first (opt-in analytics)
- **Completely free forever**

### How It Works

1. **Sign Up** → Create account with email or OAuth (Google/GitHub)
2. **Choose Tier** → Start with Free, upgrade to Ad-Supported anytime
3. **Use App** → All features available based on your tier
4. **Privacy First** → All analytics are opt-in, you control your data

### Setup (We Handle It)
- ✅ Server infrastructure (we pay)
- ✅ Database hosting (we manage)
- ✅ Automatic backups (we handle)
- ✅ Security updates (we patch)
- ✅ Monitoring (we watch)

**You just sign up and use it!**

---

## Comparison

| Feature | Self-Hosted | Hosted Free | Hosted Ad-Supported |
|---------|-------------|-------------|---------------------|
| **Cost** | $0 | $0 | $0 |
| **Setup** | DIY | Sign up | Sign up |
| **Items** | ∞ | 50 | ∞ |
| **Outfits** | ∞ | 20 | ∞ |
| **AI/Month** | ∞ | 10 | 100 |
| **Ads** | Never | Never | Yes |
| **Privacy** | 100% | Opt-in | Opt-in |
| **Your Server** | Yes | No | No |
| **Authentication** | No | Yes | Yes |
| **Backups** | DIY | Automatic | Automatic |

---

## Which Should You Choose?

### Choose Self-Hosted If:
- ✅ You're comfortable with servers
- ✅ You want 100% data control
- ✅ You already have a VPS
- ✅ You value privacy above convenience
- ✅ You want unlimited everything

### Choose Hosted Free If:
- ✅ You want to try Twin Style
- ✅ You have a small wardrobe
- ✅ You don't want to manage servers
- ✅ You're okay with basic limits

### Choose Hosted Ad-Supported If:
- ✅ You want unlimited features
- ✅ You don't mind seeing ads
- ✅ You want no setup hassle
- ✅ You're okay with hosted solution
- ✅ You want free + unlimited

---

## Privacy Explained

### Self-Hosted
```
Your Data → Your Server → Your Database
```
**Nothing leaves your infrastructure. Period.**

### Hosted (Both Tiers)
```
Your Data → Our Secure Servers → Encrypted Database
           ↓
    [Privacy Controls]
           ↓
    [Opt-In Only]
           ↓
    Anonymized Analytics
```

**We only collect what you explicitly allow:**

**Always Collected:**
- Account info (email, username)
- Your wardrobe data (items, outfits)
- Session data (authentication)

**Opt-In Only (Default: OFF):**
- Usage analytics (which features you use)
- AI success rates (to improve suggestions)
- Search patterns (to improve search)

**Never Collected:**
- ❌ Original photos (use AI-generated catalog images only)
- ❌ Dysphoria preferences (too sensitive)
- ❌ Mental health indicators
- ❌ Raw IP addresses (hashed if needed)

---

## Ad-Supported Tier Details

### What Ads Look Like
- **Respectful placement** - Sidebar, not intrusive
- **Fashion-related** - Clothing brands, style content
- **Can be disabled with consent** - If you opt out of personalization, generic ads shown
- **ADHD-friendly** - Not distracting, clearly marked

### Ad Revenue Helps Us:
- Pay for server hosting
- Fund development
- Keep the free tier free
- Support the self-hosted option
- Improve AI models

### You Can Still:
- ✅ Export all your data anytime
- ✅ Delete your account anytime
- ✅ Opt out of analytics
- ✅ Switch to Free tier (with limits)
- ✅ Migrate to self-hosted

---

## Upgrade/Downgrade Paths

```
SELF-HOSTED ←→ HOSTED FREE ←→ HOSTED AD-SUPPORTED
                                      
    [All paths are reversible]
    [Export your data anytime]
```

### From Self-Hosted → Hosted
1. Export your data
2. Create hosted account
3. Import your data
4. Choose tier

### From Hosted → Self-Hosted
1. Export your data
2. Set up self-hosted instance
3. Import your data
4. Enjoy unlimited privacy

### Within Hosted Tiers
- **Free → Ad-Supported**: Instant, one click
- **Ad-Supported → Free**: Instant, but you hit limits again

---

## Technical Details

### Self-Hosted Mode
```bash
# .env
DEPLOYMENT_MODE="self_hosted"

# No other config needed!
```

### Hosted Mode
```bash
# .env (on our servers)
DEPLOYMENT_MODE="hosted"
NEXTAUTH_SECRET="secure-secret"
ANALYTICS_ENABLED="true"
SUBSCRIPTION_ENABLED="true"
AD_NETWORK_ENABLED="true"  # For ad-supported tier
```

---

## Cost Analysis

### Self-Hosted
```
VPS: $5-20/month (your choice)
Domain: $10/year (optional)
Your time: Setup + maintenance
───────────────────────────
Total: $5-20/month + time investment
Control: 100%
Privacy: 100%
```

### Hosted Free
```
Hosting: $0 (we pay)
Maintenance: $0 (we do it)
Your time: None
───────────────────────────
Total: $0
Control: High (privacy settings)
Privacy: High (opt-in)
Trade-off: 50 item limit
```

### Hosted Ad-Supported
```
Hosting: $0 (we pay)
Maintenance: $0 (we do it)
Your time: None
Trade-off: See ads
───────────────────────────
Total: $0
Control: High (privacy settings)
Privacy: High (opt-in)
Ads: Yes, but respectful
```

---

## Getting Started

### Want Self-Hosted?
1. Read: [Self-Hosted Setup Guide](./docs/deployment/SELF_HOSTED_SETUP.md)
2. Follow setup steps
3. Start using!

### Want Hosted?
1. Visit: https://twinstyle.app (when live)
2. Sign up with email or OAuth
3. Choose your tier
4. Start organizing!

---

## FAQ

**Q: Can I switch between options later?**  
A: Yes! Export your data and move it anywhere.

**Q: What if I outgrow the Free tier?**  
A: Switch to Ad-Supported (unlimited) in one click.

**Q: Are ads really that bad?**  
A: We're ADHD-friendly. Ads are respectful, not distracting, fashion-related.

**Q: Can I try hosted first, then self-host later?**  
A: Absolutely! Export and migrate anytime.

**Q: What happens to my data if the hosted service shuts down?**  
A: You can export everything and self-host. Your data is always yours.

**Q: Do I need to pay for premium?**  
A: **No!** Both self-hosted and ad-supported are completely free with unlimited core features.

**Q: What about a premium tier?**  
A: We kept it simple. Premium may come later for power features, but it's not needed for a great experience.

---

## Our Promise

**Self-Hosted Will Always Be:**
- ✅ Free forever
- ✅ Fully featured
- ✅ Unlimited
- ✅ Available to download
- ✅ Open source

**Hosted Tiers Will Always:**
- ✅ Respect your privacy
- ✅ Be transparent about data
- ✅ Allow data export
- ✅ Allow account deletion
- ✅ Support self-hosting option

**We Will Never:**
- ❌ Sell your data
- ❌ Remove self-hosted option
- ❌ Make ads intrusive
- ❌ Collect data without consent
- ❌ Exploit ADHD users

---

## Support

**Self-Hosted:**
- Community support on GitHub
- Documentation and guides
- Discord community (coming soon)

**Hosted:**
- Email support
- In-app help
- Community support

---

## Ready to Get Started?

### Self-Hosted Users
```bash
git clone https://github.com/shelbeely/ADHD-Closet.git
cd ADHD-Closet
# Follow README.md
```

### Hosted Users
Visit: **https://twinstyle.app** (when deployed)

---

**Built with ❤️ for the neurodivergent community.**

*Choose the path that works for you. No judgment, no pressure.*
