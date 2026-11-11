CREATE TABLE "billing_customers" (
	"user_id" text PRIMARY KEY NOT NULL,
	"asaas_customer_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "billing_customers_asaas_customer_id_unique" UNIQUE("asaas_customer_id")
);
--> statement-breakpoint
ALTER TABLE "billing_events" RENAME COLUMN "abacatepay_event_id" TO "asaas_event_id";--> statement-breakpoint
ALTER TABLE "subscriptions" RENAME COLUMN "abacatepay_billing_id" TO "asaas_subscription_id";--> statement-breakpoint
ALTER TABLE "billing_events" DROP CONSTRAINT "billing_events_abacatepay_event_id_unique";--> statement-breakpoint
DROP INDEX "subscriptions_abacatepay_billing_id_idx";--> statement-breakpoint
ALTER TABLE "billing_events" ADD COLUMN "asaas_payment_id" text;--> statement-breakpoint
ALTER TABLE "billing_customers" ADD CONSTRAINT "billing_customers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "billing_events_asaas_payment_id_idx" ON "billing_events" USING btree ("asaas_payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_asaas_subscription_id_idx" ON "subscriptions" USING btree ("asaas_subscription_id");--> statement-breakpoint
ALTER TABLE "plans" DROP COLUMN "abacatepay_product_id";--> statement-breakpoint
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_asaas_event_id_unique" UNIQUE("asaas_event_id");
