import { NextRequest, NextResponse } from 'next/server';

/**
 * Cron job endpoint for Vercel
 * This endpoint is called by Vercel's cron service and internally calls the fetch-and-save API
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[CRON] Starting scheduled fetch-and-save operation...');

    // Get the base URL for the internal API call
    const baseUrl =
      process.env.NEXTAUTH_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

    // Call the existing fetch-and-save endpoint
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
      const errorText = await response.text();
      console.error('[CRON] Error calling fetch-and-save API:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(
      '[CRON] Fetch-and-save operation completed successfully:',
      result
    );

    return NextResponse.json({
      success: true,
      message: 'Cron job executed successfully',
      timestamp: new Date().toISOString(),
      result: result
    });
  } catch (error) {
    console.error('[CRON] Error in cron job:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Cron job failed',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST method for manual triggering (optional)
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
