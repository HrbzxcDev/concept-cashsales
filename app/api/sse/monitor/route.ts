import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/drizzle';
import { apifetchedTable } from '@/utils/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'monitor'; // 'monitor' or 'trigger'
  const autoTrigger = searchParams.get('auto') === 'true';

  if (mode === 'trigger') {
    return handleTriggerMode(request, autoTrigger);
  }

  // SSE setup for monitoring
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: any) => {
        const event = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(event));
      };

      const monitorInterval = setInterval(async () => {
        try {
          const status = await getSystemStatus();
          sendEvent({
            type: 'status',
            timestamp: new Date().toISOString(),
            ...status
          });

          // Auto-trigger logic
          if (autoTrigger && status.shouldTriggerFetch) {
            sendEvent({
              type: 'trigger',
              timestamp: new Date().toISOString(),
              message: 'Auto-triggering fetch due to conditions'
            });

            // Trigger the fetch
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            try {
              const response = await fetch(
                `${baseUrl}/api/fetch-and-save?limit=100&upsert=true&description=SSE%20Auto%20Triggered%20Fetch`,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              );

              if (response.ok) {
                const result = await response.json();
                sendEvent({
                  type: 'fetch_result',
                  timestamp: new Date().toISOString(),
                  success: true,
                  result
                });
              } else {
                sendEvent({
                  type: 'fetch_result',
                  timestamp: new Date().toISOString(),
                  success: false,
                  error: `HTTP ${response.status}`
                });
              }
            } catch (error) {
              sendEvent({
                type: 'fetch_result',
                timestamp: new Date().toISOString(),
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          }
        } catch (error) {
          sendEvent({
            type: 'error',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }, 30000); // Check every 30 seconds

      // Cleanup on close
      return () => {
        clearInterval(monitorInterval);
      };
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

async function handleTriggerMode(request: NextRequest, autoTrigger: boolean) {
  try {
    const status = await getSystemStatus();
    
    if (autoTrigger && !status.shouldTriggerFetch) {
      return NextResponse.json({
        success: false,
        message: 'Auto-trigger disabled - conditions not met',
        status
      });
    }

    // Trigger the fetch
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/fetch-and-save?limit=100&upsert=true&description=SSE%20Triggered%20Fetch`,
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
      message: 'SSE triggered fetch-and-save completed',
      result
    });

  } catch (error) {
    console.error('SSE trigger error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}

async function getSystemStatus() {
  try {
    // Get the last successful fetch
    const lastFetch = await db
      .select()
      .from(apifetchedTable)
      .where(
        and(
          eq(apifetchedTable.status, true),
          eq(apifetchedTable.description, 'API Fetch Operation Successful - Upsert Mode.')
        )
      )
      .orderBy(sql`${apifetchedTable.createdAt} DESC`)
      .limit(1);

    const now = new Date();
    const lastFetchTime = lastFetch.length > 0 ? lastFetch[0].createdAt : null;
    const timeSinceLastFetch = lastFetchTime ? now.getTime() - lastFetchTime.getTime() : null;
    const oneHour = 3600000; // 1 hour in milliseconds

    // Get recent activity count
    const recentActivity = await db
      .select({ count: sql<number>`count(*)` })
      .from(apifetchedTable)
      .where(
        and(
          eq(apifetchedTable.createdAt, sql`${apifetchedTable.createdAt} >= NOW() - INTERVAL '24 hours'`),
          eq(apifetchedTable.status, true)
        )
      );

    return {
      lastFetchTime: lastFetchTime?.toISOString() || null,
      timeSinceLastFetch,
      shouldTriggerFetch: !lastFetchTime || (timeSinceLastFetch && timeSinceLastFetch >= oneHour),
      recentActivityCount: recentActivity[0]?.count || 0,
      systemTime: now.toISOString(),
      uptime: process.uptime()
    };

  } catch (error) {
    console.error('Error getting system status:', error);
    return {
      lastFetchTime: null,
      timeSinceLastFetch: null,
      shouldTriggerFetch: false,
      recentActivityCount: 0,
      systemTime: new Date().toISOString(),
      uptime: process.uptime(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, force = false } = body;

    if (action === 'trigger' || force) {
      return handleTriggerMode(request, !force);
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action. Use "trigger" or set force=true'
    });

  } catch (error) {
    console.error('SSE POST error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}
