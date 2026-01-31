'use client';

interface FranchiseBadgeProps {
  franchise: string;
  franchiseType?: 'band' | 'movie' | 'tv_show' | 'game' | 'anime' | 'comic' | 'sports' | 'brand' | 'other';
  isLicensedMerch?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const FRANCHISE_TYPE_ICONS: Record<string, string> = {
  band: '🎸',
  movie: '🎬',
  tv_show: '📺',
  game: '🎮',
  anime: '⚡',
  comic: '💥',
  sports: '⚽',
  brand: '🏷️',
  other: '🌟',
};

const FRANCHISE_TYPE_LABELS: Record<string, string> = {
  band: 'Band',
  movie: 'Movie',
  tv_show: 'TV Show',
  game: 'Game',
  anime: 'Anime',
  comic: 'Comic',
  sports: 'Sports',
  brand: 'Brand',
  other: 'Licensed',
};

/**
 * FranchiseBadge Component
 * 
 * Displays franchise information for licensed merchandise.
 * ADHD-friendly design with clear visual indicators.
 * 
 * Design Decisions:
 * - Emoji icons for instant recognition (reduces cognitive load)
 * - Color-coded by type (visual association)
 * - Truncated franchise names with tooltip (keeps cards clean)
 * - Optional size variants (flexible layout)
 * - High contrast for readability
 */
export default function FranchiseBadge({ 
  franchise, 
  franchiseType = 'other',
  isLicensedMerch = true,
  size = 'md' 
}: FranchiseBadgeProps) {
  if (!franchise || !isLicensedMerch) return null;

  const icon = FRANCHISE_TYPE_ICONS[franchiseType] || '🌟';
  const typeLabel = FRANCHISE_TYPE_LABELS[franchiseType] || 'Licensed';

  // Size variants
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // Truncate long franchise names
  const truncatedFranchise = franchise.length > 20 
    ? `${franchise.substring(0, 20)}...` 
    : franchise;

  return (
    <div
      className={`inline-flex items-center ${sizeClasses[size]} bg-primary-container text-on-primary-container rounded-full font-medium transition-all hover:bg-primary hover:text-on-primary cursor-default`}
      title={`${typeLabel}: ${franchise}`}
      aria-label={`${typeLabel} merchandise: ${franchise}`}
    >
      <span className={iconSizeClasses[size]} aria-hidden="true">
        {icon}
      </span>
      <span className="truncate max-w-[150px]">
        {truncatedFranchise}
      </span>
    </div>
  );
}

/**
 * Compact variant for smaller displays
 */
export function FranchiseBadgeCompact({ 
  franchise, 
  franchiseType = 'other' 
}: Omit<FranchiseBadgeProps, 'size' | 'isLicensedMerch'>) {
  if (!franchise) return null;

  const icon = FRANCHISE_TYPE_ICONS[franchiseType] || '🌟';
  const typeLabel = FRANCHISE_TYPE_LABELS[franchiseType] || 'Licensed';

  return (
    <div
      className="inline-flex items-center justify-center w-8 h-8 bg-primary-container text-on-primary-container rounded-full text-lg hover:bg-primary hover:text-on-primary transition-all cursor-default"
      title={`${typeLabel}: ${franchise}`}
      aria-label={`${typeLabel} merchandise: ${franchise}`}
    >
      <span aria-hidden="true">{icon}</span>
    </div>
  );
}

/**
 * List variant for displaying multiple franchises
 */
export function FranchiseBadgeList({ 
  franchises 
}: { 
  franchises: Array<{ franchise: string; franchiseType: string }> 
}) {
  if (!franchises || franchises.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {franchises.map((item, index) => (
        <FranchiseBadge
          key={`${item.franchise}-${index}`}
          franchise={item.franchise}
          franchiseType={item.franchiseType as any}
          size="sm"
        />
      ))}
    </div>
  );
}
