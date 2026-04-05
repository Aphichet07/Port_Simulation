import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
  risk_tolerance: integer('risk_tolerance').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
});