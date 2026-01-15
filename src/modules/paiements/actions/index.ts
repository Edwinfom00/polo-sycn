"use server";

import { db } from "@/db";
import { paiement, commande, user } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-utils";
import {
    paiementCreateSchema,
    paiementValidateSchema,
    paiementRejectSchema,
} from "../schemas";

// ============================================
// PAIEMENTS
// ============================================

export async function getPaiements(params?: {
    page?: number;
    limit?: number;
    commandeId?: string;
    statut?: string;
}) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                message: "Non authentifié",
            };
        }

        const page = params?.page || 1;
        const limit = params?.limit || 9;
        const offset = (page - 1) * limit;

        let query = db
            .select({
                paiement: paiement,
                commande: commande,
                etudiant: user,
            })
            .from(paiement)
            .leftJoin(commande, eq(paiement.commandeId, commande.id))
            .leftJoin(user, eq(commande.etudiantId, user.id))
            .$dynamic();

        // Filtrer selon le rôle
        if (currentUser.role === 'ETUDIANT') {
            query = query.where(eq(commande.etudiantId, currentUser.id));
        }

        // Filtres additionnels
        if (params?.commandeId) {
            query = query.where(eq(paiement.commandeId, params.commandeId));
        }
        if (params?.statut) {
            query = query.where(eq(paiement.statut, params.statut as any));
        }

        const [paiementsData, countResult] = await Promise.all([
            query.orderBy(desc(paiement.createdAt)).limit(limit).offset(offset),
            db.select({ count: sql<number>`count(*)` }).from(paiement),
        ]);

        const formattedPaiements = paiementsData.map((p) => ({
            ...p.paiement,
            commande: {
                ...p.commande!,
                etudiant: p.etudiant!,
            },
        }));

        return {
            success: true,
            data: {
                paiements: formattedPaiements,
                total: Number(countResult[0]?.count || 0),
            },
        };
    } catch (error) {
        console.error("Erreur getPaiements:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des paiements",
        };
    }
}

export async function createPaiement(data: z.infer<typeof paiementCreateSchema>) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                message: "Non authentifié",
            };
        }

        const validated = paiementCreateSchema.parse(data);

        // Vérifier que la commande existe et appartient à l'utilisateur
        const cmd = await db
            .select()
            .from(commande)
            .where(eq(commande.id, validated.commandeId))
            .limit(1);

        if (cmd.length === 0) {
            return {
                success: false,
                message: "Commande non trouvée",
            };
        }

        // Vérifier les permissions
        if (
            currentUser.role === 'ETUDIANT' &&
            cmd[0].etudiantId !== currentUser.id
        ) {
            return {
                success: false,
                message: "Accès non autorisé",
            };
        }

        if (cmd[0].statut === 'ANNULE') {
            return {
                success: false,
                message: "Impossible de payer une commande annulée",
            };
        }

        // Créer le paiement
        await db.insert(paiement).values({
            commandeId: validated.commandeId,
            montant: validated.montant,
            statut: 'EN_ATTENTE',
            methodePaiement: validated.methodePaiement,
            reference: validated.reference || null,
            notes: validated.notes || null,
        });

        return {
            success: true,
            message: "Paiement enregistré avec succès. En attente de validation.",
        };
    } catch (error) {
        console.error("Erreur createPaiement:", error);
        return {
            success: false,
            message: "Erreur lors de l'enregistrement du paiement",
        };
    }
}

