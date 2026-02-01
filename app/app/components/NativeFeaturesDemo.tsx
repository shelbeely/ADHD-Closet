/**
 * Example Component: Using Capacitor Native Features
 * 
 * This is a demo component showing how to use the native bridge utilities.
 * You can integrate these patterns into your existing components.
 */

'use client';

import { useState } from 'react';
import { useCamera, useShare, useHaptics, useIsNative, usePlatform } from '../lib/hooks/useCapacitor';

export default function NativeFeaturesDemo() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const isNative = useIsNative();
  const platform = usePlatform();
  const camera = useCamera();
  const share = useShare();
  const haptics = useHaptics();

  const handleTakePhoto = async () => {
    await haptics.light(); // Haptic feedback on button press
    const photo = await camera.takePhoto();
    if (photo) {
      setPhotoUrl(photo);
      await haptics.medium(); // Success feedback
    }
  };

  const handlePickImage = async () => {
    await haptics.light();
    const photo = await camera.pickImage();
    if (photo) {
      setPhotoUrl(photo);
      await haptics.medium();
    }
  };

  const handleShare = async () => {
    await haptics.light();
    await share.share(
      'Check out my wardrobe!',
      'I\'m using Twin Style to organize my clothes',
      window.location.href
    );
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-surface-container rounded-lg p-4">
        <h2 className="text-xl font-bold mb-2">Platform Info</h2>
        <p>Running as: {isNative ? 'Native App' : 'Web App'}</p>
        <p>Platform: {platform}</p>
      </div>

      <div className="bg-surface-container rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Camera Features</h2>
        <div className="space-x-2 mb-4">
          <button
            onClick={handleTakePhoto}
            disabled={!camera.isAvailable}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg disabled:opacity-50"
          >
            {camera.isAvailable ? 'Take Photo' : 'Camera Not Available'}
          </button>
          <button
            onClick={handlePickImage}
            disabled={!camera.isAvailable}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg disabled:opacity-50"
          >
            {camera.isAvailable ? 'Pick from Gallery' : 'Gallery Not Available'}
          </button>
        </div>
        {photoUrl && (
          <img src={photoUrl} alt="Captured" className="w-full max-w-md rounded-lg" />
        )}
      </div>

      <div className="bg-surface-container rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Share Features</h2>
        <button
          onClick={handleShare}
          disabled={!share.isAvailable}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg disabled:opacity-50"
        >
          {share.isAvailable ? 'Share App' : 'Share Not Available'}
        </button>
      </div>

      <div className="bg-surface-container rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Haptic Features</h2>
        <div className="space-x-2">
          <button
            onClick={haptics.light}
            disabled={!haptics.isAvailable}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg disabled:opacity-50"
          >
            Light
          </button>
          <button
            onClick={haptics.medium}
            disabled={!haptics.isAvailable}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg disabled:opacity-50"
          >
            Medium
          </button>
          <button
            onClick={haptics.heavy}
            disabled={!haptics.isAvailable}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg disabled:opacity-50"
          >
            Heavy
          </button>
        </div>
        {!haptics.isAvailable && (
          <p className="mt-2 text-sm text-on-surface-variant">
            Haptics only work on native apps
          </p>
        )}
      </div>
    </div>
  );
}
