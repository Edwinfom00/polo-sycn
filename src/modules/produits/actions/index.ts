"use server";

import { db } from "@/db";
import { produit, stock, taille, couleur } from "@/db/schema";
import { eq, and, desc, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import {
    produitInsertSchema,
    produitUpdateSchema,
    stockInsertSchema,
    stockUpdateSchema,
    stockAjustementSchema,
} from "../schemas";

// ============================================
// PRODUITS
// ============================================

export async function getProduits(params?: {
    page?: number;
    limit?: number;
    search?: string;
}) {
    try {
        const page = params?.page || 1;
        const limit = params?.limit || 9;
        const offset = (page - 1) * limit;

        let query = db.select().from(produit).$dynamic();

        if (params?.search) {
            query = query.where(
                ilike(produit.nom, `%${params.search}%`)
            );
        }

        const [produits, countResult] = await Promise.all([
            query.orderBy(desc(produit.createdAt)).limit(limit).offset(offset),
            db.select({ count: sql<number>`count(*)` }).from(produit),
        ]);

        return {
            success: true,
            data: {
                produits,
                total: Number(countResult[0]?.count || 0),
            },
        };
    } catch (error) {
        console.error("Erreur getProduits:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des produits",
        };
    }
}

export async function getProduit(id: string) {
    try {
        const result = await db
            .select()
            .from(produit)
            .where(eq(produit.id, id))
            .limit(1);

        if (result.length === 0) {
            return {
                success: false,
                message: "Produit non trouvé",
            };
        }

        return {
            success: true,
            data: result[0],
        };
    } catch (error) {
        console.error("Erreur getProduit:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération du produit",
        };
    }
}

export async function createProduit(data: z.infer<typeof produitInsertSchema>) {
    try {
        const validated = produitInsertSchema.parse(data);

        await db.insert(produit).values({
            nom: validated.nom,
            description: validated.description || null,
            prixUnitaire: validated.prixUnitaire,
            actif: validated.actif,
        });

        return {
            success: true,
            message: "Produit créé avec succès",
        };
    } catch (error) {
        console.error("Erreur createProduit:", error);
        return {
            success: false,
            message: "Erreur lors de la création du produit",
        };
    }
}

export async function updateProduit(data: z.infer<typeof produitUpdateSchema>) {
    try {
        const validated = produitUpdateSchema.parse(data);

        await db
            .update(produit)
            .set({
                nom: validated.nom,
                description: validated.description || null,
                prixUnitaire: validated.prixUnitaire,
                actif: validated.actif,
                updatedAt: new Date(),
            })
            .where(eq(produit.id, validated.id));

        return {
            success: true,
            message: "Produit mis à jour avec succès",
        };
    } catch (error) {
        console.error("Erreur updateProduit:", error);
        return {
            success: false,
            message: "Erreur lors de la mise à jour du produit",
        };
    }
}

export async function deleteProduit(id: string) {
    try {
        // Vérifier si le produit a du stock
        const stockCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(stock)
            .where(eq(stock.produitId, id));

        if (Number(stockCount[0]?.count || 0) > 0) {
            return {
                success: false,
                message: "Impossible de supprimer : ce produit a du stock associé",
            };
        }

        await db.delete(produit).where(eq(produit.id, id));

        return {
            success: true,
            message: "Produit supprimé avec succès",
        };
    } catch (error) {
        console.error("Erreur deleteProduit:", error);
        return {
            success: false,
            message: "Erreur lors de la suppression du produit",
        };
    }
}

// ============================================
// STOCK
// ============================================

export async function getStocks(params?: {
    page?: number;
    limit?: number;
    produitId?: string;
}) {
    try {
        const page = params?.page || 1;
        const limit = params?.limit || 9;
        const offset = (page - 1) * limit;

        let query = db
            .select({
                stock: stock,
                produit: produit,
                taille: taille,
                couleur: couleur,
            })
            .from(stock)
            .leftJoin(produit, eq(stock.produitId, produit.id))
            .leftJoin(taille, eq(stock.tailleId, taille.id))
            .leftJoin(couleur, eq(stock.couleurId, couleur.id))
            .$dynamic();

        if (params?.produitId) {
            query = query.where(eq(stock.produitId, params.produitId));
        }

        const [stocks, countResult] = await Promise.all([
            query.orderBy(desc(stock.updatedAt)).limit(limit).offset(offset),
            db.select({ count: sql<number>`count(*)` }).from(stock),
        ]);

        const formattedStocks = stocks.map((s) => ({
            ...s.stock,
            produit: s.produit!,
            taille: s.taille!,
            couleur: s.couleur!,
        }));

        return {
            success: true,
            data: {
                stocks: formattedStocks,
                total: Number(countResult[0]?.count || 0),
            },
        };
    } catch (error) {
        console.error("Erreur getStocks:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération du stock",
        };
    }
}

export async function createStock(data: z.infer<typeof stockInsertSchema>) {
    try {
        const validated = stockInsertSchema.parse(data);

        // Vérifier si le stock existe déjà pour cette combinaison
        const existing = await db
            .select()
            .from(stock)
            .where(
                and(
                    eq(stock.produitId, validated.produitId),
                    eq(stock.tailleId, validated.tailleId),
                    eq(stock.couleurId, validated.couleurId)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            return {
                success: false,
                message: "Cette combinaison produit/taille/couleur existe déjà",
            };
        }

        await db.insert(stock).values(validated);

        return {
            success: true,
            message: "Stock créé avec succès",
        };
    } catch (error) {
        console.error("Erreur createStock:", error);
        return {
            success: false,
            message: "Erreur lors de la création du stock",
        };
    }
}

export async function updateStock(data: z.infer<typeof stockUpdateSchema>) {
    try {
        const validated = stockUpdateSchema.parse(data);

        await db
            .update(stock)
            .set({
                quantiteDisponible: validated.quantiteDisponible,
                seuilAlerte: validated.seuilAlerte,
                updatedAt: new Date(),
            })
            .where(eq(stock.id, validated.id));

        return {
            success: true,
            message: "Stock mis à jour avec succès",
        };
    } catch (error) {
        console.error("Erreur updateStock:", error);
        return {
            success: false,
            message: "Erreur lors de la mise à jour du stock",
        };
    }
}

export async function ajusterStock(data: z.infer<typeof stockAjustementSchema>) {
    try {
        const validated = stockAjustementSchema.parse(data);

        const currentStock = await db
            .select()
            .from(stock)
            .where(eq(stock.id, validated.id))
            .limit(1);

        if (currentStock.length === 0) {
            return {
                success: false,
                message: "Stock non trouvé",
            };
        }

        const current = currentStock[0];
        let newQuantite = current.quantiteDisponible;

        if (validated.type === 'AJOUT') {
            newQuantite += validated.quantite;
        } else {
            newQuantite -= validated.quantite;
            if (newQuantite < 0) {
                return {
                    success: false,
                    message: "Quantité insuffisante en stock",
                };
            }
        }

        await db
            .update(stock)
            .set({
                quantiteDisponible: newQuantite,
                updatedAt: new Date(),
            })
            .where(eq(stock.id, validated.id));

        return {
            success: true,
            message: `Stock ${validated.type === 'AJOUT' ? 'ajouté' : 'retiré'} avec succès`,
        };
    } catch (error) {
        console.error("Erreur ajusterStock:", error);
        return {
            success: false,
            message: "Erreur lors de l'ajustement du stock",
        };
    }
}

export async function deleteStock(id: string) {
    try {
        await db.delete(stock).where(eq(stock.id, id));

        return {
            success: true,
            message: "Stock supprimé avec succès",
        };
    } catch (error) {
        console.error("Erreur deleteStock:", error);
        return {
            success: false,
            message: "Erreur lors de la suppression du stock",
        };
    }
}

// ============================================
// HELPERS
// ============================================

export async function getTailles() {
    try {
        const tailles = await db
            .select()
            .from(taille)
            .where(eq(taille.actif, true))
            .orderBy(taille.ordre);

        return {
            success: true,
            data: tailles,
        };
    } catch (error) {
        console.error("Erreur getTailles:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des tailles",
        };
    }
}

export async function getCouleurs() {
    try {
        const couleurs = await db
            .select()
            .from(couleur)
            .where(eq(couleur.actif, true))
            .orderBy(couleur.nom);

        return {
            success: true,
            data: couleurs,
        };
    } catch (error) {
        console.error("Erreur getCouleurs:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des couleurs",
        };
    }
}

export async function getStockStats() {
    try {
        const [totalStock, stockFaible, produitsActifs] = await Promise.all([
            db
                .select({ total: sql<number>`SUM(${stock.quantiteDisponible})` })
                .from(stock),
            db
                .select({ count: sql<number>`count(*)` })
                .from(stock)
                .where(sql`${stock.quantiteDisponible} <= ${stock.seuilAlerte}`),
            db
                .select({ count: sql<number>`count(*)` })
                .from(produit)
                .where(eq(produit.actif, true)),
        ]);

        return {
            success: true,
            data: {
                totalStock: Number(totalStock[0]?.total || 0),
                stockFaible: Number(stockFaible[0]?.count || 0),
                produitsActifs: Number(produitsActifs[0]?.count || 0),
            },
        };
    } catch (error) {
        console.error("Erreur getStockStats:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des statistiques",
        };
    }
}
