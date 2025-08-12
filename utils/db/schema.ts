import {
  pgTable,
  varchar,
  date,
  timestamp,
  boolean,
  uuid,
  numeric,
  time
} from 'drizzle-orm/pg-core';


export const cashsalesTable = pgTable('tblcashsales', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  cashsalesid: varchar('cashsalesid', { length: 150 }).notNull(),
  cashsalesdate: date('cashsalesdate').notNull(),
  cashsalescode: varchar('cashsalescode', { length: 100 }).notNull(),
  customer: varchar('customer', { length: 100 }).notNull(),
  stocklocation: varchar('stocklocation', { length: 100 }).notNull(),
  status: boolean('status').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow()
});

export const apifetchedTable = pgTable('tblapifetched', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  description: varchar('description', { length: 150 }).notNull(),
  count: numeric('count').notNull(),
  datefetched: date('datefetched').notNull(),
  timefetched: time('timefetched').notNull(),
  status: boolean('status').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow()
});