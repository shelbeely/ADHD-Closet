'use client';

import { useState, useEffect } from 'react';

interface EnhancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  state?: string;
  tags?: string[];
  brand?: string;
  colors?: string[];
}

const CATEGORIES = [
  { value: 'tops', label: 'Tops', icon: '👕' },
  { value: 'bottoms', label: 'Bottoms', icon: '👖' },
  { value: 'dresses', label: 'Dresses', icon: '👗' },
  { value: 'outerwear', label: 'Outerwear', icon: '🧥' },
  { value: 'shoes', label: 'Shoes', icon: '👟' },
  { value: 'accessories', label: 'Accessories', icon: '🎒' },
  { value: 'underwear_bras', label: 'Underwear', icon: '🩲' },
  { value: 'jewelry', label: 'Jewelry', icon: '💍' },
];

const STATES = [
  { value: 'available', label: 'Available' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'unavailable', label: 'Unavailable' },
  { value: 'donate', label: 'Donate' },
];

/**
 * Enhanced Search Component
 * 
 * Material Design 3 + ADHD-optimized:
 * - Progressive disclosure: Advanced filters hidden until needed
 * - Real-time results as you type
 * - Clear all filters button
 * - Mobile-friendly with collapsible sections
 * - Visual indicators for active filters
 */
export default function EnhancedSearch({ onSearch, initialFilters = {} }: EnhancedSearchProps) {
  const [query, setQuery] = useState(initialFilters.query || '');
  const [category, setCategory] = useState(initialFilters.category || '');
  const [state, setState] = useState(initialFilters.state || '');
  const [brand, setBrand] = useState(initialFilters.brand || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters.tags || []);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    // Load available tags
    fetch('/api/tags')
      .then(res => res.json())
      .then(data => setAvailableTags(data.tags?.map((t: any) => t.name) || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Trigger search on filter change (debounced)
    const timer = setTimeout(() => {
      onSearch({
        query: query || undefined,
        category: category || undefined,
        state: state || undefined,
        brand: brand || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, category, state, brand, selectedTags]);

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setState('');
    setBrand('');
    setSelectedTags([]);
  };

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const hasActiveFilters = query || category || state || brand || selectedTags.length > 0;

  return (
    <div className="bg-surface-container rounded-3xl shadow-elevation-1 p-4 md:p-6 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, brand, colors, tags..."
          className="w-full pl-12 pr-12 py-3 rounded-full bg-surface border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          aria-label="Search items"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-variant rounded-full transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 rounded-full bg-surface border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>

        {/* State Filter */}
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="px-4 py-2 rounded-full bg-surface border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        >
          <option value="">All States</option>
          {STATES.map(s => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Advanced Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            showAdvanced
              ? 'bg-primary text-on-primary'
              : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          {showAdvanced ? '− Less' : '+ More'}
        </button>

        {/* Clear All */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-full bg-error/10 text-error hover:bg-error/20 font-medium transition-all"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-outline/20">
          {/* Brand Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Filter by brand..."
              className="w-full px-4 py-2 rounded-xl bg-surface border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Tag Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-error transition-colors"
                    aria-label="Remove tag filter"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag(tagInput)}
                placeholder="Add tag filter..."
                list="available-tags"
                className="flex-1 px-4 py-2 rounded-xl bg-surface border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                onClick={() => addTag(tagInput)}
                className="px-6 py-2 bg-primary text-on-primary rounded-xl font-medium hover:shadow-elevation-2 transition-all"
              >
                Add
              </button>
            </div>
            <datalist id="available-tags">
              {availableTags.map(tag => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="text-sm text-on-surface-variant">
          {[
            query && `"${query}"`,
            category && CATEGORIES.find(c => c.value === category)?.label,
            state && STATES.find(s => s.value === state)?.label,
            brand && `Brand: ${brand}`,
            selectedTags.length > 0 && `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}`,
          ].filter(Boolean).join(' • ')}
        </div>
      )}
    </div>
  );
}
