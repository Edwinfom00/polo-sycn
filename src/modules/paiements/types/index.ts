import { paiement, commande, user } from "@/db/schema";

// ============================================
// PAIEMENT TYPES
// ============================================

export type PaiementGetOne = typeof paiement.$inferSelect & {
    commande: typeof commande.$inferSelect & {
        etudiant: typeof user.$inferSelect;
    };
};

export type PaiementGetAll = {
    paiements: PaiementGetOne[];
    total: number;
};
