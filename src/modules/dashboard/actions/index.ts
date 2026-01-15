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
        const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

        // Stats utilisateurs (seulement pour SUPER_ADMIN)
        let usersStats = { total: 0, admins: 0, delegues: 0, etudiants: 0 };
        if (isSuperAdmin) {
            const [total, admins, delegues, etudiants] = await Promise.all([
                db.select({ count: sql<number>`count(*)` }).from(user),
                db.select({ count: sql<number>`count(*)` }).from(user).where(eq(user.role, 'ADMIN')),
                db.select({ count: sql<number>`count(*)` }).from(user).where(eq(user.role, 'DELEGUE')),
                db.select({ count: sql<number>`count(*)` }).from(user).where(eq(user.role, 'ETUDIANT')),
            ]);

            usersStats = {
                total: Number(total[0]?.count || 0),
                admins: Number(admins[0]?.count || 0),
                delegues: Number(delegues[0]?.count || 0),
                etudiants: Number(etudiants[0]?.count || 0),
            };
        }

        // Stats commandes
        const [totalCommandes, commandesEnAttente, commandesPayees, commandesValidees, commandesLivrees] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(commande),
            db.select({ count: sql<number>`count(*)` }).from(commande).where(eq(commande.statut, 'EN_ATTENTE')),
            db.select({ count: sql<number>`count(*)` }).from(commande).where(eq(commande.statut, 'PAYE')),
            db.select({ count: sql<number>`count(*)` }).from(commande).where(eq(commande.statut, 'VALIDE')),
            db.select({ count: sql<number>`count(*)` }).from(commande).where(eq(commande.statut, 'LIVRE')),
        ]);

        // Stats paiements
        const [totalPaiements, paiementsEnAttente, montantTotal] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(paiement),
            db.select({ count: sql<number>`count(*)` }).from(paiement).where(eq(paiement.statut, 'EN_ATTENTE')),
            db.select({ total: sql<number>`SUM(CAST(${paiement.montant} AS DECIMAL))` }).from(paiement).where(eq(paiement.statut, 'PAYE')),
        ]);

        // Stats livraisons
        const [totalLivraisons, livraisonsAujourdhui] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(livraison),
            db.select({ count: sql<number>`count(*)` }).from(livraison).where(sql`DATE(${livraison.livreAt}) = CURRENT_DATE`),
        ]);

        // Stats stock
        const [produitsActifs, stockTotal, stockFaible] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(produit).where(eq(produit.actif, true)),
            db.select({ total: sql<number>`SUM(${stock.quantiteDisponible})` }).from(stock),
            db.select({ count: sql<number>`count(*)` }).from(stock).where(sql`${stock.quantiteDisponible} <= ${stock.seuilAlerte}`),
        ]);

        return {
            success: true,
            data: {
                users: usersStats,
                commandes: {
                    total: Number(totalCommandes[0]?.count || 0),
                    enAttente: Number(commandesEnAttente[0]?.count || 0),
                    payees: Number(commandesPayees[0]?.count || 0),
                    validees: Number(commandesValidees[0]?.count || 0),
                    livrees: Number(commandesLivrees[0]?.count || 0),
                },
                paiements: {
                    total: Number(totalPaiements[0]?.count || 0),
                    enAttente: Number(paiementsEnAttente[0]?.count || 0),
                    montantTotal: Number(montantTotal[0]?.total || 0),
                },
                livraisons: {
                    total: Number(totalLivraisons[0]?.count || 0),
                    aujourdhui: Number(livraisonsAujourdhui[0]?.count || 0),
                },
                stock: {
                    produitsActifs: Number(produitsActifs[0]?.count || 0),
                    total: Number(stockTotal[0]?.total || 0),
                    faible: Number(stockFaible[0]?.count || 0),
                },
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
