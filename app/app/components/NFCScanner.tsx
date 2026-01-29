/**
 * NFC Scanner Component
 * 
 * Provides a UI for scanning NFC tags to remove/return items from the closet.
 * Shows scanning status, detected item info, and action buttons.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNFC, useHaptics } from '../lib/hooks/useCapacitor';

interface NFCTag {
  id: string;
  tagId: string;
  label?: string;
  item: {
    id: string;
    title?: string;
    category?: string;
    state: string;
    images?: Array<{
      id: string;
      kind: string;
      filePath: string;
    }>;
  };
}

interface NFCScannerProps {
  onTagScanned?: (tagId: string, itemInfo?: NFCTag) => void;
  onError?: (error: string) => void;
  autoScan?: boolean;
}

export default function NFCScanner({ 
  onTagScanned, 
  onError,
  autoScan = false 
}: NFCScannerProps) {
  const nfc = useNFC();
  const haptics = useHaptics();
  const [scanning, setScanning] = useState(false);
  const [scannedTagId, setScannedTagId] = useState<string | null>(null);
  const [itemInfo, setItemInfo] = useState<NFCTag | null>(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string>('');

  const startScan = useCallback(async () => {
    if (!nfc.isAvailable) {
      const error = 'NFC is not available on this device';
      setMessage(error);
      onError?.(error);
      return;
    }

    if (!nfc.isEnabled) {
      const error = 'Please enable NFC in your device settings';
      setMessage(error);
      onError?.(error);
      return;
    }

    setScanning(true);
    setMessage('Hold your device near an NFC tag...');
    setScannedTagId(null);
    setItemInfo(null);

    try {
      await haptics.light();
      const tagId = await nfc.startScanning();
      
      if (tagId) {
        await haptics.medium();
        setScannedTagId(tagId);
        setMessage('Tag detected! Loading item...');
        
        // Fetch item info associated with this tag
        const fetchedItemInfo = await fetchItemInfo(tagId);
        
        onTagScanned?.(tagId, fetchedItemInfo ?? undefined);
      } else {
        setMessage('No tag detected. Please try again.');
      }
    } catch (error: any) {
      console.error('NFC scan error:', error);
      const errorMsg = error?.message || 'Failed to scan NFC tag';
      setMessage(errorMsg);
      onError?.(errorMsg);
    } finally {
      setScanning(false);
    }
  }, [nfc.isAvailable, nfc.isEnabled, nfc.startScanning, haptics, onTagScanned, onError]);

  useEffect(() => {
    if (autoScan && nfc.isAvailable && nfc.isEnabled) {
      startScan();
    }
  }, [autoScan, nfc.isAvailable, nfc.isEnabled, startScan]);

  const fetchItemInfo = async (tagId: string): Promise<NFCTag | null> => {
    setProcessing(true);
    try {
      // Use dedicated endpoint for fetching specific tag
      const response = await fetch(`/api/nfc/tags/${encodeURIComponent(tagId)}`);
      const data = await response.json();
      
      if (response.ok && data.tag) {
        setItemInfo(data.tag);
        setMessage(`Found: ${data.tag.item.title || 'Untitled Item'}`);
        return data.tag;
      } else {
        setMessage('Tag not assigned to any item yet');
        return null;
      }
    } catch (error) {
      console.error('Error fetching item info:', error);
      setMessage('Error loading item information');
      return null;
    } finally {
      setProcessing(false);
    }
  };

  const handleAction = async (action: 'removed' | 'returned') => {
    if (!scannedTagId) return;

    setProcessing(true);
    setMessage(`Recording ${action}...`);

    try {
      const response = await fetch('/api/nfc/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagId: scannedTagId,
          action,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await haptics.heavy();
        setMessage(data.message || `Item ${action} successfully!`);
        
        // Reset after success
        setTimeout(() => {
          setScannedTagId(null);
          setItemInfo(null);
          setMessage('');
          if (autoScan) {
            startScan();
          }
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to record action');
      }
    } catch (error: any) {
      console.error('Error recording action:', error);
      setMessage(error.message || 'Failed to record action');
      onError?.(error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (!nfc.isSupported) {
    return (
      <div className="bg-surface-container rounded-lg p-6 text-center">
        <div className="text-4xl mb-2">📱</div>
        <p className="text-on-surface-variant mb-2">
          NFC is not supported on this device or browser
        </p>
        <p className="text-xs text-on-surface-variant">
          For web NFC: Use Chrome/Edge 89+ on Android
        </p>
      </div>
    );
  }

  if (!nfc.isEnabled) {
    return (
      <div className="bg-surface-container rounded-lg p-6 text-center">
        <div className="text-4xl mb-2">📶</div>
        <p className="text-on-surface-variant mb-4">
          NFC is disabled. Please enable it in your device settings.
        </p>
        <p className="text-xs text-on-surface-variant">
          Android: Settings → Connected devices → NFC
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container rounded-lg p-6">
      {/* Scanning Animation */}
      {scanning && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4 animate-pulse">
            <span className="text-5xl">📡</span>
          </div>
          <p className="text-lg font-medium text-on-surface">{message}</p>
        </div>
      )}

      {/* Item Info Display */}
      {!scanning && itemInfo && itemInfo.item && (
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            {itemInfo.item.images?.[0] && (
              <img
                src={`/api/images/${itemInfo.item.images[0].filePath}`}
                alt={itemInfo.item.title || 'Item'}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-on-surface">
                {itemInfo.item.title || 'Untitled Item'}
              </h3>
              <p className="text-sm text-on-surface-variant">
                {itemInfo.item.category || 'No category'}
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                Current state: <span className="font-medium">{itemInfo.item.state}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleAction('removed')}
              disabled={processing}
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-orange-600 transition"
            >
              {processing ? '⏳ Processing...' : '👕 Removed from Closet'}
            </button>
            <button
              onClick={() => handleAction('returned')}
              disabled={processing}
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-green-600 transition"
            >
              {processing ? '⏳ Processing...' : '✅ Returned to Closet'}
            </button>
          </div>
        </div>
      )}

      {/* Scan Button */}
      {!scanning && !itemInfo && (
        <div className="text-center">
          {message && (
            <p className="text-on-surface-variant mb-4">{message}</p>
          )}
          <button
            onClick={startScan}
            disabled={scanning || processing}
            className="px-6 py-3 bg-primary text-on-primary rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition"
          >
            📡 Start Scanning
          </button>
        </div>
      )}

      {/* Scan Again */}
      {!scanning && scannedTagId && !processing && (
        <button
          onClick={startScan}
          className="w-full mt-4 px-4 py-2 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition"
        >
          Scan Another Tag
        </button>
      )}
    </div>
  );
}
