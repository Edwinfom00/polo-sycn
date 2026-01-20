"use server";

import { db } from "@/db";
import { user, account, livraison, commande } from "@/db/schema";
import { eq } from "drizzle-orm";
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
        console.log('=== UPDATE USER START ===');
        console.log('Raw data received:', JSON.stringify(data, null, 2));

        const validated = userUpdateSchema.parse(data);
        console.log('Validated data:', JSON.stringify(validated, null, 2));

        if (!validated.id) {
            console.error('No ID provided');
            return { success: false, message: 'ID utilisateur manquant' };
        }

        // Vérifier que l'utilisateur existe
        const existingUser = await db
            .select()
            .from(user)
            .where(eq(user.id, validated.id))
            .limit(1);

        if (existingUser.length === 0) {
            console.error('User not found:', validated.id);
            return { success: false, message: 'Utilisateur introuvable' };
        }

        console.log('Existing user:', JSON.stringify(existingUser[0], null, 2));

        // Construire l'objet de mise à jour
        const updateData: any = {
            updatedAt: new Date(),
        };

        if (validated.name !== undefined) updateData.name = validated.name;
        if (validated.email !== undefined) updateData.email = validated.email;
        if (validated.role !== undefined) updateData.role = validated.role;
        if (validated.classeId !== undefined) updateData.classeId = validated.classeId;

        console.log('Update data to apply:', JSON.stringify(updateData, null, 2));

        // Effectuer la mise à jour
        const result = await db
            .update(user)
            .set(updateData)
            .where(eq(user.id, validated.id))
            .returning();

        console.log('Database update result:', JSON.stringify(result, null, 2));
        console.log('=== UPDATE USER END ===');

        revalidatePath('/super-admin/admin/users');
        revalidatePath('/admin/users');

        return { success: true, message: 'Utilisateur mis à jour avec succès' };
    } catch (error) {
        console.error('=== UPDATE USER ERROR ===');
        console.error('Error details:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
        };
    }
}

export async function deleteUser(data: unknown) {
    try {
        const validated = userDeleteSchema.parse(data);

        // Vérifier s'il y a des livraisons associées
        const livraisonsAssociees = await db
            .select()
            .from(livraison)
            .where(eq(livraison.livrePar, validated.id))
            .limit(1);

        if (livraisonsAssociees.length > 0) {
            return {
                success: false,
                message: 'Impossible de supprimer cet utilisateur car il a effectué des livraisons'
            };
        }

        // Vérifier s'il y a des commandes validées par cet utilisateur
        const commandesValidees = await db
            .select()
            .from(commande)
            .where(eq(commande.validePar, validated.id))
            .limit(1);

        if (commandesValidees.length > 0) {
            return {
                success: false,
                message: 'Impossible de supprimer cet utilisateur car il a validé des commandes'
            };
        }

        // Vérifier si l'utilisateur est délégué d'une classe
        const { classe } = await import("@/db/schema");
        const classesDeléguées = await db
            .select()
            .from(classe)
            .where(eq(classe.delegueId, validated.id))
            .limit(1);

        if (classesDeléguées.length > 0) {
            return {
                success: false,
                message: 'Impossible de supprimer cet utilisateur car il est délégué d\'une classe'
            };
        }

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
            delegues: 0,
            etudiants: users.filter(u => u.role === 'ETUDIANT').length,
        };

        return stats;
    } catch (error) {
        console.error('Error getting user stats:', error);
        return { total: 0, admins: 0, delegues: 0, etudiants: 0 };
    }
}

export async function regenerateCredentials(userId: string) {
    try {
        const { generatePassword } = await import("@/lib/utils/password-generator");

        // Récupérer l'utilisateur
        const existingUser = await db
            .select()
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

        if (existingUser.length === 0) {
            return { success: false, message: 'Utilisateur introuvable' };
        }

        const userData = existingUser[0];

        // Vérifier que c'est un admin
        if (userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN') {
            return { success: false, message: 'Seuls les administrateurs peuvent avoir leurs identifiants régénérés' };
        }

        // Générer un nouveau mot de passe
        const newPassword = generatePassword(12);

        // Mettre à jour le mot de passe via BetterAuth
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db
            .update(account)
            .set({ password: hashedPassword })
            .where(eq(account.userId, userId));

        revalidatePath('/super-admin/admin/users');

        return {
            success: true,
            message: 'Identifiants régénérés avec succès',
            data: {
                email: userData.email,
                password: newPassword
            }
        };
    } catch (error) {
        console.error('Error regenerating credentials:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Erreur lors de la régénération' };
    }
}
