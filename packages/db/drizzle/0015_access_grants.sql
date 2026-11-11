CREATE TYPE "public"."access_grant_reminder_kind" AS ENUM('30_days', '7_days', '1_day');--> statement-breakpoint
CREATE TYPE "public"."access_grant_source" AS ENUM('invite', 'privileged_email');--> statement-breakpoint
CREATE TABLE "access_grant_reminders" (
	"grant_id" uuid NOT NULL,
	"kind" "access_grant_reminder_kind" NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "access_grant_reminders_grant_id_kind_pk" PRIMARY KEY("grant_id","kind")
);
--> statement-breakpoint
CREATE TABLE "access_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"plan_id" uuid NOT NULL,
	"source" "access_grant_source" NOT NULL,
	"invite_id" uuid,
	"starts_at" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "access_grants_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"invited_by_user_id" text,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invites_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "privileged_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"note" text,
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "privileged_emails_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "access_grant_reminders" ADD CONSTRAINT "access_grant_reminders_grant_id_access_grants_id_fk" FOREIGN KEY ("grant_id") REFERENCES "public"."access_grants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_invite_id_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_invited_by_user_id_user_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "privileged_emails" ADD CONSTRAINT "privileged_emails_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "access_grants_expires_at_idx" ON "access_grants" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "invites_email_idx" ON "invites" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "invites_open_per_email_idx" ON "invites" USING btree ("email") WHERE "invites"."accepted_at" is null and "invites"."revoked_at" is null;