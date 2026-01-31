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

// Sub-categories for accessories, jewelry, shoes, and bottoms
const SUB_CATEGORIES = {
  bottoms: [
    { value: 'jeans', label: 'Jeans', icon: '👖' },
    { value: 'dress_pants', label: 'Dress Pants', icon: '👔' },
    { value: 'casual_pants', label: 'Casual Pants', icon: '👖' },
    { value: 'cargo_pants', label: 'Cargo Pants', icon: '🎒' },
    { value: 'shorts', label: 'Shorts', icon: '🩳' },
    { value: 'skirt', label: 'Skirts', icon: '👗' },
    { value: 'leggings', label: 'Leggings', icon: '🧘' },
    { value: 'joggers', label: 'Joggers', icon: '🏃' },
  ],
  accessories: [
    { value: 'purse', label: 'Purses', icon: '👜' },
    { value: 'bag', label: 'Bags', icon: '🎒' },
    { value: 'backpack', label: 'Backpacks', icon: '🎒' },
    { value: 'belt', label: 'Belts', icon: '👔' },
    { value: 'hat', label: 'Hats', icon: '🎩' },
    { value: 'scarf', label: 'Scarves', icon: '🧣' },
  ],
  jewelry: [
    { value: 'necklace', label: 'Necklaces', icon: '📿' },
    { value: 'earrings', label: 'Earrings', icon: '💎' },
    { value: 'bracelet', label: 'Bracelets', icon: '📿' },
    { value: 'ring', label: 'Rings', icon: '💍' },
  ],
  shoes: [
    { value: 'sneakers', label: 'Sneakers', icon: '👟' },
    { value: 'boots', label: 'Boots', icon: '🥾' },
    { value: 'sandals', label: 'Sandals', icon: '🩴' },
    { value: 'heels', label: 'Heels', icon: '👠' },
  ],
} as const;

interface CategoryTabsEnhancedProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  selectedSubCategory?: string | null;
  onSubCategoryChange?: (subCategory: string | null) => void;
}

export default function CategoryTabsEnhanced({
  selectedCategory,
  onCategoryChange,
  selectedSubCategory,
  onSubCategoryChange,
}: CategoryTabsEnhancedProps) {
  const [showSubCategories, setShowSubCategories] = useState(false);

  // Determine if current category has sub-categories
  const hasSubCategories = selectedCategory && selectedCategory in SUB_CATEGORIES;
  const currentSubCategories = hasSubCategories 
    ? SUB_CATEGORIES[selectedCategory as keyof typeof SUB_CATEGORIES]
    : [];

  const handleCategoryClick = (category: string | null) => {
    onCategoryChange(category);
    
    // Show sub-categories if the category has them
    if (category && category in SUB_CATEGORIES) {
      setShowSubCategories(true);
    } else {
      setShowSubCategories(false);
      if (onSubCategoryChange) {
        onSubCategoryChange(null);
      }
    }
  };

  return (
    <div className="sticky top-16 z-10 bg-surface-container shadow-elevation-1">
      {/* Main category tabs */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 p-4 min-w-max">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-5 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 min-h-[48px] ${
              selectedCategory === null
                ? 'bg-primary text-on-primary shadow-elevation-2'
                : 'bg-surface-variant text-on-surface-variant hover:shadow-elevation-1'
            }`}
            aria-label="Show all items from all categories"
          >
            All Items
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryClick(category.value)}
              className={`px-5 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 min-h-[48px] ${
                selectedCategory === category.value
                  ? 'bg-primary text-on-primary shadow-elevation-2'
                  : 'bg-surface-variant text-on-surface-variant hover:shadow-elevation-1'
              }`}
              aria-label={`Filter by ${category.label} category`}
            >
              <span className="text-xl" aria-hidden="true">{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sub-category chips - ADHD-friendly progressive disclosure */}
      {showSubCategories && hasSubCategories && currentSubCategories.length > 0 && (
        <div className="border-t border-outline-variant/30 bg-surface-container-low">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 px-4 py-3 min-w-max">
              <button
                onClick={() => onSubCategoryChange && onSubCategoryChange(null)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 min-h-[40px] ${
                  selectedSubCategory === null || selectedSubCategory === undefined
                    ? 'bg-secondary text-on-secondary shadow-elevation-1'
                    : 'bg-surface-variant/50 text-on-surface-variant hover:bg-surface-variant'
                }`}
                aria-label={`Show all ${selectedCategory}`}
              >
                All {selectedCategory}
              </button>
              {currentSubCategories.map((subCat) => (
                <button
                  key={subCat.value}
                  onClick={() => onSubCategoryChange && onSubCategoryChange(subCat.value)}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 min-h-[40px] ${
                    selectedSubCategory === subCat.value
                      ? 'bg-secondary text-on-secondary shadow-elevation-1'
                      : 'bg-surface-variant/50 text-on-surface-variant hover:bg-surface-variant'
                  }`}
                >
                  <span className="text-base">{subCat.icon}</span>
                  <span>{subCat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
