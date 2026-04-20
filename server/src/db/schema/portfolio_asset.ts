import { pgTable, serial, integer, varchar, numeric, timestamp } from 'drizzle-orm/pg-core';
import { portfolios } from './portfolios';

export const portfolioAssets = pgTable('portfolio_assets', {
    id: serial('id').primaryKey(),
    portfolioId: integer('portfolio_id')
      .references(() => portfolios.id, { onDelete: 'cascade' })
      .notNull(),
    
    symbol: varchar('symbol', { length: 20 }).notNull(), 
    
    weight: numeric('weight', { precision: 5, scale: 4 }).notNull(), 
    
    // units: numeric('units', { precision: 18, scale: 6 }).default('0'), 
});