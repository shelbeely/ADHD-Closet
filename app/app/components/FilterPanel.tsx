'use client';

import { useState } from 'react';

interface FilterPanelProps {
  onFilterChange: (filters: any) => void;
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
  { value: 'laundry', label: 'In Laundry' },
  { value: 'unavailable', label: 'Unavailable' },
  { value: 'donate', label: 'To Donate' },
];

const CLEAN_STATUSES = [
  { value: 'clean', label: 'Clean', icon: '✨' },
  { value: 'dirty', label: 'Dirty', icon: '🧺' },
  { value: 'needs_wash', label: 'Needs Wash', icon: '🚿' },
];

const FRANCHISE_TYPES = [
  { value: 'band', label: 'Band Merch', icon: '🎸' },
  { value: 'movie', label: 'Movies', icon: '🎬' },
  { value: 'tv_show', label: 'TV Shows', icon: '📺' },
  { value: 'game', label: 'Video Games', icon: '🎮' },
  { value: 'anime', label: 'Anime', icon: '⚡' },
  { value: 'comic', label: 'Comics', icon: '💥' },
  { value: 'sports', label: 'Sports Teams', icon: '⚽' },
  { value: 'brand', label: 'Brands', icon: '🏷️' },
  { value: 'other', label: 'Other', icon: '🌟' },
];

/**
 * Desktop Filter Panel
 * 
 * Design Decisions (M3 + ADHD-optimized):
 * - Fixed left panel (240px) prevents layout shift (reduces cognitive load)
 * - Clear visual sections with spacing (vertical rhythm)
 * - Filter chips use M3 tonal style (not overwhelming)
 * - Selected state uses primary color (clear visual feedback)
 * - Collapsible sections for progressive disclosure
 * - No more than 8 categories visible (limit choices)
 */
