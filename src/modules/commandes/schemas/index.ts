import { z } from "zod";

// ============================================
// LIGNE COMMANDE SCHEMA
// ============================================

export const ligneCommandeSchema = z.object({
    produitId: z.string().min(1, "Le produit est requis"),
    tailleId: z.string().min(1, "La taille est requise"),
    couleurId: z.string().min(1, "La couleur est requise"),
    quantite: z.number().int().min(1, "La quantité doit être au moins 1"),
    prixUnitaire: z.string(),
});

// ============================================
// COMMANDE SCHEMAS
// ============================================

export const commandeCreateSchema = z.object({
    lignes: z.array(ligneCommandeSchema).min(1, "Au moins un article est requis"),
    notes: z.string().optional().nullable(),
});

export const commandeUpdateStatusSchema = z.object({
    id: z.string(),
    statut: z.enum(['EN_ATTENTE', 'PAYE', 'VALIDE', 'LIVRE', 'ANNULE']),
    notes: z.string().optional().nullable(),
});

export const commandeValidateSchema = z.object({
    id: z.string(),
    notes: z.string().optional().nullable(),
});
