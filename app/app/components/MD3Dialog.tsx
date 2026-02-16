'use client';

import { useEffect, useRef } from 'react';

interface MD3DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
}

/**
 * Material Design 3 Dialog Component
 * 
 * Features:
 * - Container transform animation
 * - Backdrop with fade
 * - Focus trap
 * - Escape key to close
 * - ADHD-optimized: Clear close button, predictable behavior
 */
export default function MD3Dialog({
  open,
  onClose,
  title,
  children,
  actions,
  size = 'medium'
}: MD3DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
      // Add animation class
      dialog.classList.add('md3-animate-dialog-enter');
    } else {
      // Add exit animation
      dialog.classList.add('md3-animate-dialog-exit');
      dialog.classList.remove('md3-animate-dialog-enter');
      
      // Close after animation
      setTimeout(() => {
        dialog.close();
        dialog.classList.remove('md3-animate-dialog-exit');
      }, 300);
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('keydown', handleEscape);

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-2xl',
    fullscreen: 'max-w-full w-full h-full m-0'
  };

  return (
    <dialog
      ref={dialogRef}
      className={`${sizeClasses[size]} md3-will-animate backdrop:md3-animate-dialog-backdrop backdrop:bg-black/50 backdrop:backdrop-blur-sm bg-transparent p-0 rounded-[28px] shadow-elevation-3`}
      style={{
        backgroundColor: 'var(--md-sys-color-surface-container-high)',
        color: 'var(--md-sys-color-on-surface)',
      }}
    >
      <div className="flex flex-col max-h-[90vh]">
        {/* Dialog Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 className="text-headline-small" style={{ color: 'var(--md-sys-color-on-surface)' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="md3-touch-target md3-state-layer md3-ripple rounded-full -mr-2"
              style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              aria-label="Close dialog"
            >
              <svg
                className="w-6 h-6"
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
        )}

        {/* Dialog Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Dialog Actions */}
        {actions && (
          <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-4">
            {actions}
          </div>
        )}
      </div>
    </dialog>
  );
}
