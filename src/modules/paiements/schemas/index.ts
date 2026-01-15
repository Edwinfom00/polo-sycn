import { z } from "zod";

// ============================================
// PAIEMENT SCHEMAS
// ============================================

export const paiementCreateSchema = z.object({
    commandeId: z.string().min(1, "La commande est requise"),
    montant: z.string().min(1, "Le montant est requis").refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        "Le montant doit être supérieur à 0"
    ),
    methodePaiement: z.string().min(1, "La méthode de paiement est requise"),
    reference: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

export const paiementValidateSchema = z.object({
    id: z.string(),
    notes: z.string().optional().nullable(),
});

export const paiementRejectSchema = z.object({
    id: z.string(),
    notes: z.string().min(1, "La raison du rejet est requise"),
});
