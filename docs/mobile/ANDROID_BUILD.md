# Android APK Build Guide

This guide covers building native Android APK files for the ADHD Closet app using Capacitor.

## Overview

The app works in three ways:

1. **Web Browser** - Just visit the URL, no install needed
2. **PWA** - Install from your browser for app-like experience  
3. **Native App** - Build iOS/Android apps for full native features

## Installing as PWA (Quickest Option)

### On Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (⋮)
3. Tap "Install app" or "Add to Home Screen"
4. Tap "Install"

### PWA Features

When installed as a PWA, you get:
- App icon on your home screen
- Full-screen mode (no browser UI)
- Offline support (works without internet)
- Fast loading (cached content)
- App shortcuts (Add Item, Generate Outfit)

## Native Android App Build

For developers wanting to build native Android APK:
- Uses Capacitor for native capabilities
- Adds native camera, NFC, haptics, and more
- Required for App Store distribution

### Prerequisites

1. **Node.js 20+** - Install from [nodejs.org](https://nodejs.org)
2. **Android Studio** - Download from [developer.android.com](https://developer.android.com/studio)
3. **Java Development Kit (JDK) 17** - Usually bundled with Android Studio

### Why Build Native Android APK?

Web PWA is fine for most users. Build native if you need:
- NFC tag reading on newer Android versions
- Better camera performance
- Native file system access
- App Store (Google Play) distribution
- Offline installation without browser

### Quick Build Steps

#### 1. Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/shelbeely/ADHD-Closet.git
cd ADHD-Closet/app

# Install dependencies
npm install

# Build the Next.js app
npm run build
```

#### 2. Initialize Capacitor (First Time Only)

```bash
# Add Android platform
npm run cap:add:android

# Or if already added, sync
npm run cap:sync
```

#### 3. Open in Android Studio

```bash
# Open Android project in Android Studio
npm run cap:open:android
```

This will launch Android Studio with the Android project.

#### 4. Build APK in Android Studio

1. Wait for Gradle sync to complete
2. In Android Studio menu: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for build to complete (5-10 minutes first time)
4. Click "locate" in the notification to find the APK

**APK Location:**
```
app/android/app/build/outputs/apk/debug/app-debug.apk
```

### Building for Production (Release APK)

#### 1. Generate Signing Key

```bash
# Generate keystore
keytool -genkey -v -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Follow prompts to set passwords and details.

#### 2. Configure Signing in Android Studio

1. Open `android/app/build.gradle`
2. Add signing config (or use Android Studio GUI):
   - **Build** → **Generate Signed Bundle / APK**
   - Choose **APK**
   - Select keystore file and enter credentials
   - Choose **release** build variant

#### 3. Build Release APK

```bash
# From Android Studio:
# Build → Generate Signed Bundle / APK → APK → Select keystore → Release
```

**Release APK Location:**
```
app/android/app/build/outputs/apk/release/app-release.apk
```

### Installing APK on Device

#### Via USB (Development)

```bash
# Enable USB debugging on Android device
# Connect device via USB
# Run from terminal:
adb install app/android/app/build/outputs/apk/debug/app-debug.apk
```

#### Via File Transfer

1. Copy APK to device (email, USB, cloud storage)
2. Open file manager on Android
3. Tap the APK file
4. Allow "Install from unknown sources" if prompted
5. Tap "Install"

### Testing the APK

1. Install APK on Android device (see above)
2. Open the app
3. Test key features:
   - Add an item with camera
   - Generate outfit
   - Test offline mode
   - Try NFC tag (if device supports)

### Common Build Issues

**Gradle sync failed**
- Check Android Studio SDK is properly installed
- Update Gradle in `android/build.gradle` if needed
- Verify Java/JDK version (needs JDK 17)

**Build fails with "SDK not found"**
- Open Android Studio → Settings → Android SDK
- Install required SDK version (API 33+)
- Set `ANDROID_HOME` environment variable

**Capacitor version mismatch**
```bash
# Update all Capacitor packages
npm install @capacitor/core@latest @capacitor/cli@latest @capacitor/android@latest
npm run cap:sync
```

**App crashes on startup**
- Check permissions in `AndroidManifest.xml`
- Verify all native dependencies are synced
- Check Android Studio Logcat for errors

### Updating the App

When you make code changes:

```bash
# 1. Rebuild Next.js app
npm run build

# 2. Sync changes to Android
npm run cap:sync

# 3. Rebuild in Android Studio
# Or run: ./gradlew assembleDebug (from android/ directory)
```

### App Permissions

The app requests these Android permissions:
- **Camera** - For taking photos of clothing items
- **Storage** - For saving images locally
- **Internet** - For AI features (OpenRouter API)
- **NFC** - For reading NFC tags (optional)

Permissions are configured in:
```
app/android/app/src/main/AndroidManifest.xml
```

### Publishing to Google Play Store

1. **Create Google Play Developer Account** ($25 one-time fee)
2. **Build signed release APK** (see above)
3. **Create app listing** in Play Console
4. **Upload APK** or use Android App Bundle (AAB)
5. **Fill required details** (screenshots, description, privacy policy)
6. **Submit for review**

**Note:** Google Play requires privacy policy URL for apps that request permissions.

### Comparison: PWA vs Native

| Feature | Web Browser | PWA | Native APK |
|---------|-------------|-----|------------|
| No install | ✅ | ❌ | ❌ |
| App icon | ❌ | ✅ | ✅ |
| Offline | ❌ | ✅ | ✅ |
| NFC (Android) | ⚠️ Limited | ✅ | ✅ |
| Camera | ✅ | ✅ | ✅ Better |
| Google Play | ❌ | ❌ | ✅ |
| File system | ❌ | Limited | ✅ Full |
| Background tasks | ❌ | Limited | ✅ |

### Advanced Configuration

#### App Icon and Splash Screen

```bash
# Generate icons and splash screens
npm install -g @capacitor/assets
npx capacitor-assets generate
```

Place your icon at:
- `app/resources/icon.png` (1024x1024)
- `app/resources/splash.png` (2732x2732)

#### Environment Variables

Set environment variables in:
```
app/android/app/src/main/assets/capacitor.config.json
```

#### Native Plugins

Add more Capacitor plugins for native features:
```bash
npm install @capacitor/geolocation
npm install @capacitor/push-notifications
npx cap sync
```

### Resources

- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Android Studio Download](https://developer.android.com/studio)
- [Google Play Console](https://play.google.com/console)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)

---

For iOS builds, see the main [Mobile Apps Guide](../deployment/MOBILE-APPS.md).

For deployment options (hosting the web app), see:
- [Free Tier Deployment](../deployment/FREE-TIER.md)
- [Cloudflare Deployment](../deployment/CLOUDFLARE.md)
