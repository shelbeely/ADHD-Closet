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
      <div className="flex flex-col gap-8 p-8 max-w-5xl mx-auto">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-full h-96 bg-surface-variant rounded-3xl animate-pulse shadow-elevation-3"
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
    <div className="flex flex-col gap-8 p-8 max-w-5xl mx-auto">
      {items.map((item) => {
        const { frontImage, backImage, hasBothSides } = getItemImages(item);
        const primaryColor = getPrimaryColor(item.colorPalette);

        return (
          <Link
            key={item.id}
            href={`/items/${item.id}`}
            className="group cursor-pointer block"
          >
            {/* Material Design 3 Elevated Card */}
            <div className="bg-surface-container rounded-[28px] overflow-hidden shadow-elevation-3 border border-outline-variant/20 transition-all duration-300 hover:shadow-elevation-4 hover:scale-[1.01] hover:border-primary/30">
              
              {/* Card Media Section - Horizontal layout with image on left, content on right */}
              <div className="flex flex-col md:flex-row">
                
                {/* Image Container - Fixed height, flexible width on desktop */}
                <div className="w-full md:w-1/2 lg:w-2/5 h-80 md:h-96 bg-surface-container-low relative flex-shrink-0">
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
              
              {/* Card Content Section - Beside image on desktop, below on mobile */}
              <div className="flex-1 p-8 flex flex-col justify-between">
                
                {/* Primary Content */}
                <div className="space-y-4">
                  {item.title && (
                    <h2 className="text-headline-medium text-on-surface font-bold leading-tight">
                      {item.title}
                    </h2>
                  )}
                  
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {item.category && (
                      <div className="space-y-1">
                        <div className="text-label-medium text-on-surface-variant uppercase tracking-wide">
                          Category
                        </div>
                        <div className="text-body-large text-on-surface font-medium">
                          {formatCategory(item.category)}
                        </div>
                      </div>
                    )}
                    {item.brand && (
                      <div className="space-y-1">
                        <div className="text-label-medium text-on-surface-variant uppercase tracking-wide">
                          Brand
                        </div>
                        <div className="text-body-large text-on-surface font-medium">
                          {item.brand}
                        </div>
                      </div>
                    )}
                    {primaryColor && (
                      <div className="space-y-1">
                        <div className="text-label-medium text-on-surface-variant uppercase tracking-wide">
                          Primary Color
                        </div>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-outline" 
                            style={{ backgroundColor: primaryColor }}
                          />
                          <span className="text-body-medium text-on-surface font-mono">
                            {primaryColor}
                          </span>
                        </div>
                      </div>
                    )}
                    {item.state !== 'available' && (
                      <div className="space-y-1">
                        <div className="text-label-medium text-on-surface-variant uppercase tracking-wide">
                          Status
                        </div>
                        <div className="text-body-large text-on-surface font-medium capitalize">
                          {item.state}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="pt-2">
                      <div className="flex flex-wrap gap-2">
                        {item.tags.slice(0, 5).map((tag) => (
                          <span
                            key={tag.name}
                            className="px-3 py-1.5 bg-secondary-container text-on-secondary-container text-label-large rounded-lg font-medium"
                          >
                            {tag.name}
                          </span>
                        ))}
                        {item.tags.length > 5 && (
                          <span className="px-3 py-1.5 bg-tertiary-container text-on-tertiary-container text-label-large rounded-lg font-bold">
                            +{item.tags.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Card Actions - Bottom of content area */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-outline-variant">
                  <div className="text-label-large text-on-surface-variant">
                    Tap to view details
                  </div>
                  <svg className="w-6 h-6 text-on-surface-variant group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
            </div>
          </div>
        </Link>
        );
      })}
    </div>
  );
}
