"use client";

import { useState, useEffect, useCallback } from "react";
import { Truck, Package, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { LivraisonGrid } from "../components/livraison-grid";
import { LivraisonGetOne } from "../../types";
import {
    getLivraisons,
    getLivraisonStats,
} from "../../actions";
import { SimplePagination } from "@/components/simple-pagination";

interface LivraisonsViewProps {
    userRole: string;
}

export const LivraisonsView = ({ userRole }: LivraisonsViewProps) => {
    // Livraisons
    const [livraisons, setLivraisons] = useState<LivraisonGetOne[]>([]);
    const [livraisonsTotal, setLivraisonsTotal] = useState(0);
    const [livraisonsPage, setLivraisonsPage] = useState(1);

    // Stats
    const [stats, setStats] = useState({
        totalLivraisons: 0,
        aujourdhui: 0,
    });

    const [isLoading, setIsLoading] = useState(true);

    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

    const loadLivraisons = useCallback(async () => {
        const result = await getLivraisons({
            page: livraisonsPage,
            limit: 9,
        });

        if (result.success && result.data) {
            setLivraisons(result.data.livraisons);
            setLivraisonsTotal(result.data.total);
        }
    }, [livraisonsPage]);

    const loadStats = async () => {
        const result = await getLivraisonStats();
        if (result.success && result.data) {
            setStats(result.data);
        }
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            await Promise.all([
                loadLivraisons(),
                loadStats(),
            ]);
            setIsLoading(false);
        };
        init();
    }, [loadLivraisons]);

    const livraisonsPageCount = Math.ceil(livraisonsTotal / 9);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Chargement...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header avec stats */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {isAdmin ? "Livraisons" : "Mes livraisons"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isAdmin
                                ? "Consultez l'historique des livraisons de polos"
                                : "Consultez l'historique de vos livraisons"}
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total
                            </CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalLivraisons}</div>
                            <p className="text-xs text-muted-foreground">
                                Livraisons effectuées
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Aujourd'hui
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.aujourdhui}</div>
                            <p className="text-xs text-muted-foreground">
                                Livrées ce jour
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Grille des livraisons */}
            <LivraisonGrid livraisons={livraisons} />

            {/* Pagination */}
            {livraisonsPageCount > 1 && (
                <div className="flex justify-center">
                    <SimplePagination
                        currentPage={livraisonsPage}
                        totalPages={livraisonsPageCount}
                        onPageChange={setLivraisonsPage}
                    />
                </div>
            )}
        </div>
    );
};
