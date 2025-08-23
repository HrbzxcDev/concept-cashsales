'use server';

import { db } from '@/utils/db/drizzle';
import {
  cashsalesTable,
  apiactivityTable,
  cashsalesdetailsTable
} from '@/utils/db/schema';
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

    // Format date in local timezone (YYYY-MM-DD) - ensure we're using local time
    // Use toLocaleDateString to ensure we get the correct local date
    const yesterdayString = yesterday.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Manila'
    }); // YYYY-MM-DD format

    // Debug logging to check the calculated date
    // console.log('Today:', today.toISOString());
    // console.log('Yesterday calculated:', yesterday.toISOString());
    // console.log('Yesterday string (local):', yesterdayString);
    // console.log(
    //   'Today local:',
    //   today.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
    // );

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

// Recent API fetch activities from tblapiactivity
export async function getRecentApiFetches(limit: number = 0) {
  try {
    const baseQuery = db
      .select({
        id: apiactivityTable.id,
        description: apiactivityTable.description,
        count: apiactivityTable.count,
        datefetched: apiactivityTable.datefetched,
        timefetched: apiactivityTable.timefetched,
        status: apiactivityTable.status,
        createdAt: apiactivityTable.createdAt
      })
      .from(apiactivityTable)
      .orderBy(desc(apiactivityTable.createdAt));

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

// Get cash sales details by cash sales code
export async function getCashSalesDetailsByCode(cashsalescode: string) {
  try {
    const result = await db
      .select({
        id: cashsalesdetailsTable.id,
        stockid: cashsalesdetailsTable.stockid,
        cashsalescode: cashsalesdetailsTable.cashsalescode,
        cashsalesdate: cashsalesdetailsTable.cashsalesdate,
        numbering: cashsalesdetailsTable.numbering,
        stockcode: cashsalesdetailsTable.stockcode,
        description: cashsalesdetailsTable.description,
        quantity: cashsalesdetailsTable.quantity,
        uom: cashsalesdetailsTable.uom,
        unitprice: cashsalesdetailsTable.unitprice,
        discount: cashsalesdetailsTable.discount,
        amount: cashsalesdetailsTable.amount,
        taxcode: cashsalesdetailsTable.taxcode,
        taxamount: cashsalesdetailsTable.taxamount,
        netamount: cashsalesdetailsTable.netamount,
        glaccount: cashsalesdetailsTable.glaccount,
        stocklocation: cashsalesdetailsTable.stocklocation,
        costcentre: cashsalesdetailsTable.costcentre,
        project: cashsalesdetailsTable.project,
        serialnumber: cashsalesdetailsTable.serialnumber,
        status: cashsalesdetailsTable.status,
        createdAt: cashsalesdetailsTable.createdAt,
        updatedAt: cashsalesdetailsTable.updatedAt
      })
      .from(cashsalesdetailsTable)
      .where(eq(cashsalesdetailsTable.cashsalescode, cashsalescode))
      .orderBy(asc(cashsalesdetailsTable.numbering));

    // Ensure numeric values are returned as numbers
    return result.map((row) => ({
      ...row,
      quantity: Number(row.quantity),
      unitprice: Number(row.unitprice),
      discount: Number(row.discount),
      amount: Number(row.amount),
      taxamount: Number(row.taxamount),
      netamount: Number(row.netamount)
    }));
  } catch (error) {
    // console.error('Error getting cash sales details by code:', error);
    return [];
  }
}
