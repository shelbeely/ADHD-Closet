'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ClosetRail from '../components/ClosetRail';

interface Item {
  id: string;
  title: string;
  category: string;
  images: Array<{ id: string; kind: string; }>;
}

export default function ClosetRailPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { value: 'all', label: 'All Items', icon: '👔' },
    { value: 'tops', label: 'Tops', icon: '👕' },
    { value: 'bottoms', label: 'Bottoms', icon: '👖' },
    { value: 'dresses', label: 'Dresses', icon: '👗' },
    { value: 'outerwear', label: 'Outerwear', icon: '🧥' },
    { value: 'shoes', label: 'Shoes', icon: '👟' },
    { value: 'accessories', label: 'Accessories', icon: '🎒' },
    { value: 'underwear', label: 'Underwear', icon: '🩲' },
    { value: 'jewelry', label: 'Jewelry', icon: '💍' },
  ];

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, searchQuery]);

  async function fetchItems() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('state', 'available'); // Only show available items
      params.append('limit', '50'); // Limit for performance

      const response = await fetch(`/api/items?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }

  const railItems = items.map(item => {
    const thumbnail = item.images.find(img => img.kind === 'thumbnail' || img.kind === 'ai_catalog');
    return {
      id: item.id,
      title: item.title || 'Untitled',
      category: item.category,
      thumbnailUrl: thumbnail ? `/api/images/${thumbnail.id}` : undefined,
    };
  });

  function handleItemClick(item: { id: string }) {
    router.push(`/items/${item.id}`);
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Top app bar - Material Design 3 */}
      <header className="bg-surface-container border-b border-outline-variant sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-full hover:bg-surface-variant transition-colors"
                aria-label="Back to home"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-headline-medium text-on-surface">3D Closet Rail</h1>
                <p className="text-body-small text-on-surface-variant">
                  Browse your wardrobe in 3D • {items.length} items
                </p>
              </div>
            </div>
          </div>

          {/* Category filter chips - ADHD-optimized: clear visual grouping */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all
                  ${selectedCategory === cat.value
                    ? 'bg-primary text-on-primary elevation-1'
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                  }
                `}
              >
                <span>{cat.icon}</span>
                <span className="text-label-large">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-screen-2xl mx-auto p-4">
        {loading ? (
          <div className="h-[600px] bg-surface-container rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-title-medium text-on-surface-variant">Loading your closet...</p>
            </div>
          </div>
        ) : (
          <div className="relative h-[600px]">
            <ClosetRail
              items={railItems}
              onItemClick={handleItemClick}
              className="w-full h-full"
            />
          </div>
        )}

        {/* ADHD-optimized help section - progressive disclosure */}
        <div className="mt-6 bg-surface-container rounded-2xl p-6">
          <h2 className="text-title-large text-on-surface mb-4">💡 Using the 3D Closet Rail</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-surface-variant rounded-xl p-4">
              <div className="text-3xl mb-2">🖱️</div>
              <h3 className="text-title-medium text-on-surface mb-2">Navigate</h3>
              <p className="text-body-small text-on-surface-variant">
                Drag to rotate the view, scroll to zoom in/out, click items to view details
              </p>
            </div>
            <div className="bg-surface-variant rounded-xl p-4">
              <div className="text-3xl mb-2">🏷️</div>
              <h3 className="text-title-medium text-on-surface mb-2">Filter</h3>
              <p className="text-body-small text-on-surface-variant">
                Use category chips above to focus on specific types of clothing
              </p>
            </div>
            <div className="bg-surface-variant rounded-xl p-4">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="text-title-medium text-on-surface mb-2">Performance</h3>
              <p className="text-body-small text-on-surface-variant">
                Images load lazily as you browse. Limited to 50 items for smooth performance
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
