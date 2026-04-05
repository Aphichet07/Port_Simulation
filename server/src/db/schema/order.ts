import { pgTable, uuid, decimal, timestamp, foreignKey, json } from 'drizzle-orm/pg-core';
import { portfolios } from './portfolio';

export const simulation_results = pgTable(
  'simulation_results',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    portfolio_id: uuid('portfolio_id').notNull(),
    simulated_at: timestamp('simulated_at').notNull().defaultNow(),
    expected_return: decimal('expected_return', { precision: 10, scale: 4 }).notNull(),
    var_95: decimal('var_95', { precision: 10, scale: 4 }).notNull(),
    sharpe_ratio: decimal('sharpe_ratio', { precision: 10, scale: 4 }).notNull(),
    raw_paths_json: json('raw_paths_json').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.portfolio_id],
      foreignColumns: [portfolios.id],
    }),
  ]
);
