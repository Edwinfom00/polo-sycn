import { z } from "zod";

export const sortieInsertSchema = z.object({
    type: z.enum([
        'VENTE',
        'CONSOMMATION_INTERNE',
        'DEMARQUE_CASSE',
        'DEMARQUE_VOL',
        'DEMARQUE_PEREMPTION',
        'DEMARQUE_OBSOLESCENCE',
        'TRANSFERT',
        'RETOUR_FOURNISSEUR',
        'AJUSTEMENT_INVENTAIRE',
        'ECHANTILLON',
        'AUTRE'
    ]),
    motif: z.string().min(1, "Le motif est requis"),
    methodeValorisation: z.enum(['FIFO', 'FEFO', 'CMUP', 'PRIX_SPECIFIQUE']),
    destinationDepot: z.string().optional(),
    referenceExterne: z.string().optional(),
    notes: z.string().optional(),
    lignes: z.array(z.object({
        stockId: z.string(),
        quantite: z.number().min(1, "La quantité doit être supérieure à 0"),
        coutUnitaire: z.number().optional(), // Pour PRIX_SPECIFIQUE
        lotNumero: z.string().optional(),
        datePeremption: z.date().optional(),
    })).min(1, "Au moins une ligne est requise"),
});

export const sortieUpdateSchema = z.object({
    id: z.string(),
    type: z.enum([
        'VENTE',
        'CONSOMMATION_INTERNE',
        'DEMARQUE_CASSE',
        'DEMARQUE_VOL',
        'DEMARQUE_PEREMPTION',
        'DEMARQUE_OBSOLESCENCE',
        'TRANSFERT',
        'RETOUR_FOURNISSEUR',
        'AJUSTEMENT_INVENTAIRE',
        'ECHANTILLON',
        'AUTRE'
    ]),
    motif: z.string().min(1, "Le motif est requis"),
    notes: z.string().optional(),
});

export const sortieDeleteSchema = z.object({
    id: z.string(),
});

export const sortieValiderSchema = z.object({
    id: z.string(),
});

export type SortieInsert = z.infer<typeof sortieInsertSchema>;
export type SortieUpdate = z.infer<typeof sortieUpdateSchema>;
export type SortieDelete = z.infer<typeof sortieDeleteSchema>;
export type SortieValider = z.infer<typeof sortieValiderSchema>;
