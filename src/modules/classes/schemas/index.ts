import { z } from "zod";

// Schémas pour Filière
export const filiereInsertSchema = z.object({
    nom: z.string().min(1, "Le nom est requis"),
    code: z.string().min(1, "Le code est requis").max(10, "Le code ne peut pas dépasser 10 caractères"),
    description: z.string().optional().nullable(),
});

export const filiereUpdateSchema = z.object({
    id: z.string(),
    nom: z.string().min(1, "Le nom est requis").optional(),
    code: z.string().min(1, "Le code est requis").max(10, "Le code ne peut pas dépasser 10 caractères").optional(),
    description: z.string().optional().nullable(),
    actif: z.boolean().optional(),
});

export const filiereDeleteSchema = z.object({
    id: z.string(),
});

// Schémas pour Classe
export const classeInsertSchema = z.object({
    nom: z.string().min(1, "Le nom est requis"),
    code: z.string().min(1, "Le code est requis").max(10, "Le code ne peut pas dépasser 10 caractères"),
    niveau: z.string().min(1, "Le niveau est requis"),
    filiereId: z.string().min(1, "La filière est requise"),
    delegueId: z.string().optional().nullable(),
});

export const classeUpdateSchema = z.object({
    id: z.string(),
    nom: z.string().min(1, "Le nom est requis").optional(),
    code: z.string().min(1, "Le code est requis").max(10, "Le code ne peut pas dépasser 10 caractères").optional(),
    niveau: z.string().min(1, "Le niveau est requis").optional(),
    filiereId: z.string().min(1, "La filière est requise").optional(),
    delegueId: z.string().optional().nullable(),
    actif: z.boolean().optional(),
});

export const classeDeleteSchema = z.object({
    id: z.string(),
});

export type FiliereInsert = z.infer<typeof filiereInsertSchema>;
export type FiliereUpdate = z.infer<typeof filiereUpdateSchema>;
export type FiliereDelete = z.infer<typeof filiereDeleteSchema>;

export type ClasseInsert = z.infer<typeof classeInsertSchema>;
export type ClasseUpdate = z.infer<typeof classeUpdateSchema>;
export type ClasseDelete = z.infer<typeof classeDeleteSchema>;
