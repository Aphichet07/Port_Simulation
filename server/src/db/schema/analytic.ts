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

export const portfolioAnalytics = pgTable('portfolio_analytics', {
  portfolioId: integer('portfolio_id').primaryKey().references(() => portfolios.id, { onDelete: 'cascade' }),
  expectedReturn: numeric('expected_return'),
  volatility: numeric('volatility'),
  sharpeRatio: numeric('sharpe_ratio'),
  maxDrawdown: numeric('max_drawdown'),
  beta: numeric('beta'),
  lastCalculatedAt: timestamp('last_calculated_at').defaultNow(),
});