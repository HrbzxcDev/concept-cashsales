import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/drizzle';
import { cashsalesTable, apifetchedTable } from '@/utils/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const autoTrigger = searchParams.get('auto') === 'true';
    const checkInterval = parseInt(searchParams.get('interval') || '3600000'); // 1 hour default

    // Get current time in Philippine timezone
    const now = new Date();
    const currentDate = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
    const currentTime = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Manila' }).split(' ')[0];

    // Check if we should trigger a fetch based on conditions
    const shouldTrigger = await checkTriggerConditions(currentDate, currentTime);

    if (!shouldTrigger && autoTrigger) {
      return NextResponse.json({
        success: true,
        message: 'No fetch triggered - conditions not met',
        conditions: {
          lastFetchTime: shouldTrigger.lastFetchTime || null,
          timeSinceLastFetch: shouldTrigger.timeSinceLastFetch || null ,
          shouldTrigger: shouldTrigger.shouldTrigger || false,
          threshold: checkInterval
        }
      });
    }

    // Trigger the fetch-and-save operation
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/fetch-and-save?limit=100&upsert=true&description=Event%20Driven%20Fetch`,
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
      message: 'Event-driven fetch-and-save completed',
      triggered: shouldTrigger.shouldTrigger,
      result
    });

  } catch (error) {
    console.error('Event-driven fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}

async function checkTriggerConditions(currentDate: string, currentTime: string) {
  try {
    // Get the last successful fetch time
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

    if (lastFetch.length === 0) {
      return {
        shouldTrigger: true,
        lastFetchTime: null,
        timeSinceLastFetch: null,
        reason: 'No previous fetch found'
      };
    }

    const lastFetchTime = lastFetch[0].createdAt;
    const timeSinceLastFetch = Date.now() - lastFetchTime.getTime();
    const oneHour = 3600000; // 1 hour in milliseconds

    // Check if enough time has passed since last fetch
    const shouldTrigger = timeSinceLastFetch >= oneHour;

    return {
      shouldTrigger,
      lastFetchTime: lastFetchTime.toISOString(),
      timeSinceLastFetch,
      reason: shouldTrigger 
        ? 'Enough time has passed since last fetch' 
        : 'Not enough time has passed since last fetch'
    };

  } catch (error) {
    console.error('Error checking trigger conditions:', error);
    return {
      shouldTrigger: false,
      lastFetchTime: null,
      timeSinceLastFetch: null,
      reason: 'Error checking conditions'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      conditions = {},
      force = false,
      limit = 100,
      upsert = true
    } = body;

    // If force is true, skip condition checking
    if (!force) {
      const now = new Date();
      const currentDate = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
      const currentTime = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Manila' }).split(' ')[0];
      
      const shouldTrigger = await checkTriggerConditions(currentDate, currentTime);
      
      if (!shouldTrigger.shouldTrigger) {
        return NextResponse.json({
          success: false,
          message: 'Fetch not triggered - conditions not met',
          conditions: shouldTrigger
        });
      }
    }

    // Trigger the fetch
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    queryParams.append('upsert', upsert.toString());
    queryParams.append('description', force ? 'Forced Event Driven Fetch' : 'Event Driven Fetch');

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
      message: 'Event-driven fetch-and-save completed',
      forced: force,
      result
    });

  } catch (error) {
    console.error('Event-driven fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}
