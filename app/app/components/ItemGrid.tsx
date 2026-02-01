'use client';

import Link from 'next/link';

interface Item {
  id: string;
  title?: string;
  category?: string;
  brand?: string;
  state: string;
  cleanStatus: string;
  currentWears: number;
  wearsBeforeWash: number;
  colorPalette?: string[]; // Array of hex color codes
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
  const getItemImages = (item: Item) => {
    // Prefer AI catalog images over originals for cleaner display
    const catalogImage = item.images.find(img => img.kind === 'ai_catalog');
    const frontImage = catalogImage || item.images.find(img => img.kind === 'original_main');
    const backImage = item.images.find(img => img.kind === 'original_back');
    const hasBothSides = !catalogImage && frontImage && backImage; // Only show both sides if no catalog image
    return { frontImage, backImage, hasBothSides };
  };

  // Format category for display
  const formatCategory = (category?: string): string => {
    if (!category) return '';
    return category.replace(/_/g, ' ').toUpperCase();
  };

  // Get primary color from palette
  const getPrimaryColor = (colorPalette?: string[]): string | null => {
    return colorPalette && colorPalette.length > 0 ? colorPalette[0] : null;
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

        return (
          <Link
            key={item.id}
            href={`/items/${item.id}`}
            className="group cursor-pointer"
          >
            <div className="aspect-square bg-surface-container-low rounded-3xl overflow-hidden mb-3 relative transition-all duration-300 hover:shadow-elevation-2 hover:scale-[1.02]">
              {hasBothSides ? (
                /* Side-by-side view for items with both front and back */
                <div className="w-full h-full flex">
                  <div className="w-1/2 h-full relative border-r border-outline-variant">
                    <img
                      src={`/api/images/${frontImage!.id}`}
                      alt={`${item.title || 'Item'} - Front`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary-container/90 backdrop-blur-sm text-on-primary-container text-label-small rounded-full font-medium">
                      Front
                    </div>
                  </div>
                  <div className="w-1/2 h-full relative">
                    <img
                      src={`/api/images/${backImage!.id}`}
                      alt={`${item.title || 'Item'} - Back`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-secondary-container/90 backdrop-blur-sm text-on-secondary-container text-label-small rounded-full font-medium">
                      Back
                    </div>
                  </div>
                </div>
              ) : (
                /* Single image view for items with only front or catalog image */
                frontImage || backImage ? (
                  <div className="w-full h-full relative">
                    <img
                      src={`/api/images/${(frontImage || backImage)!.id}`}
                      alt={item.title || 'Item'}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Category and brand overlay (only for catalog images) */}
                    {frontImage?.kind === 'ai_catalog' && (
                      <div className="absolute inset-x-0 top-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
                        {item.category && (
                          <div className="text-white text-label-large font-bold tracking-wider mb-1 uppercase">
                            {formatCategory(item.category)}
                          </div>
                        )}
                        {item.brand && (
                          <div 
                            className="text-white/90 text-label-medium font-medium uppercase"
                            aria-label={item.brand}
                          >
                            {item.brand}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Primary color indicator (only for catalog images) */}
                    {getPrimaryColor(item.colorPalette) && frontImage?.kind === 'ai_catalog' && (
                      <div 
                        className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 bg-surface-container/90 backdrop-blur-sm rounded-full shadow-elevation-1"
                        aria-label={`Primary color: ${getPrimaryColor(item.colorPalette)}`}
                      >
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-white/50" 
                          style={{ backgroundColor: getPrimaryColor(item.colorPalette) || '#000' }}
                          aria-hidden="true"
                        />
                        <span className="text-on-surface text-label-small font-medium pr-1">
                          Color
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-surface-variant">
                    👕
                  </div>
                )
              )}
              
              {/* State badge */}
              {item.state !== 'available' && (
                <div className="absolute top-3 right-3 px-3 py-1.5 bg-secondary-container text-on-secondary-container text-label-small rounded-full shadow-elevation-1">
                  {item.state}
                </div>
              )}
              
              {/* Clean status badge */}
              {item.cleanStatus !== 'clean' && (
                <div className={`absolute top-3 ${item.state !== 'available' ? 'right-[90px]' : 'right-3'} px-2 py-1 text-label-small rounded-full shadow-elevation-1 font-medium ${
                  item.cleanStatus === 'needs_wash' 
                    ? 'bg-error-container text-on-error-container' 
                    : 'bg-tertiary-container text-on-tertiary-container'
                }`}>
                  {item.cleanStatus === 'needs_wash' ? '🚿' : '🧺'}
                </div>
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
