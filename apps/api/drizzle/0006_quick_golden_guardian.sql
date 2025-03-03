CREATE TABLE "highscores" (
	"hash" varchar(255),
	"user_id" integer,
	"score" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "highscores_hash_user_id_pk" PRIMARY KEY("hash","user_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "highscores" ADD CONSTRAINT "highscores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;