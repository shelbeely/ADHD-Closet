'use client';

import { useState } from 'react';

/**
 * Quick Actions Menu
 * 
 * ADHD-friendly one-tap actions for items:
 * - Add to outfit
 * - Mark as favorite
 * - Quick view details
 * - Move to laundry
 * 
 * Features:
 * - Large touch targets (48dp minimum)
 * - Clear icons with labels
 * - Haptic feedback on mobile
 * - Auto-dismiss after action
 */

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  action: () => void;
}

interface QuickActionsMenuProps {
  itemId: string;
  onAddToOutfit?: () => void;
  onToggleFavorite?: () => void;
  onQuickView?: () => void;
  onMoveToLaundry?: () => void;
  isFavorite?: boolean;
  position?: 'bottom' | 'top';
  className?: string;
}

export default function QuickActionsMenu({
  itemId,
  onAddToOutfit,
  onToggleFavorite,
  onQuickView,
  onMoveToLaundry,
  isFavorite = false,
  position = 'bottom',
  className = ''
}: QuickActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Haptic feedback (works on mobile browsers)
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // 50ms vibration
    }
  };

  const handleAction = (action: () => void) => {
    triggerHaptic();
    action();
    setIsOpen(false);
  };

  const actions: QuickAction[] = [
    ...(onAddToOutfit ? [{
      id: 'add-outfit',
      label: 'Add to outfit',
      icon: '➕',
      color: 'bg-primary text-on-primary',
      action: () => handleAction(onAddToOutfit)
    }] : []),
    ...(onToggleFavorite ? [{
      id: 'favorite',
      label: isFavorite ? 'Unfavorite' : 'Favorite',
      icon: isFavorite ? '⭐' : '☆',
      color: isFavorite ? 'bg-secondary text-on-secondary' : 'bg-surface-variant text-on-surface-variant',
      action: () => handleAction(onToggleFavorite)
    }] : []),
    ...(onQuickView ? [{
      id: 'quick-view',
      label: 'Quick view',
      icon: '👁️',
      color: 'bg-tertiary text-on-tertiary',
      action: () => handleAction(onQuickView)
    }] : []),
    ...(onMoveToLaundry ? [{
      id: 'laundry',
      label: 'To laundry',
      icon: '🧺',
      color: 'bg-surface-variant text-on-surface-variant',
      action: () => handleAction(onMoveToLaundry)
    }] : [])
  ];

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => {
          triggerHaptic();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors duration-200 shadow-elevation-1"
        aria-label="Quick actions menu"
        aria-expanded={isOpen}
      >
        <span className="text-xl">⚡</span>
      </button>

      {/* Actions Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div
            className={`absolute z-50 ${
              position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
            } right-0 bg-surface-container rounded-2xl shadow-elevation-3 p-2 min-w-[180px]`}
          >
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${action.color} hover:shadow-elevation-1 transition-all duration-200 mb-1 last:mb-0 min-h-[48px]`}
                aria-label={action.label}
              >
                <span className="text-xl">{action.icon}</span>
                <span className="text-label-large font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Swipe Actions Variant
 * For mobile: swipe left/right for quick actions
 */
interface SwipeActionsProps {
  itemId: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftLabel?: string;
  rightLabel?: string;
  leftIcon?: string;
  rightIcon?: string;
  children: React.ReactNode;
}

export function SwipeActions({
  itemId,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = 'Favorite',
  rightLabel = 'Laundry',
  leftIcon = '⭐',
  rightIcon = '🧺',
  children
}: SwipeActionsProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    
    const diff = currentX - startX;
    const threshold = 100; // Minimum swipe distance
    
    // Swipe left
    if (diff < -threshold && onSwipeLeft) {
      if ('vibrate' in navigator) navigator.vibrate(50);
      onSwipeLeft();
    }
    // Swipe right
    else if (diff > threshold && onSwipeRight) {
      if ('vibrate' in navigator) navigator.vibrate(50);
      onSwipeRight();
    }
    
    setIsSwiping(false);
    setStartX(0);
    setCurrentX(0);
  };

  const translateX = isSwiping ? currentX - startX : 0;

  return (
    <div className="relative overflow-hidden">
      {/* Background actions */}
      <div className="absolute inset-0 flex items-center justify-between px-4 bg-surface-container">
        {onSwipeRight && (
          <div className="flex items-center gap-2 text-secondary">
            <span className="text-2xl">{rightIcon}</span>
            <span className="text-label-small font-medium">{rightLabel}</span>
          </div>
        )}
        {onSwipeLeft && (
          <div className="flex items-center gap-2 text-tertiary ml-auto">
            <span className="text-label-small font-medium">{leftLabel}</span>
            <span className="text-2xl">{leftIcon}</span>
          </div>
        )}
      </div>

      {/* Swipeable content */}
      <div
        className="relative bg-surface transition-transform duration-200"
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
