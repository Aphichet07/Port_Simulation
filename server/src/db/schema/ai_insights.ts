import { pgTable, uuid, integer, decimal, text, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { assets } from './assets';

export const ai_insights = pgTable(
  'ai_insights',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    asset_id: integer('asset_id').notNull(),
    sentiment_score: decimal('sentiment_score', { precision: 3, scale: 2 }).notNull(),
    summary_text: text('summary_text').notNull(),
    analyzed_at: timestamp('analyzed_at').notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.asset_id],
      foreignColumns: [assets.id],
    }),
  ]
);
