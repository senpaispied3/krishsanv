CREATE TABLE "rooms" (
	"id" serial PRIMARY KEY,
	"room_id" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now()
);
