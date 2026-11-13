ALTER TABLE "privileged_emails" ADD COLUMN "claimed_at" timestamp;--> statement-breakpoint
ALTER TABLE "privileged_emails" ADD COLUMN "revoked_at" timestamp;