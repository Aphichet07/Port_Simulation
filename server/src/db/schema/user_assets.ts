import { pgTable, uuid, integer, decimal, primaryKey, foreignKey } from 'drizzle-orm/pg-core';
import { portfolios } from './portfolio';
import { assets } from './assets';

export const portfolio_holdings = pgTable('portfolio_holdings',{
    portfolio_id: uuid('portfolio_id').notNull(),
    asset_id: integer('asset_id').notNull(),
    total_quantity: decimal('total_quantity', { precision: 18, scale: 8 }).notNull(),
    average_cost: decimal('average_cost', { precision: 18, scale: 4 }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.portfolio_id, table.asset_id] }),
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
