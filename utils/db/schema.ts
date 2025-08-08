import {
  pgTable,
  serial,
  varchar,
  integer,
  date,
  text,
  uuid,
  timestamp,
  numeric,
  decimal,
  boolean,
  pgEnum,
  time
} from 'drizzle-orm/pg-core';

export const ROLE_ENUM = pgEnum('role', ['Administrator']);

export const loansTable = pgTable('tblloans', {
  id: serial('id').primaryKey(),
  alias: varchar('alias', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  amount: numeric('amount').notNull(),
  interest: numeric('interest').notNull(),
  amtPaid: numeric('amt_paid').notNull(),
  balance: numeric('balance').notNull(),
  amtMonth: numeric('amt_month').notNull(),
  dateClaim: date('date_claim').notNull(),
  mntsToPay: numeric('mnts_to_pay').notNull(),
  firstPay: date('first_pay'),
  firstStatus: boolean('1st_status'),
  secondPay: date('second_pay'),
  secondStatus: boolean('2nd_status'),
  thirdPay: date('third_pay'),
  thirdStatus: boolean('3rd_status'),
  status: boolean('status').notNull(),
  email: varchar('email', { length: 50 }).notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow()
});

export const savingsTable = pgTable('tblsavings', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  savdate: date('Cont_Date').notNull(),
  alex: numeric('col_alex').notNull(),
  raiven: numeric('col_raiven').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow()
});

export const usersTable = pgTable('tblusers', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  email: text('email').notNull().unique(),
  username: varchar('username', { length: 50 }).notNull(),
  password: text('password').notNull(),
  role: ROLE_ENUM('role').default('Administrator'),
  lastActivityDate: date('lastActivityDate').defaultNow(),
  createdAt: timestamp('createdAt', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true })
    .notNull()
    .defaultNow()
});

export const dashboardTable = pgTable('tbldashboard', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  totsavings: integer('totsavings').notNull(),
  totonbank: decimal('totonbank').notNull(),
  totintearned: integer('totintearned').notNull(),
  totsavintearned: integer('totsavintearned').notNull(),
  capital: decimal('capital').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow()
});

export const penaltyTable = pgTable('tblpenalty', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  name: varchar('name', { length: 50 }).notNull(),
  penaltyamt: numeric('amount').notNull(),
  datepaid: date('datepaid').notNull(),
  status: boolean('status').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow()
});

export const ComputationTable = pgTable('tblcomputation', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  availonbank: decimal('availonbank').notNull(),
  amtreceivable: integer('amtreceivable').notNull(),
  servcharge: integer('servcharge').notNull(),
  capital: integer('capital').notNull(),
  intreceived: integer('intreceived').notNull(),
  pendingint: integer('pendingint').notNull(),
  equity: integer('equity').notNull(),
  paidpenalty: integer('paidpenalty').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow()
});

export const servchargeTable = pgTable('tblservcharge', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  servdate: date('servdate').notNull(),
  bank: varchar('bank').notNull(),
  servamount: numeric('amount').notNull(),
  fee: numeric('fee').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow()
});

export const auditLogsTable = pgTable('tblauditlogs', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  module: varchar('module').notNull(),
  action: varchar('action').notNull(),
  description: varchar('description', { length: 800 }).notNull(),
  date: date('date').notNull(),
  time: time('time').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow()
});
