"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ShoppingCart, Clock, CheckCircle, Package as PackageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { CommandeGrid } from "../components/commande-grid";
import { CommandeForm } from "../components/commande-form";
import { CommandeGetOne } from "../../types";
import { ProduitGetOne, TailleGetOne, CouleurGetOne } from "@/modules/produits/types";
import {
    getCommandes,
    getCommandeStats,
} from "../../actions";
import { getProduits, getTailles, getCouleurs } from "@/modules/produits/actions";
import { SimplePagination } from "@/components/simple-pagination";

interface CommandesViewProps {
    userRole: string;
}

export const CommandesView = ({ userRole }: CommandesViewProps) => {
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    // Commandes
    const [commandes, setCommandes] = useState<CommandeGetOne[]>([]);
    const [commandesTotal, setCommandesTotal] = useState(0);
    const [commandesPage, setCommandesPage] = useState(1);
    const [statutFilter, setStatutFilter] = useState<string>("all");

    // Produits pour le formulaire
    const [produits, setProduits] = useState<ProduitGetOne[]>([]);
    const [tailles, setTailles] = useState<TailleGetOne[]>([]);
    const [couleurs, setCouleurs] = useState<CouleurGetOne[]>([]);

    // Stats
    const [stats, setStats] = useState({
        totalCommandes: 0,
        enAttente: 0,
        payees: 0,
        validees: 0,
        livrees: 0,
    });

    const [isLoading, setIsLoading] = useState(true);

    const isStudent = userRole === 'ETUDIANT';

    const loadCommandes = useCallback(async () => {
        const result = await getCommandes({
            page: commandesPage,
            limit: 9,
            statut: statutFilter === "all" ? undefined : statutFilter,
        });

        if (result.success && result.data) {
            setCommandes(result.data.commandes);
            setCommandesTotal(result.data.total);
        }
    }, [commandesPage, statutFilter]);

    const loadProduits = async () => {
        const [produitsResult, taillesResult, couleursResult] = await Promise.all([
            getProduits({ limit: 100 }),
            getTailles(),
            getCouleurs(),
        ]);

        if (produitsResult.success && produitsResult.data) {
            setProduits(produitsResult.data.produits.filter(p => p.actif));
        }

        if (taillesResult.success && taillesResult.data) {
            setTailles(taillesResult.data);
        }

        if (couleursResult.success && couleursResult.data) {
            setCouleurs(couleursResult.data);
        }
    };

    const loadStats = async () => {
        const result = await getCommandeStats();
        if (result.success && result.data) {
            setStats(result.data);
        }
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            await Promise.all([
                loadCommandes(),
                loadProduits(),
                loadStats(),
            ]);
            setIsLoading(false);
        };
        init();
    }, [loadCommandes]);

    const handleCreateSuccess = () => {
        setShowCreateDialog(false);
        loadCommandes();
        loadStats();
    };

    const commandesPageCount = Math.ceil(commandesTotal / 9);

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
                            {isStudent ? "Mes commandes" : "Commandes"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isStudent
                                ? "Passez et suivez vos commandes de polos"
                                : "Gérez toutes les commandes des étudiants"}
                        </p>
                    </div>
                    {isStudent && (
                        <Button onClick={() => setShowCreateDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvelle commande
                        </Button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalCommandes}</div>
                            <p className="text-xs text-muted-foreground">
                                Commandes totales
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                En attente
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.enAttente}</div>
                            <p className="text-xs text-muted-foreground">
                                À traiter
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Validées
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.validees}</div>
                            <p className="text-xs text-muted-foreground">
                                Prêtes
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Livrées
                            </CardTitle>
                            <PackageIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.livrees}</div>
                            <p className="text-xs text-muted-foreground">
                                Complétées
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-4">
                <div className="w-64">
                    <Select value={statutFilter} onValueChange={setStatutFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                            <SelectItem value="PAYE">Payé</SelectItem>
                            <SelectItem value="VALIDE">Validé</SelectItem>
                            <SelectItem value="LIVRE">Livré</SelectItem>
                            <SelectItem value="ANNULE">Annulé</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Grille des commandes */}
            <CommandeGrid
                commandes={commandes}
                onUpdate={loadCommandes}
                userRole={userRole}
            />

            {/* Pagination */}
            {commandesPageCount > 1 && (
                <div className="flex justify-center">
                    <SimplePagination
                        currentPage={commandesPage}
                        totalPages={commandesPageCount}
                        onPageChange={setCommandesPage}
                    />
                </div>
            )}

            {/* Dialog Nouvelle commande */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Nouvelle commande</DialogTitle>
                    </DialogHeader>
                    <CommandeForm
                        produits={produits}
                        tailles={tailles}
                        couleurs={couleurs}
                        onSuccess={handleCreateSuccess}
                        onCancel={() => setShowCreateDialog(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};
