'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CategoryTabs from './components/CategoryTabs';
import ItemGrid from './components/ItemGrid';
import AddItemButton from './components/AddItemButton';
import FilterPanel from './components/FilterPanel';
import BulkEditTable from './components/BulkEditTable';

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

/**
 * Home Page - Responsive Design
 * 
 * Design Decisions (M3 + ADHD-optimized):
 * - Mobile (<1024px): Category tabs + grid view (Phase 2 implementation)
 * - Desktop (≥1024px): Filter panel + table view (Phase 4 implementation)
 * Breakpoint at 1024px aligns with M3 responsive guidelines
 * - Desktop adds power tools without removing mobile simplicity
 * - View toggle allows users to choose preferred mode on desktop
 * - Filter panel is always visible on desktop (no hidden sidebar)
 * - Table view enables bulk operations (reduce repetitive actions)
 */
export default function Home() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [desktopView, setDesktopView] = useState<'grid' | 'table'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, filters]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Mobile: single category filter
      if (!isDesktop && selectedCategory) {
        params.append('category', selectedCategory);
      }
      
      // Desktop: multi-filter support
      if (isDesktop) {
        if (filters.categories && filters.categories.length > 0) {
          filters.categories.forEach((cat: string) => params.append('category', cat));
        }
        if (filters.states && filters.states.length > 0) {
          filters.states.forEach((state: string) => params.append('state', state));
        }
        if (filters.search) {
          params.append('search', filters.search);
        }
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

  const handleBulkAction = async (action: string, ids: string[]) => {
    console.log('Bulk action:', action, ids);
    // TODO: Implement bulk actions
    alert(`Bulk action: ${action} for ${ids.length} items`);
  };

  // Mobile View
  if (!isDesktop) {
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
                {totalCount > 0 && (
                  <p className="text-label-small text-on-surface-variant">
                    {totalCount} {totalCount === 1 ? 'item' : 'items'}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
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
              
              <div className="relative">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="w-12 h-12 hover:bg-surface-variant rounded-full flex items-center justify-center transition-colors"
                  aria-label="Menu"
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
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                
                {mobileMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-20" 
                      onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container rounded-2xl shadow-elevation-3 overflow-hidden z-30">
                      <button
                        onClick={() => {
                          router.push('/guide');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors text-left"
                      >
                        <span className="text-2xl">📖</span>
                        <div>
                          <p className="text-body-large text-on-surface">Fit & Proportion Guide</p>
                          <p className="text-body-small text-on-surface-variant">Learn about styling</p>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          router.push('/outfits/generate');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors text-left"
                      >
                        <span className="text-2xl">✨</span>
                        <div>
                          <p className="text-body-large text-on-surface">Generate Outfits</p>
                          <p className="text-body-small text-on-surface-variant">AI outfit suggestions</p>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          router.push('/settings');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors text-left"
                      >
                        <span className="text-2xl">⚙️</span>
                        <div>
                          <p className="text-body-large text-on-surface">Settings</p>
                          <p className="text-body-small text-on-surface-variant">Export & Import</p>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Category Tabs */}
        <CategoryTabs
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Main Content */}
        <main className="pb-24">
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

          <ItemGrid items={items} loading={loading} />
        </main>

        <AddItemButton />
      </div>
    );
  }

  // Desktop View
  return (
    <div className="h-screen flex flex-col bg-surface">
      {/* Desktop Top Bar */}
      <header className="bg-surface-container border-b border-outline px-6 h-16 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-on-primary text-xl">
            👕
          </div>
          <div>
            <h1 className="text-title-large text-on-surface">
              My Closet
            </h1>
            {totalCount > 0 && (
              <p className="text-label-small text-on-surface-variant">
                {totalCount} {totalCount === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 3D Closet Rail Link */}
          <button
            onClick={() => router.push('/closet-rail')}
            className="px-4 py-2 bg-surface-variant text-on-surface rounded-full text-label-large hover:bg-surface-container-high transition-all flex items-center gap-2"
            title="View your closet in 3D"
          >
            <span>🪝</span>
            <span>3D Rail</span>
          </button>

          {/* Outfit Generator Link */}
          <button
            onClick={() => router.push('/outfits/generate')}
            className="px-4 py-2 bg-surface-variant text-on-surface rounded-full text-label-large hover:bg-surface-container-high transition-all flex items-center gap-2"
            title="Generate outfits"
          >
            <span>✨</span>
            <span>Outfits</span>
          </button>

          {/* Guide Link */}
          <button
            onClick={() => router.push('/guide')}
            className="px-4 py-2 bg-surface-variant text-on-surface rounded-full text-label-large hover:bg-surface-container-high transition-all flex items-center gap-2"
            title="Fit & Proportion Guide"
          >
            <span>📖</span>
            <span>Guide</span>
          </button>

          {/* Settings Link */}
          <button
            onClick={() => router.push('/settings')}
            className="px-4 py-2 bg-surface-variant text-on-surface rounded-full text-label-large hover:bg-surface-container-high transition-all flex items-center gap-2"
            title="Export & Import"
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>

          {/* View Toggle */}
          <div className="flex bg-surface-variant rounded-full p-1">
            <button
              onClick={() => setDesktopView('table')}
              className={`px-4 py-2 rounded-full text-label-medium transition-all ${
                desktopView === 'table'
                  ? 'bg-primary text-on-primary shadow-elevation-1'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setDesktopView('grid')}
              className={`px-4 py-2 rounded-full text-label-medium transition-all ${
                desktopView === 'grid'
                  ? 'bg-primary text-on-primary shadow-elevation-1'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Grid
            </button>
          </div>

          <button
            onClick={() => router.push('/items/new')}
            className="px-5 py-2.5 bg-primary text-on-primary rounded-full text-label-large font-medium shadow-elevation-1 hover:shadow-elevation-2 transition-all"
          >
            Add Item
          </button>
        </div>
      </header>

      {/* Desktop Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Filter Panel */}
        <FilterPanel onFilterChange={setFilters} />

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {desktopView === 'table' ? (
            <BulkEditTable
              items={items}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onBulkAction={handleBulkAction}
            />
          ) : (
            <div className="p-6">
              <ItemGrid items={items} loading={loading} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

