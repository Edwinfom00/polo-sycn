"use server";

import { db } from "@/db";
import { commande, paiement, livraison, stock, classe, user, produit, ligneCommande } from "@/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-utils";

export async function getRapportsStats() {
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

        // Stats globales
        const [
            totalCommandes,
            commandesEnAttente,
            commandesPayees,
            commandesValidees,
            commandesLivrees,
            totalPaiements,
            paiementsEnAttente,
            paiementsValides,
            montantTotal,
            montantPaye,
            totalLivraisons,
            stockTotal,
            stockFaible,
            totalEtudiants,
            totalClasses,
        ] = await Promise.all([
            // Commandes
            db.select({ count: sql<number>`count(*)` }).from(commande),
            db.select({ count: sql<number>`count(*)` }).from(commande).where(eq(commande.statut, 'EN_ATTENTE')),
            db.select({ count: sql<number>`count(*)` }).from(commande).where(eq(commande.statut, 'PAYE')),
            db.select({ count: sql<number>`count(*)` }).from(commande).where(eq(commande.statut, 'VALIDE')),
            db.select({ count: sql<number>`count(*)` }).from(commande).where(eq(commande.statut, 'LIVRE')),

            // Paiements
            db.select({ count: sql<number>`count(*)` }).from(paiement),
            db.select({ count: sql<number>`count(*)` }).from(paiement).where(eq(paiement.statut, 'EN_ATTENTE')),
            db.select({ count: sql<number>`count(*)` }).from(paiement).where(eq(paiement.statut, 'PAYE')),

            // Montants
            db.select({ total: sql<number>`SUM(CAST(${commande.montantTotal} AS DECIMAL))` }).from(commande),
            db.select({ total: sql<number>`SUM(CAST(${commande.montantPaye} AS DECIMAL))` }).from(commande),

            // Livraisons
            db.select({ count: sql<number>`count(*)` }).from(livraison),

            // Stock
            db.select({ total: sql<number>`SUM(${stock.quantiteDisponible})` }).from(stock),
            db.select({ count: sql<number>`count(*)` }).from(stock).where(sql`${stock.quantiteDisponible} <= ${stock.seuilAlerte}`),

            // Utilisateurs
            db.select({ count: sql<number>`count(*)` }).from(user).where(eq(user.role, 'ETUDIANT')),
            db.select({ count: sql<number>`count(*)` }).from(classe),
        ]);

        // Stats par classe
        const commandesParClasse = await db
            .select({
                classeId: commande.classeId,
                classe: classe,
                totalCommandes: sql<number>`count(*)`,
                montantTotal: sql<number>`SUM(CAST(${commande.montantTotal} AS DECIMAL))`,
                montantPaye: sql<number>`SUM(CAST(${commande.montantPaye} AS DECIMAL))`,
            })
            .from(commande)
            .leftJoin(classe, eq(commande.classeId, classe.id))
            .groupBy(commande.classeId, classe.id, classe.nom, classe.code, classe.niveau, classe.filiereId, classe.delegueId, classe.actif, classe.createdAt, classe.updatedAt);

        // Stats par statut (pour graphique)
        const commandesParStatut = [
            { statut: 'EN_ATTENTE', count: Number(commandesEnAttente[0]?.count || 0) },
            { statut: 'PAYE', count: Number(commandesPayees[0]?.count || 0) },
            { statut: 'VALIDE', count: Number(commandesValidees[0]?.count || 0) },
            { statut: 'LIVRE', count: Number(commandesLivrees[0]?.count || 0) },
        ];

        // Produits les plus commandés
        const produitsPopulaires = await db
            .select({
                produitId: produit.id,
                produitNom: produit.nom,
                totalQuantite: sql<number>`SUM(${ligneCommande.quantite})`,
                totalCommandes: sql<number>`count(DISTINCT ${ligneCommande.commandeId})`,
            })
            .from(ligneCommande)
            .leftJoin(produit, eq(ligneCommande.produitId, produit.id))
            .groupBy(produit.id, produit.nom)
            .orderBy(sql`SUM(${ligneCommande.quantite}) DESC`)
            .limit(5);

        return {
            success: true,
            data: {
                global: {
                    totalCommandes: Number(totalCommandes[0]?.count || 0),
                    commandesEnAttente: Number(commandesEnAttente[0]?.count || 0),
                    commandesPayees: Number(commandesPayees[0]?.count || 0),
                    commandesValidees: Number(commandesValidees[0]?.count || 0),
                    commandesLivrees: Number(commandesLivrees[0]?.count || 0),
                    totalPaiements: Number(totalPaiements[0]?.count || 0),
                    paiementsEnAttente: Number(paiementsEnAttente[0]?.count || 0),
                    paiementsValides: Number(paiementsValides[0]?.count || 0),
                    montantTotal: Number(montantTotal[0]?.total || 0),
                    montantPaye: Number(montantPaye[0]?.total || 0),
                    totalLivraisons: Number(totalLivraisons[0]?.count || 0),
                    stockTotal: Number(stockTotal[0]?.total || 0),
                    stockFaible: Number(stockFaible[0]?.count || 0),
                    totalEtudiants: Number(totalEtudiants[0]?.count || 0),
                    totalClasses: Number(totalClasses[0]?.count || 0),
                },
                parClasse: commandesParClasse.map(c => ({
                    classeNom: c.classe?.nom || 'N/A',
                    classeCode: c.classe?.code || 'N/A',
                    totalCommandes: Number(c.totalCommandes || 0),
                    montantTotal: Number(c.montantTotal || 0),
                    montantPaye: Number(c.montantPaye || 0),
                })),
                parStatut: commandesParStatut,
                produitsPopulaires: produitsPopulaires.map(p => ({
                    nom: p.produitNom || 'N/A',
                    quantite: Number(p.totalQuantite || 0),
                    commandes: Number(p.totalCommandes || 0),
                })),
            },
        };
    } catch (error) {
        console.error("Erreur getRapportsStats:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des statistiques",
        };
    }
}
