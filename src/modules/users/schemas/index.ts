import { z } from "zod";

export const userInsertSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'DELEGUE', 'ETUDIANT']),
    classeId: z.string().optional().nullable(),
});

export const userUpdateSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Le nom est requis").optional(),
    email: z.string().email("Email invalide").optional(),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'DELEGUE', 'ETUDIANT']).optional(),
    classeId: z.string().optional().nullable(),
});

export const userDeleteSchema = z.object({
    id: z.string(),
});

export type UserInsert = z.infer<typeof userInsertSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserDelete = z.infer<typeof userDeleteSchema>;
