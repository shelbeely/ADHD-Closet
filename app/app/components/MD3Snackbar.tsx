'use client';

import { useEffect, useState } from 'react';

interface MD3SnackbarProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  onClose?: () => void;
}

/**
 * Material Design 3 Snackbar Component
 * 
 * Features:
 * - Slide + fade animation
 * - Auto-dismiss after duration
 * - Optional action button
 * - ADHD-optimized: Brief, clear messages with optional action
 */
export default function MD3Snackbar({
  message,
  action,
  duration = 4000,
  onClose
}: MD3SnackbarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 250);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`md3-snackbar ${
        isExiting ? 'md3-animate-snackbar-exit' : 'md3-animate-snackbar-enter'
      } md3-will-animate`}
      role="status"
      aria-live="polite"
    >
      <span className="text-body-medium flex-1">{message}</span>
      
      {action && (
        <button
          onClick={() => {
            action.onClick();
            handleClose();
          }}
          className="md3-button-text md3-state-layer md3-ripple text-label-large font-medium px-3 py-2"
          style={{ color: 'var(--md-sys-color-inverse-primary)' }}
        >
          {action.label}
        </button>
      )}
      
      <button
        onClick={handleClose}
        className="md3-touch-target md3-state-layer md3-ripple rounded-full -mr-2"
        style={{ color: 'var(--md-sys-color-inverse-on-surface)' }}
        aria-label="Close"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
