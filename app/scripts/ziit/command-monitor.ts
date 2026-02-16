/**
 * Command Monitor
 * 
 * Monitors shell command execution by watching bash history file
 * and sends heartbeats to Ziit.app when meaningful commands are executed.
 * 
 * Features:
 * - Watches ~/.bash_history for new command entries
 * - Filters commands based on include/ignore lists
 * - Debounces rapid command sequences
 * - Integrates with existing Ziit heartbeat system
 */

import { watch, readFileSync, statSync } from 'fs';
import { homedir } from 'os';
import { ZiitHeartbeat } from './ziit';

export interface CommandMonitorConfig {
  enabled: boolean;
  historyFile: string;
  includeCommands: string[];
  ignoreCommands: string[];
  debounceMs: number;
  verbose: boolean;
}

export interface CommandEvent {
  command: string;
  timestamp: number;
}

export class CommandMonitor {
  private config: CommandMonitorConfig;
  private lastFileSize: number = 0;
  private lastReadPosition: number = 0;
  private pendingCommands: Map<string, number> = new Map();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private watcher: any = null;

  constructor(config: CommandMonitorConfig) {
    this.config = config;
  }

  private log(message: string) {
    if (this.config.verbose) {
      console.log(`[Ziit 📜] ${message}`);
    }
  }

  /**
   * Check if a command should be tracked
   */
  private shouldTrackCommand(command: string): boolean {
    const baseCommand = command.trim().split(/\s+/)[0];
    
    if (!baseCommand) return false;

    // Check ignore list first
    if (this.config.ignoreCommands.some(cmd => baseCommand === cmd || command.startsWith(cmd + ' '))) {
      return false;
    }

    // If include list is empty, track all non-ignored commands
    if (this.config.includeCommands.length === 0) {
      return true;
    }

    // Check include list
    return this.config.includeCommands.some(cmd => baseCommand === cmd || command.startsWith(cmd + ' '));
  }

  /**
   * Parse new commands from history file
   */
  private async parseNewCommands(): Promise<CommandEvent[]> {
    try {
      const stats = statSync(this.config.historyFile);
      const currentSize = stats.size;

      // If file is smaller, it was truncated - reset position
      if (currentSize < this.lastFileSize) {
        this.log('History file truncated, resetting read position');
        this.lastReadPosition = 0;
      }

      // If file size hasn't changed, no new commands
      if (currentSize === this.lastFileSize) {
        return [];
      }

      // Read only the new content
      const content = readFileSync(this.config.historyFile, 'utf-8');
      
      // Calculate which lines are new based on file size
      const newContent = content.slice(this.lastReadPosition);
      const newLines = newContent.split('\n').filter(line => line.trim());

      this.lastFileSize = currentSize;
      this.lastReadPosition = currentSize;

      const commands: CommandEvent[] = [];
      const now = Date.now();

      for (const line of newLines) {
        const command = line.trim();
        if (command && this.shouldTrackCommand(command)) {
          commands.push({
            command,
            timestamp: now,
          });
          this.log(`New command detected: ${command}`);
        }
      }

      return commands;
    } catch (error) {
      if (this.config.verbose) {
        console.error('[Ziit] Error parsing commands:', error);
      }
      return [];
    }
  }

  /**
   * Start monitoring shell history
   */
  async start(onCommand: (events: CommandEvent[]) => void): Promise<void> {
    if (!this.config.enabled) {
      this.log('Command monitoring disabled');
      return;
    }

    // Check if history file exists
    try {
      const stats = statSync(this.config.historyFile);
      this.lastFileSize = stats.size;
      this.lastReadPosition = stats.size; // Start from end of file
      this.log(`Monitoring bash history: ${this.config.historyFile} (starting at ${this.lastFileSize} bytes)`);
    } catch (error) {
      console.error(`[Ziit] Cannot access history file: ${this.config.historyFile}`);
      console.error('[Ziit] Command monitoring disabled');
      return;
    }

    // Watch for changes to history file
    this.watcher = watch(this.config.historyFile, async (eventType) => {
      if (eventType === 'change') {
        const commands = await this.parseNewCommands();
        
        if (commands.length > 0) {
          // Add to pending queue
          for (const cmd of commands) {
            this.pendingCommands.set(cmd.command, cmd.timestamp);
          }

          // Debounce processing
          if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
          }

          this.debounceTimer = setTimeout(() => {
            const events = Array.from(this.pendingCommands.entries()).map(([command, timestamp]) => ({
              command,
              timestamp,
            }));
            this.pendingCommands.clear();
            
            if (events.length > 0) {
              onCommand(events);
            }
          }, this.config.debounceMs);
        }
      }
    });

    this.log(`Command monitoring started (tracking: ${this.config.includeCommands.length > 0 ? this.config.includeCommands.join(', ') : 'all non-ignored commands'})`);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.log('Command monitoring stopped');
  }

  /**
   * Create heartbeat from command event
   */
  static createHeartbeat(
    event: CommandEvent,
    project: string,
    editor: string,
    branch?: string
  ): ZiitHeartbeat {
    const baseCommand = event.command.trim().split(/\s+/)[0];
    
    // Detect language from command
    let language = 'Shell';
    if (baseCommand === 'git') language = 'Git';
    else if (['npm', 'yarn', 'pnpm', 'bun'].includes(baseCommand)) language = 'JavaScript';
    else if (baseCommand === 'python' || baseCommand === 'python3') language = 'Python';
    else if (baseCommand === 'docker' || baseCommand === 'docker-compose') language = 'Docker';
    else if (baseCommand === 'cargo') language = 'Rust';
    else if (baseCommand === 'go') language = 'Go';

    return {
      timestamp: event.timestamp,
      project,
      language,
      editor,
      os: process.platform,
      file: `[command] ${event.command}`,
      branch,
    };
  }
}
