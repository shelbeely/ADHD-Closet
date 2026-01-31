# PWA + Native Bridge Setup

This document describes the Progressive Web App (PWA) and native bridge capabilities of the Wardrobe AI Closet application.

## Overview

The application supports three deployment modes:

1. **Web PWA** - Progressive Web App that can be installed on any device
2. **iOS Native** - Native iOS app built with Capacitor
3. **Android Native** - Native Android app built with Capacitor

## PWA Features

### Current PWA Capabilities

- ✅ **Installable** - Can be installed on mobile and desktop devices
- ✅ **Offline Support** - Service worker with intelligent caching strategies
- ✅ **App Shortcuts** - Quick actions for "Add Item" and "Generate Outfit"
- ✅ **Manifest** - Full Web App Manifest with icons and metadata
- ✅ **Push Notifications** - Support for web push notifications (NotificationPrompt component)

### Caching Strategy

The PWA uses `next-pwa` with custom caching rules:

- **Google Fonts** - CacheFirst (1 year)
- **OpenRouter AI API** - NetworkFirst (1 day cache)
- **Wardrobe Images** - CacheFirst (1 week, max 200 entries)
- **General API Routes** - NetworkFirst (1 day cache)

## Native Bridge (Capacitor)

### Setup

The application uses [Capacitor](https://capacitorjs.com/) to provide native capabilities when deployed as a mobile app.

#### Installed Plugins

- `@capacitor/core` - Core Capacitor functionality
- `@capacitor/camera` - Camera and photo gallery access
- `@capacitor/filesystem` - Native file system access
- `@capacitor/share` - Native share sheet
- `@capacitor/haptics` - Haptic feedback
- `@capacitor/app` - App lifecycle management
- `@capacitor/status-bar` - Status bar customization
- `@capacitor/splash-screen` - Splash screen management
- `@capgo/capacitor-nfc` - NFC tag reading and writing

### Usage in Code

#### Checking if Running Native

```typescript
import { isNative, getPlatform } from '@/app/lib/capacitor';

if (isNative()) {
  console.log(`Running on ${getPlatform()}`); // 'ios' or 'android'
}
```

#### Using React Hooks

```typescript
import { useCamera, useShare, useHaptics } from '@/app/lib/hooks/useCapacitor';

function MyComponent() {
  const { takePhoto, pickImage, isAvailable } = useCamera();
  const { share } = useShare();
  const { light, medium, heavy } = useHaptics();

  const handleTakePhoto = async () => {
    const photoDataUrl = await takePhoto();
    if (photoDataUrl) {
      // Use the photo data URL
    }
  };

  const handleShare = async () => {
    await share('My Outfit', 'Check out this outfit!', 'https://...');
  };

  return (
    <button onClick={handleTakePhoto}>
      {isAvailable ? 'Take Photo' : 'Choose File'}
    </button>
  );
}
```

#### Direct API Usage

```typescript
import { CameraUtils, ShareUtils, HapticsUtils } from '@/app/lib/capacitor';

// Take a photo
const photoUrl = await CameraUtils.takePhoto();

// Share content
await ShareUtils.share('Title', 'Text', 'https://example.com');

// Haptic feedback
await HapticsUtils.medium();
```

### Available Utilities

#### Camera

- `CameraUtils.takePhoto()` - Take a photo with the camera
- `CameraUtils.pickImage()` - Pick an image from the gallery
- `CameraUtils.isAvailable()` - Check if camera is available

#### Filesystem

- `FilesystemUtils.writeFile(fileName, data)` - Write a file
- `FilesystemUtils.readFile(fileName)` - Read a file
- `FilesystemUtils.isAvailable()` - Check if filesystem is available

#### Share

- `ShareUtils.share(title, text, url)` - Share content
- `ShareUtils.isAvailable()` - Check if share is available

#### Haptics

Supports both Capacitor Haptics (native apps) and Web Vibration API (web browsers).

- `HapticsUtils.light()` - Light haptic feedback (10ms vibration on web)
- `HapticsUtils.medium()` - Medium haptic feedback (20ms vibration on web)
- `HapticsUtils.heavy()` - Heavy haptic feedback (30ms vibration on web)
- `HapticsUtils.isAvailable()` - Check if haptics is available
- `HapticsUtils.isWebVibrationAvailable()` - Check if Web Vibration API is available

**Browser Support:**
- ✅ Most Android browsers (Chrome, Firefox, Edge)
- ✅ Safari on iOS (requires user interaction)
- ✅ Most modern mobile browsers

#### App

- `AppUtils.getInfo()` - Get app information
- `AppUtils.addStateChangeListener(callback)` - Listen for app state changes
- `AppUtils.isAvailable()` - Check if app utilities are available

#### Status Bar

- `StatusBarUtils.setStyle('light' | 'dark')` - Set status bar style
- `StatusBarUtils.setBackgroundColor(color)` - Set status bar color
- `StatusBarUtils.show()` - Show status bar
- `StatusBarUtils.hide()` - Hide status bar
- `StatusBarUtils.isAvailable()` - Check if status bar is available

#### Splash Screen

- `SplashScreenUtils.hide()` - Hide splash screen
- `SplashScreenUtils.show()` - Show splash screen
- `SplashScreenUtils.isAvailable()` - Check if splash screen is available

#### NFC

- `NFCUtils.isAvailable()` - Check if NFC hardware is available
- `NFCUtils.isEnabled()` - Check if NFC is enabled
- `NFCUtils.startScanning()` - Start scanning for NFC tags
- `NFCUtils.stopScanning()` - Stop scanning
- `NFCUtils.readTag()` - Read data from NFC tag
- `NFCUtils.writeTag(text)` - Write text to NFC tag
- `NFCUtils.addTagDetectionListener(callback)` - Listen for tag detection
- `NFCUtils.isSupported()` - Check if NFC is supported

See [NFC_TAG_SUPPORT.md](./NFC_TAG_SUPPORT.md) for detailed NFC documentation.

## Building for Mobile

### Prerequisites

#### For iOS

- macOS with Xcode installed
- iOS development environment set up
- Apple Developer account (for deployment)

#### For Android

- Android Studio installed
- Android SDK and build tools
- Java Development Kit (JDK)

### Initial Setup

#### 1. Build the Web Application

```bash
npm run build
```

#### 2. Add iOS Platform (macOS only)

```bash
npm run cap:add:ios
```

This creates an `ios/` directory with an Xcode project.

#### 3. Add Android Platform

```bash
npm run cap:add:android
```

This creates an `android/` directory with an Android Studio project.

### Development Workflow

#### Testing with Local Server

During development, you can test native features while connecting to your local development server:

```bash
# 1. Start the Next.js dev server
npm run dev

# 2. In another terminal, sync the native projects
CAPACITOR_SERVER_URL=http://localhost:3000 npm run cap:sync

# 3. Open in native IDE
npm run cap:open:ios     # or
npm run cap:open:android
```

Then run the app from Xcode or Android Studio.

#### Building for Production

```bash
# 1. Build the Next.js app
npm run build

# 2. Sync with native projects
npm run cap:sync

# 3. Open native IDE to build and deploy
npm run cap:open:ios     # or
npm run cap:open:android
```

Alternatively, use the combined command:

```bash
npm run build:mobile
```

### Running on Devices

#### iOS

```bash
npm run cap:run:ios
```

Or open in Xcode and run from there:

```bash
npm run cap:open:ios
```

#### Android

```bash
npm run cap:run:android
```

Or open in Android Studio and run from there:

```bash
npm run cap:open:android
```

## Configuration

### Capacitor Configuration

The Capacitor configuration is in `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.wardrobe.closet',
  appName: 'Wardrobe AI Closet',
  webDir: 'public',
  server: {
    url: process.env.CAPACITOR_SERVER_URL,
    cleartext: true,
    androidScheme: 'https',
    iosScheme: 'capacitor',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#6750a4",
      // ...
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: "#6750a4",
    },
  },
};
```

### PWA Configuration

The PWA configuration is in `next.config.ts` using `next-pwa`.

## Graceful Degradation

All native features gracefully degrade when running as a web PWA:

- **Camera** - Falls back to `<input type="file" accept="image/*">`
- **Share** - Falls back to Web Share API, then clipboard
- **Haptics** - Silently ignored on web
- **Filesystem** - Falls back to browser storage APIs
- **Status Bar** - No-op on web

The utility functions check for native availability and handle fallbacks automatically.

## Testing

### Testing PWA Features

1. **Local HTTPS** - PWAs require HTTPS (except localhost)

```bash
npm run dev
# Visit http://localhost:3000
```

2. **Production Build**

```bash
npm run build
npm start
```

3. **Install Prompt** - Visit in Chrome/Edge/Safari and look for install prompt

### Testing Native Features

1. **iOS Simulator**

```bash
npm run cap:open:ios
# Run in Xcode iOS Simulator
```

2. **Android Emulator**

```bash
npm run cap:open:android
# Run in Android Studio Emulator
```

3. **Physical Devices** - Connect device and run from IDE

## Troubleshooting

### Service Worker Issues

If the service worker isn't updating:

```bash
# Clear browser cache and service workers
# In Chrome DevTools: Application > Service Workers > Unregister
```

### Capacitor Sync Issues

```bash
# Clean and resync
rm -rf ios android
npm run cap:add:ios
npm run cap:add:android
npm run cap:sync
```

### Native Build Issues

#### iOS

- Make sure Xcode is up to date
- Check iOS deployment target in Xcode project settings
- Run `pod install` in the `ios/App` directory if needed

#### Android

- Make sure Android Studio and SDK are up to date
- Check Gradle version compatibility
- Invalidate caches in Android Studio if needed

## Architecture Notes

### Why Capacitor Instead of Static Export?

This Next.js application uses API routes, server-side features, and dynamic content. Instead of doing a static export (which would lose these features), we:

1. Keep the full Next.js server running
2. Use Capacitor to wrap the web app in a native shell
3. Point the native app to either:
   - A production server URL for deployed apps
   - `localhost` for development testing

This approach maintains all server-side functionality while adding native capabilities.

### Hybrid Architecture Benefits

- ✅ Single codebase for web and mobile
- ✅ Full Next.js feature set (API routes, SSR, etc.)
- ✅ Native device capabilities where needed
- ✅ Easy updates via web (no app store approval for web content)
- ✅ Native performance and UX

## Future Enhancements

Potential additions for native capabilities:

- **Background Sync** - Sync data when app is in background
- **Push Notifications** - Native push notifications
- **Biometric Auth** - Fingerprint/Face ID authentication
- **Local Storage** - SQLite or similar for offline data
- **Calendar Integration** - Add outfit events to calendar
- **Contacts Integration** - Share with contacts

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Next.js PWA Guide](https://github.com/shadowwalker/next-pwa)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## Quick Start Guide

### Install as PWA (Web)
**Desktop (Chrome/Edge):**
1. Click the install icon (⊕) in address bar
2. Click "Install"

**Mobile (Any browser):**
1. Open browser menu (⋮)
2. Select "Add to Home Screen" or "Install App"
3. Tap "Add"

### Build Native App

**iOS:**
```bash
cd app
npx cap add ios
npx cap sync ios
npx cap open ios
# Build in Xcode
```

**Android:**
```bash
cd app
npx cap add android
npx cap sync android
npx cap open android
# Build in Android Studio
```

### Quick Feature Check

| Feature | PWA | Native iOS | Native Android |
|---------|-----|------------|----------------|
| Install to home screen | ✅ | ✅ | ✅ |
| Offline browsing | ✅ | ✅ | ✅ |
| Push notifications | ✅ | ✅ | ✅ |
| Camera access | ✅ | ✅ Better | ✅ Better |
| NFC scanning | Android only | ✅ | ✅ |
| Haptic feedback | ❌ | ✅ | ✅ |
| App Store distribution | ❌ | ✅ | ✅ |

