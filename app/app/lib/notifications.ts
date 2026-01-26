// Notification utility for PWA push notifications
// Follows ADHD-optimized principles: clear, non-intrusive, helpful

export type NotificationPermissionStatus = "default" | "granted" | "denied";

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: any;
}

/**
 * Check if notifications are supported in this browser
 */
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermissionStatus {
  if (!isNotificationSupported()) {
    return "denied";
  }
  return Notification.permission;
}

/**
 * Request notification permission from user
 * ADHD-optimized: Clear, non-blocking, one-time request
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (!isNotificationSupported()) {
    console.warn("Notifications not supported in this browser");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "denied";
  }
}

/**
 * Show a local notification
 * ADHD-optimized: Gentle, helpful, dismissible
 */
export async function showNotification(options: NotificationOptions): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn("Notifications not supported");
    return false;
  }

  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    console.warn("Notification permission not granted");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || "/icon-192x192.png",
      badge: options.badge || "/icon-192x192.png",
      tag: options.tag,
      requireInteraction: options.requireInteraction ?? false,
      silent: options.silent ?? false,
      data: options.data,
      // @ts-ignore - vibrate is supported but not in TypeScript types yet
      vibrate: [200, 100, 200], // Gentle vibration pattern
    });
    return true;
  } catch (error) {
    console.error("Error showing notification:", error);
    return false;
  }
}

/**
 * ADHD-Optimized Notification Presets
 * Clear, helpful notifications for common wardrobe scenarios
 */

export const NotificationPresets = {
  /**
   * AI catalog image is ready
   */
  aiCatalogReady: (itemName: string) => ({
    title: "✨ Your catalog photo is ready!",
    body: `AI finished processing ${itemName}. Tap to view.`,
    tag: "ai-catalog-ready",
    requireInteraction: false,
    data: { type: "ai-catalog-ready", itemName },
  }),

  /**
   * AI item inference complete
   */
  aiInferenceComplete: (itemName: string) => ({
    title: "🔍 Item details detected",
    body: `AI found category, colors, and tags for ${itemName}.`,
    tag: "ai-inference-complete",
    requireInteraction: false,
    data: { type: "ai-inference-complete", itemName },
  }),

  /**
   * Outfit generation complete
   */
  outfitReady: (outfitCount: number) => ({
    title: "👔 Your outfits are ready!",
    body: `Generated ${outfitCount} outfit${outfitCount > 1 ? "s" : ""} for you. Tap to view.`,
    tag: "outfit-ready",
    requireInteraction: false,
    data: { type: "outfit-ready", outfitCount },
  }),

  /**
   * Reminder to check laundry items
   */
  laundryReminder: (count: number) => ({
    title: "🧺 Laundry reminder",
    body: `You have ${count} item${count > 1 ? "s" : ""} in laundry state.`,
    tag: "laundry-reminder",
    requireInteraction: false,
    silent: true, // Gentle reminder, not urgent
    data: { type: "laundry-reminder", count },
  }),

  /**
   * Export backup complete
   */
  exportComplete: (filename: string) => ({
    title: "📦 Export complete",
    body: `Your wardrobe backup is ready: ${filename}`,
    tag: "export-complete",
    requireInteraction: false,
    data: { type: "export-complete", filename },
  }),

  /**
   * Import restore complete
   */
  importComplete: (itemCount: number) => ({
    title: "✅ Import successful",
    body: `Restored ${itemCount} items to your wardrobe.`,
    tag: "import-complete",
    requireInteraction: false,
    data: { type: "import-complete", itemCount },
  }),

  /**
   * Generic success notification
   */
  success: (message: string) => ({
    title: "✅ Success",
    body: message,
    tag: "success",
    requireInteraction: false,
    silent: true,
  }),

  /**
   * Generic info notification
   */
  info: (title: string, message: string) => ({
    title,
    body: message,
    tag: "info",
    requireInteraction: false,
    silent: true,
  }),
};

/**
 * Schedule a notification for later
 * Useful for time-based reminders (e.g., "Check laundry in 2 hours")
 */
export function scheduleNotification(
  options: NotificationOptions,
  delayMs: number
): NodeJS.Timeout {
  return setTimeout(async () => {
    await showNotification(options);
  }, delayMs);
}

/**
 * Clear all notifications with a specific tag
 */
export async function clearNotificationsByTag(tag: string): Promise<void> {
  if (!isNotificationSupported()) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications({ tag });
    notifications.forEach((notification) => notification.close());
  } catch (error) {
    console.error("Error clearing notifications:", error);
  }
}
