'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
}

interface BulkEditTableProps {
  items: Item[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onBulkAction: (action: string, ids: string[]) => void;
}

/**
 * Bulk Edit Table Component
 * 
 * Design Decisions (M3 + ADHD-optimized):
 * - Table layout on desktop (>= 1024px) for efficient scanning
 * - Keyboard-driven multi-select (Shift+Click, Cmd/Ctrl+A)
 * - Selected rows use primary-container (clear visual feedback)
 * - Sticky header prevents disorientation during scroll
 * - Row hover state provides immediate feedback
 * - Actions bar appears only when items selected (progressive disclosure)
 * - Maximum 50 items per page to avoid overwhelm
 * - Checkbox targets are 40x40px (comfortable interaction)
 */
export default function BulkEditTable({
  items,
  selectedIds,
  onSelectionChange,
  onBulkAction,
}: BulkEditTableProps) {
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + A: Select all
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && items.length > 0) {
        e.preventDefault();
        onSelectionChange(items.map(item => item.id));
      }

      // Escape: Clear selection
      if (e.key === 'Escape' && selectedIds.length > 0) {
        onSelectionChange([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIds, onSelectionChange]);

  const handleRowClick = (itemId: string, index: number, e: React.MouseEvent) => {
    if (e.shiftKey && lastSelectedIndex !== null) {
      // Shift+Click: Select range
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeIds = items.slice(start, end + 1).map(item => item.id);
      const newSelection = Array.from(new Set([...selectedIds, ...rangeIds]));
      onSelectionChange(newSelection);
    } else if (e.metaKey || e.ctrlKey) {
      // Cmd/Ctrl+Click: Toggle individual
      const newSelection = selectedIds.includes(itemId)
        ? selectedIds.filter(id => id !== itemId)
        : [...selectedIds, itemId];
      onSelectionChange(newSelection);
      setLastSelectedIndex(index);
    } else {
      // Regular click: Select only this item
      onSelectionChange([itemId]);
      setLastSelectedIndex(index);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(item => item.id));
    }
  };

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-title-large text-on-surface mb-2">
          No items match filters
        </h3>
        <p className="text-body-medium text-on-surface-variant">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Bulk Actions Bar - ADHD: Progressive disclosure, only shows when needed */}
      {selectedIds.length > 0 && (
        <div className="bg-primary-container border-b border-outline p-4 flex items-center gap-4">
          <span className="text-body-large text-on-primary-container font-medium">
            {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onBulkAction('change-state', selectedIds)}
              className="px-4 py-2 bg-primary text-on-primary rounded-full text-label-large font-medium hover:shadow-elevation-1 transition-all"
            >
              Change State
            </button>
            <button
              onClick={() => onBulkAction('add-tags', selectedIds)}
              className="px-4 py-2 bg-surface-variant text-on-surface-variant rounded-full text-label-large hover:bg-surface-container-high transition-colors"
            >
              Add Tags
            </button>
            <button
              onClick={() => onBulkAction('run-ai', selectedIds)}
              className="px-4 py-2 bg-surface-variant text-on-surface-variant rounded-full text-label-large hover:bg-surface-container-high transition-colors"
            >
              Run AI Inference
            </button>
          </div>
          <button
            onClick={() => onSelectionChange([])}
            className="ml-auto p-2 hover:bg-primary/10 rounded-lg transition-colors"
            aria-label="Clear selection"
          >
            <svg className="w-6 h-6 text-on-primary-container" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-surface-container border-b border-outline z-10">
            <tr>
              <th className="w-12 p-4 text-left">
                <button
                  onClick={toggleSelectAll}
                  className="w-6 h-6 rounded-md border-2 border-outline flex items-center justify-center hover:border-primary transition-colors"
                  style={{
                    backgroundColor: isAllSelected ? 'var(--md-sys-color-primary)' : 'transparent',
                    borderColor: isSomeSelected || isAllSelected ? 'var(--md-sys-color-primary)' : undefined,
                  }}
                >
                  {isAllSelected && (
                    <svg className="w-4 h-4 text-on-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {isSomeSelected && !isAllSelected && (
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </th>
              <th className="p-4 text-left text-label-large text-on-surface">Image</th>
              <th className="p-4 text-left text-label-large text-on-surface">Title</th>
              <th className="p-4 text-left text-label-large text-on-surface">Category</th>
              <th className="p-4 text-left text-label-large text-on-surface">Brand</th>
              <th className="p-4 text-left text-label-large text-on-surface">State</th>
              <th className="p-4 text-left text-label-large text-on-surface">Tags</th>
              <th className="w-12 p-4"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <tr
                  key={item.id}
                  onClick={(e) => handleRowClick(item.id, index, e)}
                  className={`border-b border-outline cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary-container'
                      : 'hover:bg-surface-variant'
                  }`}
                >
                  <td className="p-4">
                    <div
                      className="w-6 h-6 rounded-md border-2 border-outline flex items-center justify-center"
                      style={{
                        backgroundColor: isSelected ? 'var(--md-sys-color-primary)' : 'transparent',
                        borderColor: isSelected ? 'var(--md-sys-color-primary)' : undefined,
                      }}
                    >
                      {isSelected && (
                        <svg className="w-4 h-4 text-on-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {item.images[0] ? (
                      <img
                        src={`/api/images/${item.images[0].id}`}
                        alt={item.title || 'Item'}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-surface-variant rounded-lg flex items-center justify-center text-xl">
                        👕
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-body-medium text-on-surface">
                    {item.title || '—'}
                  </td>
                  <td className="p-4 text-body-medium text-on-surface">
                    {item.category || '—'}
                  </td>
                  <td className="p-4 text-body-medium text-on-surface">
                    {item.brand || '—'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-label-small ${
                      item.state === 'available' ? 'bg-tertiary-container text-on-tertiary-container' :
                      item.state === 'laundry' ? 'bg-secondary-container text-on-secondary-container' :
                      'bg-surface-variant text-on-surface-variant'
                    }`}>
                      {item.state}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag.name}
                          className="text-label-small px-2 py-0.5 bg-surface-variant rounded-lg text-on-surface-variant"
                        >
                          {tag.name}
                        </span>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="text-label-small px-2 py-0.5 bg-surface-variant rounded-lg text-on-surface-variant">
                          +{item.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/items/${item.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-surface-variant rounded-lg inline-block transition-colors"
                    >
                      <svg className="w-5 h-5 text-on-surface" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Keyboard Shortcuts Hint - ADHD: Discoverable shortcuts */}
      <div className="border-t border-outline p-3 bg-surface-container-low">
        <div className="flex gap-6 text-label-small text-on-surface-variant">
          <span><kbd className="px-2 py-1 bg-surface-variant rounded text-on-surface">⌘/Ctrl</kbd> + Click = Toggle</span>
          <span><kbd className="px-2 py-1 bg-surface-variant rounded text-on-surface">Shift</kbd> + Click = Range</span>
          <span><kbd className="px-2 py-1 bg-surface-variant rounded text-on-surface">⌘/Ctrl</kbd> + <kbd className="px-2 py-1 bg-surface-variant rounded text-on-surface">A</kbd> = Select All</span>
          <span><kbd className="px-2 py-1 bg-surface-variant rounded text-on-surface">Esc</kbd> = Clear</span>
        </div>
      </div>
    </div>
  );
}
