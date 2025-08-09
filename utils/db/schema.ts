import {
  pgTable,
  varchar,
  date,
  timestamp,
  boolean,
  uuid,
} from 'drizzle-orm/pg-core';

export const cashsalesTable = pgTable('tblcashsales', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  cashsalesid: varchar('cashsalesid', { length: 150 }).notNull(),
  cashsalesdate: date('cashsalesdate').notNull(),
  cashsalescode: varchar('cashsalescode', { length: 50 }).notNull(),
  customer: varchar('customer', { length: 50 }).notNull(),
  stocklocation: varchar('stocklocation', { length: 50 }).notNull(),
  status: boolean('status').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow()
});
