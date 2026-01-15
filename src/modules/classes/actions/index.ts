"use server";

import { db } from "@/db";
import { filiere, classe, user } from "@/db/schema";
import { eq, or, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
    filiereInsertSchema,
    filiereUpdateSchema,
    filiereDeleteSchema,
    classeInsertSchema,
    classeUpdateSchema,
    classeDeleteSchema,
} from "../schemas";
import type { FiliereGetOne, ClasseGetOne, ClasseWithFiliere, ClasseStats } from "../types";

// ============================================
// FILIÈRES
// ============================================

export async function createFiliere(data: unknown) {
    try {
        const validated = filiereInsertSchema.parse(data);

        await db.insert(filiere).values({
            id: crypto.randomUUID(),
            nom: validated.nom,
            code: validated.code.toUpperCase(),
            description: validated.description || null,
            actif: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        revalidatePath('/admin/classes');

        return { success: true, message: 'Filière créée avec succès' };
    } catch (error) {
        console.error('Error creating filiere:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Erreur lors de la création' };
    }
}

export async function updateFiliere(data: unknown) {
    try {
        const validated = filiereUpdateSchema.parse(data);

        const updateData: any = { updatedAt: new Date() };
        if (validated.nom) updateData.nom = validated.nom;
        if (validated.code) updateData.code = validated.code.toUpperCase();
        if (validated.description !== undefined) updateData.description = validated.description;
        if (validated.actif !== undefined) updateData.actif = validated.actif;

        await db
            .update(filiere)
            .set(updateData)
            .where(eq(filiere.id, validated.id));

        revalidatePath('/admin/classes');

        return { success: true, message: 'Filière mise à jour avec succès' };
    } catch (error) {
        console.error('Error updating filiere:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' };
    }
}

export async function deleteFiliere(data: unknown) {
    try {
        const validated = filiereDeleteSchema.parse(data);

        // Vérifier s'il y a des classes associées
        const classes = await db
            .select()
            .from(classe)
            .where(eq(classe.filiereId, validated.id));

        if (classes.length > 0) {
            return { success: false, message: 'Impossible de supprimer une filière avec des classes associées' };
        }

        await db.delete(filiere).where(eq(filiere.id, validated.id));

        revalidatePath('/admin/classes');

        return { success: true, message: 'Filière supprimée avec succès' };
    } catch (error) {
        console.error('Error deleting filiere:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Erreur lors de la suppression' };
    }
}

export async function getFilieres(): Promise<FiliereGetOne[]> {
    try {
        const filieres = await db.select().from(filiere);
        return filieres as FiliereGetOne[];
    } catch (error) {
        console.error('Error getting filieres:', error);
        return [];
    }
}

export async function getFiliere(id: string): Promise<FiliereGetOne | null> {
    try {
        const result = await db
            .select()
            .from(filiere)
            .where(eq(filiere.id, id))
            .limit(1);

        return result[0] as FiliereGetOne || null;
    } catch (error) {
        console.error('Error getting filiere:', error);
        return null;
    }
}

// ============================================
// CLASSES
// ============================================

export async function createClasse(data: unknown) {
    try {
        const validated = classeInsertSchema.parse(data);

        await db.insert(classe).values({
            id: crypto.randomUUID(),
            nom: validated.nom,
            code: validated.code.toUpperCase(),
            niveau: validated.niveau,
            filiereId: validated.filiereId,
            delegueId: validated.delegueId || null,
            actif: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        revalidatePath('/admin/classes');

        return { success: true, message: 'Classe créée avec succès' };
    } catch (error) {
        console.error('Error creating classe:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Erreur lors de la création' };
    }
}

export async function updateClasse(data: unknown) {
    try {
        const validated = classeUpdateSchema.parse(data);

        const updateData: any = { updatedAt: new Date() };
        if (validated.nom) updateData.nom = validated.nom;
        if (validated.code) updateData.code = validated.code.toUpperCase();
        if (validated.niveau) updateData.niveau = validated.niveau;
        if (validated.filiereId) updateData.filiereId = validated.filiereId;
        if (validated.delegueId !== undefined) updateData.delegueId = validated.delegueId;
        if (validated.actif !== undefined) updateData.actif = validated.actif;

        await db
            .update(classe)
            .set(updateData)
            .where(eq(classe.id, validated.id));

        revalidatePath('/admin/classes');

        return { success: true, message: 'Classe mise à jour avec succès' };
    } catch (error) {
        console.error('Error updating classe:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' };
    }
}

export async function deleteClasse(data: unknown) {
    try {
        const validated = classeDeleteSchema.parse(data);

        // Vérifier s'il y a des étudiants associés
        const etudiants = await db
            .select()
            .from(user)
            .where(eq(user.classeId, validated.id));

        if (etudiants.length > 0) {
            return { success: false, message: 'Impossible de supprimer une classe avec des étudiants associés' };
        }

        await db.delete(classe).where(eq(classe.id, validated.id));

        revalidatePath('/admin/classes');

        return { success: true, message: 'Classe supprimée avec succès' };
    } catch (error) {
        console.error('Error deleting classe:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Erreur lors de la suppression' };
    }
}

export async function getClasses(): Promise<ClasseWithFiliere[]> {
    try {
        const classes = await db
            .select({
                id: classe.id,
                nom: classe.nom,
                code: classe.code,
                niveau: classe.niveau,
                filiereId: classe.filiereId,
                delegueId: classe.delegueId,
                actif: classe.actif,
                createdAt: classe.createdAt,
                updatedAt: classe.updatedAt,
                filiere: {
                    id: filiere.id,
                    nom: filiere.nom,
                    code: filiere.code,
                    description: filiere.description,
                    actif: filiere.actif,
                    createdAt: filiere.createdAt,
                    updatedAt: filiere.updatedAt,
                },
            })
            .from(classe)
            .leftJoin(filiere, eq(classe.filiereId, filiere.id));

        return classes as ClasseWithFiliere[];
    } catch (error) {
        console.error('Error getting classes:', error);
        return [];
    }
}

export async function getClasse(id: string): Promise<ClasseWithFiliere | null> {
    try {
        const result = await db
            .select({
                id: classe.id,
                nom: classe.nom,
                code: classe.code,
                niveau: classe.niveau,
                filiereId: classe.filiereId,
                delegueId: classe.delegueId,
                actif: classe.actif,
                createdAt: classe.createdAt,
                updatedAt: classe.updatedAt,
                filiere: {
                    id: filiere.id,
                    nom: filiere.nom,
                    code: filiere.code,
                    description: filiere.description,
                    actif: filiere.actif,
                    createdAt: filiere.createdAt,
                    updatedAt: filiere.updatedAt,
                },
            })
            .from(classe)
            .leftJoin(filiere, eq(classe.filiereId, filiere.id))
            .where(eq(classe.id, id))
            .limit(1);

        return result[0] as ClasseWithFiliere || null;
    } catch (error) {
        console.error('Error getting classe:', error);
        return null;
    }
}

export async function getClasseStats(): Promise<ClasseStats> {
    try {
        const classes = await db.select().from(classe);
        const filieres = await db.select().from(filiere);

        return {
            totalClasses: classes.length,
            totalFilieres: filieres.length,
            classesActives: classes.filter(c => c.actif).length,
        };
    } catch (error) {
        console.error('Error getting classe stats:', error);
        return { totalClasses: 0, totalFilieres: 0, classesActives: 0 };
    }
}

export async function getDelegues() {
    try {
        const delegues = await db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
            })
            .from(user)
            .where(eq(user.role, 'DELEGUE'));

        return delegues;
    } catch (error) {
        console.error('Error getting delegues:', error);
        return [];
    }
}
