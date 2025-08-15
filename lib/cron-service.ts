import * as cron from 'node-cron';

interface CronJobConfig {
  schedule: string;
  task: () => Promise<void>;
  name: string;
}

class CronService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Schedule a new cron job
   */
  scheduleJob(config: CronJobConfig): void {
    const { schedule, task, name } = config;

    // Stop existing job if it exists
    if (this.jobs.has(name)) {
      this.jobs.get(name)?.stop();
    }

    // Initialized once the schedule is running
    // Create new job
    const job = cron.schedule(schedule, async () => {
      try {
        console.log(
          `[${new Date().toISOString()}] Starting Cron Jobs: ${name}`
        );
        await task();
        console.log(
          `[${new Date().toISOString()}] Completed Cron Jobs: ${name}`
        );
      } catch (error) {
        console.error(
          `[${new Date().toISOString()}] Error in Cron Jobs ${name}:`,
          error
        );
      }
    });

    this.jobs.set(name, job);
    job.start();
    console.log(
      `Scheduled Cron Jobs "${name}" With Schedule: ${schedule} (Every Minute)`
    );
  }

  /**
   * Stop a specific job
   */
  stopJob(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      console.log(`Stopped Cron Jobs: ${name}`);
    }
  }

  /**
   * Stop all jobs
   */
  stopAllJobs(): void {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped Cron Jobs: ${name}`);
    });
    this.jobs.clear();
  }

  /**
   * Get all active jobs
   */
  getActiveJobs(): string[] {
    return Array.from(this.jobs.keys());
  }
}

// Create singleton instance
export const cronService = new CronService();

// Predefined schedules
export const CRON_SCHEDULES = {
  EVERY_MINUTE: '* * * * *',
  EVERY_5_MINUTES: '*/5 * * * *',
  EVERY_10_MINUTES: '*/10 * * * *',
  EVERY_30_MINUTES: '*/30 * * * *',
  EVERY_HOUR: '0 * * * *',
  EVERY_DAY_AT_MIDNIGHT: '0 0 * * *',
  EVERY_DAY_AT_6AM: '0 6 * * *',
  EVERY_WEEK: '0 0 * * 0'
} as const;
