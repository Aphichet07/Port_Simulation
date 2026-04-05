import { pgTable, serial, integer, varchar, numeric, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const portfolio = pgTable('portfolio', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  quantity: numeric('quantity', { precision: 15, scale: 4 }).notNull(),
  averagePrice: numeric('average_price', { precision: 15, scale: 4 }).notNull(), // ต้นทุนเฉลี่ย
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});