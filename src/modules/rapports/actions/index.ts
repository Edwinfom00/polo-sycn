"use server";

import { db } from "@/db";
import {
    commande,
    paiement,
    livraison,
    stock,
    classe,
    user,
    produit,
    ligneCommande,
    sortieStock,
    ligneSortieStock,
    filiere
} from "@/db/schema";
import { eq, sql, and, gte, lte, between, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-utils";

interface RapportFilters {
    dateDebut?: Date;
    dateFin?: Date;
    classeId?: string;
    filiereId?: string;
    type?: string;
}

export async function getRapportComplet(filters?: RapportFilters) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
            return { success: false, message: "Accès non autorisé" };
        }

        const now = new Date();
        const dateDebut = filters?.dateDebut || new Date(now.getFullYear(), now.getMonth(), 1);
        const dateFin = filters?.dateFin || now;

        // Stats globales avec filtres
        const whereCommande = filters?.classeId
            ? and(
                gte(commande.createdAt, dateDebut),
                lte(commande.createdAt, dateFin),
                eq(commande.classeId, filters.classeId)
            )
            : and(
                gte(commande.createdAt, dateDebut),
                lte(commande.createdAt, dateFin)
            );

        const [
            // Commandes
            totalCommandes,
            commandesParStatut,
            montantStats,

            // Paiements
            paiementsStats,
            paiementsParMethode,

            // Livraisons
            livraisonsStats,

            // Stock
            stockStats,
            stockParProduit,

            // Sorties
            sortiesStats,
            sortiesParType,

            // Utilisateurs
            etudiantsStats,
            classesStats,

            // Évolution temporelle
            evolutionCommandes,
            evolutionPaiements,

            // Top produits
            topProduits,

            // Performance par classe
            performanceClasses,
        ] = await Promise.all([
            // Total commandes
            db.select({ count: sql<number>`count(*)` })
                .from(commande)
                .where(whereCommande),

            // Commandes par statut
            db.select({
                statut: commande.statut,
                count: sql<number>`count(*)`,
                montant: sql<number>`SUM(CAST(${commande.montantTotal} AS DECIMAL))`,
            })
                .from(commande)
                .where(whereCommande)
                .groupBy(commande.statut),

            // Montants
            db.select({
                total: sql<number>`SUM(CAST(${commande.montantTotal} AS DECIMAL))`,
                paye: sql<number>`SUM(CAST(${commande.montantPaye} AS DECIMAL))`,
                impaye: sql<number>`SUM(CAST(${commande.montantTotal} AS DECIMAL)) - SUM(CAST(${commande.montantPaye} AS DECIMAL))`,
            })
                .from(commande)
                .where(whereCommande),

            // Paiements
            db.select({
                count: sql<number>`count(*)`,
                montant: sql<number>`SUM(CAST(${paiement.montant} AS DECIMAL))`,
            })
                .from(paiement)
                .where(and(
                    gte(paiement.createdAt, dateDebut),
                    lte(paiement.createdAt, dateFin)
                )),

            // Paiements par méthode
            db.select({
                methode: paiement.methodePaiement,
                count: sql<number>`count(*)`,
                montant: sql<number>`SUM(CAST(${paiement.montant} AS DECIMAL))`,
            })
                .from(paiement)
                .where(and(
                    gte(paiement.createdAt, dateDebut),
                    lte(paiement.createdAt, dateFin)
                ))
                .groupBy(paiement.methodePaiement),

            // Livraisons
            db.select({
                count: sql<number>`count(*)`,
            })
                .from(livraison)
                .where(and(
                    gte(livraison.livreAt, dateDebut),
                    lte(livraison.livreAt, dateFin)
                )),

            // Stock
            db.select({
                total: sql<number>`SUM(${stock.quantiteDisponible})`,
                reserve: sql<number>`SUM(${stock.quantiteReservee})`,
                livre: sql<number>`SUM(${stock.quantiteLivree})`,
                faible: sql<number>`count(*) FILTER (WHERE ${stock.quantiteDisponible} <= ${stock.seuilAlerte})`,
            })
                .from(stock),

            // Stock par produit
            db.select({
                produitNom: produit.nom,
                disponible: sql<number>`SUM(${stock.quantiteDisponible})`,
                reserve: sql<number>`SUM(${stock.quantiteReservee})`,
                livre: sql<number>`SUM(${stock.quantiteLivree})`,
            })
                .from(stock)
                .leftJoin(produit, eq(stock.produitId, produit.id))
                .groupBy(produit.id, produit.nom)
                .orderBy(desc(sql`SUM(${stock.quantiteDisponible})`))
                .limit(10),

            // Sorties
            db.select({
                count: sql<number>`count(*)`,
                quantite: sql<number>`SUM((SELECT SUM(${ligneSortieStock.quantite}) FROM ${ligneSortieStock} WHERE ${ligneSortieStock.sortieId} = ${sortieStock.id}))`,
            })
                .from(sortieStock)
                .where(and(
                    gte(sortieStock.effectueAt, dateDebut),
                    lte(sortieStock.effectueAt, dateFin)
                )),

            // Sorties par type
            db.select({
                type: sortieStock.type,
                count: sql<number>`count(*)`,
                quantite: sql<number>`SUM((SELECT SUM(${ligneSortieStock.quantite}) FROM ${ligneSortieStock} WHERE ${ligneSortieStock.sortieId} = ${sortieStock.id}))`,
            })
                .from(sortieStock)
                .where(and(
                    gte(sortieStock.effectueAt, dateDebut),
                    lte(sortieStock.effectueAt, dateFin)
                ))
                .groupBy(sortieStock.type),

            // Étudiants
            db.select({ count: sql<number>`count(*)` })
                .from(user)
                .where(eq(user.role, 'ETUDIANT')),

            // Classes
            db.select({ count: sql<number>`count(*)` })
                .from(classe)
                .where(eq(classe.actif, true)),

            // Évolution commandes (par jour)
            db.select({
                date: sql<string>`DATE(${commande.createdAt})`,
                count: sql<number>`count(*)`,
                montant: sql<number>`SUM(CAST(${commande.montantTotal} AS DECIMAL))`,
            })
                .from(commande)
                .where(whereCommande)
                .groupBy(sql`DATE(${commande.createdAt})`)
                .orderBy(sql`DATE(${commande.createdAt})`),

            // Évolution paiements (par jour)
            db.select({
                date: sql<string>`DATE(${paiement.createdAt})`,
                count: sql<number>`count(*)`,
                montant: sql<number>`SUM(CAST(${paiement.montant} AS DECIMAL))`,
            })
                .from(paiement)
                .where(and(
                    gte(paiement.createdAt, dateDebut),
                    lte(paiement.createdAt, dateFin)
                ))
                .groupBy(sql`DATE(${paiement.createdAt})`)
                .orderBy(sql`DATE(${paiement.createdAt})`),

            // Top produits
            db.select({
                produitNom: produit.nom,
                quantite: sql<number>`SUM(${ligneCommande.quantite})`,
                commandes: sql<number>`count(DISTINCT ${ligneCommande.commandeId})`,
                montant: sql<number>`SUM(CAST(${ligneCommande.sousTotal} AS DECIMAL))`,
            })
                .from(ligneCommande)
                .leftJoin(produit, eq(ligneCommande.produitId, produit.id))
                .leftJoin(commande, eq(ligneCommande.commandeId, commande.id))
                .where(whereCommande)
                .groupBy(produit.id, produit.nom)
                .orderBy(desc(sql`SUM(${ligneCommande.quantite})`))
                .limit(10),

            // Performance par classe
            db.select({
                classeNom: classe.nom,
                classeCode: classe.code,
                filiereNom: filiere.nom,
                totalCommandes: sql<number>`count(*)`,
                montantTotal: sql<number>`SUM(CAST(${commande.montantTotal} AS DECIMAL))`,
                montantPaye: sql<number>`SUM(CAST(${commande.montantPaye} AS DECIMAL))`,
                etudiants: sql<number>`(SELECT count(*) FROM ${user} WHERE ${user.classeId} = ${classe.id})`,
            })
                .from(commande)
                .leftJoin(classe, eq(commande.classeId, classe.id))
                .leftJoin(filiere, eq(classe.filiereId, filiere.id))
                .where(whereCommande)
                .groupBy(classe.id, classe.nom, classe.code, filiere.nom)
                .orderBy(desc(sql`SUM(CAST(${commande.montantTotal} AS DECIMAL))`)),
        ]);

        return {
            success: true,
            data: {
                periode: {
                    debut: dateDebut,
                    fin: dateFin,
                },
                commandes: {
                    total: Number(totalCommandes[0]?.count || 0),
                    parStatut: commandesParStatut.map(s => ({
                        statut: s.statut,
                        count: Number(s.count || 0),
                        montant: Number(s.montant || 0),
                    })),
                    montants: {
                        total: Number(montantStats[0]?.total || 0),
                        paye: Number(montantStats[0]?.paye || 0),
                        impaye: Number(montantStats[0]?.impaye || 0),
                    },
                    evolution: evolutionCommandes.map(e => ({
                        date: e.date,
                        count: Number(e.count || 0),
                        montant: Number(e.montant || 0),
                    })),
                },
                paiements: {
                    total: Number(paiementsStats[0]?.count || 0),
                    montant: Number(paiementsStats[0]?.montant || 0),
                    parMethode: paiementsParMethode.map(p => ({
                        methode: p.methode || 'Non spécifié',
                        count: Number(p.count || 0),
                        montant: Number(p.montant || 0),
                    })),
                    evolution: evolutionPaiements.map(e => ({
                        date: e.date,
                        count: Number(e.count || 0),
                        montant: Number(e.montant || 0),
                    })),
                },
                livraisons: {
                    total: Number(livraisonsStats[0]?.count || 0),
                },
                stock: {
                    disponible: Number(stockStats[0]?.total || 0),
                    reserve: Number(stockStats[0]?.reserve || 0),
                    livre: Number(stockStats[0]?.livre || 0),
                    faible: Number(stockStats[0]?.faible || 0),
                    parProduit: stockParProduit.map(s => ({
                        produit: s.produitNom || 'N/A',
                        disponible: Number(s.disponible || 0),
                        reserve: Number(s.reserve || 0),
                        livre: Number(s.livre || 0),
                    })),
                },
                sorties: {
                    total: Number(sortiesStats[0]?.count || 0),
                    quantite: Number(sortiesStats[0]?.quantite || 0),
                    parType: sortiesParType.map(s => ({
                        type: s.type,
                        count: Number(s.count || 0),
                        quantite: Number(s.quantite || 0),
                    })),
                },
                utilisateurs: {
                    etudiants: Number(etudiantsStats[0]?.count || 0),
                    classes: Number(classesStats[0]?.count || 0),
                },
                topProduits: topProduits.map(p => ({
                    nom: p.produitNom || 'N/A',
                    quantite: Number(p.quantite || 0),
                    commandes: Number(p.commandes || 0),
                    montant: Number(p.montant || 0),
                })),
                performanceClasses: performanceClasses.map(c => ({
                    nom: c.classeNom || 'N/A',
                    code: c.classeCode || 'N/A',
                    filiere: c.filiereNom || 'N/A',
                    commandes: Number(c.totalCommandes || 0),
                    montantTotal: Number(c.montantTotal || 0),
                    montantPaye: Number(c.montantPaye || 0),
                    etudiants: Number(c.etudiants || 0),
                    tauxPaiement: Number(c.montantTotal || 0) > 0
                        ? (Number(c.montantPaye || 0) / Number(c.montantTotal || 0)) * 100
                        : 0,
                    moyenneParEtudiant: Number(c.etudiants || 0) > 0
                        ? Number(c.montantTotal || 0) / Number(c.etudiants || 0)
                        : 0,
                })),
            },
        };
    } catch (error) {
        console.error("Erreur getRapportComplet:", error);
        return {
            success: false,
            message: "Erreur lors de la génération du rapport",
        };
    }
}

export async function getClassesList() {
    try {
        const classes = await db
            .select({
                id: classe.id,
                nom: classe.nom,
                code: classe.code,
            })
            .from(classe)
            .where(eq(classe.actif, true))
            .orderBy(classe.nom);

        return { success: true, data: classes };
    } catch (error) {
        console.error("Erreur getClassesList:", error);
        return { success: false, data: [] };
    }
}

export async function getFilieresList() {
    try {
        const filieres = await db
            .select({
                id: filiere.id,
                nom: filiere.nom,
                code: filiere.code,
            })
            .from(filiere)
            .where(eq(filiere.actif, true))
            .orderBy(filiere.nom);

        return { success: true, data: filieres };
    } catch (error) {
        console.error("Erreur getFilieresList:", error);
        return { success: false, data: [] };
    }
}
