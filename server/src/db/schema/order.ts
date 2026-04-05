import { pgTable, serial, integer, varchar, numeric, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  side: varchar('side', { length: 10 }).notNull(), // 'BUY' หรือ 'SELL'
  quantity: numeric('quantity', { precision: 15, scale: 4 }).notNull(),
  price: numeric('price', { precision: 15, scale: 4 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 15, scale: 4 }).notNull(), // quantity * price
  status: varchar('status', { length: 20 }).default('COMPLETED'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});