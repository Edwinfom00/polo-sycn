import { sortieStock, ligneSortieStock, user, stock, produit, taille, couleur } from "@/db/schema";

export type SortieGetOne = typeof sortieStock.$inferSelect & {
    effectuePar: typeof user.$inferSelect;
    lignes: (typeof ligneSortieStock.$inferSelect & {
        stock: typeof stock.$inferSelect & {
            produit: typeof produit.$inferSelect;
            taille: typeof taille.$inferSelect;
            couleur: typeof couleur.$inferSelect;
        };
    })[];
};

export type SortieGetMany = {
    sorties: SortieGetOne[];
    total: number;
};

export type SortieStats = {
    totalSorties: number;
    sortiesMoisCourant: number;
    quantiteTotaleSortie: number;
    coutTotal: number;
    parType: Array<{
        type: string;
        count: number;
        cout: number;
    }>;
};
