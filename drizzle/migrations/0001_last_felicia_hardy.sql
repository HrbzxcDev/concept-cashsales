CREATE TABLE "tblusers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(100) NOT NULL,
	"password" varchar(100) NOT NULL,
	"email" varchar(100) NOT NULL,
	"role" varchar(50) DEFAULT 'Administrator' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tblusers_id_unique" UNIQUE("id")
);
