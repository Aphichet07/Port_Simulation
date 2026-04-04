import { pgTable, serial, text, varchar, timestamp } from 'drizzle-orm/pg-core';

export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  symbol: varchar('symbol', { length: 20 }).notNull().unique(), 
  name: text('name').notNull(),                                 
  type: varchar('type', { length: 20 }).notNull(),            
  exchange: varchar('exchange', { length: 20 }),              
  updatedAt: timestamp('updated_at').defaultNow(),
});