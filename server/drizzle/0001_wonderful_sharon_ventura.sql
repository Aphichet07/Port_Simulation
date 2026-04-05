CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticker" varchar(20) NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"asset_type" varchar(20) NOT NULL,
	"sector" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_holdings" (
	"portfolio_id" uuid NOT NULL,
	"asset_id" integer NOT NULL,
	"total_quantity" numeric(18, 8) NOT NULL,
	"average_cost" numeric(18, 4) NOT NULL,
	CONSTRAINT "portfolio_holdings_portfolio_id_asset_id_pk" PRIMARY KEY("portfolio_id","asset_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"asset_id" integer NOT NULL,
	"type" varchar(10) NOT NULL,
	"quantity" numeric(18, 8) NOT NULL,
	"price_per_unit" numeric(18, 4) NOT NULL,
	"fees" numeric(10, 2) NOT NULL,
	"transaction_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_price_history" (
	"asset_id" integer NOT NULL,
	"price_date" date NOT NULL,
	"close_price" numeric(18, 4) NOT NULL,
	"volume" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "simulation_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"simulated_at" timestamp DEFAULT now() NOT NULL,
	"expected_return" numeric(10, 4) NOT NULL,
	"var_95" numeric(10, 4) NOT NULL,
	"sharpe_ratio" numeric(10, 4) NOT NULL,
	"raw_paths_json" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" integer NOT NULL,
	"sentiment_score" numeric(3, 2) NOT NULL,
	"summary_text" text NOT NULL,
	"analyzed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "risk_tolerance" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_holdings" ADD CONSTRAINT "portfolio_holdings_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_holdings" ADD CONSTRAINT "portfolio_holdings_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_price_history" ADD CONSTRAINT "asset_price_history_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulation_results" ADD CONSTRAINT "simulation_results_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");