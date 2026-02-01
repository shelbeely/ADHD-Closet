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
      <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] bg-surface-variant rounded-3xl animate-pulse shadow-elevation-2"
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
    <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => {
        const { frontImage, backImage, hasBothSides } = getItemImages(item);
        const primaryColor = getPrimaryColor(item.colorPalette);

        return (
          <Link
            key={item.id}
            href={`/items/${item.id}`}
            className="group cursor-pointer"
          >
            {/* Card-based UI with prominent image and overlaid text */}
            <div className="bg-surface-container rounded-3xl overflow-hidden shadow-elevation-2 transition-all duration-300 hover:shadow-elevation-3 hover:scale-[1.02]">
              {/* Image Container - 3:4 aspect ratio like typical product cards */}
              <div className="aspect-[3/4] bg-surface-container-low relative">
                {hasBothSides ? (
                  /* Side-by-side view for items with both front and back */
                  <div className="w-full h-full flex">
                    <div className="w-1/2 h-full relative border-r border-outline-variant">
                      <img
                        src={`/api/images/${frontImage!.id}`}
                        alt={`${item.title || 'Item'} - Front`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-container/90 backdrop-blur-sm text-on-primary-container text-label-small rounded-full font-medium">
                        Front
                      </div>
                    </div>
                    <div className="w-1/2 h-full relative">
                      <img
                        src={`/api/images/${backImage!.id}`}
                        alt={`${item.title || 'Item'} - Back`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-secondary-container/90 backdrop-blur-sm text-on-secondary-container text-label-small rounded-full font-medium">
                        Back
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Single image view with overlaid metadata */
                  frontImage || backImage ? (
                    <div className="w-full h-full relative">
                      <img
                        src={`/api/images/${(frontImage || backImage)!.id}`}
                        alt={item.title || 'Item'}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Top overlay with category, brand, and optional color text */}
                      <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/70 via-black/40 to-transparent">
                        {item.category && (
                          <div className="text-white text-title-medium font-bold tracking-wide mb-1 uppercase drop-shadow-lg">
                            {formatCategory(item.category)}
                          </div>
                        )}
                        {item.brand && (
                          <div 
                            className="text-white/95 text-body-large font-semibold uppercase drop-shadow-lg"
                            aria-label={item.brand}
                          >
                            {item.brand}
                          </div>
                        )}
                      </div>
                      
                      {/* Bottom overlay with color badge */}
                      {primaryColor && (
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end justify-between">
                          <div 
                            className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-elevation-2"
                            aria-label={`Primary color: ${primaryColor}`}
                          >
                            <div 
                              className="w-5 h-5 rounded-full border-2 border-white shadow-sm" 
                              style={{ backgroundColor: primaryColor }}
                              aria-hidden="true"
                            />
                            <span className="text-on-surface text-label-large font-bold uppercase tracking-wide">
                              {primaryColor}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl bg-surface-variant">
                      👕
                    </div>
                  )
                )}
                
                {/* State badge */}
                {item.state !== 'available' && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-secondary-container text-on-secondary-container text-label-medium rounded-full shadow-elevation-2 font-bold uppercase">
                    {item.state}
                  </div>
                )}
                
                {/* Clean status badge */}
                {item.cleanStatus !== 'clean' && (
                  <div className={`absolute top-4 ${item.state !== 'available' ? 'right-[100px]' : 'right-4'} px-3 py-1.5 text-label-medium rounded-full shadow-elevation-2 font-bold ${
                    item.cleanStatus === 'needs_wash' 
                      ? 'bg-error-container text-on-error-container' 
                      : 'bg-tertiary-container text-on-tertiary-container'
                  }`}>
                    {item.cleanStatus === 'needs_wash' ? '🚿 Wash' : '🧺 Dirty'}
                  </div>
                )}
                
                {/* Additional images count */}
                {item.imageCount > 2 && (
                  <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-primary-container text-on-primary-container text-label-medium rounded-full shadow-elevation-2 font-bold">
                    +{item.imageCount - 2} photos
                  </div>
                )}
              </div>
              
              {/* Card footer with title and tags - minimal, clean */}
              <div className="p-4 space-y-2">
                {item.title && (
                  <h3 className="text-title-small text-on-surface line-clamp-2 font-bold">
                    {item.title}
                  </h3>
                )}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.name}
                        className="text-label-medium px-2 py-1 bg-surface-variant rounded-lg text-on-surface-variant"
                      >
                        {tag.name}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-label-medium px-2 py-1 bg-surface-variant rounded-lg text-on-surface-variant font-bold">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
