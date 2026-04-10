import { pgTable, serial, text, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password'),
  googleId: varchar('google_id', { length: 255 }).unique(), 
  avatarUrl: text('avatar_url'),
  isActivated: boolean('is_activated').default(false), 
  activationToken: text('activation_token'),          
  createdAt: timestamp('created_at').defaultNow(),
});