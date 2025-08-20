import { NextRequest, NextResponse } from 'next/server';

// Global state for polling control
let pollingInterval: NodeJS.Timeout | null = null;
let isPolling = false;
let pollConfig = {
  interval: 3600000, // 1 hour default
  limit: 100,
  upsert: true,
  description: 'Polling Triggered Fetch'
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'start':
      return startPolling();
    case 'stop':
      return stopPolling();
    case 'status':
      return getPollingStatus();
    case 'config':
      return getPollingConfig();
    default:
      return NextResponse.json({
        success: false,
        message: 'Invalid action. Use: start, stop, status, or config'
      });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      action, 
      interval, 
      limit, 
      upsert, 
      description,
      force = false 
    } = body;

    switch (action) {
      case 'start':
        return startPolling({ interval, limit, upsert, description });
      case 'stop':
        return stopPolling();
      case 'trigger':
        return triggerFetch({ limit, upsert, description, force });
      case 'config':
        return updateConfig({ interval, limit, upsert, description });
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action. Use: start, stop, trigger, or config'
        });
    }
  } catch (error) {
    console.error('Polling controller error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}

function startPolling(config?: Partial<typeof pollConfig>) {
  if (isPolling) {
    return NextResponse.json({
      success: false,
      message: 'Polling is already active'
    });
  }

  // Update config if provided
  if (config) {
    pollConfig = { ...pollConfig, ...config };
  }

  // Start polling
  pollingInterval = setInterval(async () => {
    try {
      console.log('Polling: Triggering fetch-and-save...');
      await triggerFetchOperation(pollConfig);
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, pollConfig.interval);

  isPolling = true;

  console.log(`Polling started with interval: ${pollConfig.interval}ms`);

  return NextResponse.json({
    success: true,
    message: 'Polling started successfully',
    config: pollConfig,
    nextTrigger: new Date(Date.now() + pollConfig.interval).toISOString()
  });
}

function stopPolling() {
  if (!isPolling) {
    return NextResponse.json({
      success: false,
      message: 'Polling is not active'
    });
  }

  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }

  isPolling = false;

  console.log('Polling stopped');

  return NextResponse.json({
    success: true,
    message: 'Polling stopped successfully'
  });
}

function getPollingStatus() {
  return NextResponse.json({
    success: true,
    isPolling,
    config: pollConfig,
    nextTrigger: isPolling && pollingInterval 
      ? new Date(Date.now() + pollConfig.interval).toISOString()
      : null
  });
}

function getPollingConfig() {
  return NextResponse.json({
    success: true,
    config: pollConfig
  });
}

async function triggerFetch(config?: Partial<typeof pollConfig>) {
  const fetchConfig = { ...pollConfig, ...config };
  
  try {
    const result = await triggerFetchOperation(fetchConfig);
    return NextResponse.json({
      success: true,
      message: 'Manual fetch triggered successfully',
      result
    });
  } catch (error) {
    console.error('Manual fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}

function updateConfig(config: Partial<typeof pollConfig>) {
  pollConfig = { ...pollConfig, ...config };

  // Restart polling with new config if currently active
  if (isPolling) {
    stopPolling();
    startPolling();
  }

  return NextResponse.json({
    success: true,
    message: 'Polling configuration updated',
    config: pollConfig
  });
}

async function triggerFetchOperation(config: typeof pollConfig) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const queryParams = new URLSearchParams();
  queryParams.append('limit', config.limit.toString());
  queryParams.append('upsert', config.upsert.toString());
  queryParams.append('description', config.description);

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

  const result = await response.json();
  console.log('Polling fetch result:', result);
  return result;
}

// Cleanup on process exit
process.on('SIGINT', () => {
  console.log('Shutting down polling...');
  stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down polling...');
  stopPolling();
  process.exit(0);
});
