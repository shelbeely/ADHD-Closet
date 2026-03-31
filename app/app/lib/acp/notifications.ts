/**
 * ACP Bidirectional Notifications
 * 
 * Enables server-to-client notifications for real-time updates
 */

import { z } from 'zod';

/**
 * Notification Types
 */
export enum ACPNotificationType {
  ITEM_ADDED = 'item/added',
  ITEM_UPDATED = 'item/updated',
  ITEM_DELETED = 'item/deleted',
  JOB_COMPLETED = 'job/completed',
  JOB_FAILED = 'job/failed',
  STATS_CHANGED = 'stats/changed',
  CATALOG_GENERATED = 'catalog/generated',
  OUTFIT_GENERATED = 'outfit/generated',
}

/**
 * Notification Schema
 */
export const ACPNotificationSchema = z.object({
  jsonrpc: z.literal('2.0'),
  method: z.literal('notification'),
  params: z.object({
    type: z.nativeEnum(ACPNotificationType),
    data: z.record(z.unknown()),
    timestamp: z.string(),
  }),
});

export type ACPNotification = z.infer<typeof ACPNotificationSchema>;

/**
 * Event Subscription Schema
 */
export const EventSubscriptionSchema = z.object({
  types: z.array(z.nativeEnum(ACPNotificationType)).optional(),
  categories: z.array(z.string()).optional(),
  itemIds: z.array(z.string()).optional(),
});

export type EventSubscription = z.infer<typeof EventSubscriptionSchema>;

/**
 * Notification Data Types
 */
export interface ItemNotificationData {
  itemId: string;
  title?: string;
  category?: string;
  action: 'created' | 'updated' | 'deleted';
}

export interface JobNotificationData {
  jobId: string;
  jobType: 'catalog' | 'inference' | 'ocr' | 'outfit';
  status: 'completed' | 'failed';
  result?: Record<string, unknown>;
  error?: string;
}

export interface StatsNotificationData {
  totalItems: number;
  changeType: 'added' | 'removed' | 'updated';
  categoryStats?: Record<string, number>;
}

export interface CatalogGeneratedData {
  itemId: string;
  imageUrl: string;
  generatedAt: string;
}

export interface OutfitGeneratedData {
  outfitId?: string;
  items: string[];
  reasoning: string;
  generatedAt: string;
}

/**
 * Notification Manager
 * 
 * Manages notification subscriptions and broadcasting
 */
export class NotificationManager {
  private subscriptions: Map<string, EventSubscription> = new Map();
  private listeners: Map<string, (notification: ACPNotification) => void> = new Map();

  /**
   * Register a listener for notifications
   */
  subscribe(
    connectionId: string,
    subscription: EventSubscription,
    listener: (notification: ACPNotification) => void
  ): void {
    this.subscriptions.set(connectionId, subscription);
    this.listeners.set(connectionId, listener);
    console.log(`ACP: Client ${connectionId} subscribed to events`, subscription);
  }

  /**
   * Unregister a listener
   */
  unsubscribe(connectionId: string): void {
    this.subscriptions.delete(connectionId);
    this.listeners.delete(connectionId);
    console.log(`ACP: Client ${connectionId} unsubscribed`);
  }

  /**
   * Broadcast a notification to all subscribed listeners
   */
  broadcast(type: ACPNotificationType, data: Record<string, unknown>): void {
    const notification: ACPNotification = {
      jsonrpc: '2.0',
      method: 'notification',
      params: {
        type,
        data,
        timestamp: new Date().toISOString(),
      },
    };

    let sentCount = 0;
    this.listeners.forEach((listener, connectionId) => {
      const subscription = this.subscriptions.get(connectionId);
      
      if (this.shouldNotify(subscription, notification)) {
        try {
          listener(notification);
          sentCount++;
        } catch (error) {
          console.error(`ACP: Error sending notification to ${connectionId}:`, error);
        }
      }
    });

    console.log(`ACP: Broadcast ${type} to ${sentCount} listeners`);
  }

  /**
   * Check if a notification matches a subscription
   */
  private shouldNotify(
    subscription: EventSubscription | undefined,
    notification: ACPNotification
  ): boolean {
    if (!subscription) {
      // No filter = receive all
      return true;
    }

    const { type, data } = notification.params;

    // Check type filter
    if (subscription.types && subscription.types.length > 0) {
      if (!subscription.types.includes(type)) {
        return false;
      }
    }

    // Check category filter
    if (subscription.categories && subscription.categories.length > 0) {
      const itemCategory = data.category as string | undefined;
      if (itemCategory && !subscription.categories.includes(itemCategory)) {
        return false;
      }
    }

    // Check item ID filter
    if (subscription.itemIds && subscription.itemIds.length > 0) {
      const itemId = data.itemId as string | undefined;
      if (itemId && !subscription.itemIds.includes(itemId)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get number of active subscriptions
   */
  getSubscriptionCount(): number {
    return this.listeners.size;
  }
}

// Global notification manager instance
export const notificationManager = new NotificationManager();

/**
 * Helper functions to emit common notifications
 */
export function notifyItemAdded(itemId: string, title?: string, category?: string): void {
  notificationManager.broadcast(ACPNotificationType.ITEM_ADDED, {
    itemId,
    title,
    category,
    action: 'created',
  });
}

export function notifyItemUpdated(itemId: string, title?: string, category?: string): void {
  notificationManager.broadcast(ACPNotificationType.ITEM_UPDATED, {
    itemId,
    title,
    category,
    action: 'updated',
  });
}

export function notifyItemDeleted(itemId: string): void {
  notificationManager.broadcast(ACPNotificationType.ITEM_DELETED, {
    itemId,
    action: 'deleted',
  });
}

export function notifyJobCompleted(
  jobId: string,
  jobType: string,
  result?: Record<string, unknown>
): void {
  notificationManager.broadcast(ACPNotificationType.JOB_COMPLETED, {
    jobId,
    jobType,
    status: 'completed',
    result,
  });
}

export function notifyJobFailed(jobId: string, jobType: string, error: string): void {
  notificationManager.broadcast(ACPNotificationType.JOB_FAILED, {
    jobId,
    jobType,
    status: 'failed',
    error,
  });
}

export function notifyStatsChanged(
  totalItems: number,
  changeType: 'added' | 'removed' | 'updated',
  categoryStats?: Record<string, number>
): void {
  notificationManager.broadcast(ACPNotificationType.STATS_CHANGED, {
    totalItems,
    changeType,
    categoryStats,
  });
}

export function notifyCatalogGenerated(itemId: string, imageUrl: string): void {
  notificationManager.broadcast(ACPNotificationType.CATALOG_GENERATED, {
    itemId,
    imageUrl,
    generatedAt: new Date().toISOString(),
  });
}

export function notifyOutfitGenerated(
  items: string[],
  reasoning: string,
  outfitId?: string
): void {
  notificationManager.broadcast(ACPNotificationType.OUTFIT_GENERATED, {
    outfitId,
    items,
    reasoning,
    generatedAt: new Date().toISOString(),
  });
}
