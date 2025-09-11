CREATE TABLE IF NOT EXISTS "tblapiactivity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" varchar(150) NOT NULL,
	"count" numeric NOT NULL,
	"datefetched" date NOT NULL,
	"timefetched" time NOT NULL,
	"status" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tblapiactivity_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tblcashsales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cashsalesid" varchar(150) NOT NULL,
	"cashsalesdate" date NOT NULL,
	"cashsalescode" varchar(100) NOT NULL,
	"customer" varchar(100) NOT NULL,
	"stocklocation" varchar(100) NOT NULL,
	"status" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tblcashsales_id_unique" UNIQUE("id"),
	CONSTRAINT "tblcashsales_cashsalescode_unique" UNIQUE("cashsalescode")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tblcashsalesdetails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stockid" varchar(150) NOT NULL,
	"cashsalescode" varchar(150) NOT NULL,
	"cashsalesdate" date NOT NULL,
	"numbering" varchar(30) NOT NULL,
	"stockcode" varchar(100) NOT NULL,
	"description" varchar(100) NOT NULL,
	"quantity" numeric NOT NULL,
	"uom" varchar(20) NOT NULL,
	"unitprice" numeric NOT NULL,
	"discount" numeric NOT NULL,
	"amount" numeric NOT NULL,
	"taxcode" varchar(10) NOT NULL,
	"taxamount" numeric NOT NULL,
	"netamount" numeric NOT NULL,
	"glaccount" varchar(15) NOT NULL,
	"stocklocation" varchar(100) NOT NULL,
	"costcentre" varchar(100) NOT NULL,
	"project" varchar(100) NOT NULL,
	"serialnumber" varchar(50) NOT NULL,
	"status" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tblcashsalesdetails_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tblfetchcompletion" (
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
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tblnotifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(200) NOT NULL,
	"message" varchar(500) NOT NULL,
	"data" varchar(1000),
	"isread" boolean DEFAULT false NOT NULL,
	"isactive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tblnotifications_id_unique" UNIQUE("id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tblcashsalesdetails" ADD CONSTRAINT "tblcashsalesdetails_cashsalescode_tblcashsales_cashsalescode_fk" FOREIGN KEY ("cashsalescode") REFERENCES "public"."tblcashsales"("cashsalescode") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
