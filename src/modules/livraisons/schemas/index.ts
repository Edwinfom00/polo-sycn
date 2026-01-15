import { z } from "zod";

// ============================================
// LIVRAISON SCHEMAS
// ============================================

export const livraisonCreateSchema = z.object({
    commandeId: z.string().min(1, "La commande est requise"),
    notes: z.string().optional().nullable(),
});
