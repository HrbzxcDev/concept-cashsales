'use server';

import { db } from '@/utils/db/drizzle';
import { cashsalesTable } from '@/utils/db/schema';
import { count, sql } from 'drizzle-orm';

export async function gettotaltrans() {
  try {
    const result = await db.select({ count: count() }).from(cashsalesTable);

    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error getting total transactions:', error);
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
    console.error('Error getting total unique branches:', error);
    return 0;
  }
}

export async function getCashsalesData() {
  try {
    const result = await db.select().from(cashsalesTable).limit(20);
    return result;
  } catch (error) {
    console.error('Error getting cashsales data:', error);
    return [];
  }
}