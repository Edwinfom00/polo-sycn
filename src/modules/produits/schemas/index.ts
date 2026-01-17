import { z } from "zod";

// ============================================
// PRODUIT SCHEMAS
// ============================================

export const produitInsertSchema = z.object({
    nom: z.string().min(1, "Le nom est requis"),
    description: z.string().nullable().optional(),
    prixUnitaire: z.string().min(1, "Le prix est requis").refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        "Le prix doit être supérieur à 0"
    ),
    actif: z.boolean(),
});

export const produitUpdateSchema = produitInsertSchema.extend({
    id: z.string(),
});

// ============================================
// STOCK SCHEMAS
// ============================================

export const stockInsertSchema = z.object({
    produitId: z.string().min(1, "Le produit est requis"),
    tailleId: z.string().min(1, "La taille est requise"),
    couleurId: z.string().min(1, "La couleur est requise"),
    quantiteDisponible: z.number().int().min(0, "La quantité doit être positive"),
    seuilAlerte: z.number().int().min(0, "Le seuil doit être positif"),
});

export const stockUpdateSchema = z.object({
    id: z.string(),
    quantiteDisponible: z.number().int().min(0, "La quantité doit être positive"),
    seuilAlerte: z.number().int().min(0, "Le seuil doit être positif"),
});

export const stockAjustementSchema = z.object({
    id: z.string(),
    quantite: z.number().int(),
    type: z.enum(['AJOUT', 'RETRAIT']),
    notes: z.string().optional(),
});
