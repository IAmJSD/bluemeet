CREATE TABLE "bsky_oauth_store" (
	"id" text NOT NULL,
	"session" boolean NOT NULL,
	"session_data" jsonb NOT NULL,
	CONSTRAINT "bsky_oauth_store_id_session_pk" PRIMARY KEY("id","session")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"did" text PRIMARY KEY NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"token" text PRIMARY KEY NOT NULL,
	"did" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "token_index" ON "tokens" USING btree ("token");