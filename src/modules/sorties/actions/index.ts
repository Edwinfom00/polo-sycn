"use server";

import { db } from "@/db";
import { sortieStock, ligneSortieStock, stock, produit, taille, couleur, user } from "@/db/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { sortieInsertSchema, sortieUpdateSchema, sortieDeleteSchema, sortieValiderSchema } from "../schemas";
import type { SortieGetOne, SortieGetMany, SortieStats } from "../types";

// Générer un numéro de sortie unique
async function generateNumeroSortie(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SOR-${year}-`;

    const lastSortie = await db
        .select()
        .from(sortieStock)
        .where(sql`${sortieStock.numero} LIKE ${prefix + '%'}`)
        .orderBy(desc(sortieStock.numero))
        .limit(1);

    let nextNumber = 1;
    if (lastSortie.length > 0) {
        const lastNumber = parseInt(lastSortie[0].numero.split('-')[2]);
        nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

// Calculer le coût selon la méthode de valorisation
async function calculerCoutSortie(
    stockId: string,
    quantite: number,
    methode: string,
    coutSpecifique?: number
): Promise<{ coutUnitaire: number; coutTotal: number }> {
    const stockItem = await db
        .select()
        .from(stock)
        .where(eq(stock.id, stockId))
        .limit(1);

    if (stockItem.length === 0) {
        throw new Error('Stock introuvable');
    }

    let coutUnitaire = 0;

    switch (methode) {
        case 'PRIX_SPECIFIQUE':
            if (!coutSpecifique) {
                throw new Error('Coût spécifique requis pour cette méthode');
            }
            coutUnitaire = coutSpecifique;
            break;

        case 'CMUP':
            coutUnitaire = Number(stockItem[0].coutUnitaireMoyen || 0);
            break;

        case 'FIFO':
        case 'FEFO':
            // Pour FIFO/FEFO, on utilise le CMUP comme approximation
            // Dans un système plus avancé, on gérerait des lots avec dates d'entrée
            coutUnitaire = Number(stockItem[0].coutUnitaireMoyen || 0);
            break;

        default:
            coutUnitaire = Number(stockItem[0].coutUnitaireMoyen || 0);
    }

    const coutTotal = coutUnitaire * quantite;

    return { coutUnitaire, coutTotal };
}

export async function createSortie(data: unknown) {
    try {
        const session = await auth.api.getSession({
            headers: await import('next/headers').then(m => m.headers())
        });

        if (!session?.user) {
            return { success: false, message: 'Non authentifié' };
        }

        const validated = sortieInsertSchema.parse(data);
        const numero = await generateNumeroSortie();

        // Vérifier que toutes les quantités sont disponibles
        for (const ligne of validated.lignes) {
            const stockItem = await db
                .select()
                .from(stock)
                .where(eq(stock.id, ligne.stockId))
                .limit(1);

            if (stockItem.length === 0) {
                return { success: false, message: 'Stock introuvable' };
            }

            if (stockItem[0].quantiteDisponible < ligne.quantite) {
                return {
                    success: false,
                    message: `Quantité insuffisante en stock pour un des articles`
                };
            }
        }

        // Calculer le coût total
        let coutTotalSortie = 0;
        const lignesAvecCout = [];

        for (const ligne of validated.lignes) {
            const { coutUnitaire, coutTotal } = await calculerCoutSortie(
                ligne.stockId,
                ligne.quantite,
                validated.methodeValorisation,
                ligne.coutUnitaire
            );

            coutTotalSortie += coutTotal;
            lignesAvecCout.push({
                ...ligne,
                coutUnitaire,
                coutTotal,
            });
        }

        // Créer la sortie
        const [newSortie] = await db.insert(sortieStock).values({
            numero,
            type: validated.type,
            motif: validated.motif,
            methodeValorisation: validated.methodeValorisation,
            destinationDepot: validated.destinationDepot || null,
            referenceExterne: validated.referenceExterne || null,
            coutTotal: coutTotalSortie.toString(),
            notes: validated.notes || null,
            effectuePar: session.user.id,
        }).returning();

        // Créer les lignes et mettre à jour le stock
        for (const ligne of lignesAvecCout) {
            await db.insert(ligneSortieStock).values({
                sortieId: newSortie.id,
                stockId: ligne.stockId,
                quantite: ligne.quantite,
                coutUnitaire: ligne.coutUnitaire.toString(),
                coutTotal: ligne.coutTotal.toString(),
                lotNumero: ligne.lotNumero || null,
                datePeremption: ligne.datePeremption || null,
            });

            // Déduire du stock disponible
            await db
                .update(stock)
                .set({
                    quantiteDisponible: sql`${stock.quantiteDisponible} - ${ligne.quantite}`,
                    updatedAt: new Date(),
                })
                .where(eq(stock.id, ligne.stockId));
        }

        revalidatePath('/super-admin/admin/sorties');
        revalidatePath('/admin/sorties');

        return { success: true, message: 'Sortie enregistrée avec succès', data: newSortie };
    } catch (error) {
        console.error('Error creating sortie:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Erreur lors de la création' };
    }
}

export async function validerSortie(data: unknown) {
    try {
        const session = await auth.api.getSession({
            headers: await import('next/headers').then(m => m.headers())
        });

        if (!session?.user) {
            return { success: false, message: 'Non authentifié' };
        }

        const validated = sortieValiderSchema.parse(data);

        await db
            .update(sortieStock)
            .set({
                validePar: session.user.id,
                valideAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(sortieStock.id, validated.id));

        revalidatePath('/super-admin/admin/sorties');
        revalidatePath('/admin/sorties');

        return { success: true, message: 'Sortie validée avec succès' };
    } catch (error) {
        console.error('Error validating sortie:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Erreur lors de la validation' };
    }
}

export async function getSorties(params?: {
    page?: number;
    limit?: number;
    type?: string;
    dateDebut?: Date;
    dateFin?: Date;
}): Promise<SortieGetMany> {
    try {
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const offset = (page - 1) * limit;

        let whereConditions = [];

        if (params?.type) {
            whereConditions.push(eq(sortieStock.type, params.type as any));
        }

        if (params?.dateDebut) {
            whereConditions.push(gte(sortieStock.effectueAt, params.dateDebut));
        }

        if (params?.dateFin) {
            whereConditions.push(lte(sortieStock.effectueAt, params.dateFin));
        }

        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

        let query = db
            .select({
                sortie: sortieStock,
                effectuePar: user,
            })
            .from(sortieStock)
            .leftJoin(user, eq(sortieStock.effectuePar, user.id))
            .$dynamic();

        if (whereClause) {
            query = query.where(whereClause);
        }

        const [sorties, countResult] = await Promise.all([
            query.orderBy(desc(sortieStock.effectueAt)).limit(limit).offset(offset),
            db.select({ count: sql<number>`count(*)` }).from(sortieStock).where(whereClause),
        ]);

        // Récupérer les lignes pour chaque sortie
        const sortiesWithLignes = await Promise.all(
            sorties.map(async (s) => {
                const lignes = await db
                    .select({
                        ligne: ligneSortieStock,
                        stock: stock,
                        produit: produit,
                        taille: taille,
                        couleur: couleur,
                    })
                    .from(ligneSortieStock)
                    .leftJoin(stock, eq(ligneSortieStock.stockId, stock.id))
                    .leftJoin(produit, eq(stock.produitId, produit.id))
                    .leftJoin(taille, eq(stock.tailleId, taille.id))
                    .leftJoin(couleur, eq(stock.couleurId, couleur.id))
                    .where(eq(ligneSortieStock.sortieId, s.sortie.id));

                return {
                    ...s.sortie,
                    effectuePar: s.effectuePar!,
                    lignes: lignes.map(l => ({
                        ...l.ligne,
                        stock: {
                            ...l.stock!,
                            produit: l.produit!,
                            taille: l.taille!,
                            couleur: l.couleur!,
                        }
                    }))
                } as SortieGetOne;
            })
        );

        return {
            sorties: sortiesWithLignes,
            total: Number(countResult[0]?.count || 0),
        };
    } catch (error) {
        console.error('Error getting sorties:', error);
        return { sorties: [], total: 0 };
    }
}

export async function getSortie(id: string): Promise<SortieGetOne | null> {
    try {
        const result = await db
            .select({
                sortie: sortieStock,
                effectuePar: user,
            })
            .from(sortieStock)
            .leftJoin(user, eq(sortieStock.effectuePar, user.id))
            .where(eq(sortieStock.id, id))
            .limit(1);

        if (result.length === 0) return null;

        const lignes = await db
            .select({
                ligne: ligneSortieStock,
                stock: stock,
                produit: produit,
                taille: taille,
                couleur: couleur,
            })
            .from(ligneSortieStock)
            .leftJoin(stock, eq(ligneSortieStock.stockId, stock.id))
            .leftJoin(produit, eq(stock.produitId, produit.id))
            .leftJoin(taille, eq(stock.tailleId, taille.id))
            .leftJoin(couleur, eq(stock.couleurId, couleur.id))
            .where(eq(ligneSortieStock.sortieId, id));

        return {
            ...result[0].sortie,
            effectuePar: result[0].effectuePar!,
            lignes: lignes.map(l => ({
                ...l.ligne,
                stock: {
                    ...l.stock!,
                    produit: l.produit!,
                    taille: l.taille!,
                    couleur: l.couleur!,
                }
            }))
        } as SortieGetOne;
    } catch (error) {
        console.error('Error getting sortie:', error);
        return null;
    }
}

export async function deleteSortie(data: unknown) {
    try {
        const validated = sortieDeleteSchema.parse(data);

        // Récupérer les lignes pour restaurer le stock
        const lignes = await db
            .select()
            .from(ligneSortieStock)
            .where(eq(ligneSortieStock.sortieId, validated.id));

        // Restaurer le stock
        for (const ligne of lignes) {
            await db
                .update(stock)
                .set({
                    quantiteDisponible: sql`${stock.quantiteDisponible} + ${ligne.quantite}`,
                    updatedAt: new Date(),
                })
                .where(eq(stock.id, ligne.stockId));
        }

        // Supprimer la sortie (les lignes seront supprimées en cascade)
        await db.delete(sortieStock).where(eq(sortieStock.id, validated.id));

        revalidatePath('/super-admin/admin/sorties');
        revalidatePath('/admin/sorties');

        return { success: true, message: 'Sortie supprimée avec succès' };
    } catch (error) {
        console.error('Error deleting sortie:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Erreur lors de la suppression' };
    }
}

export async function getSortieStats(): Promise<SortieStats> {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalResult, monthResult, quantiteResult, coutResult, parTypeResult] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(sortieStock),
            db
                .select({ count: sql<number>`count(*)` })
                .from(sortieStock)
                .where(gte(sortieStock.effectueAt, firstDayOfMonth)),
            db
                .select({ total: sql<number>`SUM((SELECT SUM(${ligneSortieStock.quantite}) FROM ${ligneSortieStock} WHERE ${ligneSortieStock.sortieId} = ${sortieStock.id}))` })
                .from(sortieStock),
            db
                .select({ total: sql<number>`SUM(CAST(${sortieStock.coutTotal} AS DECIMAL))` })
                .from(sortieStock),
            db
                .select({
                    type: sortieStock.type,
                    count: sql<number>`count(*)`,
                    cout: sql<number>`SUM(CAST(${sortieStock.coutTotal} AS DECIMAL))`,
                })
                .from(sortieStock)
                .groupBy(sortieStock.type),
        ]);

        return {
            totalSorties: Number(totalResult[0]?.count || 0),
            sortiesMoisCourant: Number(monthResult[0]?.count || 0),
            quantiteTotaleSortie: Number(quantiteResult[0]?.total || 0),
            coutTotal: Number(coutResult[0]?.total || 0),
            parType: parTypeResult.map(p => ({
                type: p.type,
                count: Number(p.count || 0),
                cout: Number(p.cout || 0),
            })),
        };
    } catch (error) {
        console.error('Error getting sortie stats:', error);
        return {
            totalSorties: 0,
            sortiesMoisCourant: 0,
            quantiteTotaleSortie: 0,
            coutTotal: 0,
            parType: [],
        };
    }
}
