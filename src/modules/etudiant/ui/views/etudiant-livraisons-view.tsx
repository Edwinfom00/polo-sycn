"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Truck,
    Search,
    Package,
    Calendar,
    ChevronLeft,
    ChevronRight,
    FileText,
} from "lucide-react";

interface Livraison {
    id: string;
    livreAt: Date;
    notes: string | null;
    commande: {
        numero: string;
        montantTotal: string;
    };
    lignes: Array<{
        quantiteLivree: number;
        ligneCommande: {
            produit: {
                nom: string;
            };
            taille: {
                nom: string;
            };
            couleur: {
                nom: string;
                codeHex: string | null;
            };
        };
    }>;
}

interface EtudiantLivraisonsViewProps {
    livraisons: Livraison[];
}

export const EtudiantLivraisonsView = ({ livraisons: initialLivraisons }: EtudiantLivraisonsViewProps) => {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const filteredLivraisons = initialLivraisons.filter(l =>
        search === "" ||
        l.commande.numero.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredLivraisons.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLivraisons = filteredLivraisons.slice(startIndex, endIndex);

    const stats = {
        total: initialLivraisons.length,
        articles: initialLivraisons.reduce((acc, l) =>
            acc + l.lignes.reduce((sum, ligne) => sum + ligne.quantiteLivree, 0), 0
        ),
    };

    return (
        <div className="flex-1 space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Mes Livraisons</h1>
                <p className="text-muted-foreground">Consultez l'historique de vos livraisons</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total livraisons</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">Commandes livrées</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Articles livrés</CardTitle>
                        <Package className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.articles}</div>
                        <p className="text-xs text-muted-foreground">Unités au total</p>
                    </CardContent>
                </Card>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Rechercher par numéro de commande..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {currentLivraisons.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">Aucune livraison trouvée</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {currentLivraisons.map((livraison) => (
                            <Card key={livraison.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base">
                                                {livraison.commande.numero}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(livraison.livreAt).toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <Badge className="gap-1 bg-green-500">
                                            <Truck className="h-3 w-3" />
                                            Livré
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium flex items-center gap-1">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            Articles livrés:
                                        </p>
                                        <div className="space-y-2 pl-5">
                                            {livraison.lignes.map((ligne, idx) => (
                                                <div key={idx} className="text-sm">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <p className="font-medium">
                                                                {ligne.ligneCommande.produit.nom}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {ligne.ligneCommande.taille.nom}
                                                                </Badge>
                                                                <div className="flex items-center gap-1">
                                                                    {ligne.ligneCommande.couleur.codeHex && (
                                                                        <div
                                                                            className="w-3 h-3 rounded-full border"
                                                                            style={{
                                                                                backgroundColor: ligne.ligneCommande.couleur.codeHex
                                                                            }}
                                                                        />
                                                                    )}
                                                                    <span>{ligne.ligneCommande.couleur.nom}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Badge variant="secondary">
                                                            x{ligne.quantiteLivree}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {livraison.notes && (
                                        <div className="pt-2 border-t">
                                            <p className="text-xs text-muted-foreground flex items-start gap-1">
                                                <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                                                {livraison.notes}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
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
