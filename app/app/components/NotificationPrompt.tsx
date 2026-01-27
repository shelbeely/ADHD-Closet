"use client";

import { useEffect, useState } from "react";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  type NotificationPermissionStatus,
} from "../lib/notifications";

/**
 * PWA Notification Prompt Component
 * ADHD-Optimized: Progressive disclosure, clear benefits, easy to dismiss
 */
export default function NotificationPrompt() {
  const [permission, setPermission] = useState<NotificationPermissionStatus>("default");
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if (!isNotificationSupported()) {
      return;
    }

    // Get current permission status
    const currentPermission = getNotificationPermission();
    setPermission(currentPermission);

    // Check if user already dismissed the prompt
    const wasDismissed = localStorage.getItem("notification-prompt-dismissed");
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Show prompt after a delay (progressive disclosure, not overwhelming)
    // Only if permission is default (not yet asked)
    if (currentPermission === "default") {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 10000); // Wait 10 seconds before showing prompt

      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = async () => {
    const newPermission = await requestNotificationPermission();
    setPermission(newPermission);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("notification-prompt-dismissed", "true");
  };

  // Don't show if not supported, already answered, or dismissed
  if (!isNotificationSupported() || permission !== "default" || !showPrompt || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-50">
      <div className="bg-surface-container rounded-3xl shadow-elevation-3 p-4 border border-outline-variant">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="text-3xl">🔔</div>
          <div className="flex-1">
            <h3 className="text-title-medium text-on-surface font-medium mb-1">
              Enable notifications?
            </h3>
            <p className="text-body-small text-on-surface-variant">
              Get helpful updates when AI finishes processing photos or outfits are ready. You can
              always change this later.
            </p>
          </div>
        </div>

        {/* Benefits list - ADHD-friendly: clear value proposition */}
        <ul className="text-body-small text-on-surface-variant space-y-1 mb-4 ml-12">
          <li>✨ AI catalog photos ready</li>
          <li>👔 Outfit suggestions complete</li>
          <li>📦 Export/import status updates</li>
        </ul>

        {/* Actions - Material Design 3 button styles */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleDismiss}
            className="px-6 py-2 rounded-full text-label-large text-primary hover:bg-primary/8 transition-colors"
            aria-label="Not now, don't show again"
          >
            Not now
          </button>
          <button
            onClick={handleEnable}
            className="px-6 py-2 rounded-full bg-primary text-on-primary text-label-large hover:shadow-elevation-1 transition-all"
            aria-label="Enable notifications"
          >
            Enable
          </button>
        </div>
      </div>
    </div>
  );
}
