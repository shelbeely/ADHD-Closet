/**
 * Achievement/Milestone Tracker
 * 
 * ADHD-optimized:
 * - Provides dopamine rewards at meaningful milestones
 * - Builds positive habits through celebration
 * - Non-intrusive (doesn't block workflow)
 */

export interface Milestone {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  threshold: number;
  currentValue: number;
}

const MILESTONES = {
  FIRST_ITEM: { threshold: 1, title: 'First Item Added!', description: 'You\'re on your way!' },
  TEN_ITEMS: { threshold: 10, title: '10 Items!', description: 'Your closet is growing!' },
  TWENTY_FIVE_ITEMS: { threshold: 25, title: '25 Items!', description: 'Quarter century!' },
  FIFTY_ITEMS: { threshold: 50, title: '50 Items!', description: 'Half-century closet!' },
  FIRST_OUTFIT: { threshold: 1, title: 'First Outfit!', description: 'Looking good!' },
  TEN_OUTFITS: { threshold: 10, title: '10 Outfits!', description: 'Fashion explorer!' },
  LAUNDRY_CLEARED: { threshold: 0, title: 'Laundry Cleared!', description: 'All caught up!' },
  DONATE_PILE_CLEARED: { threshold: 0, title: 'Donate Pile Cleared!', description: 'Decluttered!' },
};

export function checkMilestone(
  type: 'items' | 'outfits' | 'laundry' | 'donate',
  count: number
): { achieved: boolean; milestone?: typeof MILESTONES[keyof typeof MILESTONES] } {
  
  let milestone;
  
  if (type === 'items') {
    if (count === 1) milestone = MILESTONES.FIRST_ITEM;
    else if (count === 10) milestone = MILESTONES.TEN_ITEMS;
    else if (count === 25) milestone = MILESTONES.TWENTY_FIVE_ITEMS;
    else if (count === 50) milestone = MILESTONES.FIFTY_ITEMS;
  } else if (type === 'outfits') {
    if (count === 1) milestone = MILESTONES.FIRST_OUTFIT;
    else if (count === 10) milestone = MILESTONES.TEN_OUTFITS;
  } else if (type === 'laundry' && count === 0) {
    milestone = MILESTONES.LAUNDRY_CLEARED;
  } else if (type === 'donate' && count === 0) {
    milestone = MILESTONES.DONATE_PILE_CLEARED;
  }
  
  return {
    achieved: !!milestone,
    milestone
  };
}

/**
 * Get encouraging messages for task completion
 */
export function getEncouragementMessage(action: string): string {
  const messages: Record<string, string[]> = {
    'item_added': [
      'Item added! ✨',
      'Nice! One more item catalogued',
      'Added to your closet!',
      'Great job! Item saved',
    ],
    'outfit_generated': [
      'Outfit ready! 👔',
      'Looking good! Outfit created',
      'Perfect! Here\'s your outfit',
      'Done! Check out your new outfit',
    ],
    'state_changed': [
      'Updated! ✓',
      'Changed successfully!',
      'Done!',
      'All set!',
    ],
    'laundry_done': [
      'Moved to laundry! 🧺',
      'Ready for wash day',
      'Added to laundry pile',
    ],
    'donated': [
      'Marked for donation! 📦',
      'Ready to donate',
      'Declutter success!',
    ]
  };
  
  const options = messages[action] || messages['state_changed'];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Store achievement in localStorage to show only once
 */
export function hasSeenMilestone(milestoneId: string): boolean {
  if (typeof window === 'undefined') return true;
  
  const seen = localStorage.getItem(`milestone_${milestoneId}`);
  return seen === 'true';
}

export function markMilestoneAsSeen(milestoneId: string): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(`milestone_${milestoneId}`, 'true');
}
