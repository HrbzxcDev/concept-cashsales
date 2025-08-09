CREATE TABLE IF NOT EXISTS "tblcashsales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cashsalesid" varchar(150) NOT NULL,
	"cashsalesdate" date NOT NULL,
	"cashsalescode" varchar(50) NOT NULL,
	"customer" varchar(50) NOT NULL,
	"stocklocation" varchar(50) NOT NULL,
	"status" boolean NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tblcashsales_id_unique" UNIQUE("id")
);
