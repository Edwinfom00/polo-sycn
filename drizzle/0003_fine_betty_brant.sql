CREATE TYPE "public"."methode_valorisation" AS ENUM('FIFO', 'FEFO', 'CMUP', 'PRIX_SPECIFIQUE');--> statement-breakpoint
ALTER TABLE "sortie_stock" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."sortie_type";--> statement-breakpoint
CREATE TYPE "public"."sortie_type" AS ENUM('VENTE', 'CONSOMMATION_INTERNE', 'DEMARQUE_CASSE', 'DEMARQUE_VOL', 'DEMARQUE_PEREMPTION', 'DEMARQUE_OBSOLESCENCE', 'TRANSFERT', 'RETOUR_FOURNISSEUR', 'AJUSTEMENT_INVENTAIRE', 'ECHANTILLON', 'AUTRE');--> statement-breakpoint
ALTER TABLE "sortie_stock" ALTER COLUMN "type" SET DATA TYPE "public"."sortie_type" USING "type"::"public"."sortie_type";--> statement-breakpoint
ALTER TABLE "ligne_sortie_stock" ADD COLUMN "cout_unitaire" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "ligne_sortie_stock" ADD COLUMN "cout_total" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "ligne_sortie_stock" ADD COLUMN "lot_numero" text;--> statement-breakpoint
ALTER TABLE "ligne_sortie_stock" ADD COLUMN "date_peremption" timestamp;--> statement-breakpoint
ALTER TABLE "sortie_stock" ADD COLUMN "methode_valorisation" "methode_valorisation" NOT NULL;--> statement-breakpoint
ALTER TABLE "sortie_stock" ADD COLUMN "destination_depot" text;--> statement-breakpoint
ALTER TABLE "sortie_stock" ADD COLUMN "reference_externe" text;--> statement-breakpoint
ALTER TABLE "sortie_stock" ADD COLUMN "cout_total" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "sortie_stock" ADD COLUMN "valide_par" text;--> statement-breakpoint
ALTER TABLE "sortie_stock" ADD COLUMN "valide_at" timestamp;--> statement-breakpoint
ALTER TABLE "stock" ADD COLUMN "cout_unitaire_moyen" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "stock" ADD COLUMN "lot_numero" text;--> statement-breakpoint
ALTER TABLE "stock" ADD COLUMN "date_peremption" timestamp;--> statement-breakpoint
ALTER TABLE "sortie_stock" ADD CONSTRAINT "sortie_stock_valide_par_user_id_fk" FOREIGN KEY ("valide_par") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;