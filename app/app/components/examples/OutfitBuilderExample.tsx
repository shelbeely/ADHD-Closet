'use client';

/**
 * Example: Outfit Builder Page with OUI Integration
 * 
 * This example demonstrates how to integrate the new OUI components:
 * - SmartAccessorySuggestions
 * - CategoryTabsEnhanced
 * - ColorCompatibilityBadge
 * 
 * This file is for reference/documentation purposes and shows the recommended
 * integration pattern for the Orchestrated User Interface.
 */

import { useState, useEffect } from 'react';
import SmartAccessorySuggestions from '@/app/components/SmartAccessorySuggestions';
import CategoryTabsEnhanced from '@/app/components/CategoryTabsEnhanced';
import ColorCompatibilityBadge from '@/app/components/ColorCompatibilityBadge';

interface OutfitItem {
  id: string;
  title: string;
  category: string;
  colorPalette?: string[];
  imageUrl?: string;
}

export default function OutfitBuilderExample() {
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  const handleAddAccessory = async (accessoryId: string) => {
    const response = await fetch(`/api/items/${accessoryId}`);
    if (response.ok) {
      const item = await response.json();
      setOutfitItems([...outfitItems, item]);
    }
  };

  const outfitColors = outfitItems.flatMap(item => item.colorPalette || []);

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-20 bg-surface-container shadow-elevation-2 px-4 py-3">
        <h1 className="text-headline-medium font-bold text-on-surface">
          Build Your Outfit
        </h1>
      </header>

      <CategoryTabsEnhanced
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedSubCategory={selectedSubCategory}
        onSubCategoryChange={setSelectedSubCategory}
      />

      <div className="container mx-auto px-4 py-6">
        {outfitItems.length > 0 && (
          <SmartAccessorySuggestions
            outfitItems={outfitItems.map(item => ({
              id: item.id,
              category: item.category,
              colorPalette: item.colorPalette
            }))}
            onAddAccessory={handleAddAccessory}
          />
        )}
      </div>
    </div>
  );
}
