/**
 * NFC Quick Scan Page
 * 
 * Dedicated page for quickly scanning NFC tags to track item removal/return.
 * Designed for quick access when taking items from the closet.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NFCScanner from '../components/NFCScanner';

export default function NFCScanPage() {
  const router = useRouter();
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  const handleTagScanned = (tagId: string, itemInfo?: any) => {
    console.log('Tag scanned:', tagId, itemInfo);
    
    // Add to history
    if (itemInfo) {
      setScanHistory(prev => [
        {
          tagId,
          item: itemInfo.item,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 9), // Keep last 10
      ]);
    }
  };

  const handleError = (error: string) => {
    console.error('NFC Error:', error);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-primary text-on-primary p-4 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-2xl hover:opacity-80 transition"
          >
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">NFC Scanner</h1>
            <p className="text-sm opacity-90">Track items removed from closet</p>
          </div>
          <span className="text-3xl">📡</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Scanner */}
        <NFCScanner
          onTagScanned={handleTagScanned}
          onError={handleError}
          autoScan={true}
        />

        {/* Quick Instructions */}
        <div className="bg-surface-container rounded-lg p-4">
          <h2 className="font-bold text-on-surface mb-2">How to Use</h2>
          <ol className="space-y-2 text-sm text-on-surface-variant">
            <li>1. Hold your phone near the NFC tag on the hanger</li>
            <li>2. Wait for the item to be detected</li>
            <li>3. Tap "Removed" when taking item from closet</li>
            <li>4. Tap "Returned" when putting item back</li>
          </ol>
        </div>

        {/* Recent Scans */}
        {scanHistory.length > 0 && (
          <div className="bg-surface-container rounded-lg p-4">
            <h2 className="font-bold text-on-surface mb-3">Recent Scans</h2>
            <div className="space-y-2">
              {scanHistory.map((scan, idx) => (
                <div
                  key={`${scan.tagId}-${scan.timestamp}`}
                  className="flex items-center gap-3 p-2 bg-surface rounded-lg"
                >
                  {scan.item?.images?.[0] && (
                    <img
                      src={`/api/images/${scan.item.images[0].filePath}`}
                      alt={scan.item.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-on-surface truncate">
                      {scan.item?.title || 'Unknown Item'}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {new Date(scan.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/items/${scan.item.id}`)}
                    className="text-sm text-primary hover:underline"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manage Tags Link */}
        <div className="text-center">
          <button
            onClick={() => router.push('/settings')}
            className="text-sm text-primary hover:underline"
          >
            Manage NFC Tags
          </button>
        </div>
      </div>
    </div>
  );
}
