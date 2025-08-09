import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Vercel Cron Job - runs every hour
export async function GET(request: NextRequest) {
  try {
    // Call the fetch-and-save API internally
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const response = await fetch(
      `${baseUrl}/api/fetch-and-save?limit=100&upsert=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Cron job executed successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Cron job failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
