CREATE TABLE "lobbies" (
	"id" varchar(8) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "lobby_id" varchar(8);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_lobby_id_lobbies_id_fk" FOREIGN KEY ("lobby_id") REFERENCES "public"."lobbies"("id") ON DELETE cascade ON UPDATE no action;