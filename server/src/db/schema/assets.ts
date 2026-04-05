import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  ticker: varchar('ticker', { length: 20 }).notNull(),
  full_name: varchar('full_name', { length: 100 }).notNull(),
  asset_type: varchar('asset_type', { length: 20 }).notNull(),
  sector: varchar('sector', { length: 50 }).notNull(),
});

