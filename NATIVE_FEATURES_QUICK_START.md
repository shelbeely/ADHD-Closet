# Quick Start: Using Native Features

This guide shows how to use Capacitor native features in your components.

## Basic Usage

### Check if Running Native

```typescript
import { useIsNative, usePlatform } from '@/app/lib/hooks/useCapacitor';

function MyComponent() {
  const isNative = useIsNative();
  const platform = usePlatform(); // 'ios', 'android', or 'web'
  
  return (
    <div>
      {isNative ? 'Native App' : 'Web App'} on {platform}
    </div>
  );
}
```

### Camera

```typescript
import { useCamera } from '@/app/lib/hooks/useCapacitor';

function AddItemButton() {
  const { takePhoto, pickImage, isAvailable } = useCamera();
  
  const handleCapture = async () => {
    // Take a photo with the camera
    const photoDataUrl = await takePhoto();
    if (photoDataUrl) {
      // Use the photo (it's a base64 data URL)
      uploadPhoto(photoDataUrl);
    }
  };
  
  const handleGallery = async () => {
    // Pick from gallery
    const photoDataUrl = await pickImage();
    if (photoDataUrl) {
      uploadPhoto(photoDataUrl);
    }
  };
  
  return (
    <>
      <button onClick={handleCapture}>
        {isAvailable ? 'Take Photo' : 'Use File Input'}
      </button>
      <button onClick={handleGallery}>
        {isAvailable ? 'Choose from Gallery' : 'Use File Input'}
      </button>
    </>
  );
}
```

### Share

```typescript
import { useShare } from '@/app/lib/hooks/useCapacitor';

function ShareButton() {
  const { share, isAvailable } = useShare();
  
  const handleShare = async () => {
    await share(
      'Check out my outfit!',
      'I created this outfit using Wardrobe AI',
      'https://example.com/outfit/123'
    );
  };
  
  return (
    <button onClick={handleShare} disabled={!isAvailable}>
      Share
    </button>
  );
}
```

### Haptics (Tactile Feedback)

Works on both native apps and modern web browsers via the Vibration API.

```typescript
import { useHaptics } from '@/app/lib/hooks/useCapacitor';

function InteractiveButton() {
  const { light, medium, heavy, isAvailable } = useHaptics();
  
  return (
    <>
      <button onClick={async () => {
        await light(); // Light tap (10ms vibration on web)
        // Do action
      }}>
        Light Action
      </button>
      
      <button onClick={async () => {
        await medium(); // Medium tap (20ms vibration on web)
        // Do action
      }}>
        Medium Action
      </button>
      
      <button onClick={async () => {
        await heavy(); // Strong tap (30ms vibration on web)
        // Do important action
      }}>
        Important Action
      </button>
    </>
  );
}
```

### NFC (Tag Scanning)

```typescript
import { useNFC } from '@/app/lib/hooks/useCapacitor';

function NFCScanButton() {
  const { startScanning, isAvailable, isEnabled } = useNFC();
  
  const handleScan = async () => {
    if (!isAvailable || !isEnabled) {
      alert('NFC is not available or enabled');
      return;
    }
    
    const tagId = await startScanning();
    if (tagId) {
      console.log('Scanned NFC tag:', tagId);
      // Look up item associated with this tag
      // Record removal/return event
    }
  };
  
  return (
    <button onClick={handleScan} disabled={!isEnabled}>
      {isEnabled ? 'Scan NFC Tag' : 'Enable NFC in Settings'}
    </button>
  );
}
```

## Direct API Usage (Without Hooks)

If you need to use native features outside of React components:

```typescript
import { CameraUtils, ShareUtils, HapticsUtils, NFCUtils } from '@/app/lib/capacitor';

// Camera
const photo = await CameraUtils.takePhoto();

// Share
await ShareUtils.share('Title', 'Message', 'https://url');

// Haptics
await HapticsUtils.medium();

// NFC
const tagId = await NFCUtils.startScanning();
const tag = await NFCUtils.readTag(); // { id, text }
await NFCUtils.writeTag('Hello NFC!');

// Check availability
if (CameraUtils.isAvailable()) {
  // Use camera
}
```

## Graceful Degradation

All features automatically degrade when not available:

- **Camera**: Returns `null` if not available (you can fall back to `<input type="file">`)
- **Share**: Uses Web Share API on web, native share on mobile
- **Haptics**: Uses Web Vibration API on web browsers, native haptics on mobile apps
- **NFC**: Uses Web NFC API on Chrome/Edge Android, native on iOS/Android apps
- **Other features**: Check `isAvailable()` before using

## Example: Enhanced Add Item Button

```typescript
'use client';

import { useCamera, useHaptics } from '@/app/lib/hooks/useCapacitor';

export default function EnhancedAddItem() {
  const camera = useCamera();
  const haptics = useHaptics();
  
  const handleTakePhoto = async () => {
    // Haptic feedback on button press
    await haptics.light();
    
    // Try native camera first
    let photoUrl = await camera.takePhoto();
    
    // If native camera not available, fall back to file input
    if (!photoUrl) {
      // Show file input dialog
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            photoUrl = reader.result as string;
            processPhoto(photoUrl);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      // Native camera worked
      await haptics.medium(); // Success feedback
      processPhoto(photoUrl);
    }
  };
  
  const processPhoto = (photoUrl: string) => {
    // Upload and process the photo
    console.log('Processing photo:', photoUrl);
  };
  
  return (
    <button onClick={handleTakePhoto}>
      {camera.isAvailable ? '📸 Take Photo' : '📁 Choose File'}
    </button>
  );
}
```

## See Also

- [Full Documentation](../PWA_NATIVE_BRIDGE.md)
- [NFC Tag Support](../NFC_TAG_SUPPORT.md)
- [Demo Component](./app/components/NativeFeaturesDemo.tsx)
- [Capacitor Docs](https://capacitorjs.com/docs)

