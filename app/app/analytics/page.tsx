'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface AnalyticsData {
  totalItems: number;
  itemsByCategory: Record<string, number>;
  itemsByState: Record<string, number>;
  topTags: Array<{ name: string; count: number }>;
  outfitStats: {
    total: number;
    liked: number;
    disliked: number;
    neutral: number;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  dresses: 'Dresses',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  accessories: 'Accessories',
  underwear_bras: 'Underwear',
  jewelry: 'Jewelry',
};

const STATE_LABELS: Record<string, string> = {
  available: 'Available',
  laundry: 'Laundry',
  unavailable: 'Unavailable',
  donate: 'Donate',
};

/**
 * Analytics Dashboard
 * 
 * Material Design 3 + ADHD-optimized:
 * - Simple, clear visualizations
 * - Obvious insights highlighted
 * - No overwhelming data dumps
 * - Colorful but purposeful
 * - Card-based layout for easy scanning
 */
export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [itemsRes, outfitsRes, tagsRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/outfits'),
        fetch('/api/tags'),
      ]);

      const items = await itemsRes.json();
      const outfits = await outfitsRes.json();
      const tags = await tagsRes.json();

      // Process items data
      const itemsByCategory: Record<string, number> = {};
      const itemsByState: Record<string, number> = {};
      const tagCounts: Record<string, number> = {};

      items.items?.forEach((item: any) => {
        // Count by category
        if (item.category) {
          itemsByCategory[item.category] = (itemsByCategory[item.category] || 0) + 1;
        }
        // Count by state
        itemsByState[item.state] = (itemsByState[item.state] || 0) + 1;
        // Count tags
        item.tags?.forEach((tag: any) => {
          tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
        });
      });

      // Get top tags
      const topTags = Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Process outfit stats
      const outfitStats = {
        total: outfits.outfits?.length || 0,
        liked: outfits.outfits?.filter((o: any) => o.rating === 'up').length || 0,
        disliked: outfits.outfits?.filter((o: any) => o.rating === 'down').length || 0,
        neutral: outfits.outfits?.filter((o: any) => o.rating === 'neutral').length || 0,
      };

      setData({
        totalItems: items.items?.length || 0,
        itemsByCategory,
        itemsByState,
        topTags,
        outfitStats,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-on-surface-variant">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-error">Failed to load analytics</p>
      </div>
    );
  }

  // Chart data
  const categoryChartData = {
    labels: Object.keys(data.itemsByCategory).map(k => CATEGORY_LABELS[k] || k),
    datasets: [
      {
        data: Object.values(data.itemsByCategory),
        backgroundColor: [
          '#6750A4',
          '#625B71',
          '#7D5260',
          '#D0BCFF',
          '#CCC2DC',
          '#EFB8C8',
          '#EADDFF',
          '#E8DEF8',
        ],
      },
    ],
  };

  const stateChartData = {
    labels: Object.keys(data.itemsByState).map(k => STATE_LABELS[k] || k),
    datasets: [
      {
        label: 'Items',
        data: Object.values(data.itemsByState),
        backgroundColor: ['#4CAF50', '#2196F3', '#9E9E9E', '#FF9800'],
      },
    ],
  };

  const outfitRatingData = {
    labels: ['Liked', 'Neutral', 'Disliked'],
    datasets: [
      {
        label: 'Outfits',
        data: [data.outfitStats.liked, data.outfitStats.neutral, data.outfitStats.disliked],
        backgroundColor: ['#4CAF50', '#9E9E9E', '#F44336'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-container shadow-elevation-2">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-full hover:bg-surface-variant transition-colors"
            aria-label="Go back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-primary-container rounded-3xl shadow-elevation-1 p-6 text-center">
            <div className="text-4xl font-bold text-on-primary-container">{data.totalItems}</div>
            <div className="text-sm text-on-primary-container mt-2">Total Items</div>
          </div>
          <div className="bg-secondary-container rounded-3xl shadow-elevation-1 p-6 text-center">
            <div className="text-4xl font-bold text-on-secondary-container">{data.outfitStats.total}</div>
            <div className="text-sm text-on-secondary-container mt-2">Outfits</div>
          </div>
          <div className="bg-tertiary-container rounded-3xl shadow-elevation-1 p-6 text-center">
            <div className="text-4xl font-bold text-on-tertiary-container">{data.topTags.length}</div>
            <div className="text-sm text-on-tertiary-container mt-2">Unique Tags</div>
          </div>
          <div className="bg-surface-container rounded-3xl shadow-elevation-1 p-6 text-center">
            <div className="text-4xl font-bold text-on-surface">
              {data.outfitStats.total > 0 
                ? Math.round((data.outfitStats.liked / data.outfitStats.total) * 100)
                : 0}%
            </div>
            <div className="text-sm text-on-surface-variant mt-2">Success Rate</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Items by Category */}
          {Object.keys(data.itemsByCategory).length > 0 && (
            <div className="bg-surface-container rounded-3xl shadow-elevation-1 p-6">
              <h2 className="text-xl font-semibold mb-4">Items by Category</h2>
              <div className="h-64">
                <Pie data={categoryChartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Items by State */}
          {Object.keys(data.itemsByState).length > 0 && (
            <div className="bg-surface-container rounded-3xl shadow-elevation-1 p-6">
              <h2 className="text-xl font-semibold mb-4">Items by State</h2>
              <div className="h-64">
                <Bar data={stateChartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Outfit Ratings */}
          {data.outfitStats.total > 0 && (
            <div className="bg-surface-container rounded-3xl shadow-elevation-1 p-6">
              <h2 className="text-xl font-semibold mb-4">Outfit Ratings</h2>
              <div className="h-64">
                <Bar data={outfitRatingData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Tag Cloud */}
          {data.topTags.length > 0 && (
            <div className="bg-surface-container rounded-3xl shadow-elevation-1 p-6">
              <h2 className="text-xl font-semibold mb-4">Top Tags</h2>
              <div className="flex flex-wrap gap-3">
                {data.topTags.map(tag => {
                  const size = Math.max(12, Math.min(24, 12 + (tag.count * 2)));
                  return (
                    <span
                      key={tag.name}
                      className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full"
                      style={{ fontSize: `${size}px` }}
                    >
                      {tag.name} ({tag.count})
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="bg-surface-container rounded-3xl shadow-elevation-1 p-6">
          <h2 className="text-xl font-semibold mb-4">💡 Insights</h2>
          <div className="space-y-3 text-on-surface-variant">
            {data.itemsByState.laundry > 5 && (
              <div className="flex items-start gap-3 p-3 bg-tertiary-container/20 rounded-xl">
                <span className="text-2xl">🧺</span>
                <div>
                  <strong className="text-on-surface">Laundry Alert:</strong> You have {data.itemsByState.laundry} items in laundry. 
                  Consider doing a load soon!
                </div>
              </div>
            )}
            {data.itemsByState.donate > 0 && (
              <div className="flex items-start gap-3 p-3 bg-primary-container/20 rounded-xl">
                <span className="text-2xl">📦</span>
                <div>
                  <strong className="text-on-surface">Donation Reminder:</strong> You have {data.itemsByState.donate} items marked for donation.
                </div>
              </div>
            )}
            {data.outfitStats.liked > data.outfitStats.disliked * 2 && (
              <div className="flex items-start gap-3 p-3 bg-secondary-container/20 rounded-xl">
                <span className="text-2xl">✨</span>
                <div>
                  <strong className="text-on-surface">Great Choices:</strong> You're loving most of your outfits! Keep it up!
                </div>
              </div>
            )}
            {data.totalItems < 10 && (
              <div className="flex items-start gap-3 p-3 bg-tertiary-container/20 rounded-xl">
                <span className="text-2xl">📸</span>
                <div>
                  <strong className="text-on-surface">Getting Started:</strong> Add more items to get better outfit suggestions.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
