'use client';

import { useEffect, useState } from 'react';

interface LoadingStateProps {
  message?: string;
  estimatedSeconds?: number;
  showProgress?: boolean;
}

/**
 * Enhanced Loading State Component
 * 
 * ADHD-optimized:
 * - Shows estimated time remaining (time blindness support)
 * - Visual progress indicator
 * - Clear status messaging
 * - Reduces anxiety about "how long will this take?"
 */
export default function LoadingState({ 
  message = 'Processing...', 
  estimatedSeconds,
  showProgress = false 
}: LoadingStateProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!estimatedSeconds) return;

    const interval = setInterval(() => {
      setElapsed((prev) => Math.min(prev + 1, estimatedSeconds));
    }, 1000);

    return () => clearInterval(interval);
  }, [estimatedSeconds]);

  const progress = estimatedSeconds ? (elapsed / estimatedSeconds) * 100 : 0;
  const remaining = estimatedSeconds ? Math.max(0, estimatedSeconds - elapsed) : 0;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {/* Spinner */}
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 border-4 border-primary-container rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-primary border-transparent rounded-full animate-spin"></div>
      </div>

      {/* Message */}
      <p className="text-title-medium text-on-surface mb-2">
        {message}
      </p>

      {/* Time Estimate */}
      {estimatedSeconds && (
        <div className="text-body-medium text-on-surface-variant mb-4">
          {remaining > 0 ? (
            <>~{remaining} second{remaining !== 1 ? 's' : ''} remaining</>
          ) : (
            'Almost done...'
          )}
        </div>
      )}

      {/* Progress Bar */}
      {showProgress && estimatedSeconds && (
        <div className="w-64 h-2 bg-surface-container rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 95)}%` }}
          />
        </div>
      )}

      {/* Helpful hint for long operations */}
      {estimatedSeconds && estimatedSeconds > 10 && elapsed > 5 && (
        <p className="text-body-small text-on-surface-variant mt-4 max-w-xs">
          💡 Feel free to do something else - you'll get a notification when it's done
        </p>
      )}
    </div>
  );
}
