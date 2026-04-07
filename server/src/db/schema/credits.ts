import { pgTable, serial, integer, numeric, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const creditTransactions = pgTable('credit_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  type: text('type').notNull(), // 'ADD', 'BUY', 'SELL', 'INITIALIZE'
  reason: text('reason'),
  balanceBefore: numeric('balance_before', { precision: 15, scale: 2 }).notNull(),
  balanceAfter: numeric('balance_after', { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
