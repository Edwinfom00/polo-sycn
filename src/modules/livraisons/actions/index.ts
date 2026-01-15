"use server";

import { db } from "@/db";
import { livraison, ligneLivraison, commande, ligneCommande, user, produit, taille, couleur, stock } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-utils";
import { livraisonCreateSchema } from "../schemas";

// ============================================
// LIVRAISONS
// ============================================

export async function getLivraisons(params?: {
    page?: number;
    limit?: number;
    commandeId?: string;
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
                livraison: livraison,
                commande: commande,
                etudiant: user,
                livrePar: user,
            })
            .from(livraison)
            .leftJoin(commande, eq(livraison.commandeId, commande.id))
            .leftJoin(user, eq(commande.etudiantId, user.id))
            .$dynamic();

        // Filtrer selon le rôle
        if (currentUser.role === 'ETUDIANT') {
            query = query.where(eq(commande.etudiantId, currentUser.id));
        }

        // Filtres additionnels
        if (params?.commandeId) {
            query = query.where(eq(livraison.commandeId, params.commandeId));
        }

        const [livraisonsData, countResult] = await Promise.all([
            query.orderBy(desc(livraison.livreAt)).limit(limit).offset(offset),
            db.select({ count: sql<number>`count(*)` }).from(livraison),
        ]);

        // Charger les lignes et le livreur pour chaque livraison
        const livraisonsWithDetails = await Promise.all(
            livraisonsData.map(async (liv) => {
                const lignes = await db
                    .select({
                        ligne: ligneLivraison,
                        ligneCommande: ligneCommande,
                        produit: produit,
                        taille: taille,
                        couleur: couleur,
                    })
                    .from(ligneLivraison)
                    .leftJoin(ligneCommande, eq(ligneLivraison.ligneCommandeId, ligneCommande.id))
                    .leftJoin(produit, eq(ligneCommande.produitId, produit.id))
                    .leftJoin(taille, eq(ligneCommande.tailleId, taille.id))
                    .leftJoin(couleur, eq(ligneCommande.couleurId, couleur.id))
                    .where(eq(ligneLivraison.livraisonId, liv.livraison.id));

                const livreur = await db
                    .select()
                    .from(user)
                    .where(eq(user.id, liv.livraison.livrePar))
                    .limit(1);

                return {
                    ...liv.livraison,
                    commande: {
                        ...liv.commande!,
                        etudiant: liv.etudiant!,
                    },
                    livrePar: livreur[0],
                    lignes: lignes.map((l) => ({
                        ...l.ligne,
                        ligneCommande: {
                            ...l.ligneCommande!,
                            produit: l.produit!,
                            taille: l.taille!,
                            couleur: l.couleur!,
                        },
                    })),
                };
            })
        );

        return {
            success: true,
            data: {
                livraisons: livraisonsWithDetails,
                total: Number(countResult[0]?.count || 0),
            },
        };
    } catch (error) {
        console.error("Erreur getLivraisons:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des livraisons",
        };
    }
}

export async function createLivraison(data: z.infer<typeof livraisonCreateSchema>) {
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

        const validated = livraisonCreateSchema.parse(data);

        // Vérifier que la commande existe et est validée
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

        if (cmd[0].statut !== 'VALIDE') {
            return {
                success: false,
                message: "La commande doit être validée avant livraison",
            };
        }

        // Récupérer toutes les lignes de la commande
        const lignesCommande = await db
            .select()
            .from(ligneCommande)
            .where(eq(ligneCommande.commandeId, validated.commandeId));

        if (lignesCommande.length === 0) {
            return {
                success: false,
                message: "Aucun article dans cette commande",
            };
        }

        // Créer la livraison
        const livraisonId = crypto.randomUUID();

        await db.insert(livraison).values({
            id: livraisonId,
            commandeId: validated.commandeId,
            livrePar: currentUser.id,
            livreAt: new Date(),
            notes: validated.notes || null,
        });

        // Créer les lignes de livraison et mettre à jour le stock pour chaque article
        for (const lc of lignesCommande) {
            // Créer la ligne de livraison
            await db.insert(ligneLivraison).values({
                livraisonId,
                ligneCommandeId: lc.id,
                quantiteLivree: lc.quantite,
            });

            // Mettre à jour le stock
            const stockItem = await db
                .select()
                .from(stock)
                .where(
                    and(
                        eq(stock.produitId, lc.produitId),
                        eq(stock.tailleId, lc.tailleId),
                        eq(stock.couleurId, lc.couleurId)
                    )
                )
                .limit(1);

            if (stockItem.length > 0) {
                const currentStock = stockItem[0];
                await db
                    .update(stock)
                    .set({
                        quantiteReservee: currentStock.quantiteReservee - lc.quantite,
                        quantiteLivree: currentStock.quantiteLivree + lc.quantite,
                        updatedAt: new Date(),
                    })
                    .where(eq(stock.id, currentStock.id));
            }
        }

        // Mettre à jour le statut de la commande
        await db
            .update(commande)
            .set({
                statut: 'LIVRE',
                updatedAt: new Date(),
            })
            .where(eq(commande.id, validated.commandeId));

        return {
            success: true,
            message: "Livraison enregistrée avec succès",
        };
    } catch (error) {
        console.error("Erreur createLivraison:", error);
        return {
            success: false,
            message: "Erreur lors de l'enregistrement de la livraison",
        };
    }
}

export async function getLivraisonStats() {
    try {
        const [totalLivraisons, aujourdhui] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(livraison),
            db
                .select({ count: sql<number>`count(*)` })
                .from(livraison)
                .where(sql`DATE(${livraison.livreAt}) = CURRENT_DATE`),
        ]);

        return {
            success: true,
            data: {
                totalLivraisons: Number(totalLivraisons[0]?.count || 0),
                aujourdhui: Number(aujourdhui[0]?.count || 0),
            },
        };
    } catch (error) {
        console.error("Erreur getLivraisonStats:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des statistiques",
        };
    }
}

// ============================================
// HELPERS
// ============================================

export async function getCommandesValidees() {
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

        const commandes = await db
            .select({
                commande: commande,
                etudiant: user,
            })
            .from(commande)
            .leftJoin(user, eq(commande.etudiantId, user.id))
            .where(eq(commande.statut, 'VALIDE'));

        // Charger les lignes pour chaque commande
        const commandesWithLignes = await Promise.all(
            commandes.map(async (cmd) => {
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
            data: commandesWithLignes,
        };
    } catch (error) {
        console.error("Erreur getCommandesValidees:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des commandes",
        };
    }
}
