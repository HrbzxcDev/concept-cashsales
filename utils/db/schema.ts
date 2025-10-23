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
  cashsalescode: varchar('cashsalescode', { length: 100 }).notNull().unique(),
  customer: varchar('customer', { length: 100 }).notNull(),
  stocklocation: varchar('stocklocation', { length: 100 }).notNull(),
  status: boolean('status').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow()
});

export const apiactivityTable = pgTable('tblapiactivity', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  description: varchar('description', { length: 150 }).notNull(),
  count: numeric('count').notNull(),
  datefetched: date('datefetched').notNull(),
  timefetched: time('timefetched').notNull(),
  status: boolean('status').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow()
});

export const cashsalesdetailsTable = pgTable('tblcashsalesdetails', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  stockid: varchar('stockid', { length: 150 }).notNull(),
  cashsalescode: varchar('cashsalescode', { length: 150 })
    .notNull()
    .references(() => cashsalesTable.cashsalescode),
  cashsalesdate: date('cashsalesdate').notNull(),
  numbering: varchar('numbering', { length: 30 }).notNull(),
  stockcode: varchar('stockcode', { length: 100 }).notNull(),
  description: varchar('description', { length: 100 }).notNull(),
  quantity: numeric('quantity').notNull(),
  uom: varchar('uom', { length: 20 }).notNull(),
  unitprice: numeric('unitprice').notNull(),
  discount: numeric('discount').notNull(),
  amount: numeric('amount').notNull(),
  taxcode: varchar('taxcode', { length: 10 }).notNull(),
  taxamount: numeric('taxamount').notNull(),
  netamount: numeric('netamount').notNull(),
  glaccount: varchar('glaccount', { length: 15 }).notNull(),
  stocklocation: varchar('stocklocation', { length: 100 }).notNull(),
  costcentre: varchar('costcentre', { length: 100 }).notNull(),
  project: varchar('project', { length: 100 }).notNull(),
  serialnumber: varchar('serialnumber', { length: 50 }).notNull(),
  status: boolean('status').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow()
});

export const fetchCompletionTable = pgTable('tblfetchcompletion', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  operationType: varchar('operationtype', { length: 50 }).notNull(), // 'cashsales_details'
  dateFrom: date('datefrom').notNull(),
  dateTo: date('dateto').notNull(),
  completedAt: timestamp('completedat').notNull().defaultNow(),
  recordsProcessed: numeric('recordsprocessed').notNull(),
  savedCount: numeric('savedcount').notNull(),
  updatedCount: numeric('updatedcount').notNull(),
  status: boolean('status').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow()
});

export const notificationsTable = pgTable('tblnotifications', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  type: varchar('type', { length: 50 }).notNull(), // 'skipped_cashsalescode'
  title: varchar('title', { length: 200 }).notNull(),
  message: varchar('message', { length: 500 }).notNull(),
  data: varchar('data', { length: 1000 }), // JSON string for additional data
  isRead: boolean('isread').notNull().default(false),
  isActive: boolean('isactive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow()
});

export const usersTable = pgTable('tblusers', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  username: varchar('username', { length: 100 }).notNull(),
  password: varchar('password', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('Administrator'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow()
});
