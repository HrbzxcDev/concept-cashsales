
CREATE TABLE IF NOT EXISTS "tblcomputation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"availonbank" numeric NOT NULL,
	"amtreceivable" integer NOT NULL,
	"servcharge" integer NOT NULL,
	"capital" integer NOT NULL,
	"intreceived" integer NOT NULL,
	"pendingint" integer NOT NULL,
	"equity" integer NOT NULL,
	"paidpenalty" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tblcomputation_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tblauditlogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module" varchar NOT NULL,
	"action" varchar NOT NULL,
	"description" varchar(250) NOT NULL,
	"date" date NOT NULL,
	"time" time NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tblauditlogs_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tbldashboard" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"totsavings" integer NOT NULL,
	"totonbank" numeric NOT NULL,
	"totintearned" integer NOT NULL,
	"totsavintearned" integer NOT NULL,
	"capital" numeric NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tbldashboard_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tblloans" (
	"id" serial PRIMARY KEY NOT NULL,
	"alias" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"amount" numeric NOT NULL,
	"interest" numeric NOT NULL,
	"amt_paid" numeric NOT NULL,
	"balance" numeric NOT NULL,
	"amt_month" numeric NOT NULL,
	"date_claim" date NOT NULL,
	"mnts_to_pay" numeric NOT NULL,
	"first_pay" date,
	"1st_status" boolean,
	"second_pay" date,
	"2nd_status" boolean,
	"third_pay" date,
	"3rd_status" boolean,
	"status" boolean NOT NULL,
	"email" varchar(50) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tblpenalty" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"amount" numeric NOT NULL,
	"datepaid" date NOT NULL,
	"status" boolean NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tblpenalty_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tblsavings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"Cont_Date" date NOT NULL,
	"col_alex" numeric NOT NULL,
	"col_raiven" numeric NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tblsavings_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tblservcharge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"bank" varchar NOT NULL,
	"amount" numeric NOT NULL,
	"fee" numeric NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tblservcharge_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tblusers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" text NOT NULL,
	"role" "role" DEFAULT 'Administrator',
	"lastActivityDate" date DEFAULT now(),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tblusers_id_unique" UNIQUE("id"),
	CONSTRAINT "tblusers_email_unique" UNIQUE("email")
);
