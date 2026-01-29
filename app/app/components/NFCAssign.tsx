/**
 * NFC Tag Assignment Component
 * 
 * Allows users to scan an NFC tag and associate it with an item.
 */

'use client';

import { useState } from 'react';
import { useNFC, useHaptics } from '../lib/hooks/useCapacitor';

interface NFCTag {
  id: string;
  tagId: string;
  label?: string;
}

interface NFCAssignProps {
  itemId: string;
  currentTag?: NFCTag | null;
  onAssigned?: (tag: NFCTag) => void;
  onRemoved?: () => void;
}

export default function NFCAssign({
  itemId,
  currentTag,
  onAssigned,
  onRemoved,
}: NFCAssignProps) {
  const nfc = useNFC();
  const haptics = useHaptics();
  const [scanning, setScanning] = useState(false);
  const [label, setLabel] = useState('');
  const [message, setMessage] = useState('');
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [scannedTagId, setScannedTagId] = useState<string | null>(null);

  const startAssignment = async () => {
    if (!nfc.isAvailable) {
      setMessage('NFC is not available on this device');
      return;
    }

    if (!nfc.isEnabled) {
      setMessage('Please enable NFC in your device settings');
      return;
    }

    setScanning(true);
    setMessage('Hold your device near the NFC tag to assign...');
    setScannedTagId(null);

    try {
      await haptics.light();
      const tagId = await nfc.startScanning();

      if (tagId) {
        await haptics.medium();
        setScannedTagId(tagId);
        setMessage(`Tag detected: ${tagId.substring(0, 12)}...`);
        setShowLabelInput(true);
      } else {
        setMessage('No tag detected. Please try again.');
      }
    } catch (error: any) {
      console.error('NFC scan error:', error);
      setMessage(error?.message || 'Failed to scan NFC tag');
    } finally {
      setScanning(false);
    }
  };

  const confirmAssignment = async () => {
    if (!scannedTagId) return;

    setMessage('Assigning tag...');

    try {
      const response = await fetch('/api/nfc/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagId: scannedTagId,
          itemId,
          label: label || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await haptics.heavy();
        setMessage('Tag assigned successfully!');
        onAssigned?.(data.nfcTag);
        
        // Reset
        setTimeout(() => {
          setScannedTagId(null);
          setLabel('');
          setShowLabelInput(false);
          setMessage('');
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to assign tag');
      }
    } catch (error: any) {
      console.error('Error assigning tag:', error);
      setMessage(error.message || 'Failed to assign tag');
    }
  };

  const removeAssignment = async () => {
    if (!currentTag) return;

    if (!confirm('Remove this NFC tag assignment?')) return;

    try {
      const response = await fetch(`/api/nfc/assign?itemId=${itemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        await haptics.medium();
        setMessage('Tag removed successfully');
        onRemoved?.();
      } else {
        throw new Error(data.error || 'Failed to remove tag');
      }
    } catch (error: any) {
      console.error('Error removing tag:', error);
      setMessage(error.message || 'Failed to remove tag');
    }
  };

  if (!nfc.isSupported) {
    return (
      <div className="bg-surface-container rounded-lg p-4">
        <p className="text-sm text-on-surface-variant">
          NFC is not supported on this device or browser. For web NFC, use Chrome/Edge 89+ on Android.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-on-surface">NFC Tag</h3>
          <p className="text-sm text-on-surface-variant">
            Attach an NFC tag to track this item
          </p>
        </div>
        {currentTag ? (
          <span className="text-2xl">✅</span>
        ) : (
          <span className="text-2xl">📡</span>
        )}
      </div>

      {/* Current Tag Display */}
      {currentTag && !scannedTagId && (
        <div className="bg-surface rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-on-surface">
                {currentTag.label || 'NFC Tag'}
              </p>
              <p className="text-xs text-on-surface-variant font-mono">
                {currentTag.tagId.substring(0, 16)}...
              </p>
            </div>
            <button
              onClick={removeAssignment}
              className="px-3 py-1 text-sm bg-error/10 text-error rounded-lg hover:bg-error/20 transition"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Assign New Tag */}
      {!currentTag && !scannedTagId && (
        <button
          onClick={startAssignment}
          disabled={scanning || !nfc.isEnabled}
          className="w-full px-4 py-3 bg-primary text-on-primary rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition"
        >
          {scanning ? '📡 Scanning...' : '📡 Assign NFC Tag'}
        </button>
      )}

      {/* Tag Scanned - Label Input */}
      {showLabelInput && scannedTagId && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Tag Label (Optional)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Blue hanger, Closet 1"
              className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container text-on-surface"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={confirmAssignment}
              className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 transition"
            >
              ✓ Confirm Assignment
            </button>
            <button
              onClick={() => {
                setScannedTagId(null);
                setLabel('');
                setShowLabelInput(false);
                setMessage('');
              }}
              className="px-4 py-2 border border-outline rounded-lg text-on-surface hover:bg-surface-container transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Status Message */}
      {message && (
        <p className="text-sm text-on-surface-variant text-center">
          {message}
        </p>
      )}

      {/* Help Text */}
      {!nfc.isEnabled && (
        <p className="text-sm text-on-surface-variant text-center">
          ⚠️ Please enable NFC in your device settings
        </p>
      )}
    </div>
  );
}
