import { pgTable, serial, text, numeric } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  balance: numeric('balance', { precision: 15, scale: 2 }).default('100000.00'),
});