CREATE TYPE "public"."correction_credit_source" AS ENUM('purchase', 'consumption', 'manual_adjustment');--> statement-breakpoint
CREATE TYPE "public"."plan_billing_type" AS ENUM('one_time', 'recurring');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'past_due', 'canceled');--> statement-breakpoint
CREATE TABLE "billing_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"abacatepay_event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "billing_events_abacatepay_event_id_unique" UNIQUE("abacatepay_event_id")
);
--> statement-breakpoint
CREATE TABLE "correction_credits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"delta" integer NOT NULL,
	"source" "correction_credit_source" NOT NULL,
	"reference_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"billing_type" "plan_billing_type" NOT NULL,
	"price_cents" integer NOT NULL,
	"monthly_corrections_limit" integer,
	"credits_granted" integer,
	"allows_docx_export" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
INSERT INTO "plans" ("slug", "name", "billing_type", "price_cents", "monthly_corrections_limit", "credits_granted", "allows_docx_export") VALUES
	('avulso', 'Avulso', 'one_time', 1990, NULL, 10, false),
	('essencial', 'Essencial', 'recurring', 3990, 100, NULL, false),
	('pro', 'Pro', 'recurring', 9990, 500, NULL, true)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"plan_id" uuid NOT NULL,
	"pending_plan_id" uuid,
	"status" "subscription_status" NOT NULL,
	"abacatepay_billing_id" text NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "correction_credits" ADD CONSTRAINT "correction_credits_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_pending_plan_id_plans_id_fk" FOREIGN KEY ("pending_plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "correction_credits_user_id_idx" ON "correction_credits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_abacatepay_billing_id_idx" ON "subscriptions" USING btree ("abacatepay_billing_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_active_per_user_idx" ON "subscriptions" USING btree ("user_id") WHERE "subscriptions"."status" = 'active';