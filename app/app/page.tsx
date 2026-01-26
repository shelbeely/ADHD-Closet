'use client';

import { useEffect, useState } from 'react';
import CategoryTabs from './components/CategoryTabs';
import ItemGrid from './components/ItemGrid';
import AddItemButton from './components/AddItemButton';

interface Item {
  id: string;
  title?: string;
  category?: string;
  brand?: string;
  state: string;
  images: Array<{
    id: string;
    kind: string;
  }>;
  tags: Array<{
    name: string;
  }>;
  imageCount: number;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      
      const response = await fetch(`/api/items?${params.toString()}`);
      const data = await response.json();
      setItems(data.items || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Top App Bar - Material Design 3 */}
      <header className="sticky top-0 z-20 bg-surface-container shadow-elevation-2">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-on-primary text-xl">
              👕
            </div>
            <div>
              <h1 className="text-title-large text-on-surface">
                My Closet
              </h1>
              {/* ADHD: Show count for sense of accomplishment */}
              {totalCount > 0 && (
                <p className="text-label-small text-on-surface-variant">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'}
                </p>
              )}
            </div>
          </div>
          
          {/* ADHD: Single clear action button */}
          <button
            onClick={() => {
              const query = prompt('Search your closet...');
              if (query !== null) {
                setSearchQuery(query);
              }
            }}
            className="w-12 h-12 hover:bg-surface-variant rounded-full flex items-center justify-center transition-colors"
            aria-label="Search items"
          >
            <svg
              className="w-6 h-6 text-on-surface-variant"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Category Tabs - ADHD: Category-first navigation reduces overwhelm */}
      <CategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Main Content */}
      <main className="pb-24">
        {/* ADHD: Empty state with clear next action */}
        {!loading && items.length === 0 && !selectedCategory && (
          <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh]">
            <div className="w-32 h-32 bg-primary-container rounded-full flex items-center justify-center text-6xl mb-6">
              ✨
            </div>
            <h2 className="text-headline-small text-on-surface mb-2">
              Welcome to your closet!
            </h2>
            <p className="text-body-large text-on-surface-variant mb-8 max-w-sm">
              Add your first item to get started. It only takes 30 seconds.
            </p>
            <button
              onClick={() => window.location.href = '/items/new'}
              className="px-6 py-4 bg-primary text-on-primary rounded-full text-label-large font-medium shadow-elevation-1 hover:shadow-elevation-2 transition-all"
            >
              Add your first item
            </button>
          </div>
        )}

        {/* ADHD: Category filter shows focused subset */}
        {!loading && items.length === 0 && selectedCategory && (
          <div className="flex flex-col items-center justify-center p-12 text-center min-h-[40vh]">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-title-large text-on-surface mb-2">
              No items in this category
            </h3>
            <p className="text-body-medium text-on-surface-variant mb-6">
              Try a different category or add new items
            </p>
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-4 py-2 bg-surface-variant text-on-surface-variant rounded-full text-label-large hover:bg-surface-container-high transition-colors"
            >
              View all items
            </button>
          </div>
        )}

        {/* Item Grid */}
        <ItemGrid items={items} loading={loading} />
      </main>

      {/* Floating Action Button - ADHD: Always visible, consistent location */}
      <AddItemButton />
    </div>
  );
}

