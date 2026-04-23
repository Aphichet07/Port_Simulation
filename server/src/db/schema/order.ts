import { pgTable, serial, integer, varchar, numeric, timestamp } from 'drizzle-orm/pg-core';
import { portfolios } from './portfolios';
import { assets } from './assets';

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  
  portfolioId: integer('portfolio_id').references(() => portfolios.id).notNull(),
  
  assetId: integer('asset_id').references(() => assets.id).notNull(),
  
  side: varchar('side', { length: 10 }).notNull(), // 'BUY' หรือ 'SELL'
  
  quantity: numeric('quantity', { precision: 20, scale: 8 }).notNull(),
  price: numeric('price', { precision: 20, scale: 4 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 20, scale: 4 }).notNull(), 
  
  status: varchar('status', { length: 20 }).default('COMPLETED'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});