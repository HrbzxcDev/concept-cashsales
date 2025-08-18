import { NextRequest, NextResponse } from 'next/server';
import { cronService, CRON_SCHEDULES } from '@/lib/cron-service';

// Function to call the fetch-and-save API
// Must run the application first

//2nd Step
async function fetchAndSaveData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
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
    return result;
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

// Next.js API Route Handlers
export async function GET(request: NextRequest) {
  try {
    console.log('GET request received for cron fetch-data');

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'initialize') {
      // Initialize cron jobs
      initializeCronJobs();
      return NextResponse.json({
        success: true,
        message: 'Cron jobs initialized successfully',
        activeJobs: cronService.getActiveJobs()
      });
    } else if (action === 'status') {
      // Get status of cron jobs
      return NextResponse.json({
        success: true,
        activeJobs: cronService.getActiveJobs(),
        jobCount: cronService.getActiveJobs().length
      });
    } else if (action === 'stop') {
      // Stop all cron jobs
      cronService.stopAllJobs();
      return NextResponse.json({
        success: true,
        message: 'All cron jobs stopped'
      });
    } else {
      // Default: run fetch and save data once
      const result = await fetchAndSaveData();
      return NextResponse.json({
        success: true,
        message: 'Fetch and save operation completed',
        result
      });
    }
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received for cron fetch-data');

    const body = await request.json();
    const { action, schedule, limit, upsert } = body;

    if (action === 'schedule') {
      // Schedule a new job
      const jobName = `Custom-Fetch-${Date.now()}`;
      const cronSchedule = schedule || CRON_SCHEDULES.EVERY_MINUTE;

      cronService.scheduleJob({
        name: jobName,
        schedule: cronSchedule,
        task: async () => {
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
          const queryParams = new URLSearchParams();
          if (limit) queryParams.append('limit', limit.toString());
          if (upsert !== undefined)
            queryParams.append('upsert', upsert.toString());

          const response = await fetch(
            `${baseUrl}/api/fetch-and-save?${queryParams.toString()}`,
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

          return await response.json();
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Custom job scheduled successfully',
        jobName,
        schedule: cronSchedule
      });
    } else if (action === 'run') {
      // Run fetch and save with custom parameters
      const result = await fetchAndSaveData();
      return NextResponse.json({
        success: true,
        message: 'Fetch and save operation completed',
        result
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid action. Use "schedule" or "run"'
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export { initializeCronJobs, fetchAndSaveData };
