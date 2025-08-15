'use server';

import { db } from '@/utils/db/drizzle';
import { cashsalesTable, apifetchedTable } from '@/utils/db/schema';
import { count, desc, sql, asc, eq } from 'drizzle-orm';

export async function gettotaltrans() {
  try {
    const result = await db.select({ count: count() }).from(cashsalesTable);

    return result[0]?.count || 0;
  } catch (error) {
    // console.error('Error getting total transactions:', error);
    return 0;
  }
}

export async function gettotalbranch() {
  try {
    const result = await db
      .select({ count: count(sql`DISTINCT ${cashsalesTable.customer}`) })
      .from(cashsalesTable);

    return result[0]?.count || 0;
  } catch (error) {
    // console.error('Error getting total unique branches:', error);
    return 0;
  }
}

export async function getCashsalesData() {
  try {
    const result = await db
      .select()
      .from(cashsalesTable)
      .orderBy(
        desc(cashsalesTable.cashsalesdate),
        asc(cashsalesTable.cashsalescode)
      );
    return result;
  } catch (error) {
    // console.error('Error getting cashsales data:', error);
    return [];
  }
}

export async function getTransactionCountPerLocation() {
  try {
    const result = await db
      .select({
        location: cashsalesTable.stocklocation,
        count: count()
      })
      .from(cashsalesTable)
      .groupBy(cashsalesTable.stocklocation)
      .orderBy(desc(count()));

    return result;
  } catch (error) {
    // console.error('Error getting transaction count per location:', error);
    return [];
  }
}

export async function getPercentageChangeTotalTransaction() {
  try {
    // Get yesterday's date in local timezone to avoid UTC issues
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    // Format date in local timezone (YYYY-MM-DD)
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayString = `${year}-${month}-${day}`;

    // Get total transactions count
    const totalResult = await db
      .select({
        totalCount: count()
      })
      .from(cashsalesTable);

    const totalCount = totalResult[0]?.totalCount || 0;

    // Get yesterday's transactions count
    const yesterdayResult = await db
      .select({
        yesterdayCount: count()
      })
      .from(cashsalesTable)
      .where(eq(cashsalesTable.cashsalesdate, yesterdayString));

    const yesterdayCount = yesterdayResult[0]?.yesterdayCount || 0;

    // Calculate percentage
    const percentage = totalCount > 0 ? (yesterdayCount / totalCount) * 100 : 0;

    return {
      totalTransactions: totalCount,
      yesterdayTransactions: yesterdayCount,
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      yesterdayDate: yesterdayString
    };
  } catch (error) {
    // console.error('Error getting transaction percentage from yesterday:', error);
    return {
      totalTransactions: 0,
      yesterdayTransactions: 0,
      percentage: 0,
      yesterdayDate: ''
    };
  }
}

export async function getDailyTransactionPerLocation() {
  try {
    const result = await db
      .select({
        date: cashsalesTable.cashsalesdate,
        location: cashsalesTable.stocklocation,
        count: count()
      })
      .from(cashsalesTable)
      .groupBy(cashsalesTable.cashsalesdate, cashsalesTable.stocklocation)
      .orderBy(cashsalesTable.cashsalesdate, cashsalesTable.stocklocation);

    return result;
  } catch (error) {
    // console.error('Error getting daily transactions per location:', error);
    return [];
  }
}

// Recent API fetch activities from tblapifetched
export async function getRecentApiFetches(limit: number = 10) {
  try {
    const baseQuery = db
      .select({
        id: apifetchedTable.id,
        description: apifetchedTable.description,
        count: apifetchedTable.count,
        datefetched: apifetchedTable.datefetched,
        timefetched: apifetchedTable.timefetched,
        status: apifetchedTable.status,
        createdAt: apifetchedTable.createdAt
      })
      .from(apifetchedTable)
      .orderBy(desc(apifetchedTable.createdAt));

    // If limit is -1 or 0, return all data without limit
    const result =
      limit === -1 || limit === 0
        ? await baseQuery
        : await baseQuery.limit(limit);

    // Ensure numeric values are returned as numbers
    return result.map((row) => ({
      ...row,
      count: Number(row.count as unknown as number)
    }));
  } catch (error) {
    // console.error('Error getting recent API fetches:', error);
    return [];
  }
}
