CREATE TYPE "public"."sortie_type" AS ENUM('PERTE', 'DON', 'DEFAUT', 'AJUSTEMENT', 'AUTRE');--> statement-breakpoint
CREATE TABLE "ligne_sortie_stock" (
	"id" text PRIMARY KEY NOT NULL,
	"sortie_id" text NOT NULL,
	"stock_id" text NOT NULL,
	"quantite" integer NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sortie_stock" (
	"id" text PRIMARY KEY NOT NULL,
	"numero" text NOT NULL,
	"type" "sortie_type" NOT NULL,
	"motif" text NOT NULL,
	"effectue_par" text NOT NULL,
	"effectue_at" timestamp NOT NULL,
	"notes" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "sortie_stock_numero_unique" UNIQUE("numero")
);
--> statement-breakpoint
ALTER TABLE "ligne_sortie_stock" ADD CONSTRAINT "ligne_sortie_stock_sortie_id_sortie_stock_id_fk" FOREIGN KEY ("sortie_id") REFERENCES "public"."sortie_stock"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ligne_sortie_stock" ADD CONSTRAINT "ligne_sortie_stock_stock_id_stock_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stock"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sortie_stock" ADD CONSTRAINT "sortie_stock_effectue_par_user_id_fk" FOREIGN KEY ("effectue_par") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;