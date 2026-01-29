/**
 * Capacitor Native Bridge Utilities
 * 
 * Provides a unified interface for accessing native device capabilities
 * through Capacitor plugins. Gracefully degrades when running in a web browser.
 */

import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { CapacitorNfc, NfcTag, NfcUtils } from '@capgo/capacitor-nfc';

/**
 * Check if the app is running as a native app (iOS or Android)
 */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get the current platform
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}

/**
 * Check if a specific plugin is available
 */
export function isPluginAvailable(pluginName: string): boolean {
  return Capacitor.isPluginAvailable(pluginName);
}

/**
 * Camera utilities
 */
export const CameraUtils = {
  /**
   * Take a photo using the device camera
   */
  async takePhoto(): Promise<string | null> {
    if (!isPluginAvailable('Camera')) {
      console.warn('Camera plugin not available');
      return null;
    }

    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 90,
        allowEditing: false,
        saveToGallery: false,
      });
      
      return photo.dataUrl || null;
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  },

  /**
   * Pick an image from the gallery
   */
  async pickImage(): Promise<string | null> {
    if (!isPluginAvailable('Camera')) {
      console.warn('Camera plugin not available');
      return null;
    }

    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        quality: 90,
        allowEditing: false,
      });
      
      return photo.dataUrl || null;
    } catch (error) {
      console.error('Error picking image:', error);
      return null;
    }
  },

  /**
   * Check if camera is available
   */
  isAvailable(): boolean {
    return isPluginAvailable('Camera');
  },
};

/**
 * Filesystem utilities
 */
export const FilesystemUtils = {
  /**
   * Write a file to the device filesystem
   */
  async writeFile(fileName: string, data: string): Promise<boolean> {
    if (!isPluginAvailable('Filesystem')) {
      console.warn('Filesystem plugin not available');
      return false;
    }

    try {
      await Filesystem.writeFile({
        path: fileName,
        data: data,
        directory: Directory.Data,
      });
      return true;
    } catch (error) {
      console.error('Error writing file:', error);
      return false;
    }
  },

  /**
   * Read a file from the device filesystem
   */
  async readFile(fileName: string): Promise<string | null> {
    if (!isPluginAvailable('Filesystem')) {
      console.warn('Filesystem plugin not available');
      return null;
    }

    try {
      const result = await Filesystem.readFile({
        path: fileName,
        directory: Directory.Data,
      });
      return result.data as string;
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  },

  /**
   * Check if filesystem is available
   */
  isAvailable(): boolean {
    return isPluginAvailable('Filesystem');
  },
};

/**
 * Share utilities
 */
export const ShareUtils = {
  /**
   * Share text or URL
   */
  async share(title: string, text: string, url?: string): Promise<boolean> {
    if (!isPluginAvailable('Share')) {
      console.warn('Share plugin not available');
      return false;
    }

    try {
      await Share.share({
        title,
        text,
        url,
      });
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    }
  },

  /**
   * Check if share is available
   */
  isAvailable(): boolean {
    return isPluginAvailable('Share');
  },
};

/**
 * Haptics utilities
 */
export const HapticsUtils = {
  /**
   * Trigger light haptic feedback
   */
  async light(): Promise<void> {
    if (!isPluginAvailable('Haptics')) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.error('Error with haptics:', error);
    }
  },

  /**
   * Trigger medium haptic feedback
   */
  async medium(): Promise<void> {
    if (!isPluginAvailable('Haptics')) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.error('Error with haptics:', error);
    }
  },

  /**
   * Trigger heavy haptic feedback
   */
  async heavy(): Promise<void> {
    if (!isPluginAvailable('Haptics')) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.error('Error with haptics:', error);
    }
  },

  /**
   * Check if haptics is available
   */
  isAvailable(): boolean {
    return isPluginAvailable('Haptics');
  },
};

/**
 * App utilities
 */
export const AppUtils = {
  /**
   * Get app info
   */
  async getInfo() {
    if (!isPluginAvailable('App')) {
      return null;
    }

    try {
      return await App.getInfo();
    } catch (error) {
      console.error('Error getting app info:', error);
      return null;
    }
  },

  /**
   * Add app state change listener
   */
  addStateChangeListener(callback: (state: { isActive: boolean }) => void) {
    if (!isPluginAvailable('App')) return () => {};

    let cleanupFn = () => {};
    
    App.addListener('appStateChange', callback).then((listener) => {
      cleanupFn = () => listener.remove();
    });
    
    return () => cleanupFn();
  },

  /**
   * Check if app utilities are available
   */
  isAvailable(): boolean {
    return isPluginAvailable('App');
  },
};

/**
 * Status Bar utilities
 */
