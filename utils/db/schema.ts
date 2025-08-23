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

// {
//   "id": "f1e67180-e6bd-4161-ad23-638e77bc04bd",
//   "numbering": "1",
//   "stock": "CB-BLEND1",
//   "description": "CB BLEND 1 1KG",
//   "qty": 10,
//   "uom": "UNIT(S)",
//   "unitPrice": 780,
//   "discount": "0.00",
//   "amount": 7800,
//   "taxCode": "SR-SP",
//   "taxAmount": 835.71,
//   "netAmount": 7800,
//   "glAccount": "4110000000",
//   "stockLocation": null,
//   "costCentre": null,
//   "project": "MALAKAS",
//   "serialNumber": null,
//   "cashSales": "00000394"
// }
