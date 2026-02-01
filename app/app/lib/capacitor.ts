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
import { CapacitorNfc, NfcTag } from '@capgo/capacitor-nfc';

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
 * Supports both Capacitor Haptics (native apps) and Web Vibration API (web browsers)
 */
export const HapticsUtils = {
  /**
   * Check if Web Vibration API is available
   */
  isWebVibrationAvailable(): boolean {
    return typeof window !== 'undefined' && 'vibrate' in navigator;
  },

  /**
   * Trigger light haptic feedback
   */
  async light(): Promise<void> {
    // Try Capacitor Haptics first (native apps)
    if (isPluginAvailable('Haptics')) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
        return;
      } catch (error) {
        console.error('Error with Capacitor haptics:', error);
      }
    }
    
    // Fallback to Web Vibration API (web browsers)
    if (this.isWebVibrationAvailable()) {
      try {
        navigator.vibrate(10); // Light: 10ms vibration
      } catch (error) {
        console.error('Error with web vibration:', error);
      }
    }
  },

  /**
   * Trigger medium haptic feedback
   */
  async medium(): Promise<void> {
    // Try Capacitor Haptics first (native apps)
    if (isPluginAvailable('Haptics')) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
        return;
      } catch (error) {
        console.error('Error with Capacitor haptics:', error);
      }
    }
    
    // Fallback to Web Vibration API (web browsers)
    if (this.isWebVibrationAvailable()) {
      try {
        navigator.vibrate(20); // Medium: 20ms vibration
      } catch (error) {
        console.error('Error with web vibration:', error);
      }
    }
  },

  /**
   * Trigger heavy haptic feedback
   */
  async heavy(): Promise<void> {
    // Try Capacitor Haptics first (native apps)
    if (isPluginAvailable('Haptics')) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
        return;
      } catch (error) {
        console.error('Error with Capacitor haptics:', error);
      }
    }
    
    // Fallback to Web Vibration API (web browsers)
    if (this.isWebVibrationAvailable()) {
      try {
        navigator.vibrate(30); // Heavy: 30ms vibration
      } catch (error) {
        console.error('Error with web vibration:', error);
      }
    }
  },

  /**
   * Check if haptics is available (either via plugin or Web Vibration API)
   */
  isAvailable(): boolean {
    return isPluginAvailable('Haptics') || this.isWebVibrationAvailable();
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
 * Supports both Capacitor NFC plugin (native apps) and Web NFC API (web browsers)
 */
export const NFCUtils = {
  /**
   * Check if Web NFC API is available
   */
  isWebNFCAvailable(): boolean {
    return typeof window !== 'undefined' && 'NDEFReader' in window;
  },

  /**
   * Check if NFC is available on the device
   */
  async isAvailable(): Promise<boolean> {
    // Check Capacitor NFC plugin first (native apps)
    if (isPluginAvailable('CapacitorNfc')) {
      try {
        // @ts-expect-error - CapacitorNfc types may not be complete
        const result = await CapacitorNfc.isAvailable();
        return result.available;
      } catch (error) {
        console.error('Error checking Capacitor NFC availability:', error);
      }
    }

    // Fallback to Web NFC API (web browsers)
    if (this.isWebNFCAvailable()) {
      try {
        // Web NFC requires HTTPS (except localhost)
        const isSecure = window.location.protocol === 'https:' || 
                        window.location.hostname === 'localhost';
        return isSecure;
      } catch (error) {
        console.error('Error checking Web NFC availability:', error);
      }
    }

    return false;
  },

  /**
   * Check if NFC is enabled on the device
   */
  async isEnabled(): Promise<boolean> {
    // For Capacitor NFC plugin
    if (isPluginAvailable('CapacitorNfc')) {
      try {
        // @ts-expect-error - CapacitorNfc types may not be complete
        const result = await CapacitorNfc.isEnabled();
        return result.enabled;
      } catch (error) {
        console.error('Error checking NFC enabled status:', error);
      }
    }

    // For Web NFC API, we assume it's enabled if available
    // The API will throw an error when attempting to scan if NFC is disabled
    if (this.isWebNFCAvailable()) {
      return true;
    }

    return false;
  },

  /**
   * Start scanning for NFC tags
   * Returns the tag ID when a tag is detected
   */
  async startScanning(): Promise<string | null> {
    // Try Capacitor NFC plugin first (native apps)
    if (isPluginAvailable('CapacitorNfc')) {
      try {
        // @ts-expect-error - CapacitorNfc types may not be complete
        const tag = await CapacitorNfc.scanTag();
        if (tag && tag.id) {
          return tag.id;
        }
        return null;
      } catch (error) {
        console.error('Error scanning NFC tag with Capacitor:', error);
        return null;
      }
    }

    // Fallback to Web NFC API (web browsers)
    if (this.isWebNFCAvailable()) {
      try {
        const ndef = new (window as any).NDEFReader();
        await ndef.scan();
        
        return new Promise<string | null>((resolve, reject) => {
          const timeout = setTimeout(() => {
            resolve(null);
          }, 30000); // 30 second timeout

          ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
            clearTimeout(timeout);
            // Web NFC provides serial number as hex string
            resolve(serialNumber);
          });

          ndef.addEventListener('readingerror', (event: any) => {
            clearTimeout(timeout);
            console.error('Web NFC read error:', event);
            reject(new Error('Failed to read NFC tag'));
          });
        });
      } catch (error: any) {
        console.error('Error scanning with Web NFC:', error);
        if (error.name === 'NotAllowedError') {
          console.error('NFC permission denied. User must grant permission.');
        }
        return null;
      }
    }

    console.warn('NFC not available');
    return null;
  },

  /**
   * Stop scanning for NFC tags
   */
  async stopScanning(): Promise<void> {
    if (isPluginAvailable('CapacitorNfc')) {
      try {
        // @ts-expect-error - CapacitorNfc types may not be complete
        await CapacitorNfc.stopScan();
      } catch (error) {
        console.error('Error stopping NFC scan:', error);
      }
    }
    
    // Web NFC API doesn't require explicit stop - scans are one-time
  },

  /**
   * Write text data to an NFC tag
   */
  async writeTag(text: string): Promise<boolean> {
    // Try Capacitor NFC plugin first
    if (isPluginAvailable('CapacitorNfc')) {
      try {
        // @ts-expect-error - CapacitorNfc types may not be complete
        await CapacitorNfc.writeTag({ text });
        return true;
      } catch (error) {
        console.error('Error writing NFC tag with Capacitor:', error);
        return false;
      }
    }

    // Fallback to Web NFC API
    if (this.isWebNFCAvailable()) {
      try {
        const ndef = new (window as any).NDEFReader();
        await ndef.write({
          records: [{ recordType: 'text', data: text }]
        });
        return true;
      } catch (error: any) {
        console.error('Error writing with Web NFC:', error);
        if (error.name === 'NotAllowedError') {
          console.error('NFC write permission denied.');
        }
        return false;
      }
    }

    console.warn('NFC plugin not available');
    return false;
  },

  /**
   * Read data from an NFC tag
   */
  async readTag(): Promise<{ id: string; text?: string } | null> {
    // Try Capacitor NFC plugin first
    if (isPluginAvailable('CapacitorNfc')) {
      try {
        // @ts-expect-error - CapacitorNfc types may not be complete
        const tag = await CapacitorNfc.scanTag();
        if (tag && tag.id) {
          return {
            id: tag.id,
            text: tag.message || undefined,
          };
        }
        return null;
      } catch (error) {
        console.error('Error reading NFC tag with Capacitor:', error);
        return null;
      }
    }

    // Fallback to Web NFC API
    if (this.isWebNFCAvailable()) {
      try {
        const ndef = new (window as any).NDEFReader();
        await ndef.scan();
        
        return new Promise<{ id: string; text?: string } | null>((resolve, reject) => {
          const timeout = setTimeout(() => {
            resolve(null);
          }, 30000);

          ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
            clearTimeout(timeout);
            
            let textData: string | undefined;
            
            // Try to extract text from NDEF records
            if (message && message.records) {
              for (const record of message.records) {
                if (record.recordType === 'text') {
                  const textDecoder = new TextDecoder(record.encoding || 'utf-8');
                  textData = textDecoder.decode(record.data);
                  break;
                }
              }
            }
            
            resolve({
              id: serialNumber,
              text: textData,
            });
          });

          ndef.addEventListener('readingerror', (event: any) => {
            clearTimeout(timeout);
            console.error('Web NFC read error:', event);
            reject(new Error('Failed to read NFC tag'));
          });
        });
      } catch (error: any) {
        console.error('Error reading with Web NFC:', error);
        if (error.name === 'NotAllowedError') {
          console.error('NFC permission denied.');
        }
        return null;
      }
    }

    console.warn('NFC plugin not available');
    return null;
  },

  /**
   * Add a listener for NFC tag detection
   * Note: Web NFC API doesn't support continuous listening like Capacitor
   */
  addTagDetectionListener(callback: (tagId: string) => void) {
    // For Capacitor NFC plugin
    if (isPluginAvailable('CapacitorNfc')) {
      let cleanupFn: (() => void) | null = null;
      
      (async () => {
        // @ts-expect-error - CapacitorNfc types may not be complete
        const listener = await CapacitorNfc.addListener('nfcTagScanned', (tag: any) => {
          if (tag && tag.id) {
            callback(tag.id);
          }
        });
        cleanupFn = () => listener.remove();
      })();
      
      return () => {
        if (cleanupFn) {
          cleanupFn();
        }
      };
    }

    // For Web NFC API - set up continuous scanning
    if (this.isWebNFCAvailable()) {
      let abortController: AbortController | null = null;
      
      (async () => {
        try {
          const ndef = new (window as any).NDEFReader();
          abortController = new AbortController();
          
          await ndef.scan({ signal: abortController.signal });
          
          ndef.addEventListener('reading', ({ serialNumber }: any) => {
            callback(serialNumber);
          }, { signal: abortController.signal });
        } catch (error) {
          console.error('Error setting up Web NFC listener:', error);
        }
      })();
      
      return () => {
        if (abortController) {
          abortController.abort();
        }
      };
    }

    return () => {};
  },

  /**
   * Check if device supports NFC (either via plugin or Web NFC API)
   */
  isSupported(): boolean {
    return isPluginAvailable('CapacitorNfc') || this.isWebNFCAvailable();
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
