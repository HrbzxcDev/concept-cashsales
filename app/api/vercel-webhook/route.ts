import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      secret, 
      action = 'fetch', 
      limit = 100, 
      upsert = true,
      dateFrom,
      dateTo,
      description = 'Vercel Webhook Triggered Fetch'
    } = body;

    // Verify webhook secret for security
    const expectedSecret = process.env.WEBHOOK_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, message: 'Invalid webhook secret' },
        { status: 401 }
      );
    }

    if (action !== 'fetch') {
      return NextResponse.json(
        { success: false, message: 'Invalid action' },
        { status: 400 }
      );
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    queryParams.append('upsert', upsert.toString());
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);
    queryParams.append('description', description);

    // Call the fetch-and-save API
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
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

    return NextResponse.json({
      success: true,
      message: 'Vercel webhook triggered fetch-and-save successfully',
      result
    });

  } catch (error) {
    console.error('Vercel webhook error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Vercel webhook endpoint is active. Use POST to trigger fetch-and-save.',
    usage: {
      method: 'POST',
      body: {
        secret: 'your_webhook_secret',
        action: 'fetch',
        limit: 100,
        upsert: true,
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        description: 'Vercel Webhook Triggered Fetch'
      }
    },
    webhookUrl: `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL}/api/vercel-webhook`
  });
}
