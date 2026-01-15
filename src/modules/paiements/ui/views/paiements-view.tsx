"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, CreditCard, Clock, CheckCircle, DollarSign } from "lucide-react";

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

import { PaiementGrid } from "../components/paiement-grid";
import { PaiementForm } from "../components/paiement-form";
import { PaiementGetOne } from "../../types";
import {
    getPaiements,
    getPaiementStats,
    getCommandesNonPayees,
} from "../../actions";
import { SimplePagination } from "@/components/simple-pagination";

interface PaiementsViewProps {
    userRole: string;
}

export const PaiementsView = ({ userRole }: PaiementsViewProps) => {
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    // Paiements
    const [paiements, setPaiements] = useState<PaiementGetOne[]>([]);
    const [paiementsTotal, setPaiementsTotal] = useState(0);
    const [paiementsPage, setPaiementsPage] = useState(1);
    const [statutFilter, setStatutFilter] = useState<string>("all");

    // Commandes pour le formulaire
    const [commandesNonPayees, setCommandesNonPayees] = useState<any[]>([]);

    // Stats
    const [stats, setStats] = useState({
        totalPaiements: 0,
        enAttente: 0,
        valides: 0,
        montantTotal: 0,
    });

    const [isLoading, setIsLoading] = useState(true);

    const isStudent = userRole === 'ETUDIANT';

    const loadPaiements = useCallback(async () => {
        const result = await getPaiements({
            page: paiementsPage,
            limit: 9,
            statut: statutFilter === "all" ? undefined : statutFilter,
        });

        if (result.success && result.data) {
            setPaiements(result.data.paiements);
            setPaiementsTotal(result.data.total);
        }
    }, [paiementsPage, statutFilter]);

    const loadCommandesNonPayees = async () => {
        const result = await getCommandesNonPayees();
        if (result.success && result.data) {
            setCommandesNonPayees(result.data);
        }
    };

    const loadStats = async () => {
        const result = await getPaiementStats();
        if (result.success && result.data) {
            setStats(result.data);
        }
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            await Promise.all([
                loadPaiements(),
                loadCommandesNonPayees(),
                loadStats(),
            ]);
            setIsLoading(false);
        };
        init();
    }, [loadPaiements]);

    const handleCreateSuccess = () => {
        setShowCreateDialog(false);
        loadPaiements();
        loadCommandesNonPayees();
        loadStats();
    };

    const paiementsPageCount = Math.ceil(paiementsTotal / 9);

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
                            {isStudent ? "Mes paiements" : "Paiements"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isStudent
                                ? "Enregistrez vos paiements et suivez leur validation"
                                : "Gérez et validez les paiements des étudiants"}
                        </p>
                    </div>
                    {commandesNonPayees.length > 0 && (
                        <Button onClick={() => setShowCreateDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau paiement
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
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPaiements}</div>
                            <p className="text-xs text-muted-foreground">
                                Paiements enregistrés
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
                                À valider
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Validés
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.valides}</div>
                            <p className="text-xs text-muted-foreground">
                                Confirmés
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Montant total
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.montantTotal.toFixed(0)}</div>
                            <p className="text-xs text-muted-foreground">
                                FCFA validés
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
                            <SelectItem value="PAYE">Validé</SelectItem>
                            <SelectItem value="REMBOURSE">Rejeté</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Grille des paiements */}
            <PaiementGrid
                paiements={paiements}
                onUpdate={loadPaiements}
                userRole={userRole}
            />

            {/* Pagination */}
            {paiementsPageCount > 1 && (
                <div className="flex justify-center">
                    <SimplePagination
                        currentPage={paiementsPage}
                        totalPages={paiementsPageCount}
                        onPageChange={setPaiementsPage}
                    />
                </div>
            )}

            {/* Dialog Nouveau paiement */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Nouveau paiement</DialogTitle>
                    </DialogHeader>
                    <PaiementForm
                        commandes={commandesNonPayees}
                        onSuccess={handleCreateSuccess}
                        onCancel={() => setShowCreateDialog(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};
