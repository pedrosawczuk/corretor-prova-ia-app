CREATE TABLE "correction_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"submission_id" uuid,
	"billing_period_start" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "correction_usage_logs" ADD CONSTRAINT "correction_usage_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "correction_usage_logs_user_id_created_at_idx" ON "correction_usage_logs" USING btree ("user_id","created_at");