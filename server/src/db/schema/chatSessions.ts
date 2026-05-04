import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
  numeric,
  date,
  jsonb,
  unique
} from 'drizzle-orm/pg-core';
import { portfolios, users } from './schema';


export const chatSessions = pgTable('chat_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  portfolioId: integer('portfolio_id').references(() => portfolios.id, { onDelete: 'set null' }),
  title: varchar('title').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});