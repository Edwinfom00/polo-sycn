"use server";

import { db } from "@/db";
import { user, commande, paiement, livraison, produit, stock } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-utils";

export async function getDashboardStats() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                message: "Non authentifié",
            };
        }

        const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';
        const isDelegue = currentUser.role === 'DELEGUE';
        const isEtudiant = currentUser.role === 'ETUDIANT';

        // Stats commandes (filtrées selon le rôle)
        let totalCommandes, commandesEnAttente, commandesPayees, commandesValidees, commandesLivrees;

        if (isEtudiant) {
            [totalCommandes, commandesEnAttente, commandesPayees, commandesValidees, commandesLivrees] = await Promise.all([
                db.select({ count: sql<number>`count(*)` }).from(commande).where(eq(commande.etudiantId, currentUser.id)),
                db.select({ count: sql<number>`count(*)` }).from(commande).where(and(eq(commande.etudiantId, currentUser.id), eq(commande.statut, 'EN_ATTENTE'))),
                db.select({ count: sql<number>`count(*)` }).from(commande).where(and(eq(commande.etudiantId, currentUser.id), eq(commande.statut, 'PAYE'))),
                db.select({ count: sql<number>`count(*)` }).from(commande).where(and(eq(commande.etudiantId, currentUser.id), eq(commande.statut, 'VALIDE'))),
                db.select({ count: sql<number>`count(*)` }).from(commande).where(and(eq(commande.etudiantId, currentUser.id), eq(commande.statut, 'LIVRE'))),
            ]);
        } else if (isDelegue && currentUser.classeId) {
            [totalCommandes, commandesEnAttente, commandesPayees, commandesValidees, commandesLivrees] = await Promise.all([
                db.select({ count: sql<number>`count(*)` }).from(commande).where(eq(commande.classeId, currentUser.classeId)),
                db.select({ count: sql<number>`count(*)` }).from(commande).where(and(eq(commande.classeId, currentUser.classeId), eq(commande.statut, 'EN_ATTENTE'))),
                db.select({ count: sql<number>`count(*)` }).from(commande).where(and(eq(commande.classeId, currentUser.classeId), eq(commande.statut, 'PAYE'))),
                db.select({ count: sql<number>`count(*)` }).from(commande).where(and(eq(commande.classeId, currentUser.classeId), eq(commande.statut, 'VALIDE'))),
                db.select({ count: sql<number>`count(*)` }).from(commande).where(and(eq(commande.classeId, currentUser.classeId), eq(commande.statut, 'LIVRE'))),
            ]);
        } else {
            [totalCommandes, commandesEnAttente, commandesPayees, commandesValidees, commandesLivrees] = await Promise.all([
                db.select({ count: sql<number>`count(*)` }).from(commande),
                db.select({ count: sql<number>`count(*)` }).from(commande).where(eq(commande.statut, 'EN_ATTENTE')),
                db.select({ count: sql<number>`count(*)` }).from(commande).where(eq(commande.statut, 'PAYE')),
                db.select({ count: sql<number>`count(*)` }).from(commande).where(eq(commande.statut, 'VALIDE')),
                db.select({ count: sql<number>`count(*)` }).from(commande).where(eq(commande.statut, 'LIVRE')),
            ]);
        }

        // Stats paiements (seulement pour admin)
        let paiementsStats = { total: 0, enAttente: 0, montantTotal: 0 };
        if (isAdmin || isDelegue) {
            const [totalPaiements, paiementsEnAttente, montantTotal] = await Promise.all([
                db.select({ count: sql<number>`count(*)` }).from(paiement),
                db.select({ count: sql<number>`count(*)` }).from(paiement).where(eq(paiement.statut, 'EN_ATTENTE')),
                db.select({ total: sql<number>`SUM(CAST(${paiement.montant} AS DECIMAL))` }).from(paiement).where(eq(paiement.statut, 'PAYE')),
            ]);

            paiementsStats = {
                total: Number(totalPaiements[0]?.count || 0),
                enAttente: Number(paiementsEnAttente[0]?.count || 0),
                montantTotal: Number(montantTotal[0]?.total || 0),
            };
        }

        // Stats livraisons (seulement pour admin)
        let livraisonsStats = { total: 0, aujourdhui: 0 };
        if (isAdmin || isDelegue) {
            const [totalLivraisons, livraisonsAujourdhui] = await Promise.all([
                db.select({ count: sql<number>`count(*)` }).from(livraison),
                db.select({ count: sql<number>`count(*)` }).from(livraison).where(sql`DATE(${livraison.livreAt}) = CURRENT_DATE`),
            ]);

            livraisonsStats = {
                total: Number(totalLivraisons[0]?.count || 0),
                aujourdhui: Number(livraisonsAujourdhui[0]?.count || 0),
            };
        }

        // Stats stock (seulement pour admin)
        let stockStats = { produitsActifs: 0, total: 0, faible: 0 };
        if (isAdmin) {
            const [produitsActifs, stockTotal, stockFaible] = await Promise.all([
                db.select({ count: sql<number>`count(*)` }).from(produit).where(eq(produit.actif, true)),
                db.select({ total: sql<number>`SUM(${stock.quantiteDisponible})` }).from(stock),
                db.select({ count: sql<number>`count(*)` }).from(stock).where(sql`${stock.quantiteDisponible} <= ${stock.seuilAlerte}`),
            ]);

            stockStats = {
                produitsActifs: Number(produitsActifs[0]?.count || 0),
                total: Number(stockTotal[0]?.total || 0),
                faible: Number(stockFaible[0]?.count || 0),
            };
        }

        return {
            success: true,
            data: {
                commandes: {
                    total: Number(totalCommandes[0]?.count || 0),
                    enAttente: Number(commandesEnAttente[0]?.count || 0),
                    payees: Number(commandesPayees[0]?.count || 0),
                    validees: Number(commandesValidees[0]?.count || 0),
                    livrees: Number(commandesLivrees[0]?.count || 0),
                },
                paiements: paiementsStats,
                livraisons: livraisonsStats,
                stock: stockStats,
            },
        };
    } catch (error) {
        console.error("Erreur getDashboardStats:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des statistiques",
        };
    }
}

export async function getRecentActivities() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                message: "Non authentifié",
            };
        }

        // Récupérer les 5 dernières commandes
        const recentCommandes = await db
            .select({
                commande: commande,
                etudiant: user,
            })
            .from(commande)
            .leftJoin(user, eq(commande.etudiantId, user.id))
            .orderBy(sql`${commande.createdAt} DESC`)
            .limit(5);

        // Récupérer les 5 derniers paiements
        const recentPaiements = await db
            .select({
                paiement: paiement,
                commande: commande,
                etudiant: user,
            })
            .from(paiement)
            .leftJoin(commande, eq(paiement.commandeId, commande.id))
            .leftJoin(user, eq(commande.etudiantId, user.id))
            .orderBy(sql`${paiement.createdAt} DESC`)
            .limit(5);

        return {
            success: true,
            data: {
                commandes: recentCommandes.map(c => ({
                    ...c.commande,
                    etudiant: c.etudiant,
                })),
                paiements: recentPaiements.map(p => ({
                    ...p.paiement,
                    commande: p.commande,
                    etudiant: p.etudiant,
                })),
            },
        };
    } catch (error) {
        console.error("Erreur getRecentActivities:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des activités",
        };
    }
}
