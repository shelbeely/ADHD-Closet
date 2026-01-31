# NFC Tag Support

This document describes the NFC tag functionality for tracking clothing items when removed from and returned to the closet.

## Overview

The NFC feature allows you to:
- Attach NFC tags to clothing hangers
- Scan tags when removing items from the closet
- Scan tags when returning items to the closet
- Track item usage patterns and current location
- Automatically update item state based on NFC scans

**NFC works in:**
- ✅ Native iOS app (iPhone 7+, iOS 11+)
- ✅ Native Android app (Android 4.0+)
- ✅ **Web browsers** - Chrome/Edge on Android (89+) via Web NFC API
- ❌ iOS Safari (Web NFC not supported)
- ❌ Desktop browsers (Web NFC not supported)

## Web NFC API Support

This app now supports the **Web NFC API**, which enables NFC functionality directly in web browsers on Android without requiring a native app build!

### Browser Compatibility

| Browser | Platform | Support | Version |
|---------|----------|---------|---------|
| Chrome | Android | ✅ Yes | 89+ |
| Edge | Android | ✅ Yes | 89+ |
| Safari | iOS | ❌ No | - |
| Firefox | Android | ❌ No | - |
| Desktop | Any | ❌ No | - |

### Requirements for Web NFC

1. **HTTPS Connection**: Web NFC requires a secure context (HTTPS), except for `localhost`
2. **Android Device**: Must have NFC hardware
3. **NFC Enabled**: NFC must be enabled in device settings
4. **Browser Permissions**: User must grant NFC permission when prompted

### How It Works

The app automatically detects the best NFC method available:
1. **Native Apps**: Uses Capacitor NFC plugin (iOS/Android)
2. **Web Browser**: Falls back to Web NFC API (Chrome/Edge on Android)
3. **Not Available**: Shows friendly message if NFC not supported

No code changes needed - the app handles the fallback automatically!

## Database Schema

### NFCTag Model
Stores the association between NFC tags and items:
- `id` - Unique identifier
- `tagId` - NFC tag UID (unique hardware identifier)
- `label` - Optional human-readable label (e.g., "Blue hanger", "Closet 1")
- `itemId` - Reference to the item this tag is attached to
- `createdAt`, `updatedAt` - Timestamps

### NFCEvent Model
Tracks all NFC scan events:
- `id` - Unique identifier
- `tagId` - NFC tag UID that was scanned
- `itemId` - Reference to the item
- `action` - Either "removed" or "returned"
- `notes` - Optional user notes about the event
- `createdAt` - When the scan occurred

## Setup

### 1. Database Migration

Run the following migration to add NFC support:

```bash
cd app
npx prisma migrate dev --name add_nfc_support
npx prisma generate
```

### 2. Using Web NFC (Chrome/Edge on Android)

**No setup required!** Just:
1. Open the app in Chrome or Edge on your Android device
2. Make sure you're using HTTPS (or localhost for testing)
3. Enable NFC in your Android device settings
4. Grant NFC permission when prompted by the browser

The app will automatically use the Web NFC API.

### 3. Native App Setup (Optional - iOS/Android)

For iOS support or enhanced Android experience, you can build a native app. See [PWA_NATIVE_BRIDGE.md](./PWA_NATIVE_BRIDGE.md) for building instructions.

#### iOS Permissions

Add to `ios/App/App/Info.plist`:

```xml
<key>NFCReaderUsageDescription</key>
<string>We need NFC access to scan clothing tags</string>
```

