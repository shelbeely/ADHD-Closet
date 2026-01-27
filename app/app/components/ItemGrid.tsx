'use client';

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
  imageCount: number;
}

interface ItemGridProps {
  items: Item[];
  loading?: boolean;
}

export default function ItemGrid({ items, loading }: ItemGridProps) {
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
                /* Single image view for items with only front or only back */
                frontImage || backImage ? (
                  <img
                    src={`/api/images/${(frontImage || backImage)!.id}`}
                    alt={item.title || 'Item'}
                    className="w-full h-full object-cover"
                  />
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