export const StatusBarUtils = {
  /**
   * Set status bar style
   */
  async setStyle(style: 'light' | 'dark'): Promise<void> {
    if (!isPluginAvailable('StatusBar')) return;

    try {
      await StatusBar.setStyle({ 
        style: style === 'light' ? Style.Light : Style.Dark 
      });
    } catch (error) {
      console.error('Error setting status bar style:', error);
    }
  },

  /**
   * Set status bar background color
   */
  async setBackgroundColor(color: string): Promise<void> {
    if (!isPluginAvailable('StatusBar')) return;

    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (error) {
      console.error('Error setting status bar color:', error);
    }
  },

  /**
   * Show status bar
   */
  async show(): Promise<void> {
    if (!isPluginAvailable('StatusBar')) return;

    try {
      await StatusBar.show();
    } catch (error) {
      console.error('Error showing status bar:', error);
    }
  },

  /**
   * Hide status bar
   */
  async hide(): Promise<void> {
    if (!isPluginAvailable('StatusBar')) return;

    try {
      await StatusBar.hide();
    } catch (error) {
      console.error('Error hiding status bar:', error);
    }
  },

  /**
   * Check if status bar is available
   */
  isAvailable(): boolean {
    return isPluginAvailable('StatusBar');
  },
};

/**
 * Splash Screen utilities
 */
export const SplashScreenUtils = {
  /**
   * Hide splash screen
   */
  async hide(): Promise<void> {
    if (!isPluginAvailable('SplashScreen')) return;

    try {
      await SplashScreen.hide();
    } catch (error) {
      console.error('Error hiding splash screen:', error);
    }
  },

  /**
   * Show splash screen
   */
  async show(): Promise<void> {
    if (!isPluginAvailable('SplashScreen')) return;

    try {
      await SplashScreen.show();
    } catch (error) {
      console.error('Error showing splash screen:', error);
    }
  },

  /**
   * Check if splash screen is available
   */
  isAvailable(): boolean {
    return isPluginAvailable('SplashScreen');
  },
};

/**
 * NFC utilities for reading and writing NFC tags
 */
export const NFCUtils = {
  /**
   * Check if NFC is available on the device
   */
  async isAvailable(): Promise<boolean> {
    if (!isPluginAvailable('CapacitorNfc')) {
      return false;
    }

    try {
      const result = await CapacitorNfc.isAvailable();
      return result.available;
    } catch (error) {
      console.error('Error checking NFC availability:', error);
      return false;
    }
  },

  /**
   * Check if NFC is enabled on the device
   */
  async isEnabled(): Promise<boolean> {
    if (!isPluginAvailable('CapacitorNfc')) {
      return false;
    }

    try {
      const result = await CapacitorNfc.isEnabled();
      return result.enabled;
    } catch (error) {
      console.error('Error checking NFC enabled status:', error);
      return false;
    }
  },

  /**
   * Start scanning for NFC tags
   * Returns the tag ID when a tag is detected
   */
  async startScanning(): Promise<string | null> {
    if (!isPluginAvailable('CapacitorNfc')) {
      console.warn('NFC plugin not available');
      return null;
    }

    try {
      // Start listening for NFC tags
      const tag = await CapacitorNfc.scanTag();
      
      // Extract the tag ID (UID)
      if (tag && tag.id) {
        return tag.id;
      }
      
      return null;
    } catch (error) {
      console.error('Error scanning NFC tag:', error);
      return null;
    }
  },

  /**
   * Stop scanning for NFC tags
   */
  async stopScanning(): Promise<void> {
    if (!isPluginAvailable('CapacitorNfc')) return;

    try {
      await CapacitorNfc.stopScan();
    } catch (error) {
      console.error('Error stopping NFC scan:', error);
    }
  },

  /**
   * Write text data to an NFC tag
   */
  async writeTag(text: string): Promise<boolean> {
    if (!isPluginAvailable('CapacitorNfc')) {
      console.warn('NFC plugin not available');
      return false;
    }

    try {
      await CapacitorNfc.writeTag({ text });
      return true;
    } catch (error) {
      console.error('Error writing NFC tag:', error);
      return false;
    }
  },

  /**
   * Read data from an NFC tag
   */
  async readTag(): Promise<{ id: string; text?: string } | null> {
    if (!isPluginAvailable('CapacitorNfc')) {
      console.warn('NFC plugin not available');
      return null;
    }

    try {
      const tag = await CapacitorNfc.scanTag();
      
      if (tag && tag.id) {
        return {
          id: tag.id,
          text: tag.message || undefined,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error reading NFC tag:', error);
      return null;
    }
  },

  /**
   * Add a listener for NFC tag detection
   */
  addTagDetectionListener(callback: (tagId: string) => void) {
    if (!isPluginAvailable('CapacitorNfc')) {
      return () => {};
    }

    let cleanupFn = () => {};
    
    CapacitorNfc.addListener('nfcTagScanned', (tag: any) => {
      if (tag && tag.id) {
        callback(tag.id);
      }
    }).then((listener) => {
      cleanupFn = () => listener.remove();
    });
    
    return () => cleanupFn();
  },

  /**
   * Check if device supports NFC
   */
  isSupported(): boolean {
    return isPluginAvailable('CapacitorNfc');
  },
};

/**
 * Initialize native features when app loads
 */
export async function initializeCapacitor(): Promise<() => void> {
  if (!isNative()) {
    console.log('Running in web mode, native features disabled');
    return () => {};
  }

  console.log(`Running on ${getPlatform()}`);

  // Set initial status bar style
  await StatusBarUtils.setStyle('dark');
  await StatusBarUtils.setBackgroundColor('#6750a4');

  // Hide splash screen after a delay
  const timeoutId = setTimeout(async () => {
    await SplashScreenUtils.hide();
  }, 1000);

  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
  };
}
