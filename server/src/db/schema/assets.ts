import { pgTable, serial, text, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  symbol: varchar('symbol', { length: 20 }).notNull().unique(), 
  name: text('name').notNull(),                                
  type: varchar('type', { length: 20 }).notNull(), // 'crypto', 'stock'
  exchange: varchar('exchange', { length: 20 }),   // 'BINANCE', 'SET'
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()) 
    .notNull(),
});