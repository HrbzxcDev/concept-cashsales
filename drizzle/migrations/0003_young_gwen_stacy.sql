CREATE TABLE IF NOT EXISTS "tblapifetched" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" varchar(150) NOT NULL,
	"count" numeric NOT NULL,
	"datefetched" date NOT NULL,
	"timefetched" time NOT NULL,
	"status" boolean NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tblapifetched_id_unique" UNIQUE("id")
);
