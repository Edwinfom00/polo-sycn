CREATE TYPE "public"."order_status" AS ENUM('EN_ATTENTE', 'PAYE', 'VALIDE', 'LIVRE', 'ANNULE');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('EN_ATTENTE', 'PAYE', 'REMBOURSE');--> statement-breakpoint
CREATE TABLE "classe" (
	"id" text PRIMARY KEY NOT NULL,
	"nom" text NOT NULL,
	"code" text NOT NULL,
	"niveau" text NOT NULL,
	"filiere_id" text NOT NULL,
	"delegue_id" text,
	"actif" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "classe_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "commande" (
	"id" text PRIMARY KEY NOT NULL,
	"numero" text NOT NULL,
	"etudiant_id" text NOT NULL,
	"classe_id" text NOT NULL,
	"statut" "order_status" NOT NULL,
	"montant_total" numeric(10, 2) NOT NULL,
	"montant_paye" numeric(10, 2) NOT NULL,
	"valide_par" text,
	"valide_at" timestamp,
	"notes" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "commande_numero_unique" UNIQUE("numero")
);
--> statement-breakpoint
CREATE TABLE "couleur" (
	"id" text PRIMARY KEY NOT NULL,
	"nom" text NOT NULL,
	"code_hex" text,
	"actif" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "couleur_nom_unique" UNIQUE("nom")
);
--> statement-breakpoint
CREATE TABLE "filiere" (
	"id" text PRIMARY KEY NOT NULL,
	"nom" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"actif" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "filiere_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "ligne_commande" (
	"id" text PRIMARY KEY NOT NULL,
	"commande_id" text NOT NULL,
	"produit_id" text NOT NULL,
	"taille_id" text NOT NULL,
	"couleur_id" text NOT NULL,
	"quantite" integer NOT NULL,
	"prix_unitaire" numeric(10, 2) NOT NULL,
	"sous_total" numeric(10, 2) NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ligne_livraison" (
	"id" text PRIMARY KEY NOT NULL,
	"livraison_id" text NOT NULL,
	"ligne_commande_id" text NOT NULL,
	"quantite_livree" integer NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "livraison" (
	"id" text PRIMARY KEY NOT NULL,
	"commande_id" text NOT NULL,
	"livre_par" text NOT NULL,
	"livre_at" timestamp NOT NULL,
	"notes" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paiement" (
	"id" text PRIMARY KEY NOT NULL,
	"commande_id" text NOT NULL,
	"montant" numeric(10, 2) NOT NULL,
	"statut" "payment_status" NOT NULL,
	"methode_paiement" text,
	"reference" text,
	"valide_par" text,
	"valide_at" timestamp,
	"notes" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "produit" (
	"id" text PRIMARY KEY NOT NULL,
	"nom" text NOT NULL,
	"description" text,
	"prix_unitaire" numeric(10, 2) NOT NULL,
	"actif" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock" (
	"id" text PRIMARY KEY NOT NULL,
	"produit_id" text NOT NULL,
	"taille_id" text NOT NULL,
	"couleur_id" text NOT NULL,
	"quantite_disponible" integer NOT NULL,
	"quantite_reservee" integer NOT NULL,
	"quantite_livree" integer NOT NULL,
	"seuil_alerte" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taille" (
	"id" text PRIMARY KEY NOT NULL,
	"nom" text NOT NULL,
	"ordre" integer NOT NULL,
	"actif" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "taille_nom_unique" UNIQUE("nom")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "classe_id" text;--> statement-breakpoint
ALTER TABLE "classe" ADD CONSTRAINT "classe_filiere_id_filiere_id_fk" FOREIGN KEY ("filiere_id") REFERENCES "public"."filiere"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commande" ADD CONSTRAINT "commande_etudiant_id_user_id_fk" FOREIGN KEY ("etudiant_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commande" ADD CONSTRAINT "commande_classe_id_classe_id_fk" FOREIGN KEY ("classe_id") REFERENCES "public"."classe"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commande" ADD CONSTRAINT "commande_valide_par_user_id_fk" FOREIGN KEY ("valide_par") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ligne_commande" ADD CONSTRAINT "ligne_commande_commande_id_commande_id_fk" FOREIGN KEY ("commande_id") REFERENCES "public"."commande"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ligne_commande" ADD CONSTRAINT "ligne_commande_produit_id_produit_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."produit"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ligne_commande" ADD CONSTRAINT "ligne_commande_taille_id_taille_id_fk" FOREIGN KEY ("taille_id") REFERENCES "public"."taille"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ligne_commande" ADD CONSTRAINT "ligne_commande_couleur_id_couleur_id_fk" FOREIGN KEY ("couleur_id") REFERENCES "public"."couleur"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ligne_livraison" ADD CONSTRAINT "ligne_livraison_livraison_id_livraison_id_fk" FOREIGN KEY ("livraison_id") REFERENCES "public"."livraison"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ligne_livraison" ADD CONSTRAINT "ligne_livraison_ligne_commande_id_ligne_commande_id_fk" FOREIGN KEY ("ligne_commande_id") REFERENCES "public"."ligne_commande"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livraison" ADD CONSTRAINT "livraison_commande_id_commande_id_fk" FOREIGN KEY ("commande_id") REFERENCES "public"."commande"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livraison" ADD CONSTRAINT "livraison_livre_par_user_id_fk" FOREIGN KEY ("livre_par") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paiement" ADD CONSTRAINT "paiement_commande_id_commande_id_fk" FOREIGN KEY ("commande_id") REFERENCES "public"."commande"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paiement" ADD CONSTRAINT "paiement_valide_par_user_id_fk" FOREIGN KEY ("valide_par") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock" ADD CONSTRAINT "stock_produit_id_produit_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."produit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock" ADD CONSTRAINT "stock_taille_id_taille_id_fk" FOREIGN KEY ("taille_id") REFERENCES "public"."taille"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock" ADD CONSTRAINT "stock_couleur_id_couleur_id_fk" FOREIGN KEY ("couleur_id") REFERENCES "public"."couleur"("id") ON DELETE cascade ON UPDATE no action;