/**
 * React Hooks for Capacitor Native Features
 * 
 * Custom hooks that provide easy access to native device capabilities
 * with proper React lifecycle management.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  isNative,
  getPlatform,
  CameraUtils,
  ShareUtils,
  HapticsUtils,
  AppUtils,
  NFCUtils,
} from '../capacitor';

/**
 * Hook to detect if running as a native app
 */
export function useIsNative() {
  const [native, setNative] = useState(false);

  useEffect(() => {
    setNative(isNative());
  }, []);

  return native;
}

/**
 * Hook to get the current platform
 */
export function usePlatform() {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web');

  useEffect(() => {
    setPlatform(getPlatform());
  }, []);

  return platform;
}

/**
 * Hook for camera functionality
 */
export function useCamera() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    setIsAvailable(CameraUtils.isAvailable());
  }, []);

  const takePhoto = useCallback(async () => {
    if (!isAvailable) {
      console.warn('Camera not available, falling back to file input');
      return null;
    }
    return await CameraUtils.takePhoto();
  }, [isAvailable]);

  const pickImage = useCallback(async () => {
    if (!isAvailable) {
      console.warn('Camera not available, falling back to file input');
      return null;
    }
    return await CameraUtils.pickImage();
  }, [isAvailable]);

  return {
    isAvailable,
    takePhoto,
    pickImage,
  };
}

/**
 * Hook for share functionality
 */
export function useShare() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const checkAvailability = () => {
      return ShareUtils.isAvailable() || (typeof window !== 'undefined' && 'share' in navigator);
    };
    setIsAvailable(checkAvailability());
  }, []);

  const share = useCallback(
    async (title: string, text: string, url?: string) => {
      if (!ShareUtils.isAvailable()) {
        // Fallback to Web Share API if available
        if (typeof window !== 'undefined' && navigator.share) {
          try {
            await navigator.share({ title, text, url });
            return true;
          } catch (error) {
            console.error('Web Share API error:', error);
            return false;
          }
        }
        console.warn('Share not available');
        return false;
      }
      return await ShareUtils.share(title, text, url);
    },
    []
  );

  return {
    isAvailable,
    share,
  };
}

/**
 * Hook for haptic feedback
 */
export function useHaptics() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    setIsAvailable(HapticsUtils.isAvailable());
  }, []);

  const light = useCallback(async () => {
    if (!isAvailable) return;
    await HapticsUtils.light();
  }, [isAvailable]);

  const medium = useCallback(async () => {
    if (!isAvailable) return;
    await HapticsUtils.medium();
  }, [isAvailable]);

  const heavy = useCallback(async () => {
    if (!isAvailable) return;
    await HapticsUtils.heavy();
  }, [isAvailable]);

  return {
    isAvailable,
    light,
    medium,
    heavy,
  };
}

/**
 * Hook to track app state changes (foreground/background)
 */
export function useAppState() {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!AppUtils.isAvailable()) return;

    const removeListener = AppUtils.addStateChangeListener((state: { isActive: boolean }) => {
      setIsActive(state.isActive);
    });

    return removeListener;
  }, []);

  return isActive;
}

/**
 * Hook to get app info
 */
export function useAppInfo() {
  const [appInfo, setAppInfo] = useState<{
    name: string;
    id: string;
    version: string;
    build: string;
  } | null>(null);

  useEffect(() => {
    async function fetchAppInfo() {
      const info = await AppUtils.getInfo();
      if (info) {
        setAppInfo(info);
      }
    }

    fetchAppInfo();
  }, []);

  return appInfo;
}

/**
 * Hook for NFC functionality
 */
export function useNFC() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    async function checkNFC() {
      const available = await NFCUtils.isAvailable();
      const enabled = await NFCUtils.isEnabled();
      setIsAvailable(available);
      setIsEnabled(enabled);
    }

    checkNFC();
  }, []);

  const startScanning = useCallback(async () => {
    if (!isAvailable || !isEnabled) {
      console.warn('NFC not available or not enabled');
      return null;
    }

    setIsScanning(true);
    try {
      const tagId = await NFCUtils.startScanning();
      return tagId;
    } finally {
      setIsScanning(false);
    }
  }, [isAvailable, isEnabled]);

  const stopScanning = useCallback(async () => {
    await NFCUtils.stopScanning();
    setIsScanning(false);
  }, []);

  const readTag = useCallback(async () => {
    if (!isAvailable || !isEnabled) {
      console.warn('NFC not available or not enabled');
      return null;
    }

    setIsScanning(true);
    try {
      const tag = await NFCUtils.readTag();
      return tag;
    } finally {
      setIsScanning(false);
    }
  }, [isAvailable, isEnabled]);

  const writeTag = useCallback(
    async (text: string) => {
      if (!isAvailable || !isEnabled) {
        console.warn('NFC not available or not enabled');
        return false;
      }

      return await NFCUtils.writeTag(text);
    },
    [isAvailable, isEnabled]
  );

  const addTagListener = useCallback(
    (callback: (tagId: string) => void) => {
      if (!isAvailable || !isEnabled) {
        return () => {};
      }

      return NFCUtils.addTagDetectionListener(callback);
    },
    [isAvailable, isEnabled]
  );

  return {
    isAvailable,
    isEnabled,
    isScanning,
    isSupported: NFCUtils.isSupported(),
    startScanning,
    stopScanning,
    readTag,
    writeTag,
    addTagListener,
  };
}
