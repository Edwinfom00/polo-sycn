import { commande, ligneCommande, produit, taille, couleur, user, classe } from "@/db/schema";

// ============================================
// COMMANDE TYPES
// ============================================

export type CommandeGetOne = typeof commande.$inferSelect & {
    etudiant: typeof user.$inferSelect;
    classe: typeof classe.$inferSelect;
    lignes: (typeof ligneCommande.$inferSelect & {
        produit: typeof produit.$inferSelect;
        taille: typeof taille.$inferSelect;
        couleur: typeof couleur.$inferSelect;
    })[];
};

export type CommandeGetAll = {
    commandes: CommandeGetOne[];
    total: number;
};

export type LigneCommandeInput = {
    produitId: string;
    tailleId: string;
    couleurId: string;
    quantite: number;
    prixUnitaire: string;
};
