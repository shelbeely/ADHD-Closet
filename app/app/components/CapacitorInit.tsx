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
    // Initialize Capacitor when the component mounts
    initializeCapacitor().catch((error) => {
      console.error('Error initializing Capacitor:', error);
    });
  }, []);

  // This component doesn't render anything
  return null;
}
