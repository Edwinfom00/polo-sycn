"use server";

import { db } from "@/db";
import { user, classe, filiere, commande } from "@/db/schema";
import { eq, sql, desc, ilike, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-utils";

export async function getEtudiants(params?: {
    page?: number;
    limit?: number;
    search?: string;
    classeId?: string;
}) {
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

        const page = params?.page || 1;
        const limit = params?.limit || 12;
        const offset = (page - 1) * limit;

        let query = db
            .select({
                user: user,
                classe: classe,
                filiere: filiere,
            })
            .from(user)
            .leftJoin(classe, eq(user.classeId, classe.id))
            .leftJoin(filiere, eq(classe.filiereId, filiere.id))
            .where(eq(user.role, 'ETUDIANT'))
            .$dynamic();

        // Filtres
        if (params?.search) {
            query = query.where(
                sql`${user.name} ILIKE ${`%${params.search}%`} OR ${user.email} ILIKE ${`%${params.search}%`}`
            );
        }

        if (params?.classeId) {
            query = query.where(eq(user.classeId, params.classeId));
        }

        const [etudiants, countResult] = await Promise.all([
            query.orderBy(desc(user.createdAt)).limit(limit).offset(offset),
            db.select({ count: sql<number>`count(*)` }).from(user).where(eq(user.role, 'ETUDIANT')),
        ]);

        // Récupérer les stats de commandes pour chaque étudiant
        const etudiantsWithStats = await Promise.all(
            etudiants.map(async (etudiant) => {
                const [commandesStats, montantTotal] = await Promise.all([
                    db
                        .select({
                            total: sql<number>`count(*)`,
                            enAttente: sql<number>`count(*) FILTER (WHERE ${commande.statut} = 'EN_ATTENTE')`,
                            paye: sql<number>`count(*) FILTER (WHERE ${commande.statut} = 'PAYE')`,
                            valide: sql<number>`count(*) FILTER (WHERE ${commande.statut} = 'VALIDE')`,
                            livre: sql<number>`count(*) FILTER (WHERE ${commande.statut} = 'LIVRE')`,
                        })
                        .from(commande)
                        .where(eq(commande.etudiantId, etudiant.user.id)),
                    db
                        .select({
                            total: sql<number>`SUM(CAST(${commande.montantTotal} AS DECIMAL))`,
                            paye: sql<number>`SUM(CAST(${commande.montantPaye} AS DECIMAL))`,
                        })
                        .from(commande)
                        .where(eq(commande.etudiantId, etudiant.user.id)),
                ]);

                return {
                    ...etudiant.user,
                    classe: etudiant.classe,
                    filiere: etudiant.filiere,
                    stats: {
                        totalCommandes: Number(commandesStats[0]?.total || 0),
                        commandesEnAttente: Number(commandesStats[0]?.enAttente || 0),
                        commandesPayees: Number(commandesStats[0]?.paye || 0),
                        commandesValidees: Number(commandesStats[0]?.valide || 0),
                        commandesLivrees: Number(commandesStats[0]?.livre || 0),
                        montantTotal: Number(montantTotal[0]?.total || 0),
                        montantPaye: Number(montantTotal[0]?.paye || 0),
                    },
                };
            })
        );

        return {
            success: true,
            data: {
                etudiants: etudiantsWithStats,
                total: Number(countResult[0]?.count || 0),
            },
        };
    } catch (error) {
        console.error("Erreur getEtudiants:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des étudiants",
        };
    }
}

export async function getEtudiantDetail(id: string) {
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

        // Récupérer l'étudiant
        const etudiantData = await db
            .select({
                user: user,
                classe: classe,
                filiere: filiere,
            })
            .from(user)
            .leftJoin(classe, eq(user.classeId, classe.id))
            .leftJoin(filiere, eq(classe.filiereId, filiere.id))
            .where(and(eq(user.id, id), eq(user.role, 'ETUDIANT')))
            .limit(1);

        if (etudiantData.length === 0) {
            return {
                success: false,
                message: "Étudiant non trouvé",
            };
        }

        // Récupérer les commandes
        const commandes = await db
            .select()
            .from(commande)
            .where(eq(commande.etudiantId, id))
            .orderBy(desc(commande.createdAt));

        return {
            success: true,
            data: {
                etudiant: {
                    ...etudiantData[0].user,
                    classe: etudiantData[0].classe,
                    filiere: etudiantData[0].filiere,
                },
                commandes,
            },
        };
    } catch (error) {
        console.error("Erreur getEtudiantDetail:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération de l'étudiant",
        };
    }
}
