import { pgTable, serial, integer, numeric, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users';
import { assets } from './assets';

export const userAssets = pgTable('user_assets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  assetId: integer('asset_id').references(() => assets.id).notNull(),
  
  quantity: numeric('quantity', { precision: 20, scale: 8 }).notNull().default('0'), 
  avgCost: numeric('avg_cost', { precision: 20, scale: 4 }).notNull().default('0'),
  
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userAssetIdx: uniqueIndex('user_asset_idx').on(table.userId, table.assetId),
}));
