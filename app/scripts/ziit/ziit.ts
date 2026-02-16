/**
 * Ziit API Client
 * 
 * Minimal zero-dependency client for sending heartbeats to Ziit.app
 * Supports single heartbeat and batch endpoints.
 */

export interface ZiitHeartbeat {
  timestamp: number;
  project: string;
  language: string;
  editor: string;
  os: string;
  file: string;
  branch?: string;
}

export interface ZiitConfig {
  apiKey: string;
  baseUrl?: string;
}

export class ZiitClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: ZiitConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://ziit.app';
  }

  /**
   * Send a single heartbeat to Ziit
   */
  async heartbeat(data: ZiitHeartbeat): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/external/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => 'Unknown error');
        console.error(`[Ziit] Heartbeat failed (${response.status}): ${text}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[Ziit] Heartbeat error:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Send a batch of heartbeats to Ziit
   * Falls back to sending individual heartbeats if batch endpoint is unavailable
   */
  async batch(data: ZiitHeartbeat[]): Promise<boolean> {
    if (data.length === 0) {
      return true;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/external/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ heartbeats: data }),
      });

      // If batch endpoint returns 400, fall back to sending individual heartbeats
      if (response.status === 400) {
        console.log(`[Ziit] Batch endpoint unavailable, sending ${data.length} heartbeat(s) individually...`);
        // Send all heartbeats concurrently for better performance
        const results = await Promise.allSettled(
          data.map(heartbeat => this.heartbeat(heartbeat))
        );
        
        // Count successes and log failures
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
        const failedCount = data.length - successCount;
        
        if (failedCount > 0) {
          console.error(`[Ziit] Failed to send ${failedCount} of ${data.length} heartbeat(s)`);
          // Log details of failed heartbeats for debugging
          results.forEach((result, index) => {
            if (result.status === 'rejected' || (result.status === 'fulfilled' && result.value !== true)) {
              const reason = result.status === 'rejected' ? result.reason : 'Unknown failure';
              console.error(`[Ziit] Failed heartbeat for file: ${data[index].file}, reason: ${reason}`);
            }
          });
        }
        
        return successCount === data.length;
      }

      if (!response.ok) {
        const text = await response.text().catch(() => 'Unknown error');
        console.error(`[Ziit] Batch failed (${response.status}): ${text}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[Ziit] Batch error:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }
}