#### Android Permissions

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="false" />
```

## Usage

### From Item Detail Page

1. Navigate to any item's detail page
2. Scroll to the "NFC Tag" section
3. Tap "📡 Assign NFC Tag"
4. Hold your phone near the NFC tag
5. (Optional) Add a label like "Blue hanger"
6. Tap "✓ Confirm Assignment"

### Quick Scanning

1. Navigate to `/nfc-scan` or use the NFC Scan shortcut
2. Hold your phone near an NFC tag
3. When item is detected, tap:
   - "👕 Removed from Closet" - when taking the item out
   - "✅ Returned to Closet" - when putting it back

### What Happens on Scan

**When marking as "Removed":**
- Item state changes to "unavailable"
- `lastWornDate` is updated
- Wear count increments
- If wear count reaches `wearsBeforeWash`, clean status changes to "needs_wash"

**When marking as "Returned":**
- If item needs wash: state changes to "laundry"
- Otherwise: state changes to "available"

## API Endpoints

### POST /api/nfc/assign
Associate an NFC tag with an item.

**Request:**
```json
{
  "tagId": "04:A1:B2:C3:D4:E5:F6",
  "itemId": "clx123...",
  "label": "Blue hanger (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "nfcTag": {
    "id": "...",
    "tagId": "04:A1:B2:C3:D4:E5:F6",
    "itemId": "...",
    "label": "Blue hanger",
    "item": { ... }
  }
}
```

### DELETE /api/nfc/assign
Remove an NFC tag assignment.

**Query params:** `?tagId=...` or `?itemId=...`

**Response:**
```json
{
  "success": true,
  "deletedCount": 1
}
```

### POST /api/nfc/scan
Record an NFC tag scan event.

**Request:**
```json
{
  "tagId": "04:A1:B2:C3:D4:E5:F6",
  "action": "removed",  // or "returned"
  "notes": "Going to work (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "event": { ... },
  "item": { ... },
  "message": "Blue Shirt marked as removed from closet"
}
```

### GET /api/nfc/tags
List all NFC tags with their items and recent events.

**Response:**
```json
{
  "tags": [
    {
      "id": "...",
      "tagId": "04:A1:B2:C3:D4:E5:F6",
      "label": "Blue hanger",
      "item": { ... },
      "recentEvents": [ ... ]
    }
  ],
  "total": 5
}
```

## React Hooks

### useNFC()

Custom hook for NFC functionality.

```typescript
import { useNFC } from '@/app/lib/hooks/useCapacitor';

function MyComponent() {
  const nfc = useNFC();

  const scanTag = async () => {
    if (!nfc.isAvailable || !nfc.isEnabled) {
      alert('NFC not available');
      return;
    }

    const tagId = await nfc.startScanning();
    console.log('Scanned:', tagId);
  };

  return (
    <div>
      {nfc.isSupported ? (
        <button onClick={scanTag} disabled={nfc.isScanning}>
          {nfc.isScanning ? 'Scanning...' : 'Scan NFC Tag'}
        </button>
      ) : (
        <p>NFC not supported on this device</p>
      )}
    </div>
  );
}
```

### Available Properties

- `isAvailable` - Whether NFC hardware is available
- `isEnabled` - Whether NFC is enabled in settings
- `isScanning` - Whether a scan is in progress
- `isSupported` - Whether the device supports NFC
- `startScanning()` - Start scanning for NFC tags
- `stopScanning()` - Stop scanning
- `readTag()` - Read tag data
- `writeTag(text)` - Write text to tag
- `addTagListener(callback)` - Listen for tag detection

## Components

### NFCScanner

Full-featured NFC scanner with UI.

```typescript
import NFCScanner from '@/app/components/NFCScanner';

<NFCScanner
  onTagScanned={(tagId, itemInfo) => {
    console.log('Tag scanned:', tagId, itemInfo);
  }}
  onError={(error) => {
    console.error('Error:', error);
  }}
  autoScan={true}  // Start scanning automatically
/>
```

### NFCAssign

Component for assigning NFC tags to items.

```typescript
import NFCAssign from '@/app/components/NFCAssign';

<NFCAssign
  itemId={item.id}
  itemTitle={item.title}
  currentTag={nfcTag}
  onAssigned={(tag) => setNfcTag(tag)}
  onRemoved={() => setNfcTag(null)}
