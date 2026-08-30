CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subjects_name_unique" UNIQUE("name")
);
--> statement-breakpoint
INSERT INTO "subjects" ("name") VALUES
	('Matemática'),
	('Português'),
	('História'),
	('Geografia'),
	('Física'),
	('Química'),
	('Biologia'),
	('Inglês'),
	('Educação Física'),
	('Artes'),
	('Filosofia'),
	('Sociologia')
ON CONFLICT ("name") DO NOTHING;
--> statement-breakpoint
ALTER TABLE "classrooms" ADD COLUMN "subject_id" uuid;--> statement-breakpoint
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "classrooms_subject_id_idx" ON "classrooms" USING btree ("subject_id");