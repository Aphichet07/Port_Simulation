import { pgTable, integer, date, decimal, bigint, foreignKey } from 'drizzle-orm/pg-core';
import { assets } from './assets';

export const asset_price_history = pgTable(
  'asset_price_history',
  {
    asset_id: integer('asset_id').notNull(),
    price_date: date('price_date').notNull(),
    close_price: decimal('close_price', { precision: 18, scale: 4 }).notNull(),
    volume: bigint('volume', { mode: 'number' }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.asset_id],
      foreignColumns: [assets.id],
    }),
  ]
);
