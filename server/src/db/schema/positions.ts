import { pgTable, serial, integer, numeric, timestamp } from 'drizzle-orm/pg-core';
import { portfolios } from './portfolios';
import { assets } from './assets';

export const positions = pgTable('positions', {
  id: serial('id').primaryKey(),
  portfolioId: integer('portfolio_id').references(() => portfolios.id).notNull(), 
  assetId: integer('asset_id').references(() => assets.id).notNull(), 
  quantity: numeric('quantity', { precision: 15, scale: 4 }).notNull(),
  averagePrice: numeric('average_price', { precision: 15, scale: 4 }).notNull(), 
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});