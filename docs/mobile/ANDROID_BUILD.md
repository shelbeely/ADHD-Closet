# Building Android APK

This guide covers how to build an Android APK file for the Twin Style mobile app.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Understanding the Architecture](#understanding-the-architecture)
3. [Building APK Locally](#building-apk-locally)
4. [Building with GitHub Actions](#building-with-github-actions)
5. [Installing the APK](#installing-the-apk)
6. [Configuration Options](#configuration-options)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### For Local Builds

- **Node.js** ≥ 22.0.0
- **Java JDK** 17 (for Android builds)
- **Android SDK** (via Android Studio or command-line tools)
- **Gradle** (usually comes with Android Studio)

### For GitHub Actions Builds

- No local setup required
- Just trigger the workflow from GitHub

---

## Understanding the Architecture

Twin Style uses a **hybrid app architecture** with Capacitor:

- **Next.js** provides the web app with API routes
- **Capacitor** wraps the web app for native platforms
- The mobile app connects to a **server URL** for API functionality

### Important Note

Because Twin Style uses Next.js API routes, the mobile app requires a running server to function. The app cannot work completely offline as a standalone static app.

**Two deployment models:**

1. **Development**: Mobile app connects to local dev server (`http://localhost:3000`)
2. **Production**: Mobile app connects to your deployed server (e.g., `https://your-domain.com`)

---

## Building APK Locally

### Step 1: Install Dependencies

```bash
cd app
npm install
```

### Step 2: Add Android Platform (First Time Only)

```bash
# Add the Android platform
npx cap add android
```

This creates an `android/` directory with the native Android project.

### Step 3: Sync Web Assets

```bash
# Copy web assets to Android project
npx cap sync android
```

### Step 4: Build the APK

**For debug builds (unsigned, for testing):**

```bash
npm run build:android
```

Or manually:

```bash
cd android
./gradlew assembleDebug
cd ..
```

**For release builds (requires signing):**

```bash
npm run build:android:release
```

Or manually:

```bash
cd android
./gradlew assembleRelease
cd ..
```

### Step 5: Find Your APK

**Debug APK location:**
```
app/android/app/build/outputs/apk/debug/app-debug.apk
```

**Release APK location:**
```
app/android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## Building with GitHub Actions

The repository includes an automated GitHub Actions workflow that builds APKs in the cloud.

### Option 1: Manual Workflow Trigger

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select **Build Android APK** workflow
4. Click **Run workflow**
5. Choose build type: `debug` or `release`
6. Click **Run workflow**

### Option 2: Automatic Builds

The workflow automatically runs when:
- You push to the `main` branch
- You create a pull request to `main`
- Changes are made to files in `app/`

### Downloading the APK

1. Go to the workflow run in the **Actions** tab
2. Scroll to **Artifacts** section
3. Download `twin-style-debug-apk` or `twin-style-release-apk`
4. Extract the ZIP file to get the APK

---

## Installing the APK

### On Physical Android Device

1. **Enable Developer Options:**
   - Go to **Settings** → **About Phone**
   - Tap **Build Number** 7 times
   - Return to Settings, find **Developer Options**

2. **Enable Installation from Unknown Sources:**
   - Settings → Security → Install Unknown Apps
   - Allow your file manager or browser to install apps

3. **Transfer APK to device:**
   - Via USB cable, or
   - Via email/cloud storage, or
   - Direct download from GitHub Actions artifacts

4. **Install:**
   - Open the APK file
   - Tap **Install**
   - Open the app

### On Android Emulator (AVD)

```bash
# Start emulator from Android Studio or:
emulator -avd YOUR_AVD_NAME

# Install APK
adb install app/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Configuration Options

### Connecting to Your Server

The app needs to connect to a running Twin Style server. You have two options:

#### Option 1: Development Server (Local Network)

For testing, connect to your local development server:

1. Start the Next.js dev server:
   ```bash
   cd app
   npm run dev
   ```

2. Find your computer's local IP address:
   ```bash
   # On macOS/Linux
   ifconfig | grep "inet "
   
   # On Windows
   ipconfig
   ```

3. Set the server URL before building:
   ```bash
   # In app directory
   export CAPACITOR_SERVER_URL="http://YOUR_LOCAL_IP:3000"
   npx cap sync android
   ```

4. Build and install the APK

**Note:** Your mobile device must be on the same Wi-Fi network as your computer.

#### Option 2: Production Server (Internet)

For production use, deploy your Next.js app to a server first:

1. Deploy Twin Style to a hosting platform (Vercel, Railway, VPS, etc.)
2. Get your production URL (e.g., `https://twinstyle.yourdomain.com`)
3. Update `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'https://twinstyle.yourdomain.com',
     cleartext: false,
   }
   ```
4. Rebuild the APK

### Signing Release APKs

For production distribution (Google Play Store), you need to sign your APK:

1. **Generate a keystore:**
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore \
     -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure signing in `android/app/build.gradle`:**
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file("path/to/my-release-key.keystore")
               storePassword "your-keystore-password"
               keyAlias "my-key-alias"
               keyPassword "your-key-password"
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
           }
       }
   }
   ```

3. **Build signed APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

**⚠️ Security Note:** Never commit keystores or passwords to Git. Use environment variables or secure secret management.

---

## Troubleshooting

### Build Fails with "SDK not found"

**Solution:**
1. Install Android Studio
2. Open Android Studio → Settings → Appearance & Behavior → System Settings → Android SDK
3. Install the required SDK versions (API 33+)
4. Set `ANDROID_HOME` environment variable:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

### "Could not resolve com.android.tools.build:gradle"

**Solution:**
- Check your internet connection
- Run `./gradlew --refresh-dependencies`
- Clear Gradle cache: `rm -rf ~/.gradle/caches/`

### APK Won't Install on Device

**Solution:**
1. Check that "Install Unknown Apps" is enabled
2. If updating an existing app, uninstall the old version first
3. Ensure the APK matches your device's architecture (ARM/x86)

### App Shows "Unable to connect to server"

**Solutions:**
1. **For local development:**
   - Ensure dev server is running (`npm run dev`)
   - Check that mobile device is on same Wi-Fi network
   - Verify firewall isn't blocking port 3000
   - Use your computer's local IP, not `localhost`

2. **For production:**
   - Ensure your production server is accessible
   - Check that server URL in `capacitor.config.ts` is correct
   - Verify SSL certificate is valid (for HTTPS)

### Gradle Build Fails

**Common solutions:**
```bash
# Clean build
cd android
./gradlew clean

# Update Gradle wrapper
./gradlew wrapper --gradle-version=8.14.3

# Sync project with Gradle files
./gradlew --refresh-dependencies
```

### Node version issues

**Solution:**
Capacitor 8.x requires Node.js ≥ 22.0.0. Update Node:
```bash
# Using nvm
nvm install 22
nvm use 22

# Or download from nodejs.org
```

---

## Building for Different Architectures

By default, Gradle builds a universal APK. To build for specific architectures:

**Edit `android/app/build.gradle`:**
```gradle
android {
    splits {
        abi {
            enable true
            reset()
            include 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
            universalApk true
        }
    }
}
```

This creates:
- `app-armeabi-v7a-release.apk` (32-bit ARM)
- `app-arm64-v8a-release.apk` (64-bit ARM)
- `app-x86-release.apk` (32-bit x86)
- `app-x86_64-release.apk` (64-bit x86)
- `app-universal-release.apk` (all architectures)

Most modern devices use `arm64-v8a`.

---

## Next Steps

- [Configure server deployment](../deployment/DEPLOYMENT.md)
- [Setup native features (Camera, NFC)](../features/NFC_TAG_SUPPORT.md)
- [Setup CI/CD for automated builds](../../.github/workflows/build-android-apk.yml)

---

## Additional Resources

- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Android Developer Guide](https://developer.android.com/guide)
- [Gradle Build Tool](https://gradle.org/guides/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
