'use client';

interface ColorCompatibilityBadgeProps {
  itemColors: string[];
  outfitColors: string[];
  className?: string;
}

export default function ColorCompatibilityBadge({
  itemColors,
  outfitColors,
  className = ''
}: ColorCompatibilityBadgeProps) {
  // Check for exact color matches
  const exactMatches = itemColors.filter(color => 
    outfitColors.includes(color)
  );

  // Simple color compatibility check
  // In a more advanced version, this could check for complementary colors
  const hasExactMatch = exactMatches.length > 0;
  
  // Check if colors are similar (simplified - just checking if both have black/white/gray)
  const neutralColors = ['#000000', '#ffffff', '#808080', '#333333', '#cccccc'];
  const itemHasNeutral = itemColors.some(c => neutralColors.includes(c.toLowerCase()));
  const outfitHasNeutral = outfitColors.some(c => neutralColors.includes(c.toLowerCase()));
  const hasNeutralMatch = itemHasNeutral && outfitHasNeutral;

  if (!hasExactMatch && !hasNeutralMatch) {
    return null; // Don't show badge if no match
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${className}`}>
      {/* Color palette preview */}
      <div className="flex gap-0.5">
        {exactMatches.slice(0, 3).map((color, idx) => (
          <div
            key={idx}
            className="w-3 h-3 rounded-full border border-outline-variant/20"
            style={{ backgroundColor: color }}
            title={`Matches ${color}`}
          />
        ))}
      </div>
      
      {/* Badge text */}
      <span className="text-xs font-medium">
        {hasExactMatch ? (
          <>🎨 Perfect match</>
        ) : (
          <>✓ Goes well</>
        )}
      </span>
    </div>
  );
}