/>
```

## Troubleshooting

### NFC Not Working

1. **Check device and browser compatibility:**
   - **Web (Chrome/Edge on Android):**
     - Chrome 89+ or Edge 89+ on Android
     - HTTPS connection required (or localhost)
     - NFC enabled in Android settings
     - Grant NFC permission when prompted
   - **Native Apps:**
     - iPhone 7 or later (iOS 11+)
     - Most Android phones (Android 4.0+)
     - NFC must be enabled in Settings

2. **Check app permissions:**
   - **Web (Chrome/Edge):** Grant NFC permission when browser prompts
   - **iOS Native:** Settings > Your App > NFC
   - **Android Native:** Settings > Apps > Your App > Permissions

3. **Tag positioning:**
   - Hold phone flat against tag (back of phone)
   - Keep steady for 1-2 seconds
   - Remove any metal cases that may interfere

4. **Tag compatibility:**
   - Use NFC Forum Type 2 tags (NTAG213/215/216)
   - ISO/IEC 14443 Type A tags
   - Avoid metal surfaces near tags

### Common Errors

**"NFC is not available on this device"**
- Device doesn't have NFC hardware
- Or browser doesn't support Web NFC API
- Try Chrome/Edge on Android for web support

**"Please enable NFC in your device settings"**
- Go to device settings and enable NFC
- On Android: Settings > Connected devices > Connection preferences > NFC
- On iOS: Settings > Control Center > Add NFC Tag Reader (native app only)

**"NotAllowedError" in browser**
- User denied NFC permission
- Reload page and grant permission when prompted
- Check that site is using HTTPS

**"NFC tag is already assigned to another item"**
- Unassign the tag from the other item first
- Or use a different NFC tag

### Web NFC Specific Issues

**"NDEFReader is not defined"**
- Browser doesn't support Web NFC API
- Use Chrome 89+ or Edge 89+ on Android
- Or build a native app for iOS support

**HTTPS Required Error**
- Web NFC requires HTTPS (except localhost)
- Use a secure connection or test on localhost

**Permission Denied**
- Grant NFC permission when browser prompts
- Check browser site settings for NFC permission
- Try refreshing the page

## Best Practices

1. **Label your tags:** Use descriptive labels like "Blue hanger" or "Closet section A"

2. **Consistent placement:** Always place tags in the same spot on hangers

3. **Tag quality:** Use good quality NFC tags (NTAG213 recommended)

4. **Backup:** NFC tags can fail - keep item info in the app too

5. **Regular checks:** Periodically verify tag associations are still correct

## Future Enhancements

Potential future features:
- Write item data to NFC tag itself
- Batch tag assignment
- Tag replacement workflow
- NFC event analytics (most/least worn items)
- Outfit tracking via NFC
- Location-based reminders

## Resources

- [Web NFC API](https://developer.chrome.com/docs/capabilities/nfc) - Chrome documentation for Web NFC
- [Web NFC Specification](https://w3c.github.io/web-nfc/) - W3C Web NFC standard
- [NFC Forum](https://nfc-forum.org/) - NFC standards
- [Capacitor NFC Plugin](https://github.com/capgo/capacitor-nfc) - Plugin documentation for native apps
- [NFC Tags Guide](https://www.shopnfc.com/en/content/6-nfc-tags-guide) - Tag types and uses

---

## Quick Reference

### Scanning an NFC Tag
1. **Tap the NFC icon** in the app toolbar
2. **Hold your phone** near the NFC tag (on hanger or item)
3. **Watch for feedback** - vibration + success message
4. **Item updates automatically** - status changes to "worn" or "available"

### Best Practices
- ✅ Write item IDs in format: `wardrobe:item:{itemId}`
- ✅ Use durable NFC tags (waterproof for clothes)
- ✅ Test tags before bulk deployment
- ✅ Keep a backup list of tag → item mappings

### Troubleshooting Quick Fixes
- **"NFC not supported"** → Use a device with NFC hardware
- **"Permission denied"** → Enable NFC in phone settings
- **"Tag not recognized"** → Re-write tag or check format
- **Nothing happens** → Hold phone steady for 1-2 seconds

### Supported Devices
- ✅ Android (Chrome, Edge, Samsung Internet)
- ✅ iOS/Android native apps (via Capacitor)
- ❌ iOS web browsers (Apple restriction)

