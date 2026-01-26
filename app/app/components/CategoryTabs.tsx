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
    <div className="sticky top-16 z-10 bg-surface-container shadow-elevation-1">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 p-4 min-w-max">
          <button
            onClick={() => onCategoryChange(null)}
            className={`px-5 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 min-h-[48px] ${
              selectedCategory === null
                ? 'bg-primary text-on-primary shadow-elevation-2'
                : 'bg-surface-variant text-on-surface-variant hover:shadow-elevation-1'
            }`}
          >
            All Items
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category.value}
              onClick={() => onCategoryChange(category.value)}
              className={`px-5 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 min-h-[48px] ${
                selectedCategory === category.value
                  ? 'bg-primary text-on-primary shadow-elevation-2'
                  : 'bg-surface-variant text-on-surface-variant hover:shadow-elevation-1'
              }`}
            >
              <span className="text-xl">{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
