import { 
  pgTable, 
  serial, 
  integer, 
  numeric, 
  timestamp, 
  date, 
  uniqueIndex 
} from 'drizzle-orm/pg-core';
import { assets } from './assets';

export const marketData = pgTable('market_data', {
  id: serial('id').primaryKey(),
  assetId: integer('asset_id').references(() => assets.id).notNull(),
  
  priceDate: date('price_date').notNull(), 
  
  closePrice: numeric('close_price', { precision: 20, scale: 4 }).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, 
(table) => ({
  unqAssetDateIdx: uniqueIndex('unq_asset_date_idx').on(table.assetId, table.priceDate)
}));