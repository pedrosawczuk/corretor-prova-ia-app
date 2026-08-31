ALTER TABLE "exams" ADD COLUMN "template_page_count" integer;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "template_locked_at" timestamp;--> statement-breakpoint
ALTER TABLE "question_options" ADD COLUMN "marker_page" integer;--> statement-breakpoint
ALTER TABLE "question_options" ADD COLUMN "marker_x" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "question_options" ADD COLUMN "marker_y" numeric(8, 2);