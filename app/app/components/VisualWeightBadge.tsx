'use client';

/**
 * Visual Weight Badge
 * 
 * Shows the visual weight of an item to help users balance outfits.
 * Visual weight = how much attention an item demands visually
 * 
 * ADHD-friendly: Simple indicator (minimal, moderate, heavy)
 */

export type VisualWeight = 'minimal' | 'moderate' | 'heavy' | 'complex';

interface VisualWeightBadgeProps {
  weight: VisualWeight;
  showLabel?: boolean;
  size?: 'small' | 'medium';
  className?: string;
}

const WEIGHT_CONFIG = {
  minimal: {
    emoji: '⚪',
    label: 'Minimal',
    color: 'bg-surface-variant text-on-surface-variant',
    description: 'Simple, understated'
  },
  moderate: {
    emoji: '◐',
    label: 'Moderate',
    color: 'bg-secondary/20 text-secondary',
    description: 'Balanced presence'
  },
  heavy: {
    emoji: '⚫',
    label: 'Heavy',
    color: 'bg-tertiary/20 text-tertiary',
    description: 'Strong focal point'
  },
  complex: {
    emoji: '🌟',
    label: 'Complex',
    color: 'bg-primary/20 text-primary',
    description: 'Lots of details'
  }
};

export default function VisualWeightBadge({
  weight,
  showLabel = true,
  size = 'small',
  className = ''
}: VisualWeightBadgeProps) {
  const config = WEIGHT_CONFIG[weight];
  const sizeClasses = size === 'small' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full ${config.color} ${sizeClasses} ${className}`}
      title={config.description}
    >
      <span className={size === 'small' ? 'text-xs' : 'text-sm'}>
        {config.emoji}
      </span>
      {showLabel && (
        <span className="font-medium whitespace-nowrap">
          {config.label}
        </span>
      )}
    </div>
  );
}

/**
 * Calculate visual weight from item attributes
 * This can be enhanced with AI in the future
 */
export function calculateVisualWeight(attributes: any): VisualWeight {
  if (!attributes) return 'moderate';
  
  // Extract visual weight if AI provided it
  if (attributes.visualWeight) {
    return attributes.visualWeight as VisualWeight;
  }
  
  // Simple heuristic based on attributes
  let score = 0;
  
  // Patterns add weight
  if (attributes.pattern) {
    const pattern = attributes.pattern.toLowerCase();
    if (pattern.includes('graphic') || pattern.includes('print')) score += 2;
    else if (pattern.includes('stripe') || pattern.includes('floral')) score += 1;
  }
  
  // Embellishments add weight
  if (attributes.embellishments || attributes.details) score += 1;
  
  // Bright colors add weight (check color palette)
  if (attributes.colors && Array.isArray(attributes.colors)) {
    const hasNeon = attributes.colors.some((c: string) => 
      c.toLowerCase().includes('neon') || 
      c.toLowerCase().includes('bright')
    );
    if (hasNeon) score += 1;
  }
  
  // Convert score to weight
  if (score === 0) return 'minimal';
  if (score === 1) return 'moderate';
  if (score >= 2 && score <= 3) return 'heavy';
  return 'complex';
}
