import { pgTable, serial, integer, varchar, numeric, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const portfolios = pgTable('portfolios', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    port_name: varchar('port_name', { length: 50 }).notNull(), 
    cashBalance: numeric('cash_balance', { precision: 15, scale: 2 }).default('100000.00'), // เงินสดแยกตามพอร์ต
    createdAt: timestamp('created_at').defaultNow().notNull(),
});