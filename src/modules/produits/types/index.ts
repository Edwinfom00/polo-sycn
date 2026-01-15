import { produit, stock, taille, couleur } from "@/db/schema";

// ============================================
// PRODUIT TYPES
// ============================================

export type ProduitGetOne = typeof produit.$inferSelect;

export type ProduitGetAll = {
    produits: ProduitGetOne[];
    total: number;
};

// ============================================
// STOCK TYPES
// ============================================

export type StockGetOne = typeof stock.$inferSelect & {
    produit: typeof produit.$inferSelect;
    taille: typeof taille.$inferSelect;
    couleur: typeof couleur.$inferSelect;
};

export type StockGetAll = {
    stocks: StockGetOne[];
    total: number;
};

export type TailleGetOne = typeof taille.$inferSelect;
export type CouleurGetOne = typeof couleur.$inferSelect;
