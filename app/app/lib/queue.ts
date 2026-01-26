import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// AI Job Queue
export const aiJobQueue = new Queue('ai-jobs', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs for debugging
    },
  },
});

// Job Types
export type AIJobData = {
  jobId: string;
  type: 'generate_catalog_image' | 'infer_item' | 'extract_label' | 'generate_outfit';
  itemId?: string;
  outfitId?: string;
  inputRefs?: any;
};

// Export for type safety
export type AIJobHandler = (job: Job<AIJobData>) => Promise<void>;
