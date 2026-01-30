/**
 * Capacitor Initializer Component
 * 
 * Initializes Capacitor native features when the app loads.
 * This is a client component that runs in the browser/native app.
 */

'use client';

import { useEffect } from 'react';
import { initializeCapacitor } from '../lib/capacitor';

export default function CapacitorInit() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    // Initialize Capacitor when the component mounts
    initializeCapacitor()
      .then((cleanupFn) => {
        cleanup = cleanupFn;
      })
      .catch((error) => {
        console.error('Error initializing Capacitor:', error);
      });

    // Cleanup on unmount
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}
