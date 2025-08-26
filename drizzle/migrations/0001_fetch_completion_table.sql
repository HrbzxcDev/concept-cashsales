CREATE TABLE "tblfetchcompletion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"operationtype" varchar(50) NOT NULL,
	"datefrom" date NOT NULL,
	"dateto" date NOT NULL,
	"completedat" timestamp DEFAULT now() NOT NULL,
	"recordsprocessed" numeric NOT NULL,
	"savedcount" numeric NOT NULL,
	"updatedcount" numeric NOT NULL,
	"status" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tblfetchcompletion_id_unique" UNIQUE("id")
);
