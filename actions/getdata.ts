'use server';

import { db } from '@/utils/db/drizzle';
import {
  cashsalesTable,
  apiactivityTable,
  cashsalesdetailsTable
} from '@/utils/db/schema';
import { count, desc, sql, asc, eq, sum } from 'drizzle-orm';

export async function gettotaltrans() {
  try {
    const result = await db.select({ count: count() }).from(cashsalesTable);

    return result[0]?.count || 0;
  } catch (error) {
    // console.error('Error getting total transactions:', error);
    return 0;
  }
}

export async function gettotalitemsquantity() {
  try {
    const result = await db
      .select({ sum: sum(cashsalesdetailsTable.quantity) })
      .from(cashsalesdetailsTable);
    return result[0]?.sum || 0;
  } catch (error) {
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

export async function getCashsalesDetailsData() {
  try {
    // console.log('🔍 Fetching cashsales details data from database...');
    const result = await db
      .select({
        cashsalesdate: cashsalesdetailsTable.cashsalesdate,
        quantity: cashsalesdetailsTable.quantity
      })
      .from(cashsalesdetailsTable)
      .orderBy(desc(cashsalesdetailsTable.cashsalesdate));

    // console.log('📊 Database result length:', result?.length || 0);
    // console.log('📊 Database result sample:', result?.slice(0, 3));
    // console.log(
    //   '📊 Total quantity sum:',
    //   result?.reduce((sum, row) => sum + Number(row.quantity || 0), 0) || 0
    // );

    // Check for unique dates
    // const uniqueDates = new Set(
    //   result?.map((row) => row.cashsalesdate?.toString()) || []
    // );
    // console.log('📅 Unique dates in database:', Array.from(uniqueDates).sort());
    // console.log('📅 Number of unique dates:', uniqueDates.size);

    // Check quantity distribution
    // const quantities = result?.map((row) => Number(row.quantity || 0)) || [];
    // console.log('📊 Quantity distribution:', {
    //   min: Math.min(...quantities),
    //   max: Math.max(...quantities),
    //   avg: Math.round(
    //     quantities.reduce((sum, qty) => sum + qty, 0) / quantities.length
    //   )
    // });

    return result;
  } catch (error) {
    console.error('❌ Error getting cashsales details data:', error);
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
    });
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

export async function getPercentageChangeTotalItemsQuantity() {
  try {
    // Get yesterday's date in local timezone to avoid UTC issues
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Format date in local timezone (YYYY-MM-DD) - ensure we're using local time
    // Use toLocaleDateString to ensure we get the correct local date
    const yesterdayString = yesterday.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Manila'
    });
    // Get total transactions count by quantity
    const totalResult = await db
      .select({
        totalCount: sum(cashsalesdetailsTable.quantity)
      })
      .from(cashsalesdetailsTable);

    const totalCount = Number(totalResult[0]?.totalCount) || 0;

    // Get yesterday's transactions count by quantity
    const yesterdayResult = await db
      .select({
        yesterdayCount: sum(cashsalesdetailsTable.quantity)
      })
      .from(cashsalesdetailsTable)
      .where(eq(cashsalesdetailsTable.cashsalesdate, yesterdayString));

    const yesterdayCount = Number(yesterdayResult[0]?.yesterdayCount) || 0;

    // Calculate percentage
    const percentage = totalCount > 0 ? (yesterdayCount / totalCount) * 100 : 0;
    // console.log('totalCount', totalCount);
    // console.log('yesterdayCount', yesterdayCount);
    // console.log('percentage', percentage);

    return {
      totalItemsQuantity: totalCount,
      yesterdayItemsQuantity: yesterdayCount,
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      yesterdayDate: yesterdayString
    };
  } catch (error) {
    // console.error('Error getting transaction percentage from yesterday:', error);
    return {
      totalItemsQuantity: 0,
      yesterdayItemsQuantity: 0,
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

export async function getTotalNetAmount() {
  try {
    const result = await db
      .select({ totalNetAmount: sum(cashsalesdetailsTable.netamount) })
      .from(cashsalesdetailsTable);

    return Number(result[0]?.totalNetAmount) || 0;
  } catch (error) {
    console.error('Error getting total net amount:', error);
    return 0;
  }
}

export async function getTotalDiscount() {
  try {
    const result = await db
      .select({ totalDiscount: sum(cashsalesdetailsTable.discount) })
      .from(cashsalesdetailsTable);

    return Number(result[0]?.totalDiscount) || 0;
  } catch (error) {
    console.error('Error getting total discount:', error);
    return 0;
  }
}

export async function getDailySalesAndDiscountData() {
  try {
    // Fetch sums grouped by date for the last 7 days including today
    const result = await db
      .select({
        date: sql<string>`DATE(${cashsalesdetailsTable.cashsalesdate})`,
        netSales: sum(cashsalesdetailsTable.netamount),
        discount: sum(cashsalesdetailsTable.discount)
      })
      .from(cashsalesdetailsTable)
      .where(
        sql`DATE(${cashsalesdetailsTable.cashsalesdate}) BETWEEN CURRENT_DATE - INTERVAL '6 day' AND CURRENT_DATE`
      )
      .groupBy(sql`DATE(${cashsalesdetailsTable.cashsalesdate})`)
      .orderBy(sql`DATE(${cashsalesdetailsTable.cashsalesdate})`);

    // Map only existing days (exclude zero-activity days) and format label as MM/DD
    return result.map((row) => {
      const d = new Date(row.date);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return {
        date: `${mm}/${dd}`,
        netSales: Number(row.netSales) || 0,
        discount: Number(row.discount) || 0
      };
    });
  } catch (error) {
    console.error('Error getting daily sales and discount data:', error);
    return [];
  }
}

export async function getWeeklySalesAndDiscountData() {
  try {
    // Get weekly data with date range formatting
    const result = await db
      .select({
        weekStart: sql<string>`DATE_TRUNC('week', ${cashsalesdetailsTable.cashsalesdate})`,
        weekEnd: sql<string>`DATE_TRUNC('week', ${cashsalesdetailsTable.cashsalesdate}) + INTERVAL '6 days'`,
        netSales: sum(cashsalesdetailsTable.netamount),
        discount: sum(cashsalesdetailsTable.discount)
      })
      .from(cashsalesdetailsTable)
      .groupBy(sql`DATE_TRUNC('week', ${cashsalesdetailsTable.cashsalesdate})`)
      .orderBy(sql`DATE_TRUNC('week', ${cashsalesdetailsTable.cashsalesdate})`);

    // console.log('📊 Weekly data result:', result);

    return result.map((row) => {
      // Format the date range as MM/DD-MM/DD
      const startDate = new Date(row.weekStart);
      const endDate = new Date(row.weekEnd);

      const startFormatted = `${String(startDate.getMonth() + 1).padStart(
        2,
        '0'
      )}/${String(startDate.getDate()).padStart(2, '0')}`;
      const endFormatted = `${String(endDate.getMonth() + 1).padStart(
        2,
        '0'
      )}/${String(endDate.getDate()).padStart(2, '0')}`;

      return {
        week: `${startFormatted}-${endFormatted}`,
        netSales: Number(row.netSales) || 0,
        discount: Number(row.discount) || 0
      };
    });
  } catch (error) {
    console.error('Error getting weekly sales and discount data:', error);

    // Fallback: try with a different approach for databases that don't support DATE_TRUNC
    try {
      const fallbackResult = await db
        .select({
          weekStart: sql<string>`DATE(${cashsalesdetailsTable.cashsalesdate} - INTERVAL '6 days')`,
          weekEnd: sql<string>`DATE(${cashsalesdetailsTable.cashsalesdate})`,
          netSales: sum(cashsalesdetailsTable.netamount),
          discount: sum(cashsalesdetailsTable.discount)
        })
        .from(cashsalesdetailsTable)
        .groupBy(
          sql`DATE(${cashsalesdetailsTable.cashsalesdate} - INTERVAL '6 days')`
        )
        .orderBy(
          sql`DATE(${cashsalesdetailsTable.cashsalesdate} - INTERVAL '6 days')`
        );

      // console.log('📊 Weekly data fallback result:', fallbackResult);

      return fallbackResult.map((row) => {
        // Format the date range as MM/DD-MM/DD
        const startDate = new Date(row.weekStart);
        const endDate = new Date(row.weekEnd);

        const startFormatted = `${String(startDate.getMonth() + 1).padStart(
          2,
          '0'
        )}/${String(startDate.getDate()).padStart(2, '0')}`;
        const endFormatted = `${String(endDate.getMonth() + 1).padStart(
          2,
          '0'
        )}/${String(endDate.getDate()).padStart(2, '0')}`;

        return {
          week: `${startFormatted}-${endFormatted}`,
          netSales: Number(row.netSales) || 0,
          discount: Number(row.discount) || 0
        };
      });
    } catch (fallbackError) {
      console.error('Error in fallback weekly data query:', fallbackError);
      return [];
    }
  }
}

export async function getMonthlySalesAndDiscountData() {
  try {
    const result = await db
      .select({
        month: sql<string>`TO_CHAR(${cashsalesdetailsTable.cashsalesdate}, 'Month')`,
        monthNumber: sql<number>`EXTRACT(MONTH FROM ${cashsalesdetailsTable.cashsalesdate})`,
        netSales: sum(cashsalesdetailsTable.netamount),
        discount: sum(cashsalesdetailsTable.discount)
      })
      .from(cashsalesdetailsTable)
      .groupBy(
        sql`TO_CHAR(${cashsalesdetailsTable.cashsalesdate}, 'Month')`,
        sql`EXTRACT(MONTH FROM ${cashsalesdetailsTable.cashsalesdate})`
      )
      .orderBy(sql`EXTRACT(MONTH FROM ${cashsalesdetailsTable.cashsalesdate})`);

    return result.map((row) => ({
      month: row.month?.trim() || '',
      netSales: Number(row.netSales) || 0,
      discount: Number(row.discount) || 0
    }));
  } catch (error) {
    console.error('Error getting monthly sales and discount data:', error);
    return [];
  }
}

export async function getTop5ItemsByQuantity() {
  try {
    const result = await db
      .select({
        stockcode: cashsalesdetailsTable.stockcode,
        totalQuantity: sum(cashsalesdetailsTable.quantity)
      })
      .from(cashsalesdetailsTable)
      .groupBy(cashsalesdetailsTable.stockcode)
      .orderBy(desc(sum(cashsalesdetailsTable.quantity)))
      .limit(5);

    return result.map((item) => ({
      stockcode: item.stockcode,
      totalQuantity: Number(item.totalQuantity || 0)
    }));
  } catch (error) {
    console.error('❌ Error getting top 5 items by quantity:', error);
    return [];
  }
}


export interface CashSalesDetailsData {
  totalCount: number;
  data: any[];
}

export async function getCashSalesDetailsDataWithCount(): Promise<CashSalesDetailsData> {
  let totalCashSalesDetails = 0;
  let cashsalesdetailsData: any[] = [];

  try {
    // First, get a count of all rows
    const countResult = await db
      .select({ count: count() })
      .from(cashsalesdetailsTable);
    totalCashSalesDetails = Number(countResult[0]?.count || 0);

    // Then fetch all rows
    cashsalesdetailsData = await db
      .select()
      .from(cashsalesdetailsTable)
      .orderBy(
        desc(cashsalesdetailsTable.cashsalesdate),
        asc(cashsalesdetailsTable.cashsalescode),
        asc(cashsalesdetailsTable.numbering)
      );
  } catch (error) {
    console.error('Error fetching cash sales details:', error);
    throw new Error('Failed to fetch cash sales details data');
  }

  return {
    totalCount: totalCashSalesDetails,
    data: cashsalesdetailsData
  };
}

export async function getStockCodeTotals(stockCode: string) {
  try {
    const result = await db
      .select({
        stockcode: cashsalesdetailsTable.stockcode,
        totalQuantity: sum(cashsalesdetailsTable.quantity),
        totalAmount: sum(cashsalesdetailsTable.amount),
        totalDiscount: sum(cashsalesdetailsTable.discount),
        totalTaxAmount: sum(cashsalesdetailsTable.taxamount),
        totalNetAmount: sum(cashsalesdetailsTable.netamount),
        transactionCount: count()
      })
      .from(cashsalesdetailsTable)
      .where(eq(cashsalesdetailsTable.stockcode, stockCode))
      .groupBy(cashsalesdetailsTable.stockcode);

    if (result.length === 0) {
      return null;
    }

    const item = result[0];
    return {
      stockcode: item.stockcode,
      totalQuantity: Number(item.totalQuantity || 0),
      totalAmount: Number(item.totalAmount || 0),
      totalDiscount: Number(item.totalDiscount || 0),
      totalTaxAmount: Number(item.totalTaxAmount || 0),
      totalNetAmount: Number(item.totalNetAmount || 0),
      transactionCount: Number(item.transactionCount || 0)
    };
  } catch (error) {
    console.error('❌ Error getting stock code totals:', error);
    return null;
  }
}
