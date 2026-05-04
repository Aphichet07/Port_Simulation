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
  unique,
} from "drizzle-orm/pg-core";
import { portfolios } from "./schema";

export const optimizationLogs = pgTable("optimization_logs", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id")
    .notNull()
    .references(() => portfolios.id, { onDelete: "cascade" }),
  objective: varchar("objective").notNull(), // เช่น 'MAX_SHARPE', 'MIN_RISK'
  fitnessScore: numeric("fitness_score"),
  recommendedWeights: jsonb("recommended_weights").notNull(), // เก็บเป็น Object { "AAPL": 0.4, "TSLA": 0.6 }
  oldMetrics: jsonb("old_metrics"),
  newMetrics: jsonb("new_metrics"),
  createdAt: timestamp("created_at").defaultNow(),
});
