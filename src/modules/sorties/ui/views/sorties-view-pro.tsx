"use client";

import { useState } from "react";
import { PlusIcon, PackageMinusIcon, Filter, TrendingDown, DollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { EmptyState } from "@/components/empty-state";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { SortieGetMany, SortieStats } from "../../types";
import { SortieCardPro } from "../components/sortie-card-pro";
import { SortieFormPro } from "../components/sortie-form-pro";
import { SORTIE_TYPE_LABELS, SORTIE_CATEGORIES } from "../../constants";

interface SortiesViewProProps {
    initialData: SortieGetMany;
    stats: SortieStats;
    stocks: Array<{
        id: string;
        produit: { nom: string };
        taille: { nom: string };
        couleur: { nom: string };
        quantiteDisponible: number;
        coutUnitaireMoyen: string;
    }>;
    userRole?: string;
}

export const SortiesViewPro = ({ initialData, stats, stocks, userRole }: SortiesViewProProps) => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [data, setData] = useState(initialData);
    const [filtreType, setFiltreType] = useState<string>("TOUS");

    const handleSuccess = () => {
        setIsCreateOpen(false);
        window.location.reload();
    };

    const canValidate = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

    // Filtrer les sorties
    const sortiesFiltrees = filtreType === "TOUS"
        ? data.sorties
        : data.sorties.filter(s => s.type === filtreType);

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Sorties de Stock</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Gestion professionnelle des sorties avec valorisation
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nouvelle sortie
                </Button>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total sorties</CardDescription>
                        <CardTitle className="text-3xl">{stats.totalSorties}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            {stats.sortiesMoisCourant} ce mois
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Quantité sortie</CardDescription>
                        <CardTitle className="text-3xl flex items-center gap-2">
                            <TrendingDown className="h-6 w-6 text-orange-600" />
                            {stats.quantiteTotaleSortie}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Articles sortis du stock
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Coût total</CardDescription>
                        <CardTitle className="text-3xl flex items-center gap-2 text-orange-600">
                            {stats.coutTotal.toLocaleString('fr-FR')}{" "}
                            XAF
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            FCFA valorisés
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Types de sorties</CardDescription>
                        <CardTitle className="text-3xl">{stats.parType.length}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Catégories utilisées
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Répartition par type */}
            {stats.parType.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Répartition par type</CardTitle>
                        <CardDescription>Coût et nombre de sorties par catégorie</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {stats.parType.map((item) => (
                                <div key={item.type} className="p-3 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">
                                            {SORTIE_TYPE_LABELS[item.type]}
                                        </span>
                                        <Badge variant="outline">{item.count}</Badge>
                                    </div>
                                    <p className="text-lg font-bold text-orange-600">
                                        {item.cout.toLocaleString('fr-FR')} FCFA
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filtres */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filtrer par type:</span>
                </div>
                <Select value={filtreType} onValueChange={setFiltreType}>
                    <SelectTrigger className="w-[250px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="TOUS">Tous les types</SelectItem>
                        <SelectItem value="VENTE">Ventes</SelectItem>
                        <SelectItem value="CONSOMMATION_INTERNE">Consommation interne</SelectItem>
                        <SelectItem value="DEMARQUE_CASSE">Démarque - Casse</SelectItem>
                        <SelectItem value="DEMARQUE_VOL">Démarque - Vol</SelectItem>
                        <SelectItem value="DEMARQUE_PEREMPTION">Démarque - Péremption</SelectItem>
                        <SelectItem value="DEMARQUE_OBSOLESCENCE">Démarque - Obsolescence</SelectItem>
                        <SelectItem value="TRANSFERT">Transferts</SelectItem>
                        <SelectItem value="RETOUR_FOURNISSEUR">Retours fournisseur</SelectItem>
                        <SelectItem value="AJUSTEMENT_INVENTAIRE">Ajustements</SelectItem>
                        <SelectItem value="ECHANTILLON">Échantillons</SelectItem>
                        <SelectItem value="AUTRE">Autres</SelectItem>
                    </SelectContent>
                </Select>
                {filtreType !== "TOUS" && (
                    <Badge variant="secondary">
                        {sortiesFiltrees.length} résultat(s)
                    </Badge>
                )}
            </div>

            {/* Liste des sorties */}
            {sortiesFiltrees.length === 0 ? (
                <EmptyState
                    title={filtreType === "TOUS" ? "Aucune sortie" : "Aucune sortie de ce type"}
                    description={filtreType === "TOUS"
                        ? "Commencez par enregistrer une sortie de stock"
                        : "Aucune sortie trouvée pour ce filtre"
                    }
                    action={
                        filtreType === "TOUS" ? (
                            <Button onClick={() => setIsCreateOpen(true)}>
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Nouvelle sortie
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={() => setFiltreType("TOUS")}>
                                Voir toutes les sorties
                            </Button>
                        )
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortiesFiltrees.map((sortie) => (
                        <SortieCardPro
                            key={sortie.id}
                            sortie={sortie}
                            onDelete={() => window.location.reload()}
                            canValidate={canValidate}
                        />
                    ))}
                </div>
            )}

            {/* Formulaire de création */}
            <ResponsiveDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                title="Nouvelle sortie de stock"
                description="Enregistrez une sortie avec valorisation automatique"
                maxWidth="!max-w-6xl"
            >
                <SortieFormPro
                    onSuccess={handleSuccess}
                    onCancel={() => setIsCreateOpen(false)}
                    stocks={stocks}
                />
            </ResponsiveDialog>
        </div>
    );
};
