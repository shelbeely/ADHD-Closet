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
  const isAvailable = CameraUtils.isAvailable();

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
  const isAvailable = ShareUtils.isAvailable();

  const share = useCallback(
    async (title: string, text: string, url?: string) => {
      if (!isAvailable) {
        // Fallback to Web Share API if available
        if (navigator.share) {
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
    [isAvailable]
  );

  return {
    isAvailable: isAvailable || ('share' in navigator),
    share,
  };
}

/**
 * Hook for haptic feedback
 */
export function useHaptics() {
  const isAvailable = HapticsUtils.isAvailable();

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