export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCleanStatuses, setSelectedCleanStatuses] = useState<string[]>([]);
  const [selectedFranchiseTypes, setSelectedFranchiseTypes] = useState<string[]>([]);
  const [licensedMerchOnly, setLicensedMerchOnly] = useState(false);
  const [franchiseSearch, setFranchiseSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGenerated, setShowGenerated] = useState(false); // Default: hide AI-generated items

  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    onFilterChange({ 
      categories: newCategories, 
      states: selectedStates, 
      cleanStatuses: selectedCleanStatuses,
      franchiseTypes: selectedFranchiseTypes,
      licensedMerchOnly,
      franchiseSearch,
      search: searchQuery,
      showGenerated
    });
  };

  const toggleState = (state: string) => {
    const newStates = selectedStates.includes(state)
      ? selectedStates.filter(s => s !== state)
      : [...selectedStates, state];
    
    setSelectedStates(newStates);
    onFilterChange({ 
      categories: selectedCategories, 
      states: newStates, 
      cleanStatuses: selectedCleanStatuses,
      franchiseTypes: selectedFranchiseTypes,
      licensedMerchOnly,
      franchiseSearch,
      search: searchQuery,
      showGenerated
    });
  };

  const toggleCleanStatus = (status: string) => {
    const newStatuses = selectedCleanStatuses.includes(status)
      ? selectedCleanStatuses.filter(s => s !== status)
      : [...selectedCleanStatuses, status];
    
    setSelectedCleanStatuses(newStatuses);
    onFilterChange({ 
      categories: selectedCategories, 
      states: selectedStates, 
      cleanStatuses: newStatuses,
      franchiseTypes: selectedFranchiseTypes,
      licensedMerchOnly,
      franchiseSearch,
      search: searchQuery,
      showGenerated
    });
  };

  const toggleFranchiseType = (type: string) => {
    const newTypes = selectedFranchiseTypes.includes(type)
      ? selectedFranchiseTypes.filter(t => t !== type)
      : [...selectedFranchiseTypes, type];
    
    setSelectedFranchiseTypes(newTypes);
    onFilterChange({ 
      categories: selectedCategories, 
      states: selectedStates, 
      cleanStatuses: selectedCleanStatuses,
      franchiseTypes: newTypes,
      licensedMerchOnly,
      franchiseSearch,
      search: searchQuery,
      showGenerated
    });
  };

  const toggleLicensedMerchOnly = () => {
    const newValue = !licensedMerchOnly;
    setLicensedMerchOnly(newValue);
    onFilterChange({ 
      categories: selectedCategories, 
      states: selectedStates, 
      cleanStatuses: selectedCleanStatuses,
      franchiseTypes: selectedFranchiseTypes,
      licensedMerchOnly: newValue,
      franchiseSearch,
      search: searchQuery,
      showGenerated
    });
  };

  const handleFranchiseSearch = (value: string) => {
    setFranchiseSearch(value);
    onFilterChange({ 
      categories: selectedCategories, 
      states: selectedStates, 
      cleanStatuses: selectedCleanStatuses,
      franchiseTypes: selectedFranchiseTypes,
      licensedMerchOnly,
      franchiseSearch: value,
      search: searchQuery,
      showGenerated
    });
  };

  const toggleShowGenerated = () => {
    const newValue = !showGenerated;
    setShowGenerated(newValue);
    onFilterChange({ 
      categories: selectedCategories, 
      states: selectedStates, 
      cleanStatuses: selectedCleanStatuses,
      franchiseTypes: selectedFranchiseTypes,
      licensedMerchOnly,
      franchiseSearch,
      search: searchQuery,
      showGenerated: newValue
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedStates([]);
    setSelectedCleanStatuses([]);
    setSelectedFranchiseTypes([]);
    setLicensedMerchOnly(false);
    setFranchiseSearch('');
    setSearchQuery('');
    setShowGenerated(false); // Reset to default (hide generated)
    onFilterChange({ 
      categories: [], 
      states: [], 
      cleanStatuses: [], 
      franchiseTypes: [],
      licensedMerchOnly: false,
      franchiseSearch: '',
      search: '',
      showGenerated: false
    });
  };

  const hasFilters = selectedCategories.length > 0 || selectedStates.length > 0 || selectedCleanStatuses.length > 0 || selectedFranchiseTypes.length > 0 || licensedMerchOnly || franchiseSearch || searchQuery || showGenerated;

  return (
    <aside className="w-60 h-full bg-surface-container-low border-r border-outline flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-outline">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-title-large text-on-surface">Filters</h2>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-label-small text-primary hover:bg-primary/10 px-2 py-1 rounded-lg transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Search - ADHD: Always visible, prominent */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onFilterChange({ 
                categories: selectedCategories, 
                states: selectedStates, 
                cleanStatuses: selectedCleanStatuses,
                franchiseTypes: selectedFranchiseTypes,
                licensedMerchOnly,
                franchiseSearch,
                search: e.target.value,
                showGenerated
              });
            }}
            placeholder="Search items..."
            className="w-full px-4 py-3 pl-10 bg-surface-container border border-outline rounded-xl text-body-medium text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-0 transition-colors"
          />
          <svg
            className="absolute left-3 top-3.5 w-5 h-5 text-on-surface-variant"
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
        </div>
      </div>

      {/* Scrollable Filter Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Category Filters */}
        <div>
          <h3 className="text-label-large text-on-surface mb-3">Category</h3>
          <div className="space-y-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => toggleCategory(category.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  selectedCategories.includes(category.value)
                    ? 'bg-primary-container text-on-primary-container'
                    : 'hover:bg-surface-variant text-on-surface'
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span className="text-body-medium flex-1">{category.label}</span>
                {selectedCategories.includes(category.value) && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* State Filters */}
        <div>
          <h3 className="text-label-large text-on-surface mb-3">State</h3>
          <div className="space-y-2">
            {STATES.map((state) => (
              <button
                key={state.value}
                onClick={() => toggleState(state.value)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                  selectedStates.includes(state.value)
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'hover:bg-surface-variant text-on-surface'
                }`}
              >
                <span className="text-body-medium">{state.label}</span>
                {selectedStates.includes(state.value) && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Status Filters */}
        <div>
          <h3 className="text-label-large text-on-surface mb-3">Cleanliness</h3>
          <div className="space-y-2">
            {CLEAN_STATUSES.map((status) => (
              <button
                key={status.value}
                onClick={() => toggleCleanStatus(status.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  selectedCleanStatuses.includes(status.value)
                    ? 'bg-tertiary-container text-on-tertiary-container'
                    : 'hover:bg-surface-variant text-on-surface'
                }`}
              >
                <span className="text-xl">{status.icon}</span>
                <span className="text-body-medium flex-1">{status.label}</span>
                {selectedCleanStatuses.includes(status.value) && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Licensed Merch & Franchise Filters */}
        <div>
          <h3 className="text-label-large text-on-surface mb-3">Licensed Merch 🎸</h3>
          
          {/* Show Licensed Merch Only Toggle */}
          <button
            onClick={toggleLicensedMerchOnly}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all mb-3 ${
              licensedMerchOnly
                ? 'bg-primary-container text-on-primary-container'
                : 'hover:bg-surface-variant text-on-surface'
            }`}
          >
            <span className="text-xl">🏷️</span>
            <span className="text-body-medium flex-1">Licensed Merch Only</span>
            {licensedMerchOnly && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* Franchise Search */}
          <div className="relative mb-3">
            <input
              type="text"
              value={franchiseSearch}
              onChange={(e) => handleFranchiseSearch(e.target.value)}
              placeholder="Search franchises... (e.g., 'Slipknot')"
              className="w-full px-3 py-2.5 pl-9 bg-surface-container border border-outline rounded-xl text-body-small text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-0 transition-colors"
            />
            <svg
              className="absolute left-2.5 top-3 w-4 h-4 text-on-surface-variant"
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
          </div>

          {/* Franchise Type Filters */}
          <div className="space-y-2">
            {FRANCHISE_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => toggleFranchiseType(type.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  selectedFranchiseTypes.includes(type.value)
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'hover:bg-surface-variant text-on-surface'
                }`}
              >
                <span className="text-xl">{type.icon}</span>
                <span className="text-body-medium flex-1">{type.label}</span>
                {selectedFranchiseTypes.includes(type.value) && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Show AI-Generated Items Toggle */}
        <div>
          <h3 className="text-label-large text-on-surface mb-3">AI-Generated Items 🤖</h3>
          <button
            onClick={toggleShowGenerated}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
              showGenerated
                ? 'bg-tertiary-container text-on-tertiary-container'
                : 'hover:bg-surface-variant text-on-surface'
            }`}
          >
            <span className="text-xl">{showGenerated ? '👁️' : '🙈'}</span>
            <span className="text-body-medium flex-1">
              {showGenerated ? 'Showing AI-Generated' : 'Only Real Clothes'}
            </span>
            {showGenerated && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
          <p className="text-caption text-on-surface-variant mt-2 px-3">
            {showGenerated 
              ? 'Includes color variations and AI-generated items' 
              : 'Only showing your actual wardrobe items'}
          </p>
        </div>
      </div>
    </aside>
  );
}
