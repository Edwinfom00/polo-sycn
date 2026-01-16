"use server";

import { db } from "@/db";
import { commande, paiement, livraison, stock } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-utils";

export async function getAdminDashboardStats() {
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

        // Récupérer toutes les stats en parallèle
        const [
            totalCommandes,
            commandesEnAttente,
            commandesPayees,
            commandesValidees,
            totalPaiements,
            paiementsEnAttente,
            totalLivraisons,
            livraisonsAujourdhui,
            stockTotal,
            stockFaible,
        ] = await Promise.all([
            // Commandes
            db.select({ count: sql<number>`count(*)` }).from(commande),
            db.select({ count: sql<number>`count(*)` }).from(commande).where(eq(commande.statut, 'EN_ATTENTE')),
            db.select({ count: sql<number>`count(*)` }).from(commande).where(eq(commande.statut, 'PAYE')),
            db.select({ count: sql<number>`count(*)` }).from(commande).where(eq(commande.statut, 'VALIDE')),

            // Paiements
            db.select({ count: sql<number>`count(*)` }).from(paiement),
            db.select({ count: sql<number>`count(*)` }).from(paiement).where(eq(paiement.statut, 'EN_ATTENTE')),

            // Livraisons
            db.select({ count: sql<number>`count(*)` }).from(livraison),
            db.select({ count: sql<number>`count(*)` }).from(livraison).where(sql`DATE(${livraison.livreAt}) = CURRENT_DATE`),

            // Stock
            db.select({ total: sql<number>`SUM(${stock.quantiteDisponible})` }).from(stock),
            db.select({ count: sql<number>`count(*)` }).from(stock).where(sql`${stock.quantiteDisponible} <= ${stock.seuilAlerte}`),
        ]);

        return {
            success: true,
            data: {
                commandes: {
                    total: Number(totalCommandes[0]?.count || 0),
                    enAttente: Number(commandesEnAttente[0]?.count || 0),
                    aValider: Number(commandesPayees[0]?.count || 0), // Commandes PAYE à valider
                    livrees: Number(commandesValidees[0]?.count || 0),
                },
                paiements: {
                    total: Number(totalPaiements[0]?.count || 0),
                    enAttente: Number(paiementsEnAttente[0]?.count || 0),
                    valides: Number(totalPaiements[0]?.count || 0) - Number(paiementsEnAttente[0]?.count || 0),
                },
                livraisons: {
                    total: Number(totalLivraisons[0]?.count || 0),
                    aujourdhui: Number(livraisonsAujourdhui[0]?.count || 0),
                },
                stock: {
                    total: Number(stockTotal[0]?.total || 0),
                    faible: Number(stockFaible[0]?.count || 0),
                },
            },
        };
    } catch (error) {
        console.error("Erreur getAdminDashboardStats:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des statistiques",
        };
    }
}
