'use client';

import { useState } from 'react';

const CATEGORIES = [
  { value: 'tops', label: 'Tops', icon: '👕' },
  { value: 'bottoms', label: 'Bottoms', icon: '👖' },
  { value: 'dresses', label: 'Dresses', icon: '👗' },
  { value: 'outerwear', label: 'Outerwear', icon: '🧥' },
  { value: 'shoes', label: 'Shoes', icon: '👟' },
  { value: 'accessories', label: 'Accessories', icon: '🎒' },
  { value: 'underwear_bras', label: 'Underwear', icon: '🩲' },
  { value: 'jewelry', label: 'Jewelry', icon: '💍' },
  { value: 'swimwear', label: 'Swimwear', icon: '🩱' },
  { value: 'activewear', label: 'Activewear', icon: '🏃' },
  { value: 'sleepwear', label: 'Sleepwear', icon: '😴' },
  { value: 'loungewear', label: 'Loungewear', icon: '🛋️' },
  { value: 'suits_sets', label: 'Suits & Sets', icon: '👔' },
] as const;

interface CategoryTabsProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function CategoryTabs({
  selectedCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <div 
      className="sticky top-16 z-10 shadow-elevation-1"
      style={{ backgroundColor: 'var(--md-sys-color-surface-container)' }}
    >
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 p-4 min-w-max">
          <button
            onClick={() => onCategoryChange(null)}
            className={`md3-chip md3-state-layer px-5 py-3 rounded-full text-label-large font-medium whitespace-nowrap transition-all min-h-[48px] ${
              selectedCategory === null
                ? 'shadow-elevation-1'
                : ''
            }`}
            style={{
              backgroundColor: selectedCategory === null 
                ? 'var(--md-sys-color-secondary-container)' 
                : 'var(--md-sys-color-surface-variant)',
              color: selectedCategory === null 
                ? 'var(--md-sys-color-on-secondary-container)' 
                : 'var(--md-sys-color-on-surface-variant)',
            }}
          >
            All Items
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category.value}
              onClick={() => onCategoryChange(category.value)}
              className={`md3-chip md3-state-layer px-5 py-3 rounded-full text-label-large font-medium whitespace-nowrap transition-all flex items-center gap-2 min-h-[48px] ${
                selectedCategory === category.value
                  ? 'shadow-elevation-1'
                  : ''
              }`}
              style={{
                backgroundColor: selectedCategory === category.value 
                  ? 'var(--md-sys-color-secondary-container)' 
                  : 'var(--md-sys-color-surface-variant)',
                color: selectedCategory === category.value 
                  ? 'var(--md-sys-color-on-secondary-container)' 
                  : 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              <span className="text-xl" role="img" aria-label={category.label}>
                {category.icon}
              </span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
