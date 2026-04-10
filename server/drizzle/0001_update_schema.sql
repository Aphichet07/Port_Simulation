-- Drop old incomplete schema
DROP TABLE IF EXISTS "users" CASCADE;

-- Create users table
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"password" text,
	"google_id" varchar(255) UNIQUE,
	"avatar_url" text,
	"balance" numeric(15, 2) DEFAULT '100000.00',
	"is_activated" boolean DEFAULT false,
	"activation_token" text,
	"created_at" timestamp DEFAULT now()
);

-- Create assets table
CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" varchar(20) NOT NULL UNIQUE,
	"name" text NOT NULL,
	"type" varchar(20) NOT NULL,
	"exchange" varchar(20),
	"updated_at" timestamp DEFAULT now()
);

-- Create market_data table
CREATE TABLE "market_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL REFERENCES "assets"("id"),
	"price_date" date NOT NULL,
	"close_price" numeric(20, 4) NOT NULL
);

-- Create transactions table
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL REFERENCES "users"("id"),
	"asset_id" integer NOT NULL REFERENCES "assets"("id"),
	"type" varchar(10) NOT NULL,
	"quantity" numeric(20, 8) NOT NULL,
	"price_per_unit" numeric(20, 4) NOT NULL,
	"total_amount" numeric(20, 4) NOT NULL,
	"executed_at" timestamp DEFAULT now()
);

-- Create user_assets table
CREATE TABLE "user_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL REFERENCES "users"("id"),
	"asset_id" integer NOT NULL REFERENCES "assets"("id"),
	"quantity" numeric(20, 8) NOT NULL DEFAULT '0',
	"avg_cost" numeric(20, 4) NOT NULL DEFAULT '0',
	"updated_at" timestamp DEFAULT now()
);

-- Create unique index for user_assets
CREATE UNIQUE INDEX "user_asset_idx" ON "user_assets" ("user_id", "asset_id");

-- Create portfolio table
CREATE TABLE "portfolio" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL REFERENCES "users"("id"),
	"symbol" varchar(20) NOT NULL,
	"quantity" numeric(15, 4) NOT NULL,
	"average_price" numeric(15, 4) NOT NULL,
	"updated_at" timestamp NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL REFERENCES "users"("id"),
	"symbol" varchar(20) NOT NULL,
	"side" varchar(10) NOT NULL,
	"quantity" numeric(15, 4) NOT NULL,
	"price" numeric(15, 4) NOT NULL,
	"total_amount" numeric(15, 4) NOT NULL,
	"status" varchar(20) DEFAULT 'COMPLETED',
	"created_at" timestamp NOT NULL DEFAULT now()
);
