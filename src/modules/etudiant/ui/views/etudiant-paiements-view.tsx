"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    CreditCard,
    Search,
    Clock,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Calendar,
    FileText,
} from "lucide-react";

interface Paiement {
    id: string;
    montant: string;
    statut: string;
    methodePaiement: string;
    reference: string | null;
    notes: string | null;
    createdAt: Date;
    valideAt: Date | null;
    commande: {
        numero: string;
        montantTotal: string;
    };
}

interface EtudiantPaiementsViewProps {
    paiements: Paiement[];
}

const getStatusBadge = (statut: string) => {
    switch (statut) {
        case 'EN_ATTENTE':
            return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />En attente</Badge>;
        case 'PAYE':
            return <Badge className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" />Validé</Badge>;
        case 'REMBOURSE':
            return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejeté</Badge>;
        default:
            return <Badge variant="outline">{statut}</Badge>;
    }
};

const getMethodeBadge = (methode: string) => {
    switch (methode) {
        case 'ESPECES':
            return <Badge variant="outline">Espèces</Badge>;
        case 'MOBILE_MONEY':
            return <Badge variant="outline" className="bg-orange-50">Mobile Money</Badge>;
        case 'ORANGE_MONEY':
            return <Badge variant="outline" className="bg-blue-50">Orange Money</Badge>;
        default:
            return <Badge variant="outline">{methode}</Badge>;
    }
};

export const EtudiantPaiementsView = ({ paiements: initialPaiements }: EtudiantPaiementsViewProps) => {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const filteredPaiements = initialPaiements.filter(p =>
        search === "" ||
        p.commande.numero.toLowerCase().includes(search.toLowerCase()) ||
        p.reference?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPaiements.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPaiements = filteredPaiements.slice(startIndex, endIndex);

    const stats = {
        total: initialPaiements.length,
        enAttente: initialPaiements.filter(p => p.statut === 'EN_ATTENTE').length,
        valides: initialPaiements.filter(p => p.statut === 'PAYE').length,
        montantTotal: initialPaiements
            .filter(p => p.statut === 'PAYE')
            .reduce((acc, p) => acc + parseFloat(p.montant), 0),
    };

    return (
        <div className="flex-1 space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Mes Paiements</h1>
                <p className="text-muted-foreground">Consultez l'historique de vos paiements</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total paiements</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En attente</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.enAttente}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Validés</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.valides}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Montant total</CardTitle>
                        <CreditCard className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.montantTotal.toLocaleString('fr-FR')} FCFA
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Rechercher par numéro de commande ou référence..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {currentPaiements.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">Aucun paiement trouvé</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {currentPaiements.map((paiement) => (
                            <Card key={paiement.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base">
                                                {paiement.commande.numero}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {getMethodeBadge(paiement.methodePaiement)}
                                            </p>
                                        </div>
                                        {getStatusBadge(paiement.statut)}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Montant:</span>
                                            <span className="font-bold text-primary">
                                                {parseFloat(paiement.montant).toLocaleString('fr-FR')} FCFA
                                            </span>
                                        </div>
                                        {paiement.reference && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Référence:</span>
                                                <span className="font-medium">{paiement.reference}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Date:
                                            </span>
                                            <span className="font-medium">
                                                {new Date(paiement.createdAt).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                        {paiement.valideAt && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Validé le:
                                                </span>
                                                <span className="font-medium text-green-600">
                                                    {new Date(paiement.valideAt).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {paiement.notes && (
                                        <div className="pt-2 border-t">
                                            <p className="text-xs text-muted-foreground flex items-start gap-1">
                                                <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                                                {paiement.notes}
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
