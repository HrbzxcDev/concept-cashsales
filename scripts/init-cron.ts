import { cronService, CRON_SCHEDULES } from '../lib/cron-service';

// Function to call the fetch-and-save API
// Must run the application first 
async function fetchAndSaveData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/fetch-and-save?limit=100&upsert=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Fetch and save result:', result);
  } catch (error) {
    console.error('Error in fetch and save task:', error);
    throw error;
  }
}

// Initialize cron jobs
function initializeCronJobs() {
  console.log('Initializing cron jobs...');

  // Schedule fetch-and-save job to run every minute
  cronService.scheduleJob({
    name: 'fetch-and-save-data',
    schedule: CRON_SCHEDULES.EVERY_MINUTE, // Every minute
    task: fetchAndSaveData
  });

  // You can add more jobs here
  // Example: Run every 30 minutes
  // cronService.scheduleJob({
  //   name: 'fetch-and-save-data-30min',
  //   schedule: CRON_SCHEDULES.EVERY_30_MINUTES,
  //   task: fetchAndSaveData
  // });

  console.log('Cron jobs initialized successfully!');
  console.log('Active jobs:', cronService.getActiveJobs());
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down cron jobs...');
  cronService.stopAllJobs();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down cron jobs...');
  cronService.stopAllJobs();
  process.exit(0);
});

// Start the cron service
if (require.main === module) {
  initializeCronJobs();
}

export { initializeCronJobs, fetchAndSaveData };
