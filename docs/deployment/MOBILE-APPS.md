# Mobile Apps (Android & iOS)

## Quick Start

The app works in three ways:

1. **Web Browser** - Just visit the URL, no install needed
2. **PWA** - Install from your browser for app-like experience  
3. **Native App** - Build iOS/Android apps for full native features

## Installing as PWA

### On iPhone/iPad (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

### On Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (⋮)
3. Tap "Install app" or "Add to Home Screen"
4. Tap "Install"

### On Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click "Install" when prompted

## PWA Features

When installed as a PWA, you get:
- App icon on your home screen
- Full-screen mode (no browser UI)
- Offline support (works without internet)
- Fast loading (cached content)
- App shortcuts (Add Item, Generate Outfit)

## Native App Builds

For developers wanting to build native iOS/Android apps:
- Uses Capacitor for native capabilities
- See `app/README.md` for build instructions
- Adds native camera, NFC, haptics, and more

### Why Build Native?

Web PWA is fine for most users. Build native if you need:
- NFC tags on iOS (not available in web browsers)
- Better camera performance
- Native file system access
- App Store distribution

### Quick Build

```bash
cd app
npm run build
npx cap sync
npx cap open ios    # or: npx cap open android
```

Then build and sign in Xcode/Android Studio.

## Comparison

| Feature | Web Browser | PWA | Native App |
|---------|-------------|-----|------------|
| No install | ✅ | ❌ | ❌ |
| App icon | ❌ | ✅ | ✅ |
| Offline | ❌ | ✅ | ✅ |
| NFC (iOS) | ❌ | ❌ | ✅ |
| NFC (Android) | ✅ | ✅ | ✅ |
| App stores | ❌ | ❌ | ✅ |

## Troubleshooting

**PWA won't install**
- Make sure you're using HTTPS (or localhost)
- Try a different browser (Chrome/Edge work best)
- Clear browser cache and try again

**Native build fails**
- Check that you have Xcode (iOS) or Android Studio installed
- Run `npx cap doctor` to diagnose issues
- See full setup guide in `app/README.md`

---

For technical implementation details, see `app/README.md` section on Capacitor setup.
