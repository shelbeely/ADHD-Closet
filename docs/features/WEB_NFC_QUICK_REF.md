# Web NFC Quick Reference

## Browser Compatibility Quick Check

```
Is NFC Supported?
├─ Native App (iOS) → ✅ Capacitor NFC Plugin
├─ Native App (Android) → ✅ Capacitor NFC Plugin  
├─ Chrome on Android 89+ → ✅ Web NFC API
├─ Edge on Android 89+ → ✅ Web NFC API
├─ Safari on iOS → ❌ Not supported
├─ Firefox on Android → ❌ Not supported
└─ Desktop browsers → ❌ Not supported
```

## Quick Test

### Method 1: Browser Console
Open Chrome on Android and run:
```javascript
console.log('NDEFReader' in window ? '✅ Web NFC supported' : '❌ Not supported');
```

### Method 2: App UI
1. Open the app
2. Go to `/nfc-scan`
3. If you see "Start Scanning" button → ✅ Supported
4. If you see "Not supported" message → ❌ Not available

## Quick Start for Testing

1. **Get an Android device** with NFC
2. **Open Chrome** (version 89+)
3. **Visit your app** (must be HTTPS or localhost)
4. **Enable NFC** in Settings
5. **Grant permission** when prompted
6. **Hold phone near tag**
7. **Done!** Tag detected

## Permission Flow

```
User clicks "Scan Tag"
         ↓
    Need permission?
         ↓
    Show browser prompt
         ↓
    User grants/denies
         ↓
    If granted → Start scanning
    If denied → Show error message
```

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `NDEFReader is not defined` | Browser not supported | Use Chrome/Edge on Android |
| `NotAllowedError` | Permission denied | Grant permission when prompted |
| `SecurityError` | HTTP connection | Use HTTPS or localhost |
| NFC disabled | Android settings | Enable NFC in device settings |

## Code Example

```typescript
// The app handles this automatically!
// But here's what happens under the hood:

import { useNFC } from '@/app/lib/hooks/useCapacitor';

function MyComponent() {
  const nfc = useNFC();
  
  // isSupported is true if:
  // - Capacitor plugin available (native), OR
  // - 'NDEFReader' in window (web)
  if (!nfc.isSupported) {
    return <p>NFC not supported</p>;
  }
  
  // Just call startScanning - it handles the fallback
  const scan = async () => {
    const tagId = await nfc.startScanning();
    console.log('Tag ID:', tagId);
  };
  
  return <button onClick={scan}>Scan</button>;
}
```

## Debugging Tips

### Check if Web NFC is available
```javascript
// In browser console
console.log('NDEFReader available:', 'NDEFReader' in window);
console.log('Is HTTPS:', location.protocol === 'https:');
console.log('Is localhost:', location.hostname === 'localhost');
```

### Test permission state
```javascript
// Web NFC doesn't have permission query API yet
// Permission is requested on first scan attempt
```

### Monitor NFC events
```javascript
// In your component
ndef.addEventListener('reading', (event) => {
  console.log('Tag detected!', event);
});

ndef.addEventListener('readingerror', (event) => {
  console.error('Read error:', event);
});
```

## Feature Detection in Code

The app uses this logic:
```typescript
// 1. Check Capacitor plugin (native)
if (isPluginAvailable('CapacitorNfc')) {
  return 'Using Capacitor NFC Plugin';
}

// 2. Check Web NFC API (browser)
if ('NDEFReader' in window) {
  return 'Using Web NFC API';
}

// 3. Not available
return 'NFC not supported';
```

## HTTPS Requirement

Web NFC only works on:
- ✅ `https://your-domain.com`
- ✅ `http://localhost:3000`
- ✅ `http://127.0.0.1:3000`
- ❌ `http://your-domain.com` (insecure)

## Testing Locally

```bash
# Development server (works with localhost)
npm run dev

# Visit: http://localhost:3000/nfc-scan
# Web NFC will work even with HTTP on localhost!
```

## Production Checklist

- [ ] App is served over HTTPS
- [ ] Tested on Chrome Android
- [ ] Permission prompt works
- [ ] Tag scanning works
- [ ] Error messages are clear
- [ ] Docs mention Web NFC support
- [ ] User guide updated

## Need Help?

1. Check [NFC_TAG_SUPPORT.md](./NFC_TAG_SUPPORT.md) for full documentation
2. Check [WEB_NFC_IMPLEMENTATION.md](./WEB_NFC_IMPLEMENTATION.md) for technical details
3. Check browser console for errors
4. Verify HTTPS and browser version
5. Test with a known-working NFC tag

## Status

✅ **Web NFC Fully Supported**
- Implementation complete
- Documentation updated
- Components updated
- Ready for production

Use Chrome/Edge on Android to scan NFC tags directly in your web browser! 🎉
