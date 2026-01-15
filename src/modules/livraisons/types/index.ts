import { livraison, ligneLivraison, commande, user, ligneCommande, produit, taille, couleur } from "@/db/schema";

// ============================================
// LIVRAISON TYPES
// ============================================

export type LivraisonGetOne = Omit<typeof livraison.$inferSelect, 'livrePar'> & {
    commande: typeof commande.$inferSelect & {
        etudiant: typeof user.$inferSelect;
    };
    livrePar: typeof user.$inferSelect;
    lignes: (typeof ligneLivraison.$inferSelect & {
        ligneCommande: typeof ligneCommande.$inferSelect & {
            produit: typeof produit.$inferSelect;
            taille: typeof taille.$inferSelect;
            couleur: typeof couleur.$inferSelect;
        };
    })[];
};

export type LivraisonGetAll = {
    livraisons: LivraisonGetOne[];
    total: number;
};
