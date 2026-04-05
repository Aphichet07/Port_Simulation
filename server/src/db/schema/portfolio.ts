import { pgTable, uuid, varchar, text, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { users } from './users';

export const portfolios = pgTable(
  'portfolios',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    created_at: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.id],
    }),
  ]
);
