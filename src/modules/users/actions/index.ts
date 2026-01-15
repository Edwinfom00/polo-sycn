"use server";

import { db } from "@/db";
import { user, account } from "@/db/schema";
import { eq, count, or, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { userInsertSchema, userUpdateSchema, userDeleteSchema } from "../schemas";
import type { UserGetOne, UserGetMany, UserStats } from "../types";

export async function createUser(data: unknown) {
    try {
        const validated = userInsertSchema.parse(data);

        // Vérifier si l'email existe déjà
        const existingUser = await db
            .select()
            .from(user)
            .where(eq(user.email, validated.email))
            .limit(1);

        if (existingUser.length > 0) {
            return { success: false, message: 'Cet email est déjà utilisé' };
        }

        // Créer l'utilisateur via BetterAuth API
        const result = await auth.api.signUpEmail({
            body: {
                email: validated.email,
                password: validated.password,
                name: validated.name,
            }
        });

        if (!result) {
            throw new Error('Échec de la création du compte');
        }

        // Mettre à jour le rôle et la classe
        await db
            .update(user)
            .set({
                role: validated.role,
                classeId: validated.classeId || null,
                emailVerified: true,
            })
            .where(eq(user.email, validated.email));

        revalidatePath('/admin/users');

        return { success: true, message: 'Utilisateur créé avec succès' };
    } catch (error) {
        console.error('Error creating user:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Erreur lors de la création' };
    }
}

export async function updateUser(data: unknown) {
    try {
        const validated = userUpdateSchema.parse(data);

        const updateData: any = {};
        if (validated.name) updateData.name = validated.name;
        if (validated.email) updateData.email = validated.email;
        if (validated.role) updateData.role = validated.role;
        if (validated.classeId !== undefined) updateData.classeId = validated.classeId;

        await db
            .update(user)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(user.id, validated.id));

        revalidatePath('/admin/users');

        return { success: true, message: 'Utilisateur mis à jour avec succès' };
    } catch (error) {
        console.error('Error updating user:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' };
    }
}

export async function deleteUser(data: unknown) {
    try {
        const validated = userDeleteSchema.parse(data);

        // Supprimer les comptes associés
        await db.delete(account).where(eq(account.userId, validated.id));

        // Supprimer l'utilisateur
        await db.delete(user).where(eq(user.id, validated.id));

        revalidatePath('/admin/users');

        return { success: true, message: 'Utilisateur supprimé avec succès' };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Erreur lors de la suppression' };
    }
}

export async function getUsers(search?: string): Promise<UserGetMany> {
    try {
        let query = db.select().from(user);

        // Exclure les étudiants - ils ont leur propre gestion
        const users = await query;
        const filteredUsers = users.filter(u => u.role !== 'ETUDIANT');

        let result = filteredUsers;

        if (search) {
            result = filteredUsers.filter(u =>
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase())
            );
        }

        return {
            users: result as UserGetOne[],
            total: result.length,
        };
    } catch (error) {
        console.error('Error getting users:', error);
        return { users: [], total: 0 };
    }
}

export async function getUser(id: string): Promise<UserGetOne | null> {
    try {
        const result = await db
            .select()
            .from(user)
            .where(eq(user.id, id))
            .limit(1);

        return result[0] as UserGetOne || null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

export async function getUserStats(): Promise<UserStats> {
    try {
        const users = await db.select().from(user);

        // Statistiques uniquement pour le personnel (pas les étudiants)
        const stats = {
            total: users.filter(u => u.role !== 'ETUDIANT').length,
            admins: users.filter(u => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN').length,
            delegues: users.filter(u => u.role === 'DELEGUE').length,
            etudiants: users.filter(u => u.role === 'ETUDIANT').length, // Pour info seulement
        };

        return stats;
    } catch (error) {
        console.error('Error getting user stats:', error);
        return { total: 0, admins: 0, delegues: 0, etudiants: 0 };
    }
}