export async function validerPaiement(data: z.infer<typeof paiementValidateSchema>) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                message: "Non authentifié",
            };
        }

        if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
            return {
                success: false,
                message: "Accès non autorisé",
            };
        }

        const validated = paiementValidateSchema.parse(data);

        // Récupérer le paiement
        const paiementData = await db
            .select()
            .from(paiement)
            .where(eq(paiement.id, validated.id))
            .limit(1);

        if (paiementData.length === 0) {
            return {
                success: false,
                message: "Paiement non trouvé",
            };
        }

        const p = paiementData[0];

        if (p.statut !== 'EN_ATTENTE') {
            return {
                success: false,
                message: "Ce paiement a déjà été traité",
            };
        }

        // Mettre à jour le paiement
        await db
            .update(paiement)
            .set({
                statut: 'PAYE',
                validePar: currentUser.id,
                valideAt: new Date(),
                notes: validated.notes || null,
                updatedAt: new Date(),
            })
            .where(eq(paiement.id, validated.id));

        // Mettre à jour le montant payé de la commande
        const cmd = await db
            .select()
            .from(commande)
            .where(eq(commande.id, p.commandeId))
            .limit(1);

        if (cmd.length > 0) {
            const nouveauMontantPaye = parseFloat(cmd[0].montantPaye) + parseFloat(p.montant);
            const montantTotal = parseFloat(cmd[0].montantTotal);

            // Si le montant payé >= montant total, passer la commande en PAYE
            const nouveauStatut = nouveauMontantPaye >= montantTotal ? 'PAYE' : cmd[0].statut;

            await db
                .update(commande)
                .set({
                    montantPaye: nouveauMontantPaye.toFixed(2),
                    statut: nouveauStatut,
                    updatedAt: new Date(),
                })
                .where(eq(commande.id, p.commandeId));
        }

        return {
            success: true,
            message: "Paiement validé avec succès",
        };
    } catch (error) {
        console.error("Erreur validerPaiement:", error);
        return {
            success: false,
            message: "Erreur lors de la validation du paiement",
        };
    }
}

export async function rejeterPaiement(data: z.infer<typeof paiementRejectSchema>) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                message: "Non authentifié",
            };
        }

        if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
            return {
                success: false,
                message: "Accès non autorisé",
            };
        }

        const validated = paiementRejectSchema.parse(data);

        await db
            .update(paiement)
            .set({
                statut: 'REMBOURSE',
                notes: validated.notes,
                updatedAt: new Date(),
            })
            .where(eq(paiement.id, validated.id));

        return {
            success: true,
            message: "Paiement rejeté",
        };
    } catch (error) {
        console.error("Erreur rejeterPaiement:", error);
        return {
            success: false,
            message: "Erreur lors du rejet du paiement",
        };
    }
}

export async function getPaiementStats() {
    try {
        const [totalPaiements, enAttente, valides, montantTotal] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(paiement),
            db
                .select({ count: sql<number>`count(*)` })
                .from(paiement)
                .where(eq(paiement.statut, 'EN_ATTENTE')),
            db
                .select({ count: sql<number>`count(*)` })
                .from(paiement)
                .where(eq(paiement.statut, 'PAYE')),
            db
                .select({ total: sql<number>`SUM(CAST(${paiement.montant} AS DECIMAL))` })
                .from(paiement)
                .where(eq(paiement.statut, 'PAYE')),
        ]);

        return {
            success: true,
            data: {
                totalPaiements: Number(totalPaiements[0]?.count || 0),
                enAttente: Number(enAttente[0]?.count || 0),
                valides: Number(valides[0]?.count || 0),
                montantTotal: Number(montantTotal[0]?.total || 0),
            },
        };
    } catch (error) {
        console.error("Erreur getPaiementStats:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des statistiques",
        };
    }
}

// ============================================
// HELPERS
// ============================================

export async function getCommandesNonPayees() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                message: "Non authentifié",
            };
        }

        let query = db
            .select()
            .from(commande)
            .$dynamic();

        // Filtrer selon le rôle
        if (currentUser.role === 'ETUDIANT') {
            query = query.where(eq(commande.etudiantId, currentUser.id));
        }

        const commandes = await query;

        // Filtrer les commandes non complètement payées
        const commandesNonPayees = commandes.filter(
            (cmd) => parseFloat(cmd.montantPaye) < parseFloat(cmd.montantTotal) && cmd.statut !== 'ANNULE'
        );

        return {
            success: true,
            data: commandesNonPayees,
        };
    } catch (error) {
        console.error("Erreur getCommandesNonPayees:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des commandes",
        };
    }
}
