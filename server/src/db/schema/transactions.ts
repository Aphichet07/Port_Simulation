import { pgTable, uuid, integer, varchar, decimal, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { portfolios } from './portfolio';
import { assets } from './assets';

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    portfolio_id: uuid('portfolio_id').notNull(),
    asset_id: integer('asset_id').notNull(),
    type: varchar('type', { length: 10 }).notNull(),
    quantity: decimal('quantity', { precision: 18, scale: 8 }).notNull(),
    price_per_unit: decimal('price_per_unit', { precision: 18, scale: 4 }).notNull(),
    fees: decimal('fees', { precision: 10, scale: 2 }).notNull(),
    transaction_date: timestamp('transaction_date').notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.portfolio_id],
      foreignColumns: [portfolios.id],
    }),
    foreignKey({
      columns: [table.asset_id],
      foreignColumns: [assets.id],
    }),
  ]
);
