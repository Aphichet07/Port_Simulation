import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
  numeric,
  date,
  jsonb,
  unique
} from 'drizzle-orm/pg-core';
import { portfolios } from './schema';

export const portfolioHistory = pgTable('portfolio_history', {
  id: serial('id').primaryKey(),
  portfolioId: integer('portfolio_id').notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
  recordDate: date('record_date').notNull(),
  cashValue: numeric('cash_value').notNull(),
  assetValue: numeric('asset_value').notNull(),
  totalValue: numeric('total_value').notNull(),
  dailyReturnPercentage: numeric('daily_return_percentage'),
}, (t) => ({
  unq: unique().on(t.portfolioId, t.recordDate),
}));