'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface QuickStats {
  laundryCount: number;
  donateCount: number;
  availableCount: number;
  totalCount: number;
}

/**
 * Quick Stats Widget
 * 
 * ADHD-optimized:
 * - Shows only 3-4 key actionable metrics
 * - Cards are tappable to filter directly
 * - Visual hierarchy with color coding
 * - No overwhelming data
 */
export default function QuickStatsWidget() {
  const router = useRouter();
  const [stats, setStats] = useState<QuickStats>({
    laundryCount: 0,
    donateCount: 0,
    availableCount: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/items');
      const data = await response.json();
      
      const items = data.items || [];
      const laundry = items.filter((item: any) => item.state === 'laundry').length;
      const donate = items.filter((item: any) => item.state === 'donate').length;
      const available = items.filter((item: any) => item.state === 'available').length;
      
      setStats({
        laundryCount: laundry,
        donateCount: donate,
        availableCount: available,
        totalCount: items.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface-container rounded-lg p-4 animate-pulse">
            <div className="h-8 bg-surface-variant rounded mb-2"></div>
            <div className="h-4 bg-surface-variant rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {/* Laundry - Actionable */}
      <button
        onClick={() => router.push('/?state=laundry')}
        className={`bg-surface-container rounded-lg p-4 text-left transition-all hover:scale-105 hover:shadow-elevation-2 ${
          stats.laundryCount > 0 ? 'ring-2 ring-tertiary' : ''
        }`}
      >
        <div className="text-3xl font-bold text-tertiary">{stats.laundryCount}</div>
        <div className="text-sm text-on-surface-variant mt-1">
          🧺 In Laundry
        </div>
        {stats.laundryCount > 5 && (
          <div className="text-xs text-tertiary mt-1">Tap to review</div>
        )}
      </button>

      {/* Donate - Actionable */}
      <button
        onClick={() => router.push('/?state=donate')}
        className={`bg-surface-container rounded-lg p-4 text-left transition-all hover:scale-105 hover:shadow-elevation-2 ${
          stats.donateCount > 0 ? 'ring-2 ring-secondary' : ''
        }`}
      >
        <div className="text-3xl font-bold text-secondary">{stats.donateCount}</div>
        <div className="text-sm text-on-surface-variant mt-1">
          📦 To Donate
        </div>
        {stats.donateCount > 0 && (
          <div className="text-xs text-secondary mt-1">Tap to manage</div>
        )}
      </button>

      {/* Available - Info */}
      <div className="bg-surface-container rounded-lg p-4">
        <div className="text-3xl font-bold text-primary">{stats.availableCount}</div>
        <div className="text-sm text-on-surface-variant mt-1">
          ✅ Available
        </div>
      </div>

      {/* Quick Outfit - Primary Action */}
      <button
        onClick={() => router.push('/outfits/generate')}
        className="bg-primary text-on-primary rounded-lg p-4 text-left transition-all hover:scale-105 hover:shadow-elevation-3"
      >
        <div className="text-2xl mb-1">✨</div>
        <div className="text-sm font-semibold">
          Quick Outfit
        </div>
        <div className="text-xs opacity-90 mt-1">
          Generate now
        </div>
      </button>
    </div>
  );
}
