'use client';

import Link from 'next/link';
import { useState } from 'react';

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

interface ItemGridProps {
  items: Item[];
  loading?: boolean;
}

export default function ItemGrid({ items, loading }: ItemGridProps) {
  const [flippedItems, setFlippedItems] = useState<Set<string>>(new Set());

  const toggleFlip = (itemId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFlippedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const getItemImages = (item: Item) => {
    const frontImage = item.images.find(img => img.kind === 'original_main');
    const backImage = item.images.find(img => img.kind === 'original_back');
    const hasBothSides = frontImage && backImage;
    return { frontImage, backImage, hasBothSides };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-surface-variant rounded-3xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-32 h-32 bg-surface-variant rounded-full flex items-center justify-center text-6xl mb-6">
          👕
        </div>
        <h3 className="text-title-large text-on-surface mb-2">
          No items yet
        </h3>
        <p className="text-body-large text-on-surface-variant mb-6 max-w-sm">
          Start building your wardrobe by adding your first item
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => {
        const { frontImage, backImage, hasBothSides } = getItemImages(item);
        const isFlipped = flippedItems.has(item.id);
        const currentImage = isFlipped && backImage ? backImage : (frontImage || backImage);

        return (
          <Link
            key={item.id}
            href={`/items/${item.id}`}
            className="group cursor-pointer"
          >
            <div className="aspect-square bg-surface-container-low rounded-3xl overflow-hidden mb-3 relative transition-all duration-300 hover:shadow-elevation-2 hover:scale-[1.02]">
              {currentImage ? (
                <img
                  src={`/api/images/${currentImage.id}`}
                  alt={item.title || 'Item'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl bg-surface-variant">
                  👕
                </div>
              )}
              
              {/* State badge */}
              {item.state !== 'available' && (
                <div className="absolute top-3 right-3 px-3 py-1.5 bg-secondary-container text-on-secondary-container text-label-small rounded-full shadow-elevation-1">
                  {item.state}
                </div>
              )}
              
              {/* Flip button for items with both sides */}
              {hasBothSides && (
                <button
                  onClick={(e) => toggleFlip(item.id, e)}
                  className="absolute bottom-3 left-3 px-3 py-1.5 bg-primary-container text-on-primary-container text-label-small rounded-full shadow-elevation-2 hover:shadow-elevation-3 transition-all flex items-center gap-1.5 font-medium"
                  aria-label={isFlipped ? 'Show front' : 'Show back'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{isFlipped ? 'Front' : 'Back'}</span>
                </button>
              )}
              
              {/* Additional images count */}
              {item.imageCount > 2 && (
                <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-tertiary-container text-on-tertiary-container text-label-small rounded-full shadow-elevation-1 font-medium">
                  +{item.imageCount - 2}
                </div>
              )}
            </div>
            <div className="space-y-1 px-1">
              {item.title && (
                <h3 className="text-body-medium text-on-surface line-clamp-1 font-medium">
                  {item.title}
                </h3>
              )}
              {item.brand && (
                <p className="text-body-small text-on-surface-variant line-clamp-1">
                  {item.brand}
                </p>
              )}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag.name}
                      className="text-label-small px-2 py-0.5 bg-surface-variant rounded-lg text-on-surface-variant"
                    >
                      {tag.name}
                    </span>
                  ))}
                  {item.tags.length > 2 && (
                    <span className="text-label-small px-2 py-0.5 bg-surface-variant rounded-lg text-on-surface-variant font-medium">
                      +{item.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
