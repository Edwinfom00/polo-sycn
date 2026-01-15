"use server";

import { db } from "@/db";
import { commande, ligneCommande, user, classe, produit, taille, couleur, stock } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-utils";
import {
    commandeCreateSchema,
    commandeUpdateStatusSchema,
    commandeValidateSchema,
} from "../schemas";

// ============================================
// HELPERS
// ============================================

function generateNumeroCommande(): string {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CMD-${year}-${random}`;
}

// ============================================
// COMMANDES
// ============================================

export async function getCommandes(params?: {
    page?: number;
    limit?: number;
    etudiantId?: string;
    classeId?: string;
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
                commande: commande,
                etudiant: user,
                classe: classe,
            })
            .from(commande)
            .leftJoin(user, eq(commande.etudiantId, user.id))
            .leftJoin(classe, eq(commande.classeId, classe.id))
            .$dynamic();

        // Filtrer selon le rôle
        if (currentUser.role === 'ETUDIANT') {
            query = query.where(eq(commande.etudiantId, currentUser.id));
        } else if (currentUser.role === 'DELEGUE' && currentUser.classeId) {
            query = query.where(eq(commande.classeId, currentUser.classeId));
        }

        // Filtres additionnels
        if (params?.etudiantId) {
            query = query.where(eq(commande.etudiantId, params.etudiantId));
        }
        if (params?.classeId) {
            query = query.where(eq(commande.classeId, params.classeId));
        }
        if (params?.statut) {
            query = query.where(eq(commande.statut, params.statut as any));
        }

        const [commandesData, countResult] = await Promise.all([
            query.orderBy(desc(commande.createdAt)).limit(limit).offset(offset),
            db.select({ count: sql<number>`count(*)` }).from(commande),
        ]);

        // Charger les lignes pour chaque commande
        const commandesWithLignes = await Promise.all(
            commandesData.map(async (cmd) => {
                const lignes = await db
                    .select({
                        ligne: ligneCommande,
                        produit: produit,
                        taille: taille,
                        couleur: couleur,
                    })
                    .from(ligneCommande)
                    .leftJoin(produit, eq(ligneCommande.produitId, produit.id))
                    .leftJoin(taille, eq(ligneCommande.tailleId, taille.id))
                    .leftJoin(couleur, eq(ligneCommande.couleurId, couleur.id))
                    .where(eq(ligneCommande.commandeId, cmd.commande.id));

                return {
                    ...cmd.commande,
                    etudiant: cmd.etudiant!,
                    classe: cmd.classe!,
                    lignes: lignes.map((l) => ({
                        ...l.ligne,
                        produit: l.produit!,
                        taille: l.taille!,
                        couleur: l.couleur!,
                    })),
                };
            })
        );

        return {
            success: true,
            data: {
                commandes: commandesWithLignes,
                total: Number(countResult[0]?.count || 0),
            },
        };
    } catch (error) {
        console.error("Erreur getCommandes:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des commandes",
        };
    }
}

export async function getCommande(id: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                message: "Non authentifié",
            };
        }

        const result = await db
            .select({
                commande: commande,
                etudiant: user,
                classe: classe,
            })
            .from(commande)
            .leftJoin(user, eq(commande.etudiantId, user.id))
            .leftJoin(classe, eq(commande.classeId, classe.id))
            .where(eq(commande.id, id))
            .limit(1);

        if (result.length === 0) {
            return {
                success: false,
                message: "Commande non trouvée",
            };
        }

        const cmd = result[0];

        // Vérifier les permissions
        if (
            currentUser.role === 'ETUDIANT' &&
            cmd.commande.etudiantId !== currentUser.id
        ) {
            return {
                success: false,
                message: "Accès non autorisé",
            };
        }

        // Charger les lignes
        const lignes = await db
            .select({
                ligne: ligneCommande,
                produit: produit,
                taille: taille,
                couleur: couleur,
            })
            .from(ligneCommande)
            .leftJoin(produit, eq(ligneCommande.produitId, produit.id))
            .leftJoin(taille, eq(ligneCommande.tailleId, taille.id))
            .leftJoin(couleur, eq(ligneCommande.couleurId, couleur.id))
            .where(eq(ligneCommande.commandeId, cmd.commande.id));

        return {
            success: true,
            data: {
                ...cmd.commande,
                etudiant: cmd.etudiant!,
                classe: cmd.classe!,
                lignes: lignes.map((l) => ({
                    ...l.ligne,
                    produit: l.produit!,
                    taille: l.taille!,
                    couleur: l.couleur!,
                })),
            },
        };
    } catch (error) {
        console.error("Erreur getCommande:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération de la commande",
        };
    }
}

export async function createCommande(data: z.infer<typeof commandeCreateSchema>) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                message: "Non authentifié",
            };
        }

        if (!currentUser.classeId) {
            return {
                success: false,
                message: "Vous devez être assigné à une classe pour passer commande",
            };
        }

        const validated = commandeCreateSchema.parse(data);

        // Calculer le montant total
        let montantTotal = 0;
        for (const ligne of validated.lignes) {
            const prix = parseFloat(ligne.prixUnitaire);
            montantTotal += prix * ligne.quantite;
        }

        // Créer la commande
        const commandeId = crypto.randomUUID();
        const numero = generateNumeroCommande();

        await db.insert(commande).values({
            id: commandeId,
            numero,
            etudiantId: currentUser.id,
            classeId: currentUser.classeId,
            statut: 'EN_ATTENTE',
            montantTotal: montantTotal.toFixed(2),
            montantPaye: '0',
            notes: validated.notes || null,
        });

        // Créer les lignes
        for (const ligne of validated.lignes) {
            const sousTotal = parseFloat(ligne.prixUnitaire) * ligne.quantite;
            await db.insert(ligneCommande).values({
                commandeId,
                produitId: ligne.produitId,
                tailleId: ligne.tailleId,
                couleurId: ligne.couleurId,
                quantite: ligne.quantite,
                prixUnitaire: ligne.prixUnitaire,
                sousTotal: sousTotal.toFixed(2),
            });
        }

        return {
            success: true,
            message: "Commande créée avec succès",
            data: { id: commandeId, numero },
        };
    } catch (error) {
        console.error("Erreur createCommande:", error);
        return {
            success: false,
            message: "Erreur lors de la création de la commande",
        };
    }
}

export async function updateCommandeStatus(
    data: z.infer<typeof commandeUpdateStatusSchema>
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                message: "Non authentifié",
            };
        }

        // Seuls les admins peuvent changer le statut
        if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
            return {
                success: false,
                message: "Accès non autorisé",
            };
        }

        const validated = commandeUpdateStatusSchema.parse(data);

        await db
            .update(commande)
            .set({
                statut: validated.statut,
                notes: validated.notes || null,
                updatedAt: new Date(),
            })
            .where(eq(commande.id, validated.id));

        return {
            success: true,
            message: "Statut mis à jour avec succès",
        };
    } catch (error) {
        console.error("Erreur updateCommandeStatus:", error);
        return {
            success: false,
            message: "Erreur lors de la mise à jour du statut",
        };
    }
}

export async function validerCommande(data: z.infer<typeof commandeValidateSchema>) {
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

        const validated = commandeValidateSchema.parse(data);

        // Récupérer la commande
        const cmd = await db
            .select()
            .from(commande)
            .where(eq(commande.id, validated.id))
            .limit(1);

        if (cmd.length === 0) {
            return {
                success: false,
                message: "Commande non trouvée",
            };
        }

        if (cmd[0].statut !== 'PAYE') {
            return {
                success: false,
                message: "La commande doit être payée avant validation",
            };
        }

        // Récupérer les lignes
        const lignes = await db
            .select()
            .from(ligneCommande)
            .where(eq(ligneCommande.commandeId, validated.id));

        // Réserver le stock
        for (const ligne of lignes) {
            const stockItem = await db
                .select()
                .from(stock)
                .where(
                    and(
                        eq(stock.produitId, ligne.produitId),
                        eq(stock.tailleId, ligne.tailleId),
                        eq(stock.couleurId, ligne.couleurId)
                    )
                )
                .limit(1);

            if (stockItem.length === 0) {
                return {
                    success: false,
                    message: `Stock non trouvé pour un des articles`,
                };
            }

            const currentStock = stockItem[0];
            if (currentStock.quantiteDisponible < ligne.quantite) {
                return {
                    success: false,
                    message: `Stock insuffisant pour un des articles`,
                };
            }

            // Réserver le stock
            await db
                .update(stock)
                .set({
                    quantiteDisponible: currentStock.quantiteDisponible - ligne.quantite,
                    quantiteReservee: currentStock.quantiteReservee + ligne.quantite,
                    updatedAt: new Date(),
                })
                .where(eq(stock.id, currentStock.id));
        }

        // Mettre à jour la commande
        await db
            .update(commande)
            .set({
                statut: 'VALIDE',
                validePar: currentUser.id,
                valideAt: new Date(),
                notes: validated.notes || null,
                updatedAt: new Date(),
            })
            .where(eq(commande.id, validated.id));

        return {
            success: true,
            message: "Commande validée avec succès",
        };
    } catch (error) {
        console.error("Erreur validerCommande:", error);
        return {
            success: false,
            message: "Erreur lors de la validation de la commande",
        };
    }
}

export async function annulerCommande(id: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                message: "Non authentifié",
            };
        }

        const cmd = await db
            .select()
            .from(commande)
            .where(eq(commande.id, id))
            .limit(1);

        if (cmd.length === 0) {
            return {
                success: false,
                message: "Commande non trouvée",
            };
        }

        // Vérifier les permissions
        const isOwner = cmd[0].etudiantId === currentUser.id;
        const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

        if (!isOwner && !isAdmin) {
            return {
                success: false,
                message: "Accès non autorisé",
            };
        }

        if (cmd[0].statut === 'LIVRE') {
            return {
                success: false,
                message: "Impossible d'annuler une commande déjà livrée",
            };
        }

        // Si la commande était validée, libérer le stock
        if (cmd[0].statut === 'VALIDE') {
            const lignes = await db
                .select()
                .from(ligneCommande)
                .where(eq(ligneCommande.commandeId, id));

            for (const ligne of lignes) {
                const stockItem = await db
                    .select()
                    .from(stock)
                    .where(
                        and(
                            eq(stock.produitId, ligne.produitId),
                            eq(stock.tailleId, ligne.tailleId),
                            eq(stock.couleurId, ligne.couleurId)
                        )
                    )
                    .limit(1);

                if (stockItem.length > 0) {
                    await db
                        .update(stock)
                        .set({
                            quantiteDisponible: stockItem[0].quantiteDisponible + ligne.quantite,
                            quantiteReservee: stockItem[0].quantiteReservee - ligne.quantite,
                            updatedAt: new Date(),
                        })
                        .where(eq(stock.id, stockItem[0].id));
                }
            }
        }

        await db
            .update(commande)
            .set({
                statut: 'ANNULE',
                updatedAt: new Date(),
            })
            .where(eq(commande.id, id));

        return {
            success: true,
            message: "Commande annulée avec succès",
        };
    } catch (error) {
        console.error("Erreur annulerCommande:", error);
        return {
            success: false,
            message: "Erreur lors de l'annulation de la commande",
        };
    }
}

export async function getCommandeStats() {
    try {
        const [totalCommandes, enAttente, payees, validees, livrees] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(commande),
            db
                .select({ count: sql<number>`count(*)` })
                .from(commande)
                .where(eq(commande.statut, 'EN_ATTENTE')),
            db
                .select({ count: sql<number>`count(*)` })
                .from(commande)
                .where(eq(commande.statut, 'PAYE')),
            db
                .select({ count: sql<number>`count(*)` })
                .from(commande)
                .where(eq(commande.statut, 'VALIDE')),
            db
                .select({ count: sql<number>`count(*)` })
                .from(commande)
                .where(eq(commande.statut, 'LIVRE')),
        ]);

        return {
            success: true,
            data: {
                totalCommandes: Number(totalCommandes[0]?.count || 0),
                enAttente: Number(enAttente[0]?.count || 0),
                payees: Number(payees[0]?.count || 0),
                validees: Number(validees[0]?.count || 0),
                livrees: Number(livrees[0]?.count || 0),
            },
        };
    } catch (error) {
        console.error("Erreur getCommandeStats:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des statistiques",
        };
    }
}
