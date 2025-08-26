import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/drizzle';
import { fetchCompletionTable } from '@/utils/db/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    const recentActivity = await db
      .select({ count: sql<number>`count(*)` })
      .from(fetchCompletionTable)
      .where(sql`${fetchCompletionTable.createdAt} >= NOW() - INTERVAL '24 hours'`);
    
    // Get last successful fetch
    const lastFetch = await db  
      .select()
            .from(fetchCompletionTable)
      .where(
        sql`${fetchCompletionTable.status} = true AND ${fetchCompletionTable.operationType} LIKE '%cashsales_details%'`
      )
      .orderBy(sql`${fetchCompletionTable.createdAt} DESC`)
      .limit(1);
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      recentActivity: recentActivity[0]?.count || 0,
      lastFetch: lastFetch[0] ? {
        time: lastFetch[0].createdAt.toISOString(),
        operationType: lastFetch[0].operationType,
        recordsProcessed: lastFetch[0].recordsProcessed
      } : null,
      environment: process.env.NODE_ENV,
      webhookUrl: `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL}/api/vercel-webhook`
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
