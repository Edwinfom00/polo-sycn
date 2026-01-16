"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Package,
    AlertTriangle,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Stock {
    id: string;
    quantiteDisponible: number;
    quantiteReservee: number;
    quantiteLivree: number;
    seuilAlerte: number;
    produit: {
        nom: string;
        prixUnitaire: string;
    };
    taille: {
        nom: string;
    };
    couleur: {
        nom: string;
        codeHex: string | null;
    };
}

interface AdminStockViewProps {
    stocks: Stock[];
}

export const AdminStockView = ({ stocks: initialStocks }: AdminStockViewProps) => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<'all' | 'faible'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const filteredStocks = initialStocks.filter(s => {
        const matchSearch = search === "" ||
            s.produit.nom.toLowerCase().includes(search.toLowerCase()) ||
            s.taille.nom.toLowerCase().includes(search.toLowerCase()) ||
            s.couleur.nom.toLowerCase().includes(search.toLowerCase());

        const matchFilter = filter === 'all' ||
            (filter === 'faible' && s.quantiteDisponible <= s.seuilAlerte);

        return matchSearch && matchFilter;
    });

    const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentStocks = filteredStocks.slice(startIndex, endIndex);

    const stats = {
        total: initialStocks.reduce((acc, s) => acc + s.quantiteDisponible, 0),
        reserve: initialStocks.reduce((acc, s) => acc + s.quantiteReservee, 0),
        livre: initialStocks.reduce((acc, s) => acc + s.quantiteLivree, 0),
        faible: initialStocks.filter(s => s.quantiteDisponible <= s.seuilAlerte).length,
    };

    return (
        <div className="flex-1 space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Consultation du Stock</h1>
                <p className="text-muted-foreground">Vue en lecture seule du stock disponible</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock total</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">unités disponibles</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Réservé</CardTitle>
                        <Package className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.reserve}</div>
                        <p className="text-xs text-muted-foreground">unités réservées</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Livré</CardTitle>
                        <Package className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.livre}</div>
                        <p className="text-xs text-muted-foreground">unités livrées</p>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setFilter(filter === 'faible' ? 'all' : 'faible')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock faible</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.faible}</div>
                        <p className="text-xs text-muted-foreground">articles en alerte</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un produit, taille ou couleur..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {filter === 'faible' && (
                    <Button variant="outline" onClick={() => setFilter('all')}>
                        Voir tout
                    </Button>
                )}
            </div>

            {currentStocks.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">Aucun stock trouvé</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {currentStocks.map((stock) => {
                            const isLow = stock.quantiteDisponible <= stock.seuilAlerte;
                            const isOutOfStock = stock.quantiteDisponible === 0;

                            return (
                                <Card key={stock.id} className={`hover:shadow-lg transition-shadow ${isOutOfStock ? 'border-red-500' : isLow ? 'border-orange-500' : ''}`}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1 flex-1">
                                                <CardTitle className="text-lg">{stock.produit.nom}</CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">{stock.taille.nom}</Badge>
                                                    <div className="flex items-center gap-1">
                                                        {stock.couleur.codeHex && (
                                                            <div
                                                                className="w-4 h-4 rounded-full border"
                                                                style={{ backgroundColor: stock.couleur.codeHex }}
                                                            />
                                                        )}
                                                        <span className="text-sm text-muted-foreground">{stock.couleur.nom}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {isOutOfStock ? (
                                                <Badge variant="destructive" className="gap-1">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Rupture
                                                </Badge>
                                            ) : isLow ? (
                                                <Badge className="gap-1 bg-orange-500">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Faible
                                                </Badge>
                                            ) : (
                                                <Badge className="gap-1 bg-green-500">
                                                    <Package className="h-3 w-3" />
                                                    OK
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Disponible:</span>
                                                <span className={`font-bold ${isOutOfStock ? 'text-red-600' : isLow ? 'text-orange-600' : 'text-green-600'}`}>
                                                    {stock.quantiteDisponible}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Réservé:</span>
                                                <span className="font-medium text-blue-600">{stock.quantiteReservee}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Livré:</span>
                                                <span className="font-medium">{stock.quantiteLivree}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Seuil alerte:</span>
                                                <span className="font-medium">{stock.seuilAlerte}</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t">
                                                <span className="text-muted-foreground">Prix unitaire:</span>
                                                <span className="font-bold">
                                                    {parseFloat(stock.produit.prixUnitaire).toLocaleString('fr-FR')} FCFA
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className="w-8"
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
