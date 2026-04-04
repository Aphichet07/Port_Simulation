import { pgTable, serial, integer, numeric, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { assets } from './assets';

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  assetId: integer('asset_id').references(() => assets.id).notNull(),
  
  type: varchar('type', { length: 10 }).notNull(), 
  quantity: numeric('quantity', { precision: 20, scale: 8 }).notNull(),
  pricePerUnit: numeric('price_per_unit', { precision: 20, scale: 4 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 20, scale: 4 }).notNull(),
  
  executedAt: timestamp('executed_at').defaultNow(),
});