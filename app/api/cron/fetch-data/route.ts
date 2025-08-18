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

    // Prepare authentication headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Vercel-Cron-Job/1.0'
    };

    // Add API key if configured
    const apiKey = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY;
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // Add secret token if configured
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      headers['X-Cron-Secret'] = cronSecret;
    }

    // Add session token if configured
    const sessionToken = process.env.SESSION_TOKEN;
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }

    // Add basic auth if configured
    const basicAuthUsername = process.env.BASIC_AUTH_USERNAME;
    const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD;
    if (basicAuthUsername && basicAuthPassword) {
      const basicAuth = Buffer.from(
        `${basicAuthUsername}:${basicAuthPassword}`
      ).toString('base64');
      headers['Authorization'] = `Basic ${basicAuth}`;
    }

    // Add custom auth header if configured
    const customAuthHeader = process.env.CUSTOM_AUTH_HEADER;
    const customAuthValue = process.env.CUSTOM_AUTH_VALUE;
    if (customAuthHeader && customAuthValue) {
      headers[customAuthHeader] = customAuthValue;
    }

    // Add NextAuth session cookie if available
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    if (nextAuthSecret) {
      // Create a simple session token for internal API calls
      const sessionData = {
        user: { id: 'cron-job', email: 'cron@system.local' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };
      const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString(
        'base64'
      );
      headers['Cookie'] = `next-auth.session-token=${sessionToken}`;
    }

    console.log('[CRON] Making request with headers:', Object.keys(headers));

    // Call the existing fetch-and-save endpoint
    const response = await fetch(
      `${baseUrl}/api/fetch-and-save?limit=100&upsert=true`,
      {
        method: 'GET',
        headers
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CRON] Error calling fetch-and-save API:', errorText);

      // Check if it's an authentication error
      if (response.status === 401 || response.status === 403) {
        console.error(
          '[CRON] Authentication error - check authentication configuration'
        );
        throw new Error(
          `Authentication error: ${response.status} - Check API_KEY, CRON_SECRET, NEXTAUTH_SECRET, or other auth variables`
        );
      }

      // Check if it's an HTML response (likely a login page)
      if (
        errorText.includes('<!doctype html>') ||
        errorText.includes('<html')
      ) {
        console.error(
          '[CRON] Received HTML response instead of JSON - likely authentication redirect'
        );
        throw new Error(
          'Received HTML response - API may be protected by authentication. Check authentication headers.'
        );
      }

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
