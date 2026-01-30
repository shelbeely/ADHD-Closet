'use client';

import { useEffect, useState } from 'react';

interface SuccessFeedbackProps {
  message: string;
  show: boolean;
  onHide: () => void;
  celebration?: boolean;
  milestone?: boolean;
}

/**
 * Success Feedback Component
 * 
 * ADHD-optimized:
 * - Provides dopamine reward for task completion
 * - Subtle animation without being distracting
 * - Auto-dismisses to avoid manual close
 * - Celebrates milestones to build positive habits
 */
export default function SuccessFeedback({ 
  message, 
  show, 
  onHide,
  celebration = false,
  milestone = false 
}: SuccessFeedbackProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onHide, 300); // Wait for fade out
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show && !visible) return null;

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className={`
        bg-tertiary-container text-on-tertiary-container
        px-6 py-4 rounded-2xl shadow-elevation-3
        flex items-center gap-3 max-w-sm
        ${celebration ? 'animate-bounce-once' : ''}
      `}>
        {/* Icon */}
        <div className="text-3xl">
          {milestone ? '🎉' : celebration ? '✨' : '✓'}
        </div>
        
        {/* Message */}
        <div>
          <div className="text-label-large font-semibold">
            {message}
          </div>
          {milestone && (
            <div className="text-body-small opacity-90 mt-1">
              You're making great progress!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
