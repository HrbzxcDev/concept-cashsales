CREATE TABLE "tblapiactivity" (
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
CREATE TABLE "tblcashsales" (
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
CREATE TABLE "tblcashsalesdetails" (
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
ALTER TABLE "tblcashsalesdetails" ADD CONSTRAINT "tblcashsalesdetails_cashsalescode_tblcashsales_cashsalescode_fk" FOREIGN KEY ("cashsalescode") REFERENCES "public"."tblcashsales"("cashsalescode") ON DELETE no action ON UPDATE no action;