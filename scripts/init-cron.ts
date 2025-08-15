import { cronService, CRON_SCHEDULES } from '../lib/cron-service';

// Function to call the fetch-and-save API
// Must run the application first 

//2nd Step
async function fetchAndSaveData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(
      //calling the function from /app/api/fetch-and-save
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
    console.log('Fetch and Save Result:', result);
  } catch (error) {
    console.error('Error in fetch and save task:', error);
    throw error;
  }
}

//1st Step
// Initialize cron jobs
function initializeCronJobs() {
  console.log('Initializing Cron Jobs...');

  // Schedule fetch-and-save job to run every minute
  cronService.scheduleJob({
    name: 'Fetch-and-Save-Data',
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

  console.log('Cron Jobs Initialized Successfully!');
  console.log('Active Jobs:', cronService.getActiveJobs());
}

//function if the cron jobs is canncelled/shutdown
// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting Down Cron Jobs...');
  cronService.stopAllJobs();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting Down Cron Jobs...');
  cronService.stopAllJobs();
  process.exit(0);
});

// Start the cron service
if (require.main === module) {
  initializeCronJobs();
}

export { initializeCronJobs, fetchAndSaveData };
