TRUNCATE TABLE "classrooms" CASCADE;--> statement-breakpoint
ALTER TABLE "classrooms" ALTER COLUMN "subject_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "classrooms" DROP COLUMN "subject";